/** Corner class for the board’s outer tiles (matches --board-inner-r). */
export function cellCornerClass(
  index: number,
  width: number,
  height: number
): string | undefined {
  const col = index % width
  const row = Math.floor(index / width)
  if (row === 0 && col === 0) return 'cell-r-tl'
  if (row === 0 && col === width - 1) return 'cell-r-tr'
  if (row === height - 1 && col === 0) return 'cell-r-bl'
  if (row === height - 1 && col === width - 1) return 'cell-r-br'
  return undefined
}
