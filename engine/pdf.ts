import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'

// A Mark writes one thing onto a page of an official form.
//   text:   template with {dotted.path} placeholders; skipped if every placeholder is empty
//   tick:   draws an X when the path is truthy
//   choose: underlines the chosen option inside a printed list of options
export type Mark = {
  page: number
  x: number
  y: number
  text?: string
  tick?: string
  choose?: { printed: string; width: number; value: string }
  w?: number
  size?: number
  wrap?: number // allow this many lines inside a table cell
  pitch?: number // one character per printed box, the boxes this far apart
}

// `template` is the path of the official PDF this form is cut from; several forms may share one file.
export type FormDef = { id: string; title: string; template: string; firstPage: number; lastPage: number; marks: Mark[] }

export function lookup(data: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), data)
}

// Returns '' when no placeholder had a value, so empty rows stay empty.
export function render(template: string, data: unknown): string {
  let any = false
  const out = template.replace(/\{([^}]+)\}/g, (_, p: string) => {
    const v = lookup(data, p.trim())
    if (v === undefined || v === null || v === '') return ''
    any = true
    return String(v)
  })
  return any ? out.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '') : ''
}

// The standard PDF fonts only cover Latin-1.
// ponytail: other scripts are dropped from the PDF; the UI warns first (see nonLatin). Embed a Unicode font if forms must carry Hindi.
const TYPOGRAPHY: Record<string, string> = { '₹': 'Rs. ', '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '…': '...' }
const plain = (s: string) => s.replace(/[₹–—‘’“”…]/g, (c) => TYPOGRAPHY[c])
const latin = (s: string) => plain(s).replace(/[^\x20-\x7e\xa0-\xff]/g, '')

// True when text holds characters the printed form would lose.
export const nonLatin = (s: string) => /[^\x09-\x7e\xa0-\xff]/.test(plain(s))

// Dotted paths of every string in `data` that would lose characters in print.
export function unprintable(data: unknown, path = ''): string[] {
  if (typeof data === 'string') return nonLatin(data) ? [path] : []
  if (data && typeof data === 'object') return Object.entries(data).flatMap(([k, v]) => unprintable(v, path ? `${path}.${k}` : k))
  return []
}

function fit(font: PDFFont, text: string, size: number, w?: number) {
  if (!w) return size
  while (size > 5 && font.widthOfTextAtSize(text, size) > w) size -= 0.25
  return size
}

// Greedy word wrap into at most `max` lines; the last line takes whatever is left.
export function wrapText(font: PDFFont, text: string, size: number, w: number, max: number): string[] {
  const rows: string[] = []
  let cur = ''
  for (const word of text.split(' ')) {
    const next = cur ? cur + ' ' + word : word
    if (cur && rows.length < max - 1 && font.widthOfTextAtSize(next, size) > w) {
      rows.push(cur)
      cur = word
    } else cur = next
  }
  return [...rows, cur]
}

const INK = rgb(0.05, 0.1, 0.35)

export async function fillForm(template: ArrayBuffer | Uint8Array, form: FormDef, data: unknown): Promise<Uint8Array> {
  const src = await PDFDocument.load(template)
  const out = await PDFDocument.create()
  const indices = Array.from({ length: form.lastPage - form.firstPage + 1 }, (_, i) => form.firstPage - 1 + i)
  const pages = await out.copyPages(src, indices)
  pages.forEach((p) => out.addPage(p))
  const font = await out.embedFont(StandardFonts.Helvetica)

  for (const m of form.marks) {
    const page = pages[m.page]
    if (!page) continue
    if (m.tick) {
      if (lookup(data, m.tick)) page.drawText('X', { x: m.x, y: m.y, size: m.size ?? 10, font, color: INK })
    } else if (m.choose) {
      const value = String(lookup(data, m.choose.value) ?? '')
      const at = value ? m.choose.printed.indexOf(value) : -1
      if (at < 0) continue
      const scale = m.choose.width / font.widthOfTextAtSize(m.choose.printed, 10)
      const x1 = m.x + font.widthOfTextAtSize(m.choose.printed.slice(0, at), 10) * scale
      const x2 = x1 + font.widthOfTextAtSize(value, 10) * scale
      page.drawLine({ start: { x: x1, y: m.y - 2 }, end: { x: x2, y: m.y - 2 }, thickness: 1.2, color: INK })
    } else if (m.text) {
      const text = latin(render(m.text, data))
      if (!text) continue
      const size = m.size ?? 9.5
      if (m.pitch) {
        ;[...text.replace(/\s/g, '')].forEach((ch, i) => page.drawText(ch, { x: m.x + i * m.pitch! - font.widthOfTextAtSize(ch, size) / 2, y: m.y, size, font, color: INK }))
        continue
      }
      const rows = m.w && m.wrap && font.widthOfTextAtSize(text, size) > m.w ? wrapText(font, text, Math.min(size, 6.5), m.w, m.wrap) : [text]
      if (rows.length === 1) {
        page.drawText(text, { x: m.x, y: m.y, size: fit(font, text, size, m.w), font, color: INK })
      } else {
        const s = Math.min(size, 6.5)
        rows.forEach((row, i) => page.drawText(row, { x: m.x, y: m.y + (rows.length - 1) * s * 0.6 - i * s * 1.1, size: fit(font, row, s, m.w), font, color: INK }))
      }
    }
  }
  out.setTitle(form.title)
  return out.save()
}

// A plain A4 letter. The first paragraph is set bold as the heading.
export async function letter(title: string, paragraphs: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const size = 11
  const left = 64
  const width = 595 - 2 * left
  let page = doc.addPage([595.28, 841.89])
  let y = 780
  const line = (text: string, f: PDFFont) => {
    if (y < 70) {
      page = doc.addPage([595.28, 841.89])
      y = 780
    }
    page.drawText(text, { x: left, y, size, font: f })
    y -= 16
  }
  paragraphs.forEach((para, i) => {
    const f = i === 0 ? bold : font
    for (const row of latin(para).split('\n')) {
      let cur = ''
      for (const word of row.split(' ')) {
        const next = cur ? cur + ' ' + word : word
        if (f.widthOfTextAtSize(next, size) > width && cur) {
          line(cur, f)
          cur = word
        } else cur = next
      }
      line(cur, f)
    }
    y -= 8
  })
  doc.setTitle(title)
  return doc.save()
}

// Several PDFs, one after another, as a single file.
export async function merge(files: Uint8Array[], title: string): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const f of files) {
    const src = await PDFDocument.load(f)
    for (const p of await out.copyPages(src, src.getPageIndices())) out.addPage(p)
  }
  out.setTitle(title)
  return out.save()
}
