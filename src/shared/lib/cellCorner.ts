/** Corner class for the board’s outer tiles (matches --board-inner-r). */
export function cellCornerClass(
  index: number,
  width: number,
  height: number
): string | undefined {
  const col = index % width
  const row = Math.floor(index / width)
  if (row === 0 && col === 0) return 'rounded-tl-[var(--board-inner-r)]'
  if (row === 0 && col === width - 1) return 'rounded-tr-[var(--board-inner-r)]'
  if (row === height - 1 && col === 0)
    return 'rounded-bl-[var(--board-inner-r)]'
  if (row === height - 1 && col === width - 1)
    return 'rounded-br-[var(--board-inner-r)]'
  return undefined
}
