import { type Rgb, UNLIT } from './color'
import { LED_COUNT, indexFromCell } from './led-matrix'
import { type Layer } from './led-document'
import { rasterizeLayer } from './rasterize'

export function compositeLayers(documentLayers: Layer[]): Rgb[] {
  const result: Rgb[] = Array.from({ length: LED_COUNT }, () => ({ ...UNLIT }))
  const filled = new Array<boolean>(LED_COUNT).fill(false)

  for (let layerIndex = documentLayers.length - 1; layerIndex >= 0; layerIndex -= 1) {
    const layer = documentLayers[layerIndex]
    if (!layer.visible) continue

    for (const cell of rasterizeLayer(layer)) {
      const index = indexFromCell(cell.col, cell.row)
      if (filled[index]) continue
      result[index] = { ...cell.color }
      filled[index] = true
    }
  }

  return result
}
