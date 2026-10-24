"""Generate only missing recordings for the newly added preschool activities."""
import asyncio
import hashlib
import json
import re
from pathlib import Path
import edge_tts

def normalized(text):
    return re.sub(r'\s+', ' ', text.strip().lower())

async def main():
    root = Path(__file__).resolve().parent.parent
    manifest_path = root / 'public/audio/manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    texts = json.loads((root / 'review/new-age-audio-texts.json').read_text(encoding='utf-8'))
    limit = asyncio.Semaphore(4)
    async def record(text):
        key = normalized(text)
        digest = hashlib.md5(key.encode('utf-8')).hexdigest()[:12]
        async with limit:
            for gender, voice in [('female', 'vi-VN-HoaiMyNeural'), ('male', 'vi-VN-NamMinhNeural')]:
                target = root / f'public/audio/{gender}/{digest}.mp3'
                if not target.exists() or target.stat().st_size < 400:
                    await edge_tts.Communicate(text, voice, rate='+4%').save(str(target))
                if target.stat().st_size < 400:
                    raise RuntimeError('Incomplete recording: ' + text)
            manifest[key] = digest
            print('Recorded: ' + text, flush=True)
    await asyncio.gather(*(record(text) for text in texts))
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Completed {len(texts)} phrases in both voices', flush=True)

if __name__ == '__main__':
    asyncio.run(main())
