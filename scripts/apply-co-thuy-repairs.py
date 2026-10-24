"""Replace three lines that the long AI Studio batch read incorrectly."""
from importlib.machinery import SourceFileLoader
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
splitter = SourceFileLoader('splitter', str(ROOT / 'scripts/split-co-thuy-batches.py')).load_module()
source = ROOT / 'review/co-thuy-batches/batch-14.wav'
samples, rate = splitter.read_wav(source)
gaps = splitter.quiet_gaps(samples, rate)
if len(gaps) != 2:
    raise ValueError(f'Expected two long pauses in repair recording; found {len(gaps)}')

repairs = [
    (8, 1, 'Gì có thể làm diều bay?'),
    (10, 56, 'Chỉ ăn kẹo'),
    (10, 57, 'Kẹo dẻo'),
]
starts = [0, gaps[0][1], gaps[1][1]]
ends = [gaps[0][0], gaps[1][0], len(samples)]
for (batch_number, one_based, phrase), start, end in zip(repairs, starts, ends):
    batch = splitter.PLAN[batch_number - 1]
    row = splitter.CORPUS[batch['first'] + one_based - 1]
    if row['transcript'].rstrip('.') != phrase.rstrip('.'):
        raise ValueError(f'Repair text mismatch: {row["transcript"]} != {phrase}')
    clip = samples[max(0, start - round(.08 * rate)):min(len(samples), end + round(.08 * rate))]
    destination = ROOT / f'review/co-thuy-staging/batch-{batch_number:02d}/{row["hash"]}.mp3'
    splitter.encode_mp3(clip, rate, destination)
    print(f'Repaired batch {batch_number} row {one_based}: {row["transcript"]}')
