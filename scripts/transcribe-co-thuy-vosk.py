"""Offline Vietnamese word timestamps for checking long TTS batches."""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts' / '.vendor'))
import imageio_ffmpeg  # noqa: E402
from vosk import KaldiRecognizer, Model, SetLogLevel  # noqa: E402

parser = argparse.ArgumentParser()
parser.add_argument('--batch', type=int, required=True)
args = parser.parse_args()
wav = ROOT / 'review' / 'co-thuy-batches' / f'batch-{args.batch:02d}.wav'
model_dir = ROOT / 'review' / 'vosk-models' / 'vosk-model-small-vn-0.4'
SetLogLevel(-1)
model = Model(str(model_dir))
recognizer = KaldiRecognizer(model, 16000)
recognizer.SetWords(True)
pcm = subprocess.run([
    imageio_ffmpeg.get_ffmpeg_exe(), '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-i', str(wav), '-ac', '1', '-ar', '16000', '-f', 's16le', '-'
], capture_output=True, check=True).stdout
words = []
for i in range(0, len(pcm), 16000):
    if recognizer.AcceptWaveform(pcm[i:i + 16000]):
        words.extend(json.loads(recognizer.Result()).get('result', []))
words.extend(json.loads(recognizer.FinalResult()).get('result', []))
dest = wav.with_suffix('.vosk.json')
dest.write_text(json.dumps(words, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{wav.name}: {len(words)} words, saved {dest}')
print('first:', ' '.join(w['word'] for w in words[:30]))
print('last:', ' '.join(w['word'] for w in words[-30:]))
