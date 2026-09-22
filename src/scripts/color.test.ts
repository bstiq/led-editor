import { describe, it, expect } from 'vitest'

import {
  UNLIT,
  hexToRgb,
  isUnlit,
  rgb,
  rgbToCss,
  rgbToHex,
} from './color'

describe('rgb helpers', () => {
  it('clamps channels into 0-255', () => {
    expect(rgb(-10, 300, 128)).toEqual({ r: 0, g: 255, b: 128 })
  })

  it('detects unlit black', () => {
    expect(isUnlit(UNLIT)).toBe(true)
    expect(isUnlit(rgb(1, 0, 0))).toBe(false)
  })

  it('formats css and hex', () => {
    const red = rgb(255, 0, 0)
    expect(rgbToCss(red)).toBe('rgb(255 0 0)')
    expect(rgbToHex(red)).toBe('#ff0000')
    expect(hexToRgb('#ff0000')).toEqual(red)
    expect(hexToRgb('#f00')).toEqual(red)
  })
})
