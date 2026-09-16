import { formatProblemEq, joinAnswers } from './format'
import { pushStep, satisfies, type Cand } from './radical'
import { rat } from './rat'
import type { Expr, SolveStep } from './types'

const TWO: Expr = { k: 'n', v: rat(2) }
const FOUR: Expr = { k: 'n', v: rat(4) }
const PI: Expr = { k: 'pi' }

function isNum(e: Expr, n: bigint): boolean {
  return e.k === 'n' && e.v.n === n && e.v.d === 1n
}

function exprEq(a: Expr, b: Expr): boolean {
  if (a.k !== b.k) return false
  switch (a.k) {
    case 'n':
      return b.k === 'n' && a.v.n === b.v.n && a.v.d === b.v.d
    case 'v':
      return b.k === 'v' && a.name === b.name
    case 'pi':
      return true
    case 'neg':
    case 'abs':
    case 'sqrt':
      return b.k === a.k && exprEq(a.x, b.x)
    case 'fn':
      return b.k === 'fn' && a.fn === b.fn && exprEq(a.x, b.x)
    case 'pow':
      return b.k === 'pow' && exprEq(a.b, b.b) && exprEq(a.e, b.e)
    default:
      return (
        (b.k === 'add' || b.k === 'sub' || b.k === 'mul' || b.k === 'div') &&
        a.k === b.k &&
        exprEq(a.l, b.l) &&
        exprEq(a.r, b.r)
      )
  }
}

function isVarPow2(e: Expr, v: string): boolean {
  return e.k === 'pow' && isNum(e.e, 2n) && e.b.k === 'v' && e.b.name === v
}

function isOneMinusV2(e: Expr, v: string): boolean {
  return e.k === 'sub' && isNum(e.l, 1n) && isVarPow2(e.r, v)
}

export function hasSqrtOneMinusSq(e: Expr, v: string): boolean {
  switch (e.k) {
    case 'sqrt':
      return isOneMinusV2(e.x, v) || hasSqrtOneMinusSq(e.x, v)
    case 'n':
    case 'v':
    case 'pi':
      return false
    case 'neg':
    case 'abs':
    case 'fn':
      return hasSqrtOneMinusSq(e.x, v)
    case 'pow':
      return hasSqrtOneMinusSq(e.b, v) || hasSqrtOneMinusSq(e.e, v)
    default:
      return hasSqrtOneMinusSq(e.l, v) || hasSqrtOneMinusSq(e.r, v)
  }
}

function substCos(e: Expr, v: string, ang: Expr): Expr {
  if (e.k === 'v' && e.name === v) return { k: 'fn', fn: 'cos', x: ang }
  if (e.k === 'sqrt' && isOneMinusV2(e.x, v)) {
    return { k: 'fn', fn: 'sin', x: ang }
  }
  switch (e.k) {
    case 'n':
    case 'pi':
    case 'v':
      return e
    case 'neg':
    case 'abs':
    case 'sqrt':
      return { ...e, x: substCos(e.x, v, ang) }
    case 'fn':
      return { k: 'fn', fn: e.fn, x: substCos(e.x, v, ang) }
    case 'pow':
      return { k: 'pow', b: substCos(e.b, v, ang), e: substCos(e.e, v, ang) }
    default:
      return { ...e, l: substCos(e.l, v, ang), r: substCos(e.r, v, ang) }
  }
}

function asMul2CosSq(e: Expr): Expr | null {
  if (e.k !== 'mul') return null
  for (const [a, b] of [
    [e.l, e.r],
    [e.r, e.l]
  ] as const) {
    if (!isNum(a, 2n)) continue
    if (b.k === 'pow' && isNum(b.e, 2n) && b.b.k === 'fn' && b.b.fn === 'cos') {
      return b.b.x
    }
  }
  return null
}

function rewrite(e: Expr): Expr {
  let x: Expr
  switch (e.k) {
    case 'n':
    case 'v':
    case 'pi':
      return e
    case 'neg':
    case 'abs':
    case 'sqrt':
      x = { ...e, x: rewrite(e.x) }
      break
    case 'fn':
      x = { k: 'fn', fn: e.fn, x: rewrite(e.x) }
      break
    case 'pow':
      x = { k: 'pow', b: rewrite(e.b), e: rewrite(e.e) }
      break
    default:
      x = { ...e, l: rewrite(e.l), r: rewrite(e.r) }
  }

  if (x.k === 'sub') {
    const th = asMul2CosSq(x.l)
    if (th && isNum(x.r, 1n)) {
      return { k: 'fn', fn: 'cos', x: { k: 'mul', l: TWO, r: th } }
    }
  }
  if (x.k === 'add') {
    for (const [a, b] of [
      [x.l, x.r],
      [x.r, x.l]
    ] as const) {
      if (
        a.k === 'fn' &&
        b.k === 'fn' &&
        a.fn === 'cos' &&
        b.fn === 'sin' &&
        exprEq(a.x, b.x)
      ) {
        return {
          k: 'mul',
          l: { k: 'sqrt', x: TWO },
          r: {
            k: 'fn',
            fn: 'sin',
            x: { k: 'add', l: a.x, r: { k: 'div', l: PI, r: FOUR } }
          }
        }
      }
    }
  }
  return x
}

