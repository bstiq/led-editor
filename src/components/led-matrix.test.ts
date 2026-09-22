import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'led-matrix.vue'),
  'utf8',
)

describe('led matrix rings', () => {
  it('draws a circle around every led so off leds stay visible', () => {
    expect(source).toContain('.led::after')
    expect(source).toContain('inset: -2px')
    expect(source).toContain('border-radius: 50%')
    expect(source).toContain('border: 1px solid oklch(100% 0 0 / 18%)')
    expect(source).toContain('pointer-events: none')
  })
})
