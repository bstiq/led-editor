export interface Rgb {
  r: number
  g: number
  b: number
}

export const UNLIT: Rgb = { r: 0, g: 0, b: 0 }

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function rgb(r: number, g: number, b: number): Rgb {
  return {
    r: clampChannel(r),
    g: clampChannel(g),
    b: clampChannel(b),
  }
}

export function isUnlit(color: Rgb): boolean {
  return color.r === 0 && color.g === 0 && color.b === 0
}

export function rgbToCss(color: Rgb): string {
  return `rgb(${color.r} ${color.g} ${color.b})`
}

export function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((ch) => ch + ch).join('')
    : normalized

  return rgb(
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  )
}

export function rgbToHex(color: Rgb): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0')
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}
