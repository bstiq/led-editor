import { describe, it, expect } from 'vitest'

import { rgb } from './color'
import { type Layer } from './led-document'
import { indexFromCell } from './led-matrix'
import { normalizeRect, rasterizeLayer } from './rasterize'

function baseLayer(partial: Partial<Layer> & Pick<Layer, 'kind'>): Layer {
  return {
    id: 'test',
    name: 'Test',
    visible: true,
    color: rgb(255, 0, 0),
    originCol: 0,
    originRow: 0,
    width: 1,
    height: 1,
    text: '',
    fontSize: 'medium',
    overrides: {},
    ...partial,
  }
}

describe('rasterize', () => {
  it('fills a square bbox', () => {
    const layer = baseLayer({ kind: 'square', originCol: 1, originRow: 1, width: 2, height: 2 })
    const cells = rasterizeLayer(layer)
    expect(cells).toHaveLength(4)
    expect(cells).toContainEqual({ col: 1, row: 1, color: rgb(255, 0, 0) })
    expect(cells).toContainEqual({ col: 2, row: 2, color: rgb(255, 0, 0) })
  })

  it('fills a circle inscribed in the bbox', () => {
    const layer = baseLayer({ kind: 'circle', originCol: 0, originRow: 0, width: 5, height: 5 })
    const cells = rasterizeLayer(layer)
    expect(cells.some((cell) => cell.col === 2 && cell.row === 2)).toBe(true)
    expect(cells.some((cell) => cell.col === 0 && cell.row === 0)).toBe(false)
    expect(cells.every((cell) => cell.color.r === 255)).toBe(true)
  })

  it('rasterizes text and applies overrides that follow origin', () => {
    const layer = baseLayer({
      kind: 'text',
      text: '1',
      originCol: 0,
      originRow: 0,
      overrides: { '2,0': rgb(0, 255, 0) },
    })
    let cells = rasterizeLayer(layer)
    expect(cells.find((cell) => cell.col === 2 && cell.row === 0)?.color).toEqual(rgb(0, 255, 0))

    layer.originCol = 3
    cells = rasterizeLayer(layer)
    expect(cells.find((cell) => cell.col === 5 && cell.row === 0)?.color).toEqual(rgb(0, 255, 0))
  })

  it('rasterizes text with the layer font size', () => {
    const layer = baseLayer({ kind: 'text', text: '1', fontSize: 'small' })
    const cells = rasterizeLayer(layer)
    expect(cells).toContainEqual({ col: 1, row: 0, color: rgb(255, 0, 0) })
    expect(cells.some((cell) => cell.col === 2 && cell.row === 0)).toBe(false)
  })

  it('covers only overrides for pixel layers', () => {
    const layer = baseLayer({
      kind: 'pixels',
      overrides: { '1,2': rgb(0, 0, 255) },
    })
    expect(rasterizeLayer(layer)).toEqual([{ col: 1, row: 2, color: rgb(0, 0, 255) }])
  })

  it('normalizes drag rectangles', () => {
    expect(normalizeRect(4, 5, 1, 2)).toEqual({
      originCol: 1,
      originRow: 2,
      width: 4,
      height: 4,
    })
  })

  it('covers the full panel for background', () => {
    const layer = baseLayer({ kind: 'background', color: rgb(10, 10, 10) })
    expect(rasterizeLayer(layer)).toHaveLength(192)
    expect(rasterizeLayer(layer)[indexFromCell(0, 0)].color).toEqual(rgb(10, 10, 10))
  })
})
