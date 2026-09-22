import { textPixels } from './bitmap-font'
import { type Rgb } from './color'
import {
  LED_COUNT,
  cellFromIndex,
  isInBounds,
  overrideKey,
  parseOverrideKey,
} from './led-matrix'
import { type Layer } from './led-document'

export interface CoveredCell {
  col: number
  row: number
  color: Rgb
}

function coversEllipse(localCol: number, localRow: number, width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false
  if (width === 1 && height === 1) return localCol === 0 && localRow === 0

  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const radiusX = width / 2
  const radiusY = height / 2
  const dx = (localCol - centerX) / radiusX
  const dy = (localRow - centerY) / radiusY
  return dx * dx + dy * dy <= 1
}

function shapeCoverage(layer: Layer): CoveredCell[] {
  const cells: CoveredCell[] = []
  for (let localRow = 0; localRow < layer.height; localRow += 1) {
    for (let localCol = 0; localCol < layer.width; localCol += 1) {
      const covered = layer.kind === 'square'
        || (layer.kind === 'circle' && coversEllipse(localCol, localRow, layer.width, layer.height))
      if (!covered) continue

      const col = layer.originCol + localCol
      const row = layer.originRow + localRow
      if (!isInBounds(col, row)) continue
      cells.push({ col, row, color: { ...layer.color } })
    }
  }
  return cells
}

function textCoverage(layer: Layer): CoveredCell[] {
  return textPixels(layer.text, layer.fontSize)
    .map((pixel) => ({
      col: layer.originCol + pixel.col,
      row: layer.originRow + pixel.row,
      color: { ...layer.color },
    }))
    .filter((cell) => isInBounds(cell.col, cell.row))
}

function backgroundCoverage(layer: Layer): CoveredCell[] {
  const cells: CoveredCell[] = []
  for (let index = 0; index < LED_COUNT; index += 1) {
    const { col, row } = cellFromIndex(index)
    cells.push({ col, row, color: { ...layer.color } })
  }
  return cells
}

function applyOverrides(layer: Layer, base: CoveredCell[]): CoveredCell[] {
  const byKey = new Map<string, CoveredCell>()
  for (const cell of base) {
    byKey.set(overrideKey(cell.col, cell.row), cell)
  }

  for (const [localKey, color] of Object.entries(layer.overrides)) {
    const local = parseOverrideKey(localKey)
    const col = layer.originCol + local.col
    const row = layer.originRow + local.row
    if (!isInBounds(col, row)) continue
    byKey.set(overrideKey(col, row), { col, row, color: { ...color } })
  }

  return [...byKey.values()]
}

export function rasterizeLayer(layer: Layer): CoveredCell[] {
  let base: CoveredCell[] = []

  if (layer.kind === 'background') {
    base = backgroundCoverage(layer)
  } else if (layer.kind === 'circle' || layer.kind === 'square') {
    base = shapeCoverage(layer)
  } else if (layer.kind === 'text') {
    base = textCoverage(layer)
  } else {
    base = []
  }

  return applyOverrides(layer, base)
}

export function normalizeRect(
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
): { originCol: number; originRow: number; width: number; height: number } {
  const originCol = Math.min(startCol, endCol)
  const originRow = Math.min(startRow, endRow)
  const width = Math.abs(endCol - startCol) + 1
  const height = Math.abs(endRow - startRow) + 1
  return { originCol, originRow, width, height }
}
