<script setup lang="ts">
import { computed, watch } from 'vue'

import { type FontSize } from '../scripts/bitmap-font'
import { hexToRgb, rgbToHex } from '../scripts/color'
import {
  activeTool,
  resizeLayer,
  selectedLayer,
  setActiveTool,
  setLayerFontSize,
  setLayerText,
  toolColor,
  toolFontSize,
  toolHeight,
  toolText,
  toolWidth,
  type EditorTool,
} from '../scripts/led-document'
import { LED_COLUMNS, LED_ROWS } from '../scripts/led-matrix'

const tools: { id: EditorTool; label: string }[] = [
  { id: 'paint', label: 'Paint' },
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'text', label: 'Text' },
]

const colorHex = computed({
  get: () => rgbToHex(toolColor.value),
  set: (value: string) => {
    toolColor.value = hexToRgb(value)
  },
})

const isStamping = computed(() => activeTool.value === 'circle' || activeTool.value === 'square')

const showShapeSize = computed(() => {
  if (isStamping.value) return true
  const kind = selectedLayer.value?.kind
  return kind === 'circle' || kind === 'square'
})

const shapeWidth = computed({
  get: () => (isStamping.value ? toolWidth.value : selectedLayer.value?.width ?? toolWidth.value),
  set: (value: number) => {
    const width = Number.isFinite(value) ? Math.min(LED_COLUMNS, Math.max(1, Math.trunc(value))) : 1
    if (isStamping.value) {
      toolWidth.value = width
      return
    }
    const layer = selectedLayer.value
    if (!layer || (layer.kind !== 'circle' && layer.kind !== 'square')) return
    resizeLayer(layer.id, layer.originCol, layer.originRow, width, layer.height)
  },
})

const shapeHeight = computed({
  get: () => (isStamping.value ? toolHeight.value : selectedLayer.value?.height ?? toolHeight.value),
  set: (value: number) => {
    const height = Number.isFinite(value) ? Math.min(LED_ROWS, Math.max(1, Math.trunc(value))) : 1
    if (isStamping.value) {
      toolHeight.value = height
      return
    }
    const layer = selectedLayer.value
    if (!layer || (layer.kind !== 'circle' && layer.kind !== 'square')) return
    resizeLayer(layer.id, layer.originCol, layer.originRow, layer.width, height)
  },
})

watch(toolText, (value) => {
  const layer = selectedLayer.value
  if (layer?.kind === 'text') {
    setLayerText(layer.id, value)
  }
})

watch(toolFontSize, (value) => {
  const layer = selectedLayer.value
  if (layer?.kind === 'text') {
    setLayerFontSize(layer.id, value)
  }
})

watch(selectedLayer, (layer) => {
  if (layer?.kind === 'text') {
    toolText.value = layer.text
    toolFontSize.value = layer.fontSize
  }
})

function chooseTool(tool: EditorTool): void {
  setActiveTool(tool)
}

function chooseFontSize(size: FontSize): void {
  toolFontSize.value = size
  chooseTool('text')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-base-300 px-6 py-3">
    <label class="flex items-center gap-2 text-sm">
      <span class="opacity-70">Color</span>
      <input
        v-model="colorHex"
        type="color"
        class="h-8 w-10 cursor-pointer rounded border border-base-300 bg-transparent p-0"
        aria-label="Tool color"
      >
    </label>

    <div class="join">
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        class="btn btn-sm join-item"
        :class="activeTool === tool.id ? 'btn-primary' : 'btn-ghost'"
        @click="chooseTool(tool.id)"
      >
        {{ tool.label }}
      </button>
    </div>

    <label v-if="showShapeSize" class="flex items-center gap-2 text-sm">
      <span class="opacity-70">W</span>
      <input
        v-model.number="shapeWidth"
        type="number"
        min="1"
        :max="LED_COLUMNS"
        class="input input-bordered input-sm w-16"
        aria-label="Shape width"
      >
    </label>

    <label v-if="showShapeSize" class="flex items-center gap-2 text-sm">
      <span class="opacity-70">H</span>
      <input
        v-model.number="shapeHeight"
        type="number"
        min="1"
        :max="LED_ROWS"
        class="input input-bordered input-sm w-16"
        aria-label="Shape height"
      >
    </label>

    <label class="flex items-center gap-2 text-sm">
      <span class="opacity-70">Text</span>
      <input
        v-model="toolText"
        type="text"
        maxlength="12"
        class="input input-bordered input-sm w-36"
        aria-label="Text to place"
        @focus="chooseTool('text')"
      >
    </label>

    <div class="join">
      <button
        type="button"
        class="btn btn-sm join-item"
        :class="toolFontSize === 'small' ? 'btn-primary' : 'btn-ghost'"
        aria-label="Small 3 by 5"
        @click="chooseFontSize('small')"
      >
        S
      </button>
      <button
        type="button"
        class="btn btn-sm join-item"
        :class="toolFontSize === 'medium' ? 'btn-primary' : 'btn-ghost'"
        aria-label="Medium 5 by 7"
        @click="chooseFontSize('medium')"
      >
        M
      </button>
      <button
        type="button"
        class="btn btn-sm join-item"
        :class="toolFontSize === 'large' ? 'btn-primary' : 'btn-ghost'"
        aria-label="Large 12 by 16"
        @click="chooseFontSize('large')"
      >
        L
      </button>
    </div>
  </div>
</template>
