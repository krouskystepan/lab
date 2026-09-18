import { extractSquare, gcd, isInt, isNegOne, isOne, isZero, rabs } from './rat'
import type { Expr, Rat } from './types'
import { coeff, degree, type Poly } from './poly'

const MINUS = '−'
const TIMES = '×'

export function formatRat(r: Rat): string {
  if (r.n < 0n) return MINUS + formatRat({ n: -r.n, d: r.d })
  if (r.d === 1n) return r.n.toString()
  return `${r.n.toString()}/${r.d.toString()}`
}

function superscript(n: number): string {
  if (n === 2) return '²'
  if (n === 3) return '³'
  return `^${n}`
}

function powerAtom(v: string, deg: number): string {
  if (deg <= 1) return deg === 1 ? v : ''
  return v + superscript(deg)
}

function wrapFracCoeff(r: Rat, atom: string): string {
  if (isZero(r)) return '0'
  if (isOne(r)) return atom
  if (isNegOne(r)) return MINUS + atom
  if (isInt(r)) return formatRat(r) + atom
  if (r.n === 1n) return `${atom}/${r.d.toString()}`
  if (r.n === -1n) return `${MINUS}${atom}/${r.d.toString()}`
  return `(${formatRat(r)})${atom}`
}

export function formatPoly(p: Poly, v: string): string {
  const d = degree(p)
  const parts: string[] = []
  for (let i = d; i >= 0; i--) {
    const c = coeff(p, i)
    if (isZero(c)) continue
    const first = parts.length === 0
    if (i === 0) {
      parts.push(
        first
          ? formatRat(c)
          : c.n < 0n
            ? ` ${MINUS} ${formatRat(rabs(c))}`
            : ` + ${formatRat(c)}`
      )
      continue
    }
    const mag = wrapFracCoeff(rabs(c), powerAtom(v, i))
    if (first) {
      parts.push(wrapFracCoeff(c, powerAtom(v, i)))
    } else {
      parts.push(c.n < 0n ? ` ${MINUS} ${mag}` : ` + ${mag}`)
    }
  }
  return parts.length === 0 ? '0' : parts.join('')
}

export function formatEq(left: Poly, right: Poly, v: string): string {
  return `${formatPoly(left, v)} = ${formatPoly(right, v)}`
}

function prec(e: Expr): number {
  if (e.k === 'add' || e.k === 'sub') return 1
  if (e.k === 'mul' || e.k === 'div') return 2
  if (e.k === 'pow' || e.k === 'neg') return 3
  return 4
}

function wrap(e: Expr, parent: number, side: 'l' | 'r'): string {
  const s = formatExpr(e)
  const p = prec(e)
  if (p > parent) return s
  if (p < parent) return `(${s})`
  if (side === 'r' && p === parent) return `(${s})`
  return s
}

function juxtapose(l: Expr, r: Expr): boolean {
  if (l.k === 'n' && r.k === 'n') return false
  const rOk =
    r.k === 'v' ||
    r.k === 'pow' ||
    r.k === 'neg' ||
    r.k === 'add' ||
    r.k === 'sub' ||
    r.k === 'mul' ||
    r.k === 'div' ||
    r.k === 'abs' ||
    r.k === 'sqrt' ||
    r.k === 'fn'
  const lOk =
    l.k === 'n' ||
    l.k === 'v' ||
    l.k === 'pow' ||
    l.k === 'add' ||
    l.k === 'sub' ||
    l.k === 'neg' ||
    l.k === 'mul' ||
    l.k === 'abs' ||
    l.k === 'sqrt' ||
    l.k === 'fn'
  return lOk && rOk
}

