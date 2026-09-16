import { rat, ratFromDecimal } from './rat'
import type { Expr, Problem, Rat } from './types'

type Tok =
  | { t: 'n'; v: Rat }
  | { t: 'id'; name: string }
  | { t: '+' | '-' | '*' | '/' | '^' | '(' | ')' | '=' | '|' | '√' | 'eof' }

class ParseFail extends Error {}

function lex(src: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  const n = src.length
  while (i < n) {
    const c = src[i]!
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++
      continue
    }
    if (c === '+' || c === '*' || c === '/' || c === '^' || c === '(' || c === ')' || c === '=' || c === '|') {
      toks.push({ t: c })
      i++
      continue
    }
    if (c === '√') {
      toks.push({ t: '√' })
      i++
      continue
    }
    if (c === '-' || c === '−' || c === '–' || c === '—') {
      toks.push({ t: '-' })
      i++
      continue
    }
    if (c === '×' || c === '·' || c === '∗') {
      toks.push({ t: '*' })
      i++
      continue
    }
    if (c === '÷') {
      toks.push({ t: '/' })
      i++
      continue
    }
    if (c === '²') {
      toks.push({ t: '^' }, { t: 'n', v: rat(2) })
      i++
      continue
    }
    if (c === '³') {
      toks.push({ t: '^' }, { t: 'n', v: rat(3) })
      i++
      continue
    }
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < n && src[j]! >= '0' && src[j]! <= '9') j++
      if (j < n && (src[j] === '.' || src[j] === ',')) {
        const sep = src[j]!
        if (j + 1 < n && src[j + 1]! >= '0' && src[j + 1]! <= '9') {
          j++
          while (j < n && src[j]! >= '0' && src[j]! <= '9') j++
          const raw = src.slice(i, j).replace(sep, '.')
          const v = ratFromDecimal(raw)
          if (!v) throw new ParseFail()
          toks.push({ t: 'n', v })
          i = j
          continue
        }
      }
      toks.push({ t: 'n', v: rat(BigInt(src.slice(i, j))) })
      i = j
      continue
    }
    if (c === 'π') {
      toks.push({ t: 'id', name: 'pi' })
      i++
      continue
    }
    if (c === 'α' || c === 'θ') {
      toks.push({ t: 'id', name: c })
      i++
      continue
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      let j = i + 1
      while (
        j < n &&
        ((src[j]! >= 'a' && src[j]! <= 'z') || (src[j]! >= 'A' && src[j]! <= 'Z'))
      ) {
        j++
      }
      const name = src.slice(i, j).toLowerCase()
      const words = new Set(['sqrt', 'abs', 'sin', 'cos', 'tan', 'pi'])
      if (words.has(name) || name.length === 1) {
        toks.push({ t: 'id', name })
      } else {
        throw new ParseFail()
      }
      i = j
      continue
    }
    throw new ParseFail()
  }
  toks.push({ t: 'eof' })
  return toks
}

class Parser {
  private i = 0
  private absDepth = 0
  private readonly toks: Tok[]
  constructor(toks: Tok[]) {
    this.toks = toks
  }

  private peek(): Tok {
    return this.toks[this.i] ?? { t: 'eof' }
  }

  private take(): Tok {
    const t = this.peek()
    if (t.t !== 'eof') this.i++
    return t
  }

  private fail(): never {
    throw new ParseFail()
  }

  parseProblem(): Problem {
    const l = this.parseExpr()
    if (this.peek().t === '=') {
      this.take()
      const r = this.parseExpr()
      if (this.peek().t !== 'eof') this.fail()
      return { k: 'eq', l, r }
    }
    if (this.peek().t !== 'eof') this.fail()
    return { k: 'expr', x: l }
  }

  private parseExpr(): Expr {
    let a = this.parseTerm()
    for (;;) {
      const p = this.peek().t
      if (p !== '+' && p !== '-') break
      this.take()
      const b = this.parseTerm()
      a = p === '+' ? { k: 'add', l: a, r: b } : { k: 'sub', l: a, r: b }
    }
    return a
  }

