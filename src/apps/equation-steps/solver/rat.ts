import type { Rat } from './types'

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b
  while (y !== 0n) {
    const t = x % y
    x = y
    y = t
  }
  return x === 0n ? 1n : x
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n
  const aa = a < 0n ? -a : a
  const bb = b < 0n ? -b : b
  return (aa / gcd(aa, bb)) * bb
}

export function rat(n: bigint | number, d: bigint | number = 1n): Rat {
  let nn = typeof n === 'number' ? BigInt(n) : n
  let dd = typeof d === 'number' ? BigInt(d) : d
  if (dd === 0n) return { n: 0n, d: 1n }
  if (dd < 0n) {
    nn = -nn
    dd = -dd
  }
  const g = gcd(nn, dd)
  return { n: nn / g, d: dd / g }
}

export const ZERO = rat(0)
export const ONE = rat(1)
export const NEG_ONE = rat(-1)

export function radd(a: Rat, b: Rat): Rat {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d)
}

export function rsub(a: Rat, b: Rat): Rat {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d)
}

export function rmul(a: Rat, b: Rat): Rat {
  return rat(a.n * b.n, a.d * b.d)
}

export function rdiv(a: Rat, b: Rat): Rat {
  return rat(a.n * b.d, a.d * b.n)
}

export function rneg(a: Rat): Rat {
  return { n: -a.n, d: a.d }
}

export function rabs(a: Rat): Rat {
  return a.n < 0n ? { n: -a.n, d: a.d } : a
}

export function req(a: Rat, b: Rat): boolean {
  return a.n === b.n && a.d === b.d
}

export function isZero(a: Rat): boolean {
  return a.n === 0n
}

export function isOne(a: Rat): boolean {
  return a.n === 1n && a.d === 1n
}

export function isNegOne(a: Rat): boolean {
  return a.n === -1n && a.d === 1n
}

export function isInt(a: Rat): boolean {
  return a.d === 1n
}

export function ratFromDecimal(raw: string): Rat | null {
  const s = raw.replace(',', '.')
  const dot = s.indexOf('.')
  if (dot < 0) {
    if (!/^-?\d+$/.test(s)) return null
    return rat(BigInt(s))
  }
  const whole = s.slice(0, dot) || '0'
  const frac = s.slice(dot + 1)
  if (!/^-?\d+$/.test(whole) || !/^\d+$/.test(frac) || frac.length > 12) {
    return null
  }
  const sign = whole.startsWith('-') ? -1n : 1n
  const w = BigInt(whole.startsWith('-') ? whole.slice(1) : whole)
  const f = BigInt(frac)
  const den = 10n ** BigInt(frac.length)
  return rat(sign * (w * den + f), den)
}

/** n = k² · s with s square-free and ≥ 1. */
export function extractSquare(n: bigint): { k: bigint; s: bigint } {
  if (n <= 0n) return { k: 0n, s: n === 0n ? 1n : n }
  let k = 1n
  let s = n
  let p = 2n
  while (p * p <= s) {
    const sq = p * p
    while (s % sq === 0n) {
      s /= sq
      k *= p
    }
    p = p === 2n ? 3n : p + 2n
  }
  return { k, s }
}
