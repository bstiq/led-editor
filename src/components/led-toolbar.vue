<script setup lang="ts">
import { computed, watch } from 'vue'

import { hexToRgb, rgbToHex } from '../scripts/color'
import {
  activeTool,
  selectedLayer,
  setActiveTool,
  setLayerText,
  toolColor,
  toolText,
  type EditorTool,
} from '../scripts/led-document'

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

watch(toolText, (value) => {
  const layer = selectedLayer.value
  if (layer?.kind === 'text') {
    setLayerText(layer.id, value)
  }
})

watch(selectedLayer, (layer) => {
  if (layer?.kind === 'text') {
    toolText.value = layer.text
  }
})

function chooseTool(tool: EditorTool): void {
  setActiveTool(tool)
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
  </div>
</template>
