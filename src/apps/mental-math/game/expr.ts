import type { ArithOp } from './types'

export type Expr =
  | { k: 'n'; n: number }
  | { k: 'pow'; p: 2 | 3; x: Expr }
  | { k: 'rt'; p: 2 | 3; x: Expr }
  | { k: 'fact'; x: Expr }
  | { k: 'op'; op: ArithOp; l: Expr; r: Expr }

export function cloneExpr(e: Expr): Expr {
  if (e.k === 'n') return { k: 'n', n: e.n }
  if (e.k === 'pow') return { k: 'pow', p: e.p, x: cloneExpr(e.x) }
  if (e.k === 'rt') return { k: 'rt', p: e.p, x: cloneExpr(e.x) }
  if (e.k === 'fact') return { k: 'fact', x: cloneExpr(e.x) }
  return { k: 'op', op: e.op, l: cloneExpr(e.l), r: cloneExpr(e.r) }
}

function factorial(n: number): number {
  if (n < 0 || n > 12 || !Number.isInteger(n)) return NaN
  let a = 1
  for (let i = 2; i <= n; i++) a *= i
  return a
}

export function evalExpr(e: Expr): number {
  if (e.k === 'n') return e.n
  if (e.k === 'pow') {
    const v = evalExpr(e.x)
    return e.p === 2 ? v * v : v * v * v
  }
  if (e.k === 'rt') {
    const v = evalExpr(e.x)
    if (v < 0) return NaN
    const r = e.p === 2 ? Math.sqrt(v) : Math.cbrt(v)
    const n = Math.round(r)
    return Math.abs(r - n) < 1e-9 ? n : NaN
  }
  if (e.k === 'fact') return factorial(evalExpr(e.x))
  const l = evalExpr(e.l)
  const r = evalExpr(e.r)
  if (e.op === 'add') return l + r
  if (e.op === 'sub') return l - r
  if (e.op === 'mul') return l * r
  return r === 0 ? NaN : l / r
}

export function opGlyph(op: ArithOp): string {
  if (op === 'add') return '+'
  if (op === 'sub') return '−'
  if (op === 'mul') return '×'
  return '÷'
}

function prec(op: ArithOp): number {
  return op === 'add' || op === 'sub' ? 1 : 2
}

function formatChild(e: Expr, parentOp: ArithOp, side: 'l' | 'r'): string {
  if (e.k !== 'op') return formatExpr(e)
  const p = prec(parentOp)
  const c = prec(e.op)
  const wrap =
    c < p ||
    (c === p && side === 'r' && (parentOp === 'sub' || parentOp === 'div'))
  return wrap ? `(${formatExpr(e)})` : formatExpr(e)
}

function wrapAtom(e: Expr): string {
  if (e.k === 'n') return String(e.n)
  return `(${formatExpr(e)})`
}

export function formatExpr(e: Expr): string {
  if (e.k === 'n') return String(e.n)
  if (e.k === 'pow') return `${wrapAtom(e.x)}${e.p === 2 ? '²' : '³'}`
  if (e.k === 'rt') return `${e.p === 2 ? '√' : '∛'}${wrapAtom(e.x)}`
  if (e.k === 'fact') return `${wrapAtom(e.x)}!`
  return `${formatChild(e.l, e.op, 'l')} ${opGlyph(e.op)} ${formatChild(e.r, e.op, 'r')}`
}

export function parseExpr(raw: unknown): Expr | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as { k?: unknown }
  if (o.k === 'n') {
    const n = (raw as { n?: unknown }).n
    if (!Number.isInteger(n) || (n as number) < 0) return null
    return { k: 'n', n: n as number }
  }
  if (o.k === 'sq') {
    const x = parseExpr((raw as { x?: unknown }).x)
    if (!x) return null
    return { k: 'pow', p: 2, x }
  }
  if (o.k === 'pow') {
    const p = (raw as { p?: unknown }).p
    if (p !== 2 && p !== 3) return null
    const x = parseExpr((raw as { x?: unknown }).x)
    if (!x) return null
    return { k: 'pow', p, x }
  }
  if (o.k === 'rt') {
    const p = (raw as { p?: unknown }).p
    if (p !== 2 && p !== 3) return null
    const x = parseExpr((raw as { x?: unknown }).x)
    if (!x) return null
    return { k: 'rt', p, x }
  }
  if (o.k === 'fact') {
    const x = parseExpr((raw as { x?: unknown }).x)
    if (!x) return null
    return { k: 'fact', x }
  }
  if (o.k === 'op') {
    const op = (raw as { op?: unknown }).op
    if (op !== 'add' && op !== 'sub' && op !== 'mul' && op !== 'div') {
      return null
    }
    const l = parseExpr((raw as { l?: unknown }).l)
    const r = parseExpr((raw as { r?: unknown }).r)
    if (!l || !r) return null
    return { k: 'op', op, l, r }
  }
  return null
}

export function parseQuestionExpr(q: unknown): Expr | null {
  if (!q || typeof q !== 'object') return null
  const o = q as { expr?: unknown; a?: unknown; b?: unknown; op?: unknown }
  if (o.expr != null) return parseExpr(o.expr)
  if (
    Number.isInteger(o.a) &&
    Number.isInteger(o.b) &&
    (o.op === 'add' || o.op === 'sub' || o.op === 'mul' || o.op === 'div')
  ) {
    return {
      k: 'op',
      op: o.op,
      l: { k: 'n', n: o.a as number },
      r: { k: 'n', n: o.b as number }
    }
  }
  return null
}
