"""Split validated Gemini WAV batches at explicit double-long-pause markers.

Usage: python scripts/split-co-thuy-batches.py --pilot
       python scripts/split-co-thuy-batches.py --batch 1
       python scripts/split-co-thuy-batches.py --all
"""
import argparse
import io
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts' / '.vendor'))
import imageio_ffmpeg  # noqa: E402

CORPUS = json.loads((ROOT / 'review' / 'co-thuy-corpus.json').read_text(encoding='utf-8'))['rows']
PLAN = json.loads((ROOT / 'review' / 'co-thuy-batches.json').read_text(encoding='utf-8'))['batches']
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def read_wav(path):
    with wave.open(str(path), 'rb') as wav:
        channels, width, rate = wav.getnchannels(), wav.getsampwidth(), wav.getframerate()
        if (channels, width, rate) != (1, 2, 24000):
            raise ValueError(f'{path}: expected mono PCM16 24kHz, got {(channels, width, rate)}')
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype='<i2').copy()
    if len(samples) < rate:
        raise ValueError(f'{path}: audio is too short')
    return samples, rate


def quiet_gaps(samples, rate):
    # The double <long pause> pilot produces 1.9–3.8s silence, whereas
    # sentence punctuation remains below 0.5s. Reject ambiguous batches.
    frame = round(rate * .02)
    padded = np.pad(samples.astype(np.float32) / 32768, (0, (-len(samples)) % frame))
    rms = np.sqrt(np.mean(padded.reshape(-1, frame) ** 2, axis=1))
    quiet = rms < .01
    edges = np.diff(np.r_[False, quiet, False].astype(np.int8))
    starts = np.flatnonzero(edges == 1)
    ends = np.flatnonzero(edges == -1)
    gaps = [(int(a * frame), int(min(b * frame, len(samples)))) for a, b in zip(starts, ends)]
    return [(a, b) for a, b in gaps if (b - a) / rate >= 1.3 and a / rate >= .15 and (len(samples) - b) / rate >= .15]


def internal_gap(samples, rate, start, end, first_words, second_words):
    frame = round(rate * .02)
    left, right = max(0, round(start * rate / frame)), min(len(samples) // frame, round(end * rate / frame))
    block = samples[left * frame:right * frame].astype(np.float32).reshape(-1, frame) / 32768
    rms = np.sqrt(np.mean(block ** 2, axis=1))
    edges = np.diff(np.r_[False, rms < .01, False].astype(np.int8))
    expected = start + (end - start) * first_words / (first_words + second_words)
    candidates = []
    for a, b in zip(np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)):
        a_time, b_time = (left + a) * .02, (left + b) * .02
        duration = b_time - a_time
        if duration >= .25 and a_time > start + .2 and b_time < end - .2:
            candidates.append((duration - abs((a_time + b_time) / 2 - expected) * .12, a_time, b_time))
    if not candidates:
        raise ValueError(f'No safe gap to split two phrases inside {start:.2f}–{end:.2f}s')
    _, a_time, b_time = max(candidates)
    return a_time, b_time