function rewriteDeep(e: Expr): Expr {
  let cur = e
  for (let i = 0; i < 6; i++) {
    const n = rewrite(cur)
    if (exprEq(n, cur)) return cur
    cur = n
  }
  return cur
}

type Ang = { p: bigint; q: bigint }

function ang(p: bigint, q: bigint): Ang {
  const s = q < 0n ? -1n : 1n
  let pp = p * s
  let qq = q * s
  let x = pp < 0n ? -pp : pp
  let y = qq
  while (y) {
    const t = x % y
    x = y
    y = t
  }
  const g = x === 0n ? 1n : x
  return { p: pp / g, q: qq / g }
}

function angSub(a: Ang, b: Ang): Ang {
  return ang(a.p * b.q - b.p * a.q, a.q * b.q)
}

function formatAng(a: Ang): string {
  if (a.p === 0n) return '0'
  if (a.q === 1n) {
    if (a.p === 1n) return 'π'
    if (a.p === -1n) return '−π'
    return a.p < 0n ? `−${(-a.p).toString()}π` : `${a.p.toString()}π`
  }
  if (a.p === 1n) return `π/${a.q.toString()}`
  if (a.p === -1n) return `−π/${a.q.toString()}`
  const n = a.p < 0n ? `−${(-a.p).toString()}` : a.p.toString()
  return `${n}π/${a.q.toString()}`
}

function cosExact(a: Ang): string | null {
  const deg = (((Number(a.p) / Number(a.q)) * 180) % 360 + 360) % 360
  const table: Record<number, string> = {
    0: '1',
    15: '(√6 + √2)/4',
    30: '√3/2',
    45: '√2/2',
    60: '1/2',
    75: '(√6 − √2)/4',
    90: '0',
    105: '−(√6 − √2)/4',
    120: '−1/2',
    135: '−√2/2',
    150: '−√3/2',
    165: '−(√6 + √2)/4',
    180: '−1'
  }
  return table[Math.round(deg)] ?? null
}

function angFloat(a: Ang): number {
  return (Number(a.p) / Number(a.q)) * Math.PI
}

function isSqrt2SinShift(e: Expr, th: Expr): boolean {
  if (e.k !== 'mul') return false
  for (const [a, b] of [
    [e.l, e.r],
    [e.r, e.l]
  ] as const) {
    if (!(a.k === 'sqrt' && isNum(a.x, 2n))) continue
    if (b.k !== 'fn' || b.fn !== 'sin' || b.x.k !== 'add') continue
    const add = b.x
    const shift = (s: Expr) =>
      s.k === 'div' && s.l.k === 'pi' && isNum(s.r, 4n)
    if (exprEq(add.l, th) && shift(add.r)) return true
    if (exprEq(add.r, th) && shift(add.l)) return true
  }
  return false
}

function isSqrt2Cos2(e: Expr, th: Expr): boolean {
  if (e.k !== 'mul') return false
  for (const [a, b] of [
    [e.l, e.r],
    [e.r, e.l]
  ] as const) {
    if (!(a.k === 'sqrt' && isNum(a.x, 2n))) continue
    if (b.k !== 'fn' || b.fn !== 'cos' || b.x.k !== 'mul') continue
    const m = b.x
    if (isNum(m.l, 2n) && exprEq(m.r, th)) return true
    if (isNum(m.r, 2n) && exprEq(m.l, th)) return true
  }
  return false
}

