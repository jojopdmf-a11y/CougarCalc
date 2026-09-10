export function formatFixed(value: number, decimals: number): string {
  return value.toFixed(decimals)
}

export function nearlyEqual(actual: number, expected: number, absTol: number): boolean {
  return Math.abs(actual - expected) <= absTol
}
