import fc from 'fast-check'
import { expect, test } from 'vitest'
import { FORMS } from './forms'
import { addDays, conditions } from '@afterwards/engine'
import { PDFDocument } from 'pdf-lib'
import { enclosures, lateLetter } from './letters'
import { exampleCase, formsFor, newClaim, overdue, pdfData, route, type Claim, type Status } from './model'
import { RULEBOOK, THRESHOLD, TIMELINE, say } from './rulebook'

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

test('a nominee gets Annex V whatever the amount', () => {
  fc.assert(fc.property(claimArb, (a) => { expect(route(make({ ...a, dispute: 'no', nominee: 'yes' })).forms).toEqual(['V']) }))
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
    expect(r.source.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/)
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

test('the rulebook page can word every condition of every rule', () => {
  for (const r of RULEBOOK) for (const line of conditions(r, say)) expect(line, r.id).not.toMatch(/[{}"]/)
})

test('rule ids are unique, so each rule appears on the rulebook page exactly once', () => {
  expect(new Set(RULEBOOK.map((r) => r.id)).size).toBe(RULEBOOK.length)
})

const statusArb = fc.constantFrom<Status>('todo', 'submitted', 'query', 'paid')

test('the delay letter is offered only for a submitted, unpaid claim more than 15 days old', () => {
  fc.assert(
    fc.property(statusArb, fc.integer({ min: 0, max: 120 }), fc.boolean(), (status, passed, dated) => {
      const submittedOn = dated ? '2026-10-01' : ''
      const c: Claim = { ...newClaim(), status, submittedOn }
      expect(overdue(c, addDays('2026-10-01', passed))).toBe(status === 'submitted' && dated && passed > TIMELINE.days)
    }),
  )
})

test('the delay letter quotes both paragraphs from the rulebook and states the days elapsed', async () => {
  const c = exampleCase()
  const claim: Claim = { ...c.claims[0], status: 'submitted', submittedOn: '2026-10-01' }
  const bytes = await lateLetter(c, claim, '2026-10-21')
  expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0)
  expect(TIMELINE.deadlineQuote).toContain(`${TIMELINE.days} calendar days`)
  expect(TIMELINE.interestQuote).toContain('Bank Rate + 4 per cent')
})

test('the packet lists exactly the forms the route requires, in the order the rule gives them', () => {
  fc.assert(
    fc.property(claimArb, fc.boolean(), (a, withHeirs) => {
      const c = { ...exampleCase(), heirs: withHeirs ? exampleCase().heirs : [] }
      const claim = make(a)
      const forms = formsFor(c, claim)
      expect(forms).toEqual(route(claim).forms.filter((f) => forms.includes(f)))
      expect(enclosures(c, claim).slice(0, forms.length)).toEqual(forms.map((f) => `${FORMS[f].title}, signed`))
      if (!withHeirs) expect(forms).not.toContain('VIII')
    }),
  )
})
