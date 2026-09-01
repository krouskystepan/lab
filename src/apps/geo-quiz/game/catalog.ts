import type { Country } from './types'

const CACHE_KEY = 'geo-quiz.catalog.v2'
const CACHE_MS = 7 * 24 * 60 * 60 * 1000

/** Slim country list (names, capitals). Flags are loaded from Flagpedia. */
const CATALOG_URLS = [
  'https://cdn.jsdelivr.net/npm/world-countries@5.1.0/dist/countries.json',
  'https://cdn.jsdelivr.net/gh/mledoze/countries@master/dist/countries.json'
]

type Cached = {
  version: 2
  fetchedAt: number
  countries: Country[]
}

type RawName = { common?: unknown; official?: unknown }
type Raw = {
  cca2?: unknown
  cca3?: unknown
  cioc?: unknown
  capital?: unknown
  independent?: unknown
  area?: unknown
  region?: unknown
  altSpellings?: unknown
  name?: RawName
  translations?: Record<string, RawName | undefined>
}

let memory: Country[] | null = null
let inflight: Promise<Country[]> | null = null

export function flagPng(code: string, width: 320 | 640 = 320): string {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`
}

export function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/[A-Z]/g, (ch) =>
      String.fromCodePoint(127397 + ch.charCodeAt(0))
    )
}

export function countryName(country: Country, locale: string): string {
  return locale === 'cs' ? country.nameCs : country.nameEn
}

export function loadCatalog(): Promise<Country[]> {
  if (memory) return Promise.resolve(memory)
  const cached = readCache()
  if (cached) {
    memory = cached
    return Promise.resolve(cached)
  }
  if (!inflight) inflight = fetchCatalog().finally(() => {
    inflight = null
  })
  return inflight
}

async function fetchCatalog(): Promise<Country[]> {
  let last: unknown
  for (const url of CATALOG_URLS) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`http ${res.status}`)
      const json: unknown = await res.json()
      const countries = parseCatalog(json)
      if (countries.length < 50) throw new Error('too_small')
      memory = countries
      writeCache(countries)
      return countries
    } catch (err) {
      last = err
    }
  }
  throw last instanceof Error ? last : new Error('catalog_failed')
}

function parseCatalog(json: unknown): Country[] {
  if (!Array.isArray(json)) return []
  const out: Country[] = []
  const seen = new Set<string>()
  for (const item of json) {
    const c = parseCountry(item)
    if (!c || seen.has(c.code)) continue
    seen.add(c.code)
    out.push(c)
  }
  return out
}

function parseCountry(item: unknown): Country | null {
  if (!item || typeof item !== 'object') return null
  const o = item as Raw
  const code = typeof o.cca2 === 'string' ? o.cca2.toUpperCase() : ''
  if (!/^[A-Z]{2}$/.test(code)) return null
  const capital = firstCapital(o.capital)
  if (!capital) return null
  const nameEn =
    typeof o.name?.common === 'string' ? o.name.common.trim() : ''
  if (!nameEn) return null
  const officialEn =
    typeof o.name?.official === 'string' && o.name.official.trim()
      ? o.name.official.trim()
      : nameEn
  const ces = o.translations?.ces?.common
  const nameCs = typeof ces === 'string' && ces.trim() ? ces.trim() : nameEn
  const cesOff = o.translations?.ces?.official
  const officialCs =
    typeof cesOff === 'string' && cesOff.trim() ? cesOff.trim() : nameCs
  const cca3 = typeof o.cca3 === 'string' ? o.cca3.toUpperCase() : ''
  const altSpellings = stringList(o.altSpellings)
  const region = typeof o.region === 'string' ? o.region : ''
  const area = typeof o.area === 'number' && Number.isFinite(o.area) ? o.area : 0
  return {
    code,
    cca3: /^[A-Z]{3}$/.test(cca3) ? cca3 : '',
    nameEn,
    nameCs,
    officialEn,
    officialCs,
    altSpellings,
    capital,
    region,
    area,
    independent: o.independent === true
  }
}

function stringList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const v of raw) {
    if (typeof v !== 'string') continue
    const s = v.trim()
    if (s) out.push(s)
  }
  return out
}

function firstCapital(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const v = raw[0]
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s.length > 0 ? s : null
}

function readCache(): Country[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Cached>
    if (parsed.version !== 2) return null
    if (typeof parsed.fetchedAt !== 'number') return null
    if (Date.now() - parsed.fetchedAt > CACHE_MS) return null
    if (!Array.isArray(parsed.countries) || parsed.countries.length < 50) {
      return null
    }
    const countries: Country[] = []
    for (const c of parsed.countries) {
      if (!c || typeof c !== 'object') return null
      if (typeof c.code !== 'string' || !/^[A-Z]{2}$/.test(c.code)) return null
      if (typeof c.nameEn !== 'string' || typeof c.nameCs !== 'string') {
        return null
      }
      if (typeof c.capital !== 'string' || typeof c.region !== 'string') {
        return null
      }
      if (typeof c.area !== 'number' || typeof c.independent !== 'boolean') {
        return null
      }
      if (typeof c.cca3 !== 'string' || typeof c.officialEn !== 'string') {
        return null
      }
      if (typeof c.officialCs !== 'string' || !Array.isArray(c.altSpellings)) {
        return null
      }
      if (!c.altSpellings.every((s) => typeof s === 'string')) return null
      countries.push(c)
    }
    return countries
  } catch {
    return null
  }
}

function writeCache(countries: Country[]): void {
  try {
    const payload: Cached = {
      version: 2,
      fetchedAt: Date.now(),
      countries
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}

export function byCode(countries: Country[]): Map<string, Country> {
  const map = new Map<string, Country>()
  for (const c of countries) map.set(c.code, c)
  return map
}
