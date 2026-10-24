import os
import json
import re
import hashlib
import asyncio
import edge_tts

VOICE_FEMALE = "vi-VN-HoaiMyNeural"  # Cô giáo mầm non 25t, truyền cảm, chuẩn tiếng Việt
VOICE_MALE = "vi-VN-NamMinhNeural"    # Thầy giáo trẻ 25t, thân thiện, rõ ràng

RATE = "+4%"
PITCH_FEMALE = "+3Hz"
PITCH_MALE = "+1Hz"

def normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', text.strip().lower())

def hash_text(text: str) -> str:
    cleaned = normalize(text)
    return hashlib.md5(cleaned.encode('utf-8')).hexdigest()[:12]

import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def generate_one(text: str, voice: str, pitch: str, out_path: str, sem: asyncio.Semaphore):
    if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
        return
    clean_text = text.strip()
    if not clean_text or not any(c.isalnum() for c in clean_text):
        return
    
    for attempt in range(4):
        async with sem:
            try:
                comm = edge_tts.Communicate(clean_text, voice, rate=RATE, pitch=pitch)
                await comm.save(out_path)
                return
            except Exception as e:
                if attempt == 3:
                    try:
                        print(f"Failed '{clean_text}' ({voice}) after 4 attempts: {e}")
                    except Exception:
                        pass
                await asyncio.sleep(1 + attempt * 1.5)

async def main():
    os.makedirs('public/audio/female', exist_ok=True)
    os.makedirs('public/audio/male', exist_ok=True)

    with open('spoken_texts.json', 'r', encoding='utf-8') as f:
        texts = json.load(f)

    manifest = {}
    tasks = []
    sem = asyncio.Semaphore(5)

    for t in texts:
        if not t or not t.strip():
            continue
        h = hash_text(t)
        norm = normalize(t)
        manifest[norm] = h

        f_path = f"public/audio/female/{h}.mp3"
        m_path = f"public/audio/male/{h}.mp3"

        tasks.append(generate_one(t, VOICE_FEMALE, PITCH_FEMALE, f_path, sem))
        tasks.append(generate_one(t, VOICE_MALE, PITCH_MALE, m_path, sem))

    with open('public/audio/manifest.json', 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Starting generation of {len(tasks)} audio files for {len(texts)} texts...")
    t0 = asyncio.get_event_loop().time()
    await asyncio.gather(*tasks)
    dt = asyncio.get_event_loop().time() - t0
    print(f"Completed audio generation in {dt:.1f}s! Manifest saved to public/audio/manifest.json")

if __name__ == '__main__':
    asyncio.run(main())
