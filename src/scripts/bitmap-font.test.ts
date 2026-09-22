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
})
