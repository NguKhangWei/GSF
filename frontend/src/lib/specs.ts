import type { Product } from '../data/products'

export interface ParsedSpec {
  /** The spec name, e.g. "Loft". Falls back to the whole string when there is no label. */
  label: string
  /** Possible choices parsed from the spec value. Empty for label-only feature specs. */
  values: string[]
  /** True when the shopper can pick between two or more values. */
  selectable: boolean
}

/**
 * Specs arrive as flat strings ("Loft: 9.5° / 10.5°") because the backend joins each
 * Medusa product option (title + values) into one line. This pulls that structure back
 * apart so the UI can render real selectors instead of static text.
 *
 *   "Loft: 9.5° / 10.5°"  -> selectable dropdown (Loft: 9.5°, 10.5°)
 *   "Face: Titanium"      -> fixed detail (single value)
 *   "Italian-made"        -> feature chip (no value)
 */
export function parseSpec(raw: string): ParsedSpec {
  const idx = raw.indexOf(':')
  if (idx === -1) {
    return { label: raw.trim(), values: [], selectable: false }
  }
  const label = raw.slice(0, idx).trim()
  const values = raw
    .slice(idx + 1)
    .split('/')
    .map((v) => v.trim())
    .filter(Boolean)
  return { label, values, selectable: values.length > 1 }
}

export function parseSpecs(specs: Product['specs']): ParsedSpec[] {
  return specs.map(parseSpec)
}
