import { describe, it, expect } from 'vitest'

import { textPixels } from './bitmap-font'

describe('bitmap font', () => {
  it('rasterizes digit 1 into local pixels', () => {
    const pixels = textPixels('1')
    expect(pixels).toContainEqual({ col: 2, row: 0 })
    expect(pixels).toContainEqual({ col: 1, row: 1 })
    expect(pixels).toContainEqual({ col: 2, row: 1 })
    expect(pixels.some((pixel) => pixel.col === 0 && pixel.row === 0)).toBe(false)
  })

  it('rasterizes a 3x5 digit 1', () => {
    const pixels = textPixels('1', 'small')
    expect(pixels).toContainEqual({ col: 1, row: 0 })
    expect(pixels).toContainEqual({ col: 0, row: 1 })
    expect(pixels).toContainEqual({ col: 1, row: 1 })
    expect(pixels.some((pixel) => pixel.row === 5)).toBe(false)
    expect(pixels.some((pixel) => pixel.col === 3)).toBe(false)
  })

  it('advances small glyphs by width plus one gap', () => {
    const pixels = textPixels('11', 'small')
    const second = pixels.filter((pixel) => pixel.col >= 4)
    expect(second.length).toBeGreaterThan(0)
    expect(second).toContainEqual({ col: 5, row: 0 })
  })

  it('rasterizes a 12x16 digit 1', () => {
    const pixels = textPixels('1', 'large')
    expect(pixels).toContainEqual({ col: 5, row: 0 })
    expect(pixels).toContainEqual({ col: 4, row: 1 })
    expect(pixels.some((pixel) => pixel.row === 16)).toBe(false)
    expect(pixels.some((pixel) => pixel.col === 12)).toBe(false)
  })
})
