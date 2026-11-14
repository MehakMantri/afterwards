import fc from 'fast-check'
import { expect, test } from 'vitest'
import { FORMS } from './forms'
import { exampleCase, newClaim, pdfData, route, type Claim } from './model'
import { RULEBOOK, THRESHOLD } from './rulebook'

const yn = fc.constantFrom<'yes' | 'no'>('yes', 'no')
const claimArb = fc.record({ kind: fc.constantFrom<'bank' | 'coop'>('bank', 'coop'), nominee: yn, will: yn, dispute: yn, amount: fc.integer({ min: 1, max: 50_000_000 }) })
const make = (a: { kind: 'bank' | 'coop'; nominee: 'yes' | 'no'; will: 'yes' | 'no'; dispute: 'yes' | 'no'; amount: number }): Claim => ({
  ...newClaim(),
  kind: a.kind,
  nominee: a.nominee,
  will: a.will,
  dispute: a.dispute,
  accounts: [{ nature: 'SB', number: '1', amount: String(a.amount), maturity: '' }],
})

test('every fully answered claim reaches a real route, never the fallback', () => {
  fc.assert(fc.property(claimArb, (a) => { expect(route(make(a)).id).not.toBe('unknown') }))
})

test('a dispute always needs a court paper and never gets a form', () => {
  fc.assert(
    fc.property(claimArb, (a) => {
      const r = route(make({ ...a, dispute: 'yes' }))
      expect(r.id).toBe('dispute')
      expect(r.forms).toEqual([])
    }),
  )
})

test('a nominee gets Annex I-A whatever the amount', () => {
  fc.assert(fc.property(claimArb, (a) => { expect(route(make({ ...a, dispute: 'no', nominee: 'yes' })).forms).toEqual(['I-A']) }))
})

test('an amount above the limit never gets the simplified route', () => {
  fc.assert(
    fc.property(claimArb, (a) => {
      const r = route(make({ ...a, dispute: 'no', nominee: 'no', will: 'no' }))
      expect(r.id).toBe(a.amount <= THRESHOLD[a.kind] ? `simplified-${a.kind}` : `above-${a.kind}`)
    }),
  )
})

test('every rule cites a source, and every form it names has a field map', () => {
  for (const r of RULEBOOK) {
    expect(r.source.url).toMatch(/^https:\/\/www\.rbi\.org\.in\//)
    expect(r.source.para).not.toBe('')
    expect(r.source.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const f of r.forms) expect(FORMS[f]).toBeDefined()
  }
})

test('every placeholder in every field map resolves against the example family', () => {
  const c = exampleCase()
  const data = pdfData(c, c.claims[1]) as unknown as Record<string, unknown>
  const roots = new Set(Object.keys(data))
  for (const form of Object.values(FORMS))
    for (const m of form.marks) {
      const paths = [...(m.text ?? '').matchAll(/\{([^}]+)\}/g)].map((x) => x[1]).concat(m.tick ?? [], m.choose?.value ?? [])
      for (const p of paths) expect(roots.has(p.split('.')[0]), `${form.id}: ${p}`).toBe(true)
    }
})