def encode_mp3(samples, rate, destination):
    with io.BytesIO() as data:
        with wave.open(data, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(rate)
            wav.writeframes(samples.astype('<i2').tobytes())
        source = data.getvalue()
    temporary = destination.with_suffix('.tmp.mp3')
    result = subprocess.run([
        FFMPEG, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
        '-i', 'pipe:0', '-ac', '1', '-ar', str(rate), '-codec:a', 'libmp3lame',
        '-b:a', '64k', str(temporary),
    ], input=source, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode or not temporary.exists() or temporary.stat().st_size < 1000:
        temporary.unlink(missing_ok=True)
        raise RuntimeError(f'FFmpeg failed for {destination.name}: {result.stderr.decode(errors="replace")[:500]}')
    temporary.replace(destination)


def split(source, rows, output_dir, force=False):
    samples, rate = read_wav(source)
    gaps = quiet_gaps(samples, rate)
    if len(gaps) != len(rows) - 1:
        raise ValueError(f'{source}: detected {len(gaps)} long silences for {len(rows)} phrases; expected {len(rows)-1}. No files were written.')
    output_dir.mkdir(parents=True, exist_ok=True)
    bounds = [0] + [gap[1] for gap in gaps]
    ends = [gap[0] for gap in gaps] + [len(samples)]
    durations = []
    for row, start, end in zip(rows, bounds, ends):
        # Preserve a tiny natural lead-in and release, while removing the
        # two-second separator so the game reacts promptly.
        clip = samples[max(0, start - round(.08 * rate)):min(len(samples), end + round(.08 * rate))]
        active = np.flatnonzero(np.abs(clip) > 80)
        if len(active):
            clip = clip[max(0, active[0] - round(.1 * rate)):min(len(clip), active[-1] + round(.12 * rate))]
        duration = len(clip) / rate
        if duration < .22 or duration > 28 or np.max(np.abs(clip)) < 500:
            raise ValueError(f'Unusable clip {row["hash"]}: {duration:.2f}s')
        destination = output_dir / f'{row["hash"]}.mp3'
        if force or not destination.exists() or destination.stat().st_size < 1000:
            encode_mp3(clip, rate, destination)
        durations.append(round(duration, 2))
    print(f'{source.name}: {len(rows)} MP3 clips, {sum(durations):.1f}s speech, longest {max(durations):.1f}s')
    return durations


def split_aligned(source, rows, output_dir, force=False):
    samples, rate = read_wav(source)
    alignment = json.loads(source.with_suffix('.alignment.json').read_text(encoding='utf-8'))
    parts = alignment['parts']
    regions = [None] * len(rows)
    overrides_path = source.with_suffix('.overrides.json')
    overrides = json.loads(overrides_path.read_text(encoding='utf-8')) if overrides_path.exists() else {}
    for action in alignment['actions']:
        i, ii = action['rowStart'], action['rowEnd']
        j, jj = action['partStart'], action['partEnd']
        if action['action'] == 'skip-part':
            continue
        if action['action'] == 'missing-phrase':
            raise ValueError(f'{source.name}: missing phrase {i + 1}')
        if action['action'] == 'split-part':
            if str(i + 1) in overrides and str(i + 2) in overrides:
                continue
            a, b = internal_gap(samples, rate, parts[j]['start'], parts[j]['end'],
                                len(rows[i]['transcript'].split()), len(rows[i+1]['transcript'].split()))
            regions[i] = (parts[j]['start'], a)
            regions[i+1] = (b, parts[j]['end'])
        else:
            regions[i] = (parts[j]['start'], parts[jj-1]['end'])
    for one_based, region in overrides.items():
        index = int(one_based) - 1
        if index < 0 or index >= len(rows) or len(region) != 2 or region[0] >= region[1]:
            raise ValueError(f'Invalid override {one_based}: {region}')
        regions[index] = tuple(region)
    if any(region is None for region in regions):
        raise ValueError(f'{source.name}: not all phrases aligned')
    output_dir.mkdir(parents=True, exist_ok=True)
    durations = []
    for row, (start, end) in zip(rows, regions):
        clip = samples[max(0, round((start - .12) * rate)):min(len(samples), round((end + .12) * rate))]
        duration = len(clip) / rate
        if duration < .22 or duration > 28 or np.max(np.abs(clip)) < 500:
            raise ValueError(f'Unusable clip {row["hash"]}: {duration:.2f}s')
        destination = output_dir / f'{row["hash"]}.mp3'
        if force or not destination.exists() or destination.stat().st_size < 1000:
            encode_mp3(clip, rate, destination)
        durations.append(round(duration, 2))
    print(f'{source.name}: {len(rows)} aligned MP3 clips, {sum(durations):.1f}s speech, longest {max(durations):.1f}s')
    return durations


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--pilot', action='store_true')
    group.add_argument('--batch', type=int)
    group.add_argument('--all', action='store_true')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--aligned', action='store_true', help='Use audited offline Vietnamese word timing; write to staging')
    args = parser.parse_args()
    if args.pilot:
        split(ROOT / 'review' / 'co-thuy-batch-double-pause.wav', CORPUS[:8], ROOT / 'review' / 'co-thuy-pilot-clips', args.force)
    else:
        selected = PLAN if args.all else [PLAN[args.batch - 1]]
        for batch in selected:
            wav = ROOT / batch['wav']
            if args.all and not wav.exists():
                print(f'Skip ungenerated {wav.name}')
                continue
            rows = CORPUS[batch['first']:batch['lastExclusive']]
            if args.aligned:
                split_aligned(wav, rows, ROOT / 'review' / 'co-thuy-staging' / f'batch-{batch["number"]:02d}', args.force)
            else:
                split(wav, rows, ROOT / 'public' / 'audio' / 'co-thuy', args.force)
