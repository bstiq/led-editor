import { describe, it, expect, beforeEach } from 'vitest'

import { rgb } from './color'
import {
  activeTool,
  createPixelLayer,
  createShapeLayer,
  createTextLayer,
  layers,
  moveLayerDown,
  moveLayerOrigin,
  moveLayerUp,
  paintLayerCell,
  removeLayer,
  resetDocument,
  resizeLayer,
  selectLayer,
  selectedLayerId,
  setActiveTool,
  setLayerColor,
  setLayerFontSize,
  setLayerText,
  setLayerVisible,
  toolColor,
  toolFontSize,
  toolHeight,
  toolWidth,
} from './led-document'

describe('led document', () => {
  beforeEach(() => {
    resetDocument()
  })

  it('starts with a background layer selected', () => {
    expect(layers.value).toHaveLength(1)
    expect(layers.value[0].kind).toBe('background')
    expect(selectedLayerId.value).toBe('background')
    expect(activeTool.value).toBe('paint')
  })

  it('creates pixel layers on top and selects them', () => {
    const layer = createPixelLayer()
    expect(layers.value).toHaveLength(2)
    expect(layers.value[1].id).toBe(layer.id)
    expect(layer.kind).toBe('pixels')
    expect(selectedLayerId.value).toBe(layer.id)
  })

  it('creates shape and text layers with the tool color', () => {
    toolColor.value = rgb(0, 255, 0)
    const circle = createShapeLayer('circle', 1, 2, 4, 4)
    expect(circle.color).toEqual(rgb(0, 255, 0))
    expect(circle.width).toBe(4)

    const text = createTextLayer(0, 0, 'AB')
    expect(text.kind).toBe('text')
    expect(text.text).toBe('AB')
    expect(selectedLayerId.value).toBe(text.id)
  })

  it('removes non-background layers and reselects', () => {
    const layer = createPixelLayer()
    removeLayer(layer.id)
    expect(layers.value).toHaveLength(1)
    expect(selectedLayerId.value).toBe('background')

    removeLayer('background')
    expect(layers.value).toHaveLength(1)
  })

  it('reorders layers without moving background below others', () => {
    const a = createPixelLayer()
    const b = createPixelLayer()
    // stack: bg, a, b (b on top)
    moveLayerDown(b.id)
    expect(layers.value.map((layer) => layer.id)).toEqual(['background', b.id, a.id])

    moveLayerDown(b.id)
    expect(layers.value.map((layer) => layer.id)).toEqual(['background', b.id, a.id])

    moveLayerUp(b.id)
    expect(layers.value.map((layer) => layer.id)).toEqual(['background', a.id, b.id])
  })

  it('hides, recolors, paints, moves, and resizes', () => {
    const circle = createShapeLayer('circle', 2, 2, 3, 3)
    setLayerVisible(circle.id, false)
    expect(layers.value.find((layer) => layer.id === circle.id)?.visible).toBe(false)

    paintLayerCell(circle.id, 3, 3, rgb(1, 2, 3))
    let layer = layers.value.find((entry) => entry.id === circle.id)!
    expect(layer.overrides['1,1']).toEqual(rgb(1, 2, 3))

    moveLayerOrigin(circle.id, 5, 6)
    layer = layers.value.find((entry) => entry.id === circle.id)!
    expect(layer.originCol).toBe(5)
    expect(layer.originRow).toBe(6)
    expect(layer.overrides['1,1']).toEqual(rgb(1, 2, 3))

    resizeLayer(circle.id, 0, 0, 5, 5)
    layer = layers.value.find((entry) => entry.id === circle.id)!
    expect(layer.width).toBe(5)
    expect(layer.height).toBe(5)

    setLayerColor(circle.id, rgb(9, 9, 9))
    layer = layers.value.find((entry) => entry.id === circle.id)!
    expect(layer.color).toEqual(rgb(9, 9, 9))
    expect(layer.overrides['1,1']).toEqual(rgb(9, 9, 9))

    const text = createTextLayer(0, 0, 'A')
    setLayerText(text.id, 'Z')
    expect(layers.value.find((entry) => entry.id === text.id)?.text).toBe('Z')

    selectLayer('background')
    expect(selectedLayerId.value).toBe('background')
  })

  it('defaults stamp size to 3x3 and resets it', () => {
    toolWidth.value = 8
    toolHeight.value = 9
    resetDocument()
    expect(toolWidth.value).toBe(3)
    expect(toolHeight.value).toBe(3)
  })

  it('leaves stamp mode when selecting a shape', () => {
    const circle = createShapeLayer('circle', 0, 0, 3, 3)
    setActiveTool('square')
    selectLayer(circle.id)
    expect(selectedLayerId.value).toBe(circle.id)
    expect(activeTool.value).toBe('paint')
  })

  it('keeps stamp mode when selecting a non-shape layer', () => {
    createShapeLayer('circle', 0, 0, 3, 3)
    setActiveTool('circle')
    selectLayer('background')
    expect(selectedLayerId.value).toBe('background')
    expect(activeTool.value).toBe('circle')
  })

  it('stores the tool font size on new text layers and updates text layers only', () => {
    toolFontSize.value = 'small'
    const text = createTextLayer(0, 0, 'A')
    expect(text.fontSize).toBe('small')

    setLayerFontSize(text.id, 'large')
    expect(layers.value.find((entry) => entry.id === text.id)?.fontSize).toBe('large')

    setLayerFontSize('background', 'small')
    expect(layers.value[0].fontSize).toBe('medium')
  })
})
