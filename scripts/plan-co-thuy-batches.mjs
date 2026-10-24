import { readFileSync, writeFileSync } from 'node:fs'

const corpus = JSON.parse(readFileSync('review/co-thuy-corpus.json', 'utf8'))
const rows = corpus.rows
const pause = ' <long pause> <long pause> '
const estimate = row => row.transcript.split(/\s+/).length * .34 + 2.5
const batches = []
let start = 0
let remaining = rows.reduce((sum, row) => sum + estimate(row), 0)
const batchCount = 13
for (let number = 0; number < batchCount; number++) {
  const target = remaining / (batchCount - number)
  let seconds = 0, end = start
  while (end < rows.length && (seconds < target || number === batchCount - 1)) {
    seconds += estimate(rows[end++])
    if (number < batchCount - 1 && rows.length - end <= batchCount - number - 1) break
  }
  const selected = rows.slice(start, end)
  batches.push({
    number: number + 1,
    first: start,
    lastExclusive: end,
    expectedClips: selected.length,
    estimatedSeconds: Math.round(seconds),
    wav: `review/co-thuy-batches/batch-${String(number + 1).padStart(2, '0')}.wav`,
    text: selected.map(row => row.transcript).join(pause),
  })
  remaining -= seconds
  start = end
}
if (start !== rows.length || batches.some(batch => batch.estimatedSeconds > 600)) throw new Error('Batch plan exceeds safe model duration')
writeFileSync('review/co-thuy-batches.json', JSON.stringify({
  voice: 'Zuri', style: 'Warm, clear Vietnamese preschool teacher; smiling, gently expressive, patient medium-slow pace.',
  pause, totalClips: rows.length, batches,
}, null, 2) + '\n')
console.log(`${batches.length} free-tier batches; ${batches.map(b => b.expectedClips).join(', ')} clips; max estimated ${Math.max(...batches.map(b => b.estimatedSeconds))}s`)
