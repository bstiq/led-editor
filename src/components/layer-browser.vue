<script setup lang="ts">
import { hexToRgb, rgbToHex } from '../scripts/color'
import {
  createPixelLayer,
  layersTopFirst,
  moveLayerDown,
  moveLayerUp,
  removeLayer,
  selectLayer,
  selectedLayerId,
  setActiveTool,
  setLayerColor,
  setLayerVisible,
  type Layer,
} from '../scripts/led-document'

function isBackground(layer: Layer): boolean {
  return layer.kind === 'background'
}

function canResize(layer: Layer): boolean {
  return layer.kind === 'circle' || layer.kind === 'square'
}

function canMove(layer: Layer): boolean {
  return layer.kind !== 'background'
}

function onColorInput(layer: Layer, value: string): void {
  setLayerColor(layer.id, hexToRgb(value))
}

function startMove(layer: Layer): void {
  selectLayer(layer.id)
  setActiveTool('move')
}

function startResize(layer: Layer): void {
  selectLayer(layer.id)
  setActiveTool('resize')
}
</script>

<template>
  <aside class="flex w-72 shrink-0 flex-col gap-3 rounded-box border border-base-300 bg-base-200/40 p-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-medium uppercase tracking-wide opacity-70">Layers</h2>
      <button type="button" class="btn btn-primary btn-xs" @click="createPixelLayer()">
        New layer
      </button>
    </div>

    <ul class="flex flex-col gap-2">
      <li
        v-for="layer in layersTopFirst"
        :key="layer.id"
        class="rounded-lg border border-base-300 bg-base-100 p-2"
        :class="selectedLayerId === layer.id ? 'ring-2 ring-primary' : ''"
      >
        <button
          type="button"
          class="mb-2 flex w-full items-center justify-between gap-2 text-left"
          @click="selectLayer(layer.id)"
        >
          <span class="truncate text-sm font-medium">{{ layer.name }}</span>
          <span class="badge badge-ghost badge-sm capitalize">{{ layer.kind }}</span>
        </button>

        <div class="flex flex-wrap items-center gap-1">
          <label class="tooltip" data-tip="Layer color">
            <input
              type="color"
              class="h-7 w-8 cursor-pointer rounded border border-base-300 bg-transparent p-0"
              :value="rgbToHex(layer.color)"
              :aria-label="`Color for ${layer.name}`"
              @input="onColorInput(layer, ($event.target as HTMLInputElement).value)"
            >
          </label>

          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :aria-pressed="!layer.visible"
            @click="setLayerVisible(layer.id, !layer.visible)"
          >
            {{ layer.visible ? 'Hide' : 'Show' }}
          </button>

          <button
            v-if="canMove(layer)"
            type="button"
            class="btn btn-ghost btn-xs"
            @click="startMove(layer)"
          >
            Move
          </button>

          <button
            v-if="canResize(layer)"
            type="button"
            class="btn btn-ghost btn-xs"
            @click="startResize(layer)"
          >
            Resize
          </button>

          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="isBackground(layer) || layersTopFirst[0]?.id === layer.id"
            @click="moveLayerUp(layer.id)"
          >
            Up
          </button>

          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="isBackground(layer) || layersTopFirst.at(-2)?.id === layer.id"
            @click="moveLayerDown(layer.id)"
          >
            Down
          </button>

          <button
            v-if="!isBackground(layer)"
            type="button"
            class="btn btn-ghost btn-xs text-error"
            @click="removeLayer(layer.id)"
          >
            Remove
          </button>
        </div>
      </li>
    </ul>
  </aside>
</template>
