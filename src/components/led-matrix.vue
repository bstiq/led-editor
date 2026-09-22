<script setup lang="ts">
import { computed, ref } from 'vue'

import { isUnlit, rgbToCss } from '../scripts/color'
import { compositeLayers } from '../scripts/composite'
import {
  activeTool,
  createShapeLayer,
  createTextLayer,
  layers,
  moveLayerOrigin,
  paintLayerCell,
  resizeLayer,
  selectedLayer,
  selectedLayerId,
  toolColor,
  toolText,
  type Layer,
} from '../scripts/led-document'
import { LED_COLUMNS, LED_COUNT, cellFromIndex } from '../scripts/led-matrix'
import { normalizeRect, rasterizeLayer } from '../scripts/rasterize'

const UNLIT_CSS = 'oklch(26% 0.01 260)'

interface DragState {
  mode: 'paint' | 'circle' | 'square' | 'move' | 'resize'
  startCol: number
  startRow: number
  currentCol: number
  currentRow: number
  moveOriginCol: number
  moveOriginRow: number
}

const drag = ref<DragState | null>(null)

const previewLayer = computed<Layer | null>(() => {
  if (!drag.value) return null
  if (drag.value.mode === 'circle' || drag.value.mode === 'square') {
    const rect = normalizeRect(
      drag.value.startCol,
      drag.value.startRow,
      drag.value.currentCol,
      drag.value.currentRow,
    )
    return {
      id: 'preview',
      name: 'Preview',
      kind: drag.value.mode,
      visible: true,
      color: { ...toolColor.value },
      originCol: rect.originCol,
      originRow: rect.originRow,
      width: rect.width,
      height: rect.height,
      text: '',
      overrides: {},
    }
  }
  return null
})

const composited = computed(() => {
  const preview = previewLayer.value
  return preview
    ? compositeLayers([...layers.value, preview])
    : compositeLayers(layers.value)
})

const selectedCoverage = computed(() => {
  const layer = selectedLayer.value
  if (!layer || !layer.visible) return new Set<string>()
  const keys = new Set<string>()
  for (const cell of rasterizeLayer(layer)) {
    keys.add(`${cell.col},${cell.row}`)
  }
  return keys
})

function ledStyle(index: number): Record<string, string> {
  const color = composited.value[index] ?? { r: 0, g: 0, b: 0 }
  const { col, row } = cellFromIndex(index)
  const selected = selectedCoverage.value.has(`${col},${row}`)
  return {
    backgroundColor: isUnlit(color) ? UNLIT_CSS : rgbToCss(color),
    boxShadow: selected
      ? 'inset 0 0 0 1px oklch(100% 0 0 / 8%), 0 0 0 2px oklch(70% 0.15 250)'
      : 'inset 0 0 0 1px oklch(100% 0 0 / 8%)',
  }
}

function cellFromEvent(event: PointerEvent): { col: number; row: number } | null {
  const target = event.target
  if (!(target instanceof HTMLElement)) return null
  const indexAttr = target.dataset.ledIndex
  if (indexAttr === undefined) return null
  const index = Number(indexAttr)
  if (!Number.isInteger(index) || index < 0 || index >= LED_COUNT) return null
  return cellFromIndex(index)
}

function paintAt(col: number, row: number): void {
  paintLayerCell(selectedLayerId.value, col, row, toolColor.value)
}

function onPointerDown(event: PointerEvent): void {
  const cell = cellFromEvent(event)
  if (!cell) return
  const board = event.currentTarget
  if (board instanceof HTMLElement) {
    board.setPointerCapture(event.pointerId)
  }

  const tool = activeTool.value
  const layer = selectedLayer.value

  if (tool === 'paint') {
    drag.value = {
      mode: 'paint',
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
      moveOriginCol: 0,
      moveOriginRow: 0,
    }
    paintAt(cell.col, cell.row)
    return
  }

  if (tool === 'text') {
    createTextLayer(cell.col, cell.row, toolText.value || ' ')
    return
  }

  if (tool === 'circle' || tool === 'square') {
    drag.value = {
      mode: tool,
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
      moveOriginCol: 0,
      moveOriginRow: 0,
    }
    return
  }

  if (tool === 'move' && layer && layer.kind !== 'background') {
    drag.value = {
      mode: 'move',
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
      moveOriginCol: layer.originCol,
      moveOriginRow: layer.originRow,
    }
    return
  }

  if (tool === 'resize' && layer && (layer.kind === 'circle' || layer.kind === 'square')) {
    drag.value = {
      mode: 'resize',
      startCol: cell.col,
      startRow: cell.row,
      currentCol: cell.col,
      currentRow: cell.row,
      moveOriginCol: layer.originCol,
      moveOriginRow: layer.originRow,
    }
  }
}

function onPointerMove(event: PointerEvent): void {
  if (!drag.value) return
  const cell = cellFromEvent(event)
  if (!cell) return

  drag.value = {
    ...drag.value,
    currentCol: cell.col,
    currentRow: cell.row,
  }

  if (drag.value.mode === 'paint') {
    paintAt(cell.col, cell.row)
    return
  }

  if (drag.value.mode === 'move') {
    const deltaCol = cell.col - drag.value.startCol
    const deltaRow = cell.row - drag.value.startRow
    moveLayerOrigin(
      selectedLayerId.value,
      drag.value.moveOriginCol + deltaCol,
      drag.value.moveOriginRow + deltaRow,
    )
    return
  }

  if (drag.value.mode === 'resize') {
    const rect = normalizeRect(
      drag.value.moveOriginCol,
      drag.value.moveOriginRow,
      cell.col,
      cell.row,
    )
    resizeLayer(selectedLayerId.value, rect.originCol, rect.originRow, rect.width, rect.height)
  }
}

function onPointerUp(): void {
  if (!drag.value) return

  if (drag.value.mode === 'circle' || drag.value.mode === 'square') {
    const rect = normalizeRect(
      drag.value.startCol,
      drag.value.startRow,
      drag.value.currentCol,
      drag.value.currentRow,
    )
    createShapeLayer(drag.value.mode, rect.originCol, rect.originRow, rect.width, rect.height)
  }

  drag.value = null
}

function onPointerCancel(): void {
  drag.value = null
}
</script>

<template>
  <div
    class="led-board select-none"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <div
      class="grid gap-2"
      :style="{ gridTemplateColumns: `repeat(${LED_COLUMNS}, minmax(0, 1fr))` }"
    >
      <div
        v-for="index in LED_COUNT"
        :key="index - 1"
        class="led"
        :data-led-index="index - 1"
        :style="ledStyle(index - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
.led-board {
  padding: 1.25rem;
  border-radius: 1rem;
  background-color: oklch(16% 0.01 260);
  box-shadow: inset 0 1px 0 oklch(100% 0 0 / 6%), 0 12px 32px oklch(0% 0 0 / 35%);
  touch-action: none;
}

.led {
  position: relative;
  aspect-ratio: 1;
  width: 30px;
  border-radius: 50%;
  background-color: oklch(26% 0.01 260);
  box-shadow: inset 0 0 0 1px oklch(100% 0 0 / 8%);
  /* cursor: crosshair; */
}

.led::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid oklch(100% 0 0 / 18%);
  pointer-events: none;
}
</style>
