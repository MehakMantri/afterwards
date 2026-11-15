import { conditions } from '@afterwards/engine'
import fc from 'fast-check'
import { expect, test } from 'vitest'
import { FORMS } from './forms'
import { enclosures } from './letters'
import { age, exampleCase, newItem, pdfData, route, type Item } from './model'
import { RULEBOOK, say } from './rulebook'

const yn = fc.constantFrom<'yes' | 'no'>('yes', 'no')
const itemArb = fc.record({
  kind: fc.constantFrom<'fund' | 'bank' | 'demat'>('fund', 'bank', 'demat'),
  guardian: yn,
  sip: yn,
  operated: fc.constantFrom<'guardian' | 'self'>('guardian', 'self'),
})
const make = (a: Partial<Item>): Item => ({ ...newItem(), ...a })

test('every fully answered account reaches exactly one real rule, never the fallback', () => {
  fc.assert(
    fc.property(itemArb, (a) => {
      const item = make(a)
      expect(route(item).id).not.toBe('unknown')
      const facts = { kind: a.kind, guardian: a.guardian, sip: a.sip, operated: a.operated }
      const hits = RULEBOOK.filter((r) => Object.keys(r.when).length > 0 && Object.entries(r.when).every(([k, v]) => facts[k as keyof typeof facts] === v))
      expect(hits).toHaveLength(1)
    }),
  )
})

test('a fund folio always gets Form MAM, and the banker form only when the guardian cannot sign', () => {
  fc.assert(
    fc.property(itemArb, (a) => {
      const forms = route(make({ ...a, kind: 'fund' })).forms
      expect(forms[0]).toBe('MAM')
      expect(forms.includes('A1')).toBe(a.guardian === 'no')
    }),
  )
})

test('a running SIP adds the fresh-instruction document, and nothing else changes', () => {
  fc.assert(
    fc.property(yn, (guardian) => {
      const off = route(make({ kind: 'fund', guardian, sip: 'no' }))
      const on = route(make({ kind: 'fund', guardian, sip: 'yes' }))
      expect(on.forms).toEqual(off.forms)
      expect(on.documents.slice(0, off.documents.length)).toEqual(off.documents)
      expect(on.documents).toHaveLength(off.documents.length + 1)
    }),
  )
})

test('bank and demat accounts never get a fund form', () => {
  fc.assert(fc.property(itemArb, (a) => { if (a.kind !== 'fund') expect(route(make(a)).forms).toEqual([]) }))
})

test('an unanswered account stays on the fallback', () => {
  expect(route(newItem('fund')).id).toBe('unknown')
  expect(route(newItem('bank')).id).toBe('unknown')
})

test('every rule cites an official source with dates, and every form it names has a field map', () => {
  expect(new Set(RULEBOOK.map((r) => r.id)).size).toBe(RULEBOOK.length)
  for (const r of RULEBOOK) {
    expect(r.source.url).toMatch(/^https:\/\/(www\.)?(sebi\.gov\.in|rbi\.org\.in|cdslindia\.com)\//)
    expect(r.source.para).not.toBe('')
    expect(r.source.date).toMatch(/^\d{4}(-\d{2}-\d{2})?$/)
    expect(r.source.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const f of r.forms) expect(FORMS[f]).toBeDefined()
    for (const line of conditions(r, say)) expect(line, r.id).not.toMatch(/[{}"]/)
  }
})

test('every placeholder in every field map resolves against the example person', () => {
  const c = exampleCase()
  const data = pdfData(c, c.items[0]) as unknown as Record<string, unknown>
  const roots = new Set(Object.keys(data))
  for (const form of Object.values(FORMS))
    for (const m of form.marks) {
      const paths = [...(m.text ?? '').matchAll(/\{([^}]+)\}/g)].map((x) => x[1]).concat(m.tick ?? [])
      for (const p of paths) expect(roots.has(p.split('.')[0]), `${form.id}: ${p}`).toBe(true)
    }
})

test('the enclosures list starts with the forms the rule requires, in order', () => {
  fc.assert(
    fc.property(itemArb, (a) => {
      const item = make(a)
      const forms = route(item).forms
      expect(enclosures(item).slice(0, forms.length)).toEqual(forms.map((f) => `${FORMS[f].title}, signed`))
    }),
  )
})

test('age counts whole years and turns 18 on the birthday, not before', () => {
  expect(age('2008-10-27', '2026-10-26')).toBe(17)
  expect(age('2008-10-27', '2026-10-27')).toBe(18)
  expect(age('', '2026-10-27')).toBeUndefined()
})
