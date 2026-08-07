import type { BoardCell, UserCell } from '../solver/types';
import { MAX_GRID, MIN_GRID } from '../solver/types';

const emptyCell = (): BoardCell => ({
  user: { type: 'empty' } satisfies UserCell,
});

function keepUser(cell: BoardCell): BoardCell {
  return { user: cell.user };
}

function isMarked(cell: BoardCell): boolean {
  return cell.user.type !== 'empty';
}

export type EdgePads = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

/** Grow/shrink by adding or removing rows/cols on specific edges. */
export function padBoard(
  cells: BoardCell[],
  width: number,
  height: number,
  pads: EdgePads,
): { width: number; height: number; cells: BoardCell[] } {
  const left = pads.left ?? 0;
  const right = pads.right ?? 0;
  const top = pads.top ?? 0;
  const bottom = pads.bottom ?? 0;

  const newW = width + left + right;
  const newH = height + top + bottom;
  if (newW < MIN_GRID || newH < MIN_GRID || newW > MAX_GRID || newH > MAX_GRID) {
    return { width, height, cells };
  }

  const next: BoardCell[] = Array.from({ length: newW * newH }, emptyCell);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x + left;
      const ny = y + top;
      if (nx < 0 || ny < 0 || nx >= newW || ny >= newH) continue;
      next[ny * newW + nx] = keepUser(cells[y * width + x]);
    }
  }

  return { width: newW, height: newH, cells: next };
}

/**
 * Resize to an exact size, anchoring content to the top-left.
 * Extra space is added on the right/bottom; shrink crops right/bottom.
 */
export function resizeBoard(
  cells: BoardCell[],
  width: number,
  height: number,
  newWidth: number,
  newHeight: number,
): { width: number; height: number; cells: BoardCell[] } {
  const w = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(newWidth)));
  const h = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.floor(newHeight)));
  if (w === width && h === height) {
    return { width, height, cells };
  }
  return padBoard(cells, width, height, {
    right: w - width,
    bottom: h - height,
  });
}

/** Move marks by (dx, dy); cells that leave the board are dropped. */
export function shiftBoard(
  cells: BoardCell[],
  width: number,
  height: number,
  dx: number,
  dy: number,
): BoardCell[] {
  if (dx === 0 && dy === 0) return cells;
  const next: BoardCell[] = Array.from({ length: width * height }, emptyCell);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      next[ny * width + nx] = keepUser(cells[y * width + x]);
    }
  }
  return next;
}

/** How many marked cells would fall off the board for this shift. */
export function countShiftCrop(
  cells: BoardCell[],
  width: number,
  height: number,
  dx: number,
  dy: number,
): number {
  if (dx === 0 && dy === 0) return 0;
  let n = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isMarked(cells[y * width + x])) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) n++;
    }
  }
  return n;
}

export function flipBoardHorizontal(
  cells: BoardCell[],
  width: number,
  height: number,
): BoardCell[] {
  const next: BoardCell[] = Array.from({ length: width * height }, emptyCell);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      next[y * width + (width - 1 - x)] = keepUser(cells[y * width + x]);
    }
  }
  return next;
}

export function flipBoardVertical(
  cells: BoardCell[],
  width: number,
  height: number,
): BoardCell[] {
  const next: BoardCell[] = Array.from({ length: width * height }, emptyCell);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      next[(height - 1 - y) * width + x] = keepUser(cells[y * width + x]);
    }
  }
  return next;
}

/** Crop empty border rows/cols; keeps at least 2×2. */
export function trimEmptyEdges(
  cells: BoardCell[],
  width: number,
  height: number,
): { width: number; height: number; cells: BoardCell[] } {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isMarked(cells[y * width + x])) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0) {
    return { width, height, cells };
  }

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const newW = Math.max(2, contentW);
  const newH = Math.max(2, contentH);
  const padX = Math.floor((newW - contentW) / 2);
  const padY = Math.floor((newH - contentH) / 2);

  const next: BoardCell[] = Array.from({ length: newW * newH }, emptyCell);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = x - minX + padX;
      const ny = y - minY + padY;
      next[ny * newW + nx] = keepUser(cells[y * width + x]);
    }
  }

  return { width: newW, height: newH, cells: next };
}
