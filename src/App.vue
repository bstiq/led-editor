<script setup lang="ts">
import { watch } from 'vue'

import LayerBrowser from './components/layer-browser.vue'
import LedMatrix from './components/led-matrix.vue'
import LedToolbar from './components/led-toolbar.vue'
import { selectedTheme, themes } from './scripts/theme'

watch(selectedTheme, (theme) => {
  document.documentElement.dataset.theme = theme
}, { immediate: true })
</script>

<template>
  <main class="main-content-wash flex min-h-screen flex-col">
    <header class="flex items-center justify-between gap-4 px-6 py-4">
      <h1 class="text-xl font-medium">LED Editor</h1>

      <div class="flex items-center gap-2">
        <label class="sr-only" for="theme-select">Theme</label>
        <select
          id="theme-select"
          v-model="selectedTheme"
          class="select select-bordered select-sm max-w-[11rem]"
        >
          <option v-for="theme in themes" :key="theme" :value="theme">
            {{ theme }}
          </option>
        </select>
      </div>
    </header>

    <LedToolbar />

    <section class="flex flex-1 flex-col items-center justify-center gap-6 p-6 lg:flex-row lg:items-start">
      <LedMatrix />
      <LayerBrowser />
    </section>
  </main>
</template>
