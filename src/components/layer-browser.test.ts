import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'layer-browser.vue'),
  'utf8',
)

describe('layer browser shape size', () => {
  it('does not offer drag resize', () => {
    expect(source).not.toContain('startResize')
    expect(source).not.toContain('Resize')
  })
})
