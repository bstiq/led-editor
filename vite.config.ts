import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: '',
  test: {
    passWithNoTests: true,
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
