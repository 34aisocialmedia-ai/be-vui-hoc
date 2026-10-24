"""Validate all reviewed free-tier recordings, then activate the complete bank.

Run only after all 13 AI Studio WAV batches have been transcribed, aligned,
reviewed, and split into review/co-thuy-staging/batch-NN.
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads((ROOT / 'review' / 'co-thuy-corpus.json').read_text(encoding='utf-8'))['rows']
plan = json.loads((ROOT / 'review' / 'co-thuy-batches.json').read_text(encoding='utf-8'))['batches']
if len(corpus) != 1446 or len({row['key'] for row in corpus}) != len(corpus):
    raise ValueError('Corpus changed since audio generation; regenerate the plan')
sources = []
for batch in plan:
    number = batch['number']
    wav = ROOT / batch['wav']
    for suffix in ('.wav', '.vosk.json', '.alignment.json'):
        if not wav.with_suffix(suffix).exists():
            raise FileNotFoundError(f'Batch {number} lacks {suffix} QA evidence')
    staged = ROOT / 'review' / 'co-thuy-staging' / f'batch-{number:02d}'
    for row in corpus[batch['first']:batch['lastExclusive']]:
        source = staged / f"{row['hash']}.mp3"
        if not source.exists() or source.stat().st_size < 1000:
            raise FileNotFoundError(f'Missing or empty reviewed clip for {row["text"]}: {source}')
        sources.append((row, source))
if len(sources) != len(corpus) or len({row['hash'] for row, _ in sources}) != len(corpus):
    raise ValueError('The reviewed bank is incomplete or has hash collisions')
destination = ROOT / 'public' / 'audio' / 'co-thuy'
destination.mkdir(parents=True, exist_ok=True)
for row, source in sources:
    shutil.copy2(source, destination / source.name)
manifest = {row['key']: row['hash'] for row, _ in sources}
temporary = ROOT / 'public' / 'audio' / 'manifest.co-thuy.tmp.json'
temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
temporary.replace(ROOT / 'public' / 'audio' / 'manifest.json')
print(f'Installed {len(sources)} verified Cô Thủy clips; manifest has {len(manifest)} entries')
