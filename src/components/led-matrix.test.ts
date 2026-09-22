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

describe('led matrix shape placement', () => {
  it('places shapes on click instead of dragging size', () => {
    expect(source).toContain('createShapeLayer')
    expect(source).toContain('toolWidth')
    expect(source).toContain('toolHeight')
    expect(source).not.toContain("mode: 'resize'")
    expect(source).not.toContain('resizeLayer')
  })
})

describe('led matrix move', () => {
  it('places the selected layer origin on the clicked led', () => {
    expect(source).toContain("tool === 'move'")
    expect(source).toContain('moveLayerOrigin')
    expect(source).toContain('cell.col')
    expect(source).toContain('cell.row')
    expect(source).not.toContain('deltaCol')
    expect(source).not.toContain("mode: 'move'")
  })

  it('marks the origin led with a crosshair while move is active', () => {
    expect(source).toContain('led--move-origin')
    expect(source).toContain('originCol')
    expect(source).toContain('originRow')
    expect(source).toContain("activeTool.value !== 'move'")
  })
})
