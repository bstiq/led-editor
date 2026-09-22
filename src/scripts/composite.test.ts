import { describe, it, expect } from 'vitest'

import { rgb, UNLIT } from './color'
import { type Layer } from './led-document'
import { indexFromCell } from './led-matrix'
import { compositeLayers } from './composite'

function layer(partial: Partial<Layer> & Pick<Layer, 'id' | 'kind'>): Layer {
  return {
    name: partial.id,
    visible: true,
    color: rgb(255, 0, 0),
    originCol: 0,
    originRow: 0,
    width: 1,
    height: 1,
    text: '',
    overrides: {},
    ...partial,
  }
}

describe('composite', () => {
  it('lets the top visible layer win', () => {
    const docs: Layer[] = [
      layer({ id: 'bg', kind: 'background', color: rgb(1, 1, 1) }),
      layer({ id: 'a', kind: 'square', originCol: 0, originRow: 0, width: 2, height: 2, color: rgb(255, 0, 0) }),
      layer({ id: 'b', kind: 'square', originCol: 0, originRow: 0, width: 1, height: 1, color: rgb(0, 255, 0) }),
    ]

    const colors = compositeLayers(docs)
    expect(colors[indexFromCell(0, 0)]).toEqual(rgb(0, 255, 0))
    expect(colors[indexFromCell(1, 0)]).toEqual(rgb(255, 0, 0))
    expect(colors[indexFromCell(2, 0)]).toEqual(rgb(1, 1, 1))
  })

  it('skips hidden layers', () => {
    const docs: Layer[] = [
      layer({ id: 'bg', kind: 'background', color: UNLIT }),
      layer({
        id: 'a',
        kind: 'square',
        visible: false,
        originCol: 0,
        originRow: 0,
        width: 2,
        height: 2,
        color: rgb(255, 0, 0),
      }),
    ]

    const colors = compositeLayers(docs)
    expect(colors[indexFromCell(0, 0)]).toEqual(UNLIT)
  })

  it('reorders by array order where later entries are on top', () => {
    const bottomOnTop: Layer[] = [
      layer({ id: 'bg', kind: 'background', color: UNLIT }),
      layer({ id: 'top', kind: 'square', width: 1, height: 1, color: rgb(0, 0, 255) }),
      layer({ id: 'mid', kind: 'square', width: 1, height: 1, color: rgb(255, 255, 0) }),
    ]

    // mid is last => topmost
    expect(compositeLayers(bottomOnTop)[0]).toEqual(rgb(255, 255, 0))
  })
})
