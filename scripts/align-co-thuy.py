"""Align the free offline Vietnamese recognizer's timed utterances to script lines.

This is a QA tool: it prints ambiguous mappings and never silently installs audio.
"""
import argparse
import difflib
import json
import math
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / 'review/co-thuy-corpus.json').read_text(encoding='utf-8'))['rows']
PLAN = json.loads((ROOT / 'review/co-thuy-batches.json').read_text(encoding='utf-8'))['batches']


def simplify(text):
    text = unicodedata.normalize('NFD', text.lower())
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.replace('đ', 'd')
    return re.sub(r'[^a-z0-9 ]+', ' ', text).split()


def score(phrase, spoken):
    left, right = simplify(phrase), simplify(spoken)
    if not left or not right:
        return 1.4
    similarity = difflib.SequenceMatcher(None, ' '.join(left), ' '.join(right)).ratio()
    length = abs(math.log((len(right) + 2) / (len(left) + 2)))
    return 1 - similarity + .16 * length


def utterances(words, min_gap=.6):
    parts, start = [], 0
    for i in range(1, len(words)):
        if words[i]['start'] - words[i-1]['end'] >= min_gap:
            parts.append(words[start:i])
            start = i
    parts.append(words[start:])
    return [{'start': p[0]['start'], 'end': p[-1]['end'], 'text': ' '.join(w['word'] for w in p)} for p in parts]


def align(rows, parts):
    n, m = len(rows), len(parts)
    best = [[(float('inf'), None) for _ in range(m + 1)] for _ in range(n + 1)]
    best[0][0] = (0, None)
    for i in range(n + 1):
        for j in range(m + 1):
            base = best[i][j][0]
            if math.isinf(base):
                continue
            transitions = []
            if i < n and j < m:
                transitions.append((i+1, j+1, score(rows[i]['transcript'], parts[j]['text']), 'one'))
            if i < n:
                for count in (2, 3, 4):
                    if j + count <= m:
                        joined = ' '.join(p['text'] for p in parts[j:j+count])
                        transitions.append((i+1, j+count, score(rows[i]['transcript'], joined) + .3 * (count-1), 'join-parts'))
            if i+1 < n and j < m:
                joined = rows[i]['transcript'] + ' ' + rows[i+1]['transcript']
                transitions.append((i+2, j+1, score(joined, parts[j]['text']) + .5, 'split-part'))
            if j < m:
                filler = simplify(parts[j]['text']) == ['khi']
                transitions.append((i, j+1, .08 if filler else 1.25, 'skip-part'))
            if i < n:
                transitions.append((i+1, j, 1.8, 'missing-phrase'))
            for ii, jj, cost, action in transitions:
                if base + cost < best[ii][jj][0]:
                    best[ii][jj] = (base + cost, (i, j, action))
    i, j = n, m
    actions = []
    while i or j:
        pi, pj, action = best[i][j][1]
        actions.append({'rowStart': pi, 'rowEnd': i, 'partStart': pj, 'partEnd': j, 'action': action})
        i, j = pi, pj
    return list(reversed(actions)), best[n][m][0]


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--batch', type=int, required=True)
    parser.add_argument('--min-gap', type=float, default=.6)
    args = parser.parse_args()
    batch = PLAN[args.batch-1]
    rows = CORPUS[batch['first']:batch['lastExclusive']]
    wav = ROOT / batch['wav']
    words = json.loads(wav.with_suffix('.vosk.json').read_text(encoding='utf-8'))
    parts = utterances(words, min_gap=args.min_gap)
    actions, total = align(rows, parts)
    out = wav.with_suffix('.alignment.json')
    out.write_text(json.dumps({'score': total, 'parts': parts, 'actions': actions}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{wav.name}: {len(rows)} phrases, {len(parts)} recognized utterances, score={total:.1f}')
    for a in actions:
        if a['action'] != 'one':
            print(a['action'], f"rows {a['rowStart']+1}-{a['rowEnd']}", f"parts {a['partStart']+1}-{a['partEnd']}",
                  ' / '.join(r['transcript'] for r in rows[a['rowStart']:a['rowEnd']]), '=>',
                  ' / '.join(p['text'] for p in parts[a['partStart']:a['partEnd']]))
