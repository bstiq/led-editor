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
  selectedLayer,
  selectedLayerId,
  toolColor,
  toolHeight,
  toolText,
  toolWidth,
} from '../scripts/led-document'
import { LED_COLUMNS, LED_COUNT, cellFromIndex } from '../scripts/led-matrix'
import { rasterizeLayer } from '../scripts/rasterize'

const UNLIT_CSS = 'oklch(26% 0.01 260)'

interface DragState {
  mode: 'paint'
  startCol: number
  startRow: number
  currentCol: number
  currentRow: number
}

const drag = ref<DragState | null>(null)

const composited = computed(() => compositeLayers(layers.value))

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
    }
    paintAt(cell.col, cell.row)
    return
  }

  if (tool === 'text') {
    createTextLayer(cell.col, cell.row, toolText.value || ' ')
    return
  }

  if (tool === 'circle' || tool === 'square') {
    createShapeLayer(tool, cell.col, cell.row, toolWidth.value, toolHeight.value)
    return
  }

  if (tool === 'move') {
    if (layer && layer.kind !== 'background') {
      moveLayerOrigin(layer.id, cell.col, cell.row)
    }
    return
  }
}

function isMoveOrigin(index: number): boolean {
  if (activeTool.value !== 'move') return false
  const layer = selectedLayer.value
  if (!layer || layer.kind === 'background') return false
  const { col, row } = cellFromIndex(index)
  return col === layer.originCol && row === layer.originRow
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
  }
}

function onPointerUp(): void {
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
        :class="{ 'led--move-origin': isMoveOrigin(index - 1) }"
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
}

.led--move-origin::before {
  content: "";
  position: absolute;
  inset: 20%;
  background:
    linear-gradient(oklch(100% 0 0) 0 0) 50% 50% / 100% 2px no-repeat,
    linear-gradient(oklch(100% 0 0) 0 0) 50% 50% / 2px 100% no-repeat;
  pointer-events: none;
  z-index: 1;
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
