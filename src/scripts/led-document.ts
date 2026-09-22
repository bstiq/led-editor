import { ref, computed } from 'vue'

import { type Rgb, UNLIT, rgb } from './color'
import { LED_COLUMNS, LED_ROWS, overrideKey } from './led-matrix'

export type LayerKind = 'background' | 'pixels' | 'circle' | 'square' | 'text'
export type EditorTool = 'paint' | 'circle' | 'square' | 'text' | 'move' | 'resize'

export interface Layer {
  id: string
  name: string
  kind: LayerKind
  visible: boolean
  color: Rgb
  originCol: number
  originRow: number
  width: number
  height: number
  text: string
  overrides: Record<string, Rgb>
}

const BACKGROUND_ID = 'background'

let nextLayerId = 1

function createBackgroundLayer(): Layer {
  return {
    id: BACKGROUND_ID,
    name: 'Background',
    kind: 'background',
    visible: true,
    color: UNLIT,
    originCol: 0,
    originRow: 0,
    width: LED_COLUMNS,
    height: LED_ROWS,
    text: '',
    overrides: {},
  }
}

export const layers = ref<Layer[]>([createBackgroundLayer()])
export const selectedLayerId = ref<string>(BACKGROUND_ID)
export const activeTool = ref<EditorTool>('paint')
export const toolColor = ref<Rgb>(rgb(255, 0, 0))
export const toolText = ref('HI')

export const selectedLayer = computed(() =>
  layers.value.find((layer) => layer.id === selectedLayerId.value) ?? layers.value[0],
)

export const layersTopFirst = computed(() => [...layers.value].reverse())

function allocateId(kind: LayerKind): string {
  const id = `${kind}-${nextLayerId}`
  nextLayerId += 1
  return id
}

function defaultName(kind: LayerKind, serial: number): string {
  if (kind === 'pixels') return `Layer ${serial}`
  if (kind === 'circle') return `Circle ${serial}`
  if (kind === 'square') return `Square ${serial}`
  if (kind === 'text') return `Text ${serial}`
  return 'Background'
}

function createNamedLayer(
  kind: Exclude<LayerKind, 'background'>,
  fields: Omit<Layer, 'id' | 'name' | 'kind'>,
): Layer {
  const serial = nextLayerId
  return {
    id: allocateId(kind),
    name: defaultName(kind, serial),
    kind,
    ...fields,
  }
}

function findLayerIndex(id: string): number {
  return layers.value.findIndex((layer) => layer.id === id)
}

export function resetDocument(): void {
  nextLayerId = 1
  layers.value = [createBackgroundLayer()]
  selectedLayerId.value = BACKGROUND_ID
  activeTool.value = 'paint'
  toolColor.value = rgb(255, 0, 0)
  toolText.value = 'HI'
}

export function selectLayer(id: string): void {
  if (findLayerIndex(id) === -1) return
  selectedLayerId.value = id
}

export function createPixelLayer(): Layer {
  const layer = createNamedLayer('pixels', {
    visible: true,
    color: { ...toolColor.value },
    originCol: 0,
    originRow: 0,
    width: 0,
    height: 0,
    text: '',
    overrides: {},
  })
  layers.value = [...layers.value, layer]
  selectedLayerId.value = layer.id
  return layer
}

export function createShapeLayer(
  kind: 'circle' | 'square',
  originCol: number,
  originRow: number,
  width: number,
  height: number,
): Layer {
  const layer = createNamedLayer(kind, {
    visible: true,
    color: { ...toolColor.value },
    originCol,
    originRow,
    width: Math.max(1, width),
    height: Math.max(1, height),
    text: '',
    overrides: {},
  })
  layers.value = [...layers.value, layer]
  selectedLayerId.value = layer.id
  return layer
}

export function createTextLayer(originCol: number, originRow: number, text: string): Layer {
  const layer = createNamedLayer('text', {
    visible: true,
    color: { ...toolColor.value },
    originCol,
    originRow,
    width: 0,
    height: 0,
    text,
    overrides: {},
  })
  layers.value = [...layers.value, layer]
  selectedLayerId.value = layer.id
  return layer
}

export function removeLayer(id: string): void {
  if (id === BACKGROUND_ID) return
  const index = findLayerIndex(id)
  if (index === -1) return

  const next = layers.value.filter((layer) => layer.id !== id)
  layers.value = next

  if (selectedLayerId.value === id) {
    selectedLayerId.value = next[next.length - 1]?.id ?? BACKGROUND_ID
  }
}

export function moveLayerUp(id: string): void {
  const index = findLayerIndex(id)
  if (index === -1 || index >= layers.value.length - 1) return
  const next = [...layers.value]
  ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
  layers.value = next
}

export function moveLayerDown(id: string): void {
  const index = findLayerIndex(id)
  if (index <= 1) return // cannot go below or swap past background
  const next = [...layers.value]
  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  layers.value = next
}

export function setLayerVisible(id: string, visible: boolean): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const next = [...layers.value]
  next[index] = { ...next[index], visible }
  layers.value = next
}

export function setLayerColor(id: string, color: Rgb): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const layer = layers.value[index]
  const overrides: Record<string, Rgb> = {}
  for (const key of Object.keys(layer.overrides)) {
    overrides[key] = { ...color }
  }
  const next = [...layers.value]
  next[index] = { ...layer, color: { ...color }, overrides }
  layers.value = next
}

export function setLayerText(id: string, text: string): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const layer = layers.value[index]
  if (layer.kind !== 'text') return
  const next = [...layers.value]
  next[index] = { ...layer, text }
  layers.value = next
}

export function moveLayerOrigin(id: string, originCol: number, originRow: number): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const layer = layers.value[index]
  if (layer.kind === 'background') return
  const next = [...layers.value]
  next[index] = { ...layer, originCol, originRow }
  layers.value = next
}

export function resizeLayer(id: string, originCol: number, originRow: number, width: number, height: number): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const layer = layers.value[index]
  if (layer.kind !== 'circle' && layer.kind !== 'square') return
  const next = [...layers.value]
  next[index] = {
    ...layer,
    originCol,
    originRow,
    width: Math.max(1, width),
    height: Math.max(1, height),
  }
  layers.value = next
}

export function paintLayerCell(id: string, absoluteCol: number, absoluteRow: number, color: Rgb): void {
  const index = findLayerIndex(id)
  if (index === -1) return
  const layer = layers.value[index]
  const localCol = absoluteCol - layer.originCol
  const localRow = absoluteRow - layer.originRow
  const key = overrideKey(localCol, localRow)
  const next = [...layers.value]
  next[index] = {
    ...layer,
    overrides: {
      ...layer.overrides,
      [key]: { ...color },
    },
  }
  layers.value = next
}

export function setActiveTool(tool: EditorTool): void {
  activeTool.value = tool
}
