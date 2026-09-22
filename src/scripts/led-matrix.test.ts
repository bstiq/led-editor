import { describe, it, expect } from 'vitest'

import {
  LED_COLUMNS,
  LED_COUNT,
  LED_ROWS,
  cellFromIndex,
  indexFromCell,
  isInBounds,
  overrideKey,
  parseOverrideKey,
} from './led-matrix'

describe('led matrix dimensions', () => {
  it('describes a 12x16 panel of 192 leds', () => {
    expect(LED_COLUMNS).toBe(12)
    expect(LED_ROWS).toBe(16)
    expect(LED_COUNT).toBe(192)
  })
})

describe('led matrix cell helpers', () => {
  it('maps between 0-based index and col/row', () => {
    expect(indexFromCell(0, 0)).toBe(0)
    expect(indexFromCell(11, 0)).toBe(11)
    expect(indexFromCell(0, 1)).toBe(12)
    expect(indexFromCell(11, 15)).toBe(191)

    expect(cellFromIndex(0)).toEqual({ col: 0, row: 0 })
    expect(cellFromIndex(11)).toEqual({ col: 11, row: 0 })
    expect(cellFromIndex(12)).toEqual({ col: 0, row: 1 })
    expect(cellFromIndex(191)).toEqual({ col: 11, row: 15 })
  })

  it('checks panel bounds', () => {
    expect(isInBounds(0, 0)).toBe(true)
    expect(isInBounds(11, 15)).toBe(true)
    expect(isInBounds(-1, 0)).toBe(false)
    expect(isInBounds(12, 0)).toBe(false)
    expect(isInBounds(0, 16)).toBe(false)
  })

  it('round-trips override keys', () => {
    expect(overrideKey(3, 7)).toBe('3,7')
    expect(parseOverrideKey('3,7')).toEqual({ col: 3, row: 7 })
  })
})
