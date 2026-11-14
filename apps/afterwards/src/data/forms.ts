import type { FormDef, Mark } from '@afterwards/engine'

// Field maps for the official RBI forms (Annex I-A to I-E of the 2025 Directions).
// Coordinates are PDF points from the bottom-left of each page, read from the
// text positions of the blanks in the official file. Page numbers are within the form.

export const TEMPLATE = 'forms/rbi-annex-1.pdf'

const t = (page: number, x: number, y: number, text: string, w?: number, size?: number): Mark => ({ page, x, y, text, w, size })
const cells = (marks: Mark[]): Mark[] => marks.map((m) => ({ ...m, wrap: 2 }))
const tick = (page: number, x: number, y: number, path: string): Mark => ({ page, x, y, tick: path })

const MARITAL = 'Married / Unmarried/ Widow(er)'

// The "Deposit Accounts" table appears on four forms with the same four columns.
const accounts = (page: number, ys: number[], totalY: number, xs = [100, 225, 335, 428]): Mark[] => [
  ...ys.flatMap((y, i) => [
    t(page, xs[0], y, `{accounts.${i}.nature}`, 110),
    t(page, xs[1], y, `{accounts.${i}.number}`, 100),
    t(page, xs[2], y, `{accounts.${i}.amount}`, 80),
    t(page, xs[3], y, `{accounts.${i}.maturity}`, 95),
  ]),
  t(page, xs[2], totalY, '{total}', 80),
]

const names = (page: number, ys: number[], x: number, list: string, w = 300): Mark[] =>
  ys.map((y, i) => t(page, x, y, `{${list}.${i}.name}`, w))

const annexIA: FormDef = {
  id: 'I-A',
  title: 'Annex I-A: Claim form for nominee or survivor',
  firstPage: 1,
  lastPage: 4,
  marks: [
    t(0, 420, 684, '{today}'),
    t(0, 66, 658, '{claim.bank}', 100),
    t(0, 66, 630, '{claim.branch}', 100),
    t(0, 153, 536, '{deceased.name}', 102),
    t(0, 95, 507, '{claimantNames}', 152),
    t(0, 95, 464, '{deceased.name}', 140),
    t(0, 66, 449, '{deceased.deathDate}', 73),
    t(0, 214, 392, '{deceased.deathDate}, {deceased.deathPlace}', 300),
    t(0, 257, 364, '{deceased.certNo}', 48),
    t(0, 338, 364, '{deceased.certDate}', 54),
    t(0, 440, 364, '{deceased.certAuthority}', 91),
    t(0, 247, 321, '{deceased.age}', 38),
    { page: 0, x: 298, y: 289, choose: { printed: MARITAL, width: 164, value: 'deceased.marital' } },
    t(0, 86, 249, '{deceased.address}', 374),
    t(0, 151, 221, '{deceased.city}', 78),
    t(0, 259, 221, '{deceased.pin}', 54),
    t(0, 349, 221, '{deceased.state}', 60),
    t(0, 459, 221, '{deceased.country}', 60),
    ...accounts(1, [704, 685, 666, 646], 627),
    ...cells([379, 360, 340, 321].flatMap((y, i) => [
      t(1, 100, y, `{claimants.${i}.name}`, 76, 8),
      t(1, 178, y, `{claimants.${i}.address}`, 72, 8),
      t(1, 266, y, `{claimants.${i}.mobile}`, 72, 8),
      t(1, 342, y, `{claimants.${i}.email}`, 66, 8),
      t(1, 412, y, `{claimants.${i}.payBank} {claimants.${i}.payAccount} {claimants.${i}.payIfsc}`, 118, 8),
    ])),
    tick(2, 85.5, 428.5, 'flags.always'),
    tick(2, 85.5, 385.5, 'flags.always'),
    ...names(2, [238, 222, 206, 191], 111, 'claimants', 215),
  ],
}

