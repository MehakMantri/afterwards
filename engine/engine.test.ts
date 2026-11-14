import fc from 'fast-check'
import { PDFDocument } from 'pdf-lib'
import { expect, test } from 'vitest'
import { dmy, rupeesInWords } from './format'
import { fillForm, lookup, render } from './pdf'
import { evaluate, type Rule } from './rules'

const src = { title: 't', para: 'p', url: 'https://example.org', date: '2025-01-01' }
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
