import asyncio
import edge_tts
import hashlib
import json
import os
import re

texts = [
    "Chào con yêu! Hôm nay cô Mai sẽ đồng hành cùng con học và chơi nhé!",
    "Chào các bạn nhỏ! Hôm nay thầy Nam sẽ cùng các con khám phá nhiều điều thú vị nhé!",
    "Chào con! Cô Mai đã sẵn sàng!",
    "Chào con! Thầy Nam đã sẵn sàng!",
    "Chào con yêu! Hôm nay cô Mai sẽ đồng hành cùng con nhé!",
    "Chào các bạn nhỏ! Hôm nay thầy Nam sẽ đồng hành cùng các con nhé!",
    "Cô giáo Mai, 25 tuổi, giọng đọc truyền cảm và ấm áp.",
    "Thầy giáo Nam, 25 tuổi, giọng đọc thân thiện và hào hứng."
]

def norm(t: str) -> str:
    return re.sub(r'\s+', ' ', t.strip().lower())

def h(t: str) -> str:
    return hashlib.md5(norm(t).encode('utf-8')).hexdigest()[:12]

async def main():
    manifest_path = 'public/audio/manifest.json'
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    else:
        manifest = {}

    for t in texts:
        k = norm(t)
        v = h(t)
        manifest[k] = v
        f_p = f'public/audio/female/{v}.mp3'
        m_p = f'public/audio/male/{v}.mp3'
        try:
            if not os.path.exists(f_p) or os.path.getsize(f_p) < 500:
                await edge_tts.Communicate(t, 'vi-VN-HoaiMyNeural', rate='+4%', pitch='+3Hz').save(f_p)
            if not os.path.exists(m_p) or os.path.getsize(m_p) < 500:
                await edge_tts.Communicate(t, 'vi-VN-NamMinhNeural', rate='+4%', pitch='+1Hz').save(m_p)
        except Exception as e:
            print("Error generating:", e)

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("Successfully saved manifest with", len(manifest), "entries")

if __name__ == '__main__':
    asyncio.run(main())