export function tryCosSub(
  l: Expr,
  r: Expr,
  v: string,
  steps: SolveStep[]
): Cand[] | null {
  if (!hasSqrtOneMinusSq(l, v) && !hasSqrtOneMinusSq(r, v)) return null
  if (v === 'α') return null

  const local: SolveStep[] = []
  const th: Expr = { k: 'v', name: 'α' }
  pushStep(local, `${v} = cos α,   α ∈ [0, π]`, { k: 'subst' })
  pushStep(local, `√(1 − ${v}²) = sin α`, { k: 'subst' })

  const L1 = substCos(l, v, th)
  const R1 = substCos(r, v, th)
  pushStep(local, formatProblemEq(L1, R1), { k: 'subst' })

  const L2 = rewriteDeep(L1)
  const R2 = rewriteDeep(R1)
  if (!exprEq(L2, L1) || !exprEq(R2, R1)) {
    pushStep(local, formatProblemEq(L2, R2), { k: 'trigId' })
  }

  const pair: [Expr, Expr][] = [
    [L2, R2],
    [R2, L2]
  ]
  let matched = false
  for (const [A, B] of pair) {
    if (A.k === 'abs' && isSqrt2SinShift(A.x, th) && isSqrt2Cos2(B, th)) {
      matched = true
      break
    }
  }
  if (!matched) return null
  return finishShiftEq(l, r, v, steps, local, true)
}

function needsFn(e: Expr): boolean {
  switch (e.k) {
    case 'fn':
      return true
    case 'n':
    case 'v':
    case 'pi':
      return false
    case 'neg':
    case 'abs':
    case 'sqrt':
      return needsFn(e.x)
    case 'pow':
      return needsFn(e.b) || needsFn(e.e)
    default:
      return needsFn(e.l) || needsFn(e.r)
  }
}

export function tryTrigEq(
  l: Expr,
  r: Expr,
  v: string,
  steps: SolveStep[]
): Cand[] | null {
  if (!needsFn(l) && !needsFn(r)) return null
  const local: SolveStep[] = []
  const th: Expr = { k: 'v', name: v }
  const L2 = rewriteDeep(l)
  const R2 = rewriteDeep(r)
  if (!exprEq(L2, l) || !exprEq(R2, r)) {
    pushStep(local, formatProblemEq(L2, R2), { k: 'trigId' })
  }
  let matched = false
  for (const [A, B] of [
    [L2, R2],
    [R2, L2]
  ] as const) {
    if (A.k === 'abs' && isSqrt2SinShift(A.x, th) && isSqrt2Cos2(B, th)) {
      matched = true
      break
    }
  }
  if (!matched) return null
  return finishShiftEq(l, r, v, steps, local, false)
}

function finishShiftEq(
  origL: Expr,
  origR: Expr,
  v: string,
  steps: SolveStep[],
  local: SolveStep[],
  backToX: boolean
): Cand[] | null {
  pushStep(local, `|sin(${v === 'α' || !backToX ? v : 'α'} + π/4)| = cos 2${backToX ? 'α' : v}`, {
    k: 'trigId'
  })
  const angName = backToX ? 'α' : v
  pushStep(local, `β = ${angName} + π/4,   β ∈ [π/4, 5π/4]`, { k: 'subst' })
  pushStep(local, `cos 2${angName} = sin 2β`, { k: 'trigId' })
  pushStep(local, `|sin β| = sin 2β = 2 sin β cos β`, { k: 'trigId' })
  pushStep(
    local,
    `sin β = 0    or    cos β = 1/2  (sin β ≥ 0)`,
    { k: 'zeroProduct' }
  )

  const alphas = [ang(1n, 3n), ang(1n, 1n)].map((b) => angSub(b, ang(1n, 4n)))
  pushStep(
    local,
    `β = π/3, π    →    ${angName} = ${alphas.map(formatAng).join(', ')}`,
    { k: 'backSub' }
  )

  const cands: Cand[] = []
  if (backToX) {
    const parts: string[] = []
    for (const al of alphas) {
      const exact = cosExact(al)
      const xf = Math.cos(angFloat(al))
      const text = exact ?? `cos ${formatAng(al)}`
      parts.push(`cos ${formatAng(al)}`)
      cands.push({ text, x: xf })
    }
    pushStep(local, joinAnswers(v, parts), { k: 'backSub' })
  } else {
    for (const al of alphas) {
      cands.push({ text: formatAng(al), x: angFloat(al) })
    }
    pushStep(local, joinAnswers(v, cands.map((c) => c.text)), { k: 'backSub' })
  }

  const ok = cands.filter((c) => satisfies(origL, origR, c.x))
  if (ok.length === 0) return null
  const joined = joinAnswers(
    v,
    ok.map((c) => c.text)
  )
  if (local[local.length - 1]?.text !== joined) {
    pushStep(local, joined, { k: 'check' })
  }
  for (const s of local) steps.push(s)
  return ok
}