export function formatExpr(e: Expr): string {
  switch (e.k) {
    case 'n':
      return formatRat(e.v)
    case 'v':
      return e.name
    case 'neg': {
      if (e.x.k === 'n' || e.x.k === 'v' || e.x.k === 'pow') {
        return MINUS + formatExpr(e.x)
      }
      return MINUS + `(${formatExpr(e.x)})`
    }
    case 'add':
      return `${wrap(e.l, 1, 'l')} + ${wrap(e.r, 1, 'r')}`
    case 'sub':
      return `${wrap(e.l, 1, 'l')} ${MINUS} ${wrap(e.r, 1, 'r')}`
    case 'mul': {
      if (e.r.k === 'n' && e.l.k !== 'n') {
        return formatExpr({ k: 'mul', l: e.r, r: e.l })
      }
      if (e.l.k === 'n') {
        if (e.r.k === 'n') {
          return `${formatRat(e.l.v)} ${TIMES} ${formatRat(e.r.v)}`
        }
        return wrapFracCoeff(e.l.v, wrap(e.r, 2, 'r'))
      }
      const left = wrap(e.l, 2, 'l')
      const right = wrap(e.r, 2, 'r')
      if (e.r.k === 'fn' || (e.r.k === 'pow' && e.r.b.k === 'fn')) {
        return `${left} ${right}`
      }
      return juxtapose(e.l, e.r) ? left + right : `${left} ${TIMES} ${right}`
    }
    case 'div':
      return `${wrap(e.l, 2, 'l')}/${wrap(e.r, 2, 'r')}`
    case 'pow': {
      if (e.e.k === 'n' && isInt(e.e.v) && e.e.v.n >= 0n && e.e.v.n <= 9n) {
        const n = Number(e.e.v.n)
        if (n === 1) return formatExpr(e.b)
        if (n === 0) return '1'
        if (e.b.k === 'fn') {
          return `${e.b.fn}${superscript(n)} ${formatFnArg(e.b.x)}`
        }
        const base =
          e.b.k === 'n' || e.b.k === 'v' || e.b.k === 'pi'
            ? formatExpr(e.b)
            : `(${formatExpr(e.b)})`
        return base + superscript(n)
      }
      const base =
        e.b.k === 'n' || e.b.k === 'v' ? formatExpr(e.b) : `(${formatExpr(e.b)})`
      return `${base}^${formatExpr(e.e)}`
    }
    case 'abs':
      return `|${formatExpr(e.x)}|`
    case 'sqrt': {
      const inner = e.x
      if (inner.k === 'n' || inner.k === 'v' || inner.k === 'pi') {
        return `√${formatExpr(inner)}`
      }
      return `√(${formatExpr(inner)})`
    }
    case 'pi':
      return 'π'
    case 'fn': {
      const arg = formatFnArg(e.x)
      return arg.startsWith('(') ? `${e.fn}${arg}` : `${e.fn} ${arg}`
    }
  }
}

function formatFnArg(x: Expr): string {
  if (x.k === 'add' || x.k === 'sub') return `(${formatExpr(x)})`
  return formatExpr(x)
}

export function formatProblemEq(l: Expr, r: Expr): string {
  return `${formatExpr(l)} = ${formatExpr(r)}`
}

function formatKsqrt(k: bigint, s: bigint): string {
  if (s === 1n) return k.toString()
  if (k === 1n) return `√${s.toString()}`
  return `${k.toString()}√${s.toString()}`
}

/** ±√r, pulling square factors. r ≥ 0. */
export function formatPmSqrt(r: Rat): string {
  if (isZero(r)) return '0'
  if (r.n < 0n) return ''
  const kn = extractSquare(r.n)
  const kd = extractSquare(r.d)
  let k = kn.k
  let s = kn.s
  let den = kd.k
  if (kd.s !== 1n) {
    const folded = extractSquare(s * kd.s)
    k *= folded.k
    s = folded.s
    den *= kd.s
  }
  const g = gcd(k, den)
  k /= g
  den /= g
  const num = formatKsqrt(k, s)
  if (den === 1n) return `±${num}`
  return `±${num}/${den.toString()}`
}

/**
 * x = (−b ± √Δ) / (2a) with integer a, b, Δ (denoms already cleared).
 * Returns one math string for the pair (or a single root if Δ = 0).
 */
export function formatQuadraticPair(a: Rat, b: Rat, disc: Rat): string {
  if (!isInt(a) || !isInt(b) || !isInt(disc)) {
    const nb = formatRat({ n: -b.n, d: b.d })
    const den = formatRat({ n: a.n * 2n, d: a.d })
    const ds = formatRat(disc)
    if (isZero(disc)) return `${nb} / ${den}`
    return `(${nb} ± √${ds}) / ${den}`
  }
  if (disc.n === 0n) {
    return formatRat({ n: -b.n, d: a.n * 2n })
  }
  const { k, s } = extractSquare(disc.n < 0n ? -disc.n : disc.n)
  let nb = -b.n
  let kk = k
  let den = a.n * 2n
  const g = gcd(gcd(nb < 0n ? -nb : nb, kk), den < 0n ? -den : den)
  nb /= g
  kk /= g
  den /= g
  if (den < 0n) {
    nb = -nb
    den = -den
  }
  const rad = formatKsqrt(kk, s)
  if (nb === 0n && den === 1n) return `±${rad}`
  if (nb === 0n) return `±${rad}/${den.toString()}`
  const left = nb < 0n ? MINUS + (-nb).toString() : nb.toString()
  if (den === 1n) return `${left} ± ${rad}`
  return `(${left} ± ${rad}) / ${den.toString()}`
}

export function joinAnswers(variable: string, bodies: string[]): string {
  if (bodies.length === 0) return ''
  if (bodies.length === 1) return `${variable} = ${bodies[0]}`
  return bodies.map((b) => `${variable} = ${b}`).join(',  ')
}
