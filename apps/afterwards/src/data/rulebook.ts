import { inr, type Cond, type Rule } from '@afterwards/engine'

// Every rule cites the paragraph it comes from. Do not add a rule without one.
//
// The claim rules were first issued as stand-alone Directions on 26 September 2025. On 28 November 2025
// the RBI consolidated them: for commercial banks they are now paragraphs 282 to 323 of the Directions
// below, in force from 1 April 2026, and the forms were renumbered from Annex I-A..I-E to Annex V..IX.
// Paragraph numbers here were read against the RBI page on the `checked` date.
const RBI = {
  title: 'RBI (Commercial Banks - Responsible Business Conduct) Directions, 2025',
  url: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140',
  date: '2026-10-01',
  checked: '2026-11-15',
}

// Co-operative banks have their own consolidated Directions, whose paragraph numbers we have not yet
// read. Their limit is cited from the Directions as first issued, which name co-operative banks.
const RBI_2025 = {
  title: 'RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025',
  url: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12901&Mode=0',
  date: '2025-09-26',
  checked: '2026-11-14',
}

export const THRESHOLD = { bank: 1500000, coop: 500000 }

const DEATH = 'Death certificate (carry the original for verification)'
const ID = 'Your identity and address proof: Aadhaar, passport, voter ID or driving licence'

const source = (kind: 'bank' | 'coop', para: string, para2025: string) =>
  kind === 'bank' ? { ...RBI, para } : { ...RBI_2025, para: `${para2025} (as first issued; since moved into the Directions for co-operative banks)` }

const simplified = (kind: 'bank' | 'coop'): Rule => ({
  id: `simplified-${kind}`,
  when: { dispute: 'no', nominee: 'no', will: 'no', kind, amount: { lte: THRESHOLD[kind] } },
  title: 'Legal heirs, simplified route',
  explain:
    'There is no nominee, but the total is within the limit, so the bank must settle without asking for a succession certificate or any court paper. The heirs who are claiming sign the claim form and a bond of indemnity. Heirs who are not claiming sign a no-objection letter. Someone who knows the family, and is not an heir, signs a declaration naming the heirs.',
  forms: ['VI', 'VII', 'VIII', 'IX'],
  documents: [
    DEATH,
    ID,
    'A legal heir certificate, if you have one. If not, the declaration in Annex IX takes its place',
    'Stamp paper for Annex VII and VIII, at the value your state sets',
  ],
  source: source(kind, 'Paragraphs 287 to 289, with the limit in paragraph 283(3)', 'Paragraph 10(a), with the limit in paragraph 7(h)'),
})

const above = (kind: 'bank' | 'coop'): Rule => ({
  id: `above-${kind}`,
  when: { dispute: 'no', nominee: 'no', will: 'no', kind, amount: { gt: THRESHOLD[kind] } },
  title: 'Legal heirs, above the limit',
  explain:
    'There is no nominee and the total is above the limit. The bank can settle on a succession certificate from a court. Without one, it can accept a legal heir certificate, or the Annex IX declaration sworn as an affidavit before a notary, together with the same forms as the simplified route. It may also ask for a surety: a third person who signs Annex VII to stand behind the claim.',
  forms: ['VI', 'VII', 'VIII', 'IX'],
  documents: [
    DEATH,
    ID,
    'A succession certificate, or a legal heir certificate, or Annex IX sworn before a notary',
    'A surety who can cover the amount, if the bank asks for one',
    'Stamp paper for Annex VII and VIII, at the value your state sets',
  ],
  lawyer:
    'A succession certificate comes from a civil court and needs a lawyer. Ask the branch first whether it will accept the affidavit and surety instead, and whether it has set a higher limit of its own.',
  source: source(kind, 'Paragraph 290', 'Paragraph 10(b)'),
})

export const RULEBOOK: Rule[] = [
  {
    id: 'dispute',
    when: { dispute: 'yes' },
    title: 'Needs a court paper',
    explain:
      'When heirs disagree, or someone contests the claim, the bank may only settle on a probate, a letter of administration, a succession certificate or a court order. No form can replace that.',
    forms: [],
    documents: [DEATH, ID, 'Probate, letter of administration, succession certificate, or a court order'],
    lawyer: 'This needs a lawyer. Afterwards cannot prepare this claim for you.',
    source: { ...RBI, para: 'Paragraph 293' },
  },
  {
    id: 'nominee',
    when: { dispute: 'no', nominee: 'yes' },
    title: 'Nominee or surviving joint holder',
    explain:
      'The account has a nominee, or it is a joint account that passes to the survivor. The bank must pay on one form and two documents, whatever the amount. It may not ask for a succession certificate, a probate or a surety. The nominee receives the money as trustee for the legal heirs.',
    forms: ['V'],
    documents: [DEATH, ID],
    source: { ...RBI, para: 'Paragraphs 284 to 286' },
  },
  {
    id: 'will',
    when: { dispute: 'no', nominee: 'no', will: 'yes' },
    title: 'There is a Will',
    explain:
      "With an undisputed Will, the bank can settle on a probate or a letter of administration. It may also choose to act on the Will without probate if it is satisfied the Will is genuine, and then it asks for the claim form, a bond of indemnity and no-objection letters. That choice is the bank's.",
    forms: ['VI', 'VII', 'VIII'],
    documents: [DEATH, ID, 'The original Will and a copy', 'Probate or letter of administration, if the bank asks for it'],
    lawyer: 'If the bank insists on probate, that goes through a court and needs a lawyer.',
    source: { ...RBI, para: 'Paragraphs 291 and 292' },
  },
  simplified('bank'),
  simplified('coop'),
  above('bank'),
  above('coop'),
  {
    id: 'unknown',
    when: {},
    title: 'We cannot tell yet',
    explain: 'Answer every question for this bank and the route will appear here.',
    forms: [],
    documents: [],
    source: { ...RBI, para: 'Not applicable' },
  },
]

// What the bank owes the family once every document is in. Quotes are word for word.
export const TIMELINE = {
  days: 15,
  text: 'The bank must settle within 15 calendar days of receiving every document. If the delay is its fault, it owes interest at Bank Rate plus 4% a year on the amount.',
  para: 'Paragraphs 319 and 321',
  deadlinePara: 'paragraph 319',
  deadlineQuote:
    'A bank shall settle a claim in respect of deposit accounts of a deceased customer within a period not exceeding 15 calendar days from the date of receipt of all the required documents associated with the claim.',
  interestPara: 'paragraph 321',
  interestQuote:
    'in cases of delay attributable to the bank, compensation shall be paid by the bank in the form of interest, at a rate not less than the prevailing Bank Rate + 4 per cent per annum, on the settlement amount due for the period of delay.',
  source: RBI,
}

// The rulebook page words each condition from here, so the page cannot drift from the rules.
const SAY: Record<string, Record<string, string>> = {
  dispute: { yes: 'Someone is disputing who should get the money', no: 'Nobody is disputing who should get the money' },
  nominee: { yes: 'The account has a nominee, or passes to a surviving joint holder', no: 'The account has no nominee and no surviving joint holder' },
  will: { yes: 'The person left a Will', no: 'The person left no Will' },
  kind: { bank: 'It is a regular (commercial) bank', coop: 'It is a co-operative bank' },
}

export function say(key: string, cond: Cond): string | undefined {
  if (key === 'amount' && typeof cond === 'object')
    return cond.lte !== undefined ? `The total at this bank is ${inr(cond.lte)} or less` : `The total at this bank is more than ${inr(cond.gt ?? 0)}`
  return typeof cond === 'string' ? SAY[key]?.[cond] : undefined
}
