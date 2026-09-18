import {
  isZero,
  lcm,
  ONE,
  rat,
  radd,
  rdiv,
  req,
  rmul,
  rneg,
  ZERO
} from './rat'
import type { Expr, FailReason, Rat } from './types'

export type Poly = Rat[]

export class AlgebraError extends Error {
  readonly code: FailReason
  constructor(code: FailReason) {
    super(code)
    this.code = code
  }
}

export function coeff(p: Poly, i: number): Rat {
  return p[i] ?? ZERO
}

export function degree(p: Poly): number {
  for (let i = p.length - 1; i >= 0; i--) {
    if (!isZero(p[i]!)) return i
  }
  return 0
}

export function isZeroPoly(p: Poly): boolean {
  return p.every(isZero)
}

export function trim(p: Poly): Poly {
  let end = p.length - 1
  while (end > 0 && isZero(p[end]!)) end--
  return p.slice(0, end + 1)
}

export function polyEq(a: Poly, b: Poly): boolean {
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (!req(coeff(a, i), coeff(b, i))) return false
  }
  return true
}

export function padd(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length)
  const out: Rat[] = []
  for (let i = 0; i < n; i++) out.push(radd(coeff(a, i), coeff(b, i)))
  return trim(out)
}

export function psub(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length)
  const out: Rat[] = []
  for (let i = 0; i < n; i++) out.push(radd(coeff(a, i), rneg(coeff(b, i))))
  return trim(out)
}

export function pscale(p: Poly, s: Rat): Poly {
  if (isZero(s)) return [ZERO]
  return trim(p.map((c) => rmul(c, s)))
}

export function pmul(a: Poly, b: Poly): Poly {
  if (isZeroPoly(a) || isZeroPoly(b)) return [ZERO]
  const out: Rat[] = Array.from(
    { length: a.length + b.length - 1 },
    () => ZERO
  )
  for (let i = 0; i < a.length; i++) {
    if (isZero(a[i]!)) continue
    for (let j = 0; j < b.length; j++) {
      if (isZero(b[j]!)) continue
      out[i + j] = radd(out[i + j]!, rmul(a[i]!, b[j]!))
    }
  }
  return trim(out)
}

export function pneg(p: Poly): Poly {
  return pscale(p, rat(-1))
}

export function denLcm(p: Poly): bigint {
  let m = 1n
  for (const c of p) {
    if (!isZero(c)) m = lcm(m, c.d)
  }
  return m
}

export function clearDenoms(p: Poly): { poly: Poly; n: bigint } {
  const n = denLcm(p)
  if (n === 1n) return { poly: p, n }
  return { poly: pscale(p, rat(n, 1n)), n }
}

function powInt(base: Poly, exp: number): Poly {
  if (exp === 0) return [ONE]
  let out = [ONE]
  for (let i = 0; i < exp; i++) out = pmul(out, base)
  return out
}

export function toPoly(e: Expr, v: string): Poly {
  switch (e.k) {
    case 'n':
      return [e.v]
    case 'v':
      if (e.name !== v) throw new AlgebraError('multiVar')
      return [ZERO, ONE]
    case 'neg':
      return pneg(toPoly(e.x, v))
    case 'add':
      return padd(toPoly(e.l, v), toPoly(e.r, v))
    case 'sub':
      return psub(toPoly(e.l, v), toPoly(e.r, v))
    case 'mul':
      return pmul(toPoly(e.l, v), toPoly(e.r, v))
    case 'div': {
      const d = toPoly(e.r, v)
      if (degree(d) !== 0) throw new AlgebraError('varInDenom')
      const c = coeff(d, 0)
      if (isZero(c)) throw new AlgebraError('parse')
      return pscale(toPoly(e.l, v), rdiv(ONE, c))
    }
    case 'pow': {
      const expP = toPoly(e.e, v)
      if (degree(expP) !== 0) throw new AlgebraError('badPower')
      const ex = coeff(expP, 0)
      if (ex.d !== 1n || ex.n < 0n || ex.n > 8n) throw new AlgebraError('badPower')
      const n = Number(ex.n)
      return powInt(toPoly(e.b, v), n)
    }
    case 'abs':
    case 'sqrt':
    case 'pi':
    case 'fn':
      throw new AlgebraError('radical')
  }
}

export function monomial(degree: number, c: Rat): Poly {
  if (isZero(c) || degree < 0) return [ZERO]
  const out: Rat[] = Array.from({ length: degree + 1 }, () => ZERO)
  out[degree] = c
  return out
}