  private parseTerm(): Expr {
    let a = this.parseUnary()
    for (;;) {
      const p = this.peek().t
      if (p === '*' || p === '/') {
        this.take()
        const b = this.parseUnary()
        a = p === '*' ? { k: 'mul', l: a, r: b } : { k: 'div', l: a, r: b }
        continue
      }
      if (this.implicit()) {
        const b = this.parseUnary()
        a = { k: 'mul', l: a, r: b }
        continue
      }
      break
    }
    return a
  }

  private implicit(): boolean {
    const p = this.peek().t
    if (p === '|' && this.absDepth > 0) return false
    return p === 'n' || p === 'id' || p === '(' || p === '|' || p === '√'
  }

  private parseUnary(): Expr {
    if (this.peek().t === '-') {
      this.take()
      return { k: 'neg', x: this.parseUnary() }
    }
    if (this.peek().t === '+') {
      this.take()
      return this.parseUnary()
    }
    if (this.peek().t === '√') {
      this.take()
      return { k: 'sqrt', x: this.parseUnary() }
    }
    return this.parsePower()
  }

  private parsePower(): Expr {
    const b = this.parsePrimary()
    if (this.peek().t !== '^') return b
    this.take()
    return { k: 'pow', b, e: this.parseUnary() }
  }

  private parseCall(name: 'sqrt' | 'abs'): Expr {
    if (this.take().t !== '(') this.fail()
    const x = this.parseExpr()
    if (this.take().t !== ')') this.fail()
    return name === 'sqrt' ? { k: 'sqrt', x } : { k: 'abs', x }
  }

  private parseFnArg(): Expr {
    if (this.peek().t === '(') {
      this.take()
      const x = this.parseExpr()
      if (this.take().t !== ')') this.fail()
      return x
    }
    let a = this.parsePower()
    while (
      this.implicit() &&
      (this.peek().t === 'id' || this.peek().t === '(')
    ) {
      a = { k: 'mul', l: a, r: this.parsePower() }
    }
    return a
  }

  private parsePrimary(): Expr {
    const t = this.take()
    if (t.t === 'n') return { k: 'n', v: t.v }
    if (t.t === 'id') {
      if (t.name === 'sqrt' || t.name === 'abs') return this.parseCall(t.name)
      if (t.name === 'sin' || t.name === 'cos' || t.name === 'tan') {
        if (this.peek().t === '^') {
          this.take()
          const exp = this.parseUnary()
          return {
            k: 'pow',
            b: { k: 'fn', fn: t.name, x: this.parseFnArg() },
            e: exp
          }
        }
        return { k: 'fn', fn: t.name, x: this.parseFnArg() }
      }
      if (t.name === 'pi') return { k: 'pi' }
      return { k: 'v', name: t.name }
    }
    if (t.t === '|') {
      this.absDepth++
      const x = this.parseExpr()
      this.absDepth--
      if (this.take().t !== '|') this.fail()
      return { k: 'abs', x }
    }
    if (t.t === '(') {
      const x = this.parseExpr()
      if (this.take().t !== ')') this.fail()
      return x
    }
    this.fail()
  }
}

export function parseProblem(input: string): Problem | null {
  const src = input.trim()
  if (!src) return null
  try {
    return new Parser(lex(src)).parseProblem()
  } catch {
    return null
  }
}

export function collectVars(e: Expr, into: Set<string> = new Set()): Set<string> {
  switch (e.k) {
    case 'n':
      return into
    case 'v':
      into.add(e.name)
      return into
    case 'neg':
    case 'abs':
    case 'sqrt':
    case 'fn':
      return collectVars(e.x, into)
    case 'pi':
      return into
    case 'pow':
      collectVars(e.b, into)
      return collectVars(e.e, into)
    default:
      collectVars(e.l, into)
      return collectVars(e.r, into)
  }
}
