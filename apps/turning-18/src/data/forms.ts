import type { FormDef, Mark } from '@afterwards/engine'

// Field maps for the two AMFI forms, as published on amfiindia.com and fetched on 2026-11-15:
//   Form MAM, "Request for change in status from Minor to Major" (2 pages)
//   Annexure 1, "Bank Attestation of Account Details & Account-holder's signature" (1 page)
// Coordinates are PDF points from the bottom-left of each page, read from the text and box positions
// in the official files. Signatures, attestation, declarations about tax residence, political exposure
// and income, and the nomination choice are left blank on purpose: they are the applicant's to make.

const t = (page: number, x: number, y: number, text: string, w?: number, size?: number): Mark => ({ page, x, y, text, w, size })
const tick = (page: number, x: number, y: number, path: string): Mark => ({ page, x, y, tick: path, size: 9 })
// One character per printed box; x is the centre of the first box.
const boxes = (page: number, x: number, y: number, text: string, pitch: number): Mark => ({ page, x, y, text, pitch, size: 10 })

const FOLIO_X = [76, 267, 423]
const FOLIO_Y = [513, 497, 481]

const mam: FormDef = {
  id: 'MAM',
  template: 'forms/amfi-form-mam.pdf',
  title: 'Form MAM: Request for change in status from Minor to Major',
  firstPage: 1,
  lastPage: 2,
  marks: [
    t(0, 170, 788, '{fund}', 132, 11),
    t(0, 60, 720, '{fund}', 146),
    t(0, 100, 681, '{me.name}', 450),
    boxes(0, 133, 660, '{me.dobD}', 19.5),
    boxes(0, 195, 660, '{me.dobM}', 19.5),
    boxes(0, 257, 660, '{me.dobY}', 19.3),
    boxes(0, 379, 660, '{me.pan}', 19.2),
    t(0, 194, 596, '{me.guardianName}', 360),
    tick(0, 201, 581, 'flags.father'),
    tick(0, 264, 581, 'flags.mother'),
    tick(0, 330.5, 581, 'flags.court'),
    ...FOLIO_Y.flatMap((y, r) => FOLIO_X.map((x, c) => t(0, x, y, `{folios.${r * 3 + c}}`, c === 0 ? 165 : 130))),
    t(0, 143, 443, '{me.mobile}', 96),
    t(0, 142, 355, '{me.email}', 410),
    t(0, 122, 240, '{me.address1}', 435),
    t(0, 122, 222, '{me.address2}', 435),
    t(0, 82, 205, '{me.city}', 180),
    t(0, 293, 205, '{me.state}', 165),
    boxes(0, 493, 206, '{me.pin}', 12.5),
    t(0, 110, 151, '{me.bankName}', 440),
    t(0, 112, 133, '{me.bankAccount}', 245),
    boxes(0, 431, 134, '{me.bankIfsc}', 12.6),
    tick(0, 121.5, 116, 'flags.savings'),
    tick(0, 146.5, 116, 'flags.current'),
    t(0, 148, 98, '{me.bankBranch}', 400),
    t(0, 80, 81, '{me.bankCity}', 380),
    boxes(0, 494, 82, '{me.bankPin}', 12.5),

    tick(1, 121, 781, 'flags.privateJob'),
    tick(1, 242, 766, 'flags.student'),
    t(1, 135, 703, '{me.birthCountry}', 170),
    t(1, 372, 703, '{me.birthPlace}', 180),
    t(1, 112, 688, '{me.nationality}', 200),
    t(1, 143, 462, '{fund}', 285),
    t(1, 134, 423, '{fund}', 280),
    tick(1, 252, 349, 'flags.byGuardian'),
    tick(1, 361, 349, 'flags.byBanker'),
    t(1, 85, 319, '{me.place}', 130),
    t(1, 85, 302, '{today}', 130),
  ],
}

const annexure1: FormDef = {
  id: 'A1',
  template: 'forms/amfi-annexure-1.pdf',
  title: 'Annexure 1: Bank attestation of account details and signature',
  firstPage: 1,
  lastPage: 1,
  marks: [
    t(0, 204, 658, '{me.name}', 335),
    t(0, 222, 632, '{me.bankName}', 315),
    t(0, 76, 603, '{me.bankBranch}', 435),
    t(0, 150, 568, '{me.bankAccount}', 400),
    tick(0, 118, 547, 'flags.savings'),
    tick(0, 164, 547, 'flags.current'),
    t(0, 360, 525, '{me.bankIfsc}', 195),
    t(0, 76, 484, '{me.address1}', 475),
    t(0, 76, 464, '{me.address2}', 475),
    t(0, 94, 439, '{me.city}', 155),
    t(0, 276, 439, '{me.pin}', 95),
    t(0, 402, 439, '{me.state}', 150),
  ],
}

export const FORMS: Record<string, FormDef> = { MAM: mam, A1: annexure1 }
export const formName = (id: string) => (id === 'MAM' ? 'Form MAM' : 'Annexure 1')

export const FORM_NOTES: Record<string, string> = {
  MAM: 'You sign on page 2. Tick the boxes left empty yourself: tax status, income, nomination and the rest are your declarations.',
  A1: 'Your bank manager fills the bottom half, signs and stamps it. Take it to your own branch.',
}
