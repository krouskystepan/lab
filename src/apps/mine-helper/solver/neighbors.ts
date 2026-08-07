const OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

export function indexOf(x: number, y: number, width: number): number {
  return y * width + x;
}

export function coordsOf(index: number, width: number): { x: number; y: number } {
  return { x: index % width, y: Math.floor(index / width) }
}

/** Column letters: 0→A, 25→Z, 26→AA, … */
export function colLabel(x: number): string {
  let n = x
  let s = ''
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

/** Chess-style ref: A1 is top-left. */
export function cellRef(index: number, width: number): string {
  const { x, y } = coordsOf(index, width)
  return `${colLabel(x)}${y + 1}`
}

export function neighborsOf(
  index: number,
  width: number,
  height: number,
): number[] {
  const { x, y } = coordsOf(index, width);
  const result: number[] = [];
  for (const [dy, dx] of OFFSETS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      result.push(indexOf(nx, ny, width));
    }
  }
  return result;
}
