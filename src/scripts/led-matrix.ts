// Physical panel: 12 LEDs across, 16 LEDs down.
export const LED_COLUMNS = 12
export const LED_ROWS = 16
export const LED_COUNT = LED_COLUMNS * LED_ROWS

export interface Cell {
  col: number
  row: number
}

export function indexFromCell(col: number, row: number): number {
  return row * LED_COLUMNS + col
}

export function cellFromIndex(index: number): Cell {
  return {
    col: index % LED_COLUMNS,
    row: Math.floor(index / LED_COLUMNS),
  }
}

export function isInBounds(col: number, row: number): boolean {
  return col >= 0 && col < LED_COLUMNS && row >= 0 && row < LED_ROWS
}

export function overrideKey(col: number, row: number): string {
  return `${col},${row}`
}

export function parseOverrideKey(key: string): Cell {
  const [colText, rowText] = key.split(',')
  return {
    col: Number(colText),
    row: Number(rowText),
  }
}
