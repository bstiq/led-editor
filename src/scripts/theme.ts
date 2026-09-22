import { ref } from 'vue'

// Must stay in sync with the `@plugin "daisyui"` theme list in style.css.
export const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave',
  'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
  'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid',
  'lemonade', 'night', 'coffee', 'winter', 'dim', 'nord', 'sunset', 'caramellatte', 'silk', 'abyss',
  'andromeda', 'ayudark', 'catppuccin', 'everforest', 'flexoki', 'githubdark', 'githublight',
  'gruvbox', 'kanagawa', 'monokai', 'nightfox', 'nightowl', 'onedarkpro', 'rosepine', 'solarized',
  'tokyonight', 'vscode',
] as const

export type Theme = (typeof themes)[number]

export const selectedTheme = ref<Theme>('dark')
