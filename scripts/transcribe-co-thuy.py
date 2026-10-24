"""Offline, free speech-to-text QA for AI Studio batches; never shipped to the app."""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts' / '.vendor'))
from faster_whisper import WhisperModel  # noqa: E402

parser = argparse.ArgumentParser()
parser.add_argument('--batch', type=int, required=True)
parser.add_argument('--model', default='base')
args = parser.parse_args()
wav = ROOT / 'review' / 'co-thuy-batches' / f'batch-{args.batch:02d}.wav'
model = WhisperModel(args.model, device='cpu', compute_type='int8', download_root=str(ROOT / 'review' / 'whisper-models'))
segments, info = model.transcribe(str(wav), language='vi', beam_size=5, vad_filter=False, condition_on_previous_text=False)
rows = [{'start': round(s.start, 2), 'end': round(s.end, 2), 'text': s.text.strip()} for s in segments]
dest = wav.with_suffix('.transcript.json')
dest.write_text(json.dumps({'language': info.language, 'segments': rows}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{wav.name}: {len(rows)} segments, saved {dest}')
for row in rows[:12]:
    print(row)
