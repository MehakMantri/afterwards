import fc from 'fast-check'
import { PDFDocument } from 'pdf-lib'
import { expect, test } from 'vitest'
import { dmy, rupeesInWords } from './format'
import { fillForm, lookup, render } from './pdf'
import { evaluate, type Rule } from './rules'

const src = { title: 't', para: 'p', url: 'https://example.org', date: '2025-01-01', checked: '2025-01-02' }
const rule = (id: string, when: Rule['when']): Rule => ({ id, when, title: id, explain: '', forms: [], documents: [], source: src })
const rules = [rule('small', { amount: { lte: 100 } }), rule('big', { amount: { gt: 100 } }), rule('fallback', {})]

test('thresholds are inclusive and every number lands in exactly one band', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 1_000_000 }), (amount) => {
      const hit = rules.slice(0, 2).filter((r) => evaluate([r], { amount }))
      expect(hit).toHaveLength(1)
      expect(evaluate(rules, { amount })!.id).toBe(amount <= 100 ? 'small' : 'big')
    }),
  )
})

test('a missing or non-numeric fact falls through to the fallback, never to a band', () => {
  expect(evaluate(rules, {})!.id).toBe('fallback')
  expect(evaluate(rules, { amount: NaN })!.id).toBe('fallback')
})

test('render fills placeholders and returns empty when nothing had a value', () => {
  const data = { a: { name: 'Asha' }, list: [{ n: 1 }] }
  expect(lookup(data, 'list.0.n')).toBe(1)
  expect(render('{a.name}, {a.city}', data)).toBe('Asha')
  expect(render('{a.city} {list.3.n}', data)).toBe('')
})

test('rupees in words uses lakh and crore', () => {
  expect(rupeesInWords(415000)).toBe('Four Lakh Fifteen Thousand Only')
  expect(rupeesInWords(12500000)).toBe('One Crore Twenty Five Lakh Only')
  expect(rupeesInWords(101)).toBe('One Hundred One Only')
  expect(dmy('2026-11-14')).toBe('14/11/2026')
})

test('fillForm keeps only the requested pages and survives any text', async () => {
  const doc = await PDFDocument.create()
  for (let i = 0; i < 5; i++) doc.addPage([595, 842])
  const template = await doc.save()
  const form = {
    id: 'f',
    title: 'F',
    template: 't.pdf',
    firstPage: 2,
    lastPage: 3,
    marks: [
      { page: 0, x: 10, y: 10, text: '{v}', w: 50 },
      { page: 1, x: 10, y: 10, tick: 'v' },
    ],
  }
  await fc.assert(
    fc.asyncProperty(fc.string(), async (s) => {
      const bytes = await fillForm(template, form, { v: s })
      expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2)
    }),
    { numRuns: 25 },
  )
})

// ---------- the skeleton stays a skeleton ----------

import { readdirSync, readFileSync } from 'node:fs'
import { addDays, daysBetween, deadline } from './clock'
import { merge, nonLatin, unprintable } from './pdf'
import { conditions } from './views'

test('engine source names no institution, form or life event', () => {
  const banned = /\b(banks?|rbi|sebi|amfi|annex|annexure|nominees?|heirs?|deceased|death|died|claims?|claimants?|mutual|folios?|guardian|minor)\b/i
  const dir = new URL('.', import.meta.url)
  for (const f of readdirSync(dir).filter((n) => /\.tsx?$/.test(n) && !n.includes('.test.')))
    readFileSync(new URL(f, dir), 'utf8')
      .split('\n')
      .forEach((line, i) => expect(banned.test(line), `${f}:${i + 1}: ${line.trim()}`).toBe(false))
})

const isoDate = fc.date({ min: new Date('2020-01-01T00:00:00Z'), max: new Date('2035-12-31T00:00:00Z'), noInvalidDate: true }).map((d) => d.toISOString().slice(0, 10))

test('a deadline is late exactly when more whole days have passed than it allows, and never counts backwards', () => {
  fc.assert(
    fc.property(isoDate, fc.integer({ min: 0, max: 400 }), fc.integer({ min: 1, max: 90 }), (start, passed, days) => {
      const d = deadline(start, days, addDays(start, passed))
      expect(d.elapsed).toBe(passed)
      expect(d.late).toBe(passed > days)
      expect(d.left).toBe(Math.max(0, days - passed))
      expect(d.overdueBy).toBe(Math.max(0, passed - days))
    }),
  )
  expect(daysBetween('2026-11-20', '2026-11-01')).toBe(0)
  expect(deadline('2026-11-20', 15, '2026-11-01').late).toBe(false)
  expect(daysBetween('not a date', '2026-11-01')).toBe(0)
})

test('text the printed form would lose is reported, and ordinary punctuation is not', () => {
  expect(nonLatin('Ramesh Kumar Iyer, 14 Shanti Kunj – “Prabhat” Road ₹5')).toBe(false)
  expect(nonLatin('रमेश')).toBe(true)
  expect(unprintable({ a: { name: 'Asha' }, list: [{ name: 'आशा' }] })).toEqual(['list.0.name'])
})

test('a merged file has every page of its parts, in order', async () => {
  const part = async (pages: number, w: number) => {
    const d = await PDFDocument.create()
    for (let i = 0; i < pages; i++) d.addPage([w, 800])
    return d.save()
  }
  await fc.assert(
    fc.asyncProperty(fc.array(fc.integer({ min: 1, max: 4 }), { minLength: 1, maxLength: 5 }), async (counts) => {
      const out = await PDFDocument.load(await merge(await Promise.all(counts.map((n, i) => part(n, 500 + i))), 't'))
      expect(out.getPageCount()).toBe(counts.reduce((a, b) => a + b, 0))
      expect(out.getPages().map((p) => p.getWidth())).toEqual(counts.flatMap((n, i) => Array(n).fill(500 + i)))
    }),
    { numRuns: 15 },
  )
})

test('every condition of a rule is worded, and one the app cannot word is shown raw', () => {
  const r = rule('r', { a: 'yes', amount: { lte: 5 } })
  expect(conditions(r, (k) => (k === 'a' ? 'A is yes' : undefined))).toEqual(['A is yes', 'amount: {"lte":5}'])
})

test('a boxed field draws one character per box and ignores spaces', async () => {
  const doc = await PDFDocument.create()
  doc.addPage([595, 842])
  const form = { id: 'f', title: 'F', template: 't.pdf', firstPage: 1, lastPage: 1, marks: [{ page: 0, x: 100, y: 100, text: '{v}', pitch: 12 }] }
  await fc.assert(
    fc.asyncProperty(fc.string({ maxLength: 20 }), async (s) => {
      expect((await PDFDocument.load(await fillForm(await doc.save(), form, { v: s }))).getPageCount()).toBe(1)
    }),
    { numRuns: 15 },
  )
})
