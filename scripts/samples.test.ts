// Fills every form of both apps with the example data and writes the PDFs to samples/ for checking by eye.
// Run with: npm run samples
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { fillForm, type FormDef } from '../engine'
import { FORMS as CLAIM_FORMS } from '../apps/afterwards/src/data/forms'
import { exampleCase as family, pdfData as claimData } from '../apps/afterwards/src/data/model'
import { FORMS as EIGHTEEN_FORMS } from '../apps/turning-18/src/data/forms'
import { exampleCase as person, pdfData as eighteenData } from '../apps/turning-18/src/data/model'

const out = new URL('../samples/', import.meta.url)
const fill = async (app: string, form: FormDef, data: unknown) => {
  const bytes = await fillForm(readFileSync(new URL(`../apps/${app}/public/${form.template}`, import.meta.url)), form, data)
  writeFileSync(new URL(`${app}-${form.id}.pdf`, out), bytes)
  return bytes.length
}

test('write sample PDFs', async () => {
  mkdirSync(out, { recursive: true })
  const f = family()
  for (const form of Object.values(CLAIM_FORMS)) expect(await fill('afterwards', form, claimData(f, f.claims[1]))).toBeGreaterThan(1000)
  const p = person()
  for (const form of Object.values(EIGHTEEN_FORMS)) expect(await fill('turning-18', form, eighteenData(p, p.items[1]))).toBeGreaterThan(1000)
})