const annexIB: FormDef = {
  id: 'I-B',
  title: 'Annex I-B: Claim form for legal heirs',
  firstPage: 5,
  lastPage: 10,
  marks: [
    t(0, 420, 680, '{today}'),
    t(0, 66, 659, '{claim.bank}', 100),
    t(0, 66, 630, '{claim.branch}', 100),
    t(0, 66, 538, '{deceased.name}', 100),
    t(0, 97, 507, '{claimantNames}', 160),
    t(0, 154, 475, '{deceased.name}', 140),
    t(0, 125, 458, '{deceased.deathDate}', 73),
    t(0, 214, 407, '{deceased.deathDate}, {deceased.deathPlace}', 300),
    t(0, 257, 384, '{deceased.certNo}', 48),
    t(0, 338, 384, '{deceased.certDate}', 54),
    t(0, 440, 384, '{deceased.certAuthority}', 91),
    t(0, 113, 347, '{deceased.age}', 38),
    { page: 0, x: 167, y: 321, choose: { printed: MARITAL, width: 164, value: 'deceased.marital' } },
    t(0, 86, 282, '{deceased.address}', 440),
    t(0, 162, 259, '{deceased.city}', 77),
    t(0, 268, 259, '{deceased.pin}', 53),
    t(0, 357, 259, '{deceased.state}', 59),
    t(0, 465, 259, '{deceased.country}', 65),
    t(0, 134, 236, '{deceased.religion}', 110),
    t(0, 328, 213, '{deceased.law}', 54),
    ...cells([114, 99, 84, 70].flatMap((y, i) => [
      t(0, 94, y, `{allHeirs.${i}.name}, {allHeirs.${i}.address}`, 94, 7.5),
      t(0, 202, y, `{allHeirs.${i}.age}`, 28, 8),
      t(0, 238, y, `{allHeirs.${i}.relation}`, 56, 8),
      t(0, 298, y, `{allHeirs.${i}.mobile} {allHeirs.${i}.email}`, 100, 7.5),
      t(0, 448, y, `{allHeirs.${i}.disclaimer}`, 60, 8),
    ])),
    ...accounts(1, [531, 515, 499, 483], 467),
    tick(2, 69, 718, 'flags.noWill'),
    tick(2, 69, 695, 'flags.hasWill'),
    tick(2, 69, 273, 'flags.declaration'),
    ...cells([155, 139, 123, 107].flatMap((y, i) => [
      t(2, 100, y, `{claimants.${i}.name}`, 150, 8.5),
      t(2, 267, y, `{claimants.${i}.payBank} {claimants.${i}.payAccount}`, 96, 8),
      t(2, 378, y, `{claimants.${i}.payIfsc}`, 58, 8),
      t(2, 440, y, `{claimants.${i}.payBranch}`, 90, 8),
    ])),
    tick(3, 104.5, 474.5, 'flags.always'),
    tick(3, 104.5, 437.5, 'flags.always'),
    tick(3, 104.5, 400.5, 'flags.hasWill'),
    tick(3, 104.5, 285.5, 'flags.declaration'),
    tick(3, 104.5, 248.5, 'flags.always'),
    tick(3, 104.5, 202.5, 'flags.hasHeirs'),
    ...names(4, [736, 720, 704, 688], 106, 'claimants', 220),
  ],
}

const annexIC: FormDef = {
  id: 'I-C',
  title: 'Annex I-C: Bond of indemnity',
  firstPage: 11,
  lastPage: 13,
  marks: [
    t(0, 437, 646, '{today}'),
    t(0, 66, 624, '{claim.bank}', 100),
    t(0, 66, 599, '{claim.branch}', 100),
    ...names(0, [501, 477, 452, 427], 86, 'claimants', 440),
    t(0, 164, 397, '{totalWords}', 248),
    t(0, 66, 364, '{deceased.name}', 118),
    ...accounts(0, [284, 268, 252, 236], 220, [106, 232, 335, 425]),
    t(0, 88, 194, '{claimantNames}', 368),
  ],
}

const annexID: FormDef = {
  id: 'I-D',
  title: 'Annex I-D: Letter of disclaimer / no objection',
  firstPage: 14,
  lastPage: 15,
  marks: [
    t(0, 66, 640, '{claim.bank}', 100),
    t(0, 66, 620, '{claim.branch}', 100),
    t(0, 123, 543, '{deceased.name}', 176),
    ...accounts(0, [459, 443, 427, 411], 395),
    t(0, 264, 257, '{deceased.name}', 158),
    t(0, 285, 199, '{deceased.name}', 245),
    ...names(0, [160, 135, 111, 86], 86, 'claimants', 440),
    ...[661, 642, 623, 603].flatMap((y, i) => [
      t(1, 110, y, `{heirs.${i}.name}`, 225),
      t(1, 362, y, `{heirs.${i}.age}`, 30),
    ]),
  ],
}

const annexIE: FormDef = {
  id: 'I-E',
  title: 'Annex I-E: Declaration by an independent person',
  firstPage: 16,
  lastPage: 17,
  marks: [
    t(0, 75, 677, '{declarant.name}', 172),
    t(0, 286, 677, '{declarant.parent}', 190),
    t(0, 66, 657, '{declarant.address}', 350),
    t(0, 176, 604, '{deceased.name}', 236),
    t(0, 413, 586, '{deceased.deathDate}', 118),
    t(0, 78, 567, '{deceased.deathPlace}', 128),
    t(0, 380, 539, '{declarant.years}', 55),
    ...[413, 393, 374, 355].flatMap((y, i) => [
      t(0, 110, y, `{allHeirs.${i}.name}`, 215),
      t(0, 355, y, `{allHeirs.${i}.age}`, 30),
      t(0, 425, y, `{allHeirs.${i}.relation}`, 100),
    ]),
    t(0, 321, 245, '{claim.bank}', 100),
    t(0, 456, 245, '{claim.branch}', 75, 8),
    t(0, 99, 165, '{claim.bank}', 98),
    t(0, 231, 165, '{claim.branch}', 86, 8),
  ],
}

export const FORMS: Record<string, FormDef> = { 'I-A': annexIA, 'I-B': annexIB, 'I-C': annexIC, 'I-D': annexID, 'I-E': annexIE }

// One line each, for the people who have to sign them.
export const FORM_NOTES: Record<string, string> = {
  'I-A': 'Signed by the nominee or the surviving joint holder.',
  'I-B': 'Signed by every heir who is claiming.',
  'I-C': 'Signed by the claiming heirs, on stamp paper.',
  'I-D': 'Signed by the heirs who are not claiming, on stamp paper.',
  'I-E': 'Signed by someone who knows the family and is not an heir.',
}
