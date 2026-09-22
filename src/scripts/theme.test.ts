import { describe, it, expect } from 'vitest'

import { selectedTheme, themes } from './theme'

describe('theme', () => {
  it('defaults to dark', () => {
    expect(selectedTheme.value).toBe('dark')
  })

  it('lists the daisyui and custom themes without duplicates', () => {
    expect(themes).toContain('dark')
    expect(themes).toContain('catppuccin')
    expect(themes).toContain('vscode')
    expect(new Set(themes).size).toBe(themes.length)
  })
})
