import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'led-toolbar.vue'),
  'utf8',
)

describe('led toolbar font size', () => {
  it('offers small medium and large text size buttons', () => {
    expect(source).toContain('aria-label="Small 3 by 5"')
    expect(source).toContain('aria-label="Medium 5 by 7"')
    expect(source).toContain('aria-label="Large 12 by 16"')
    expect(source).toContain('toolFontSize')
  })
})

describe('led toolbar shape size', () => {
  it('exposes W and H number inputs for shape size', () => {
    expect(source).toContain('>W</span>')
    expect(source).toContain('>H</span>')
    expect(source).toContain('aria-label="Shape width"')
    expect(source).toContain('aria-label="Shape height"')
    expect(source).toContain('v-model.number="shapeWidth"')
    expect(source).toContain('v-model.number="shapeHeight"')
  })
})
