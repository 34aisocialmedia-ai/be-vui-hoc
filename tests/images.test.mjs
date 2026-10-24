import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const files = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? files(path) : [path]
})

test('game pictures use the optimized WebP files, never the heavy PNG/JPG originals', () => {
  for (const file of files('src').filter(f => /\.(tsx?|css)$/.test(f))) {
    const heavy = readFileSync(file, 'utf8').match(/\/assets\/(?:images|objects|covers|photos)\/[^'"`)\s]*\.(?:png|jpe?g)/g)
    assert.equal(heavy, null, `${file}: ${heavy}`)
  }
})
