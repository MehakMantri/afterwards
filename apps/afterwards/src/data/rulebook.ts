import type { Rule } from '@afterwards/engine'

// Every rule cites the paragraph it comes from. Do not add a rule without one.
const RBI = {
  title: 'RBI (Settlement of Claims in respect of Deceased Customers of Banks) Directions, 2025',
  url: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12901&Mode=0',
  date: '2025-09-26',
}

export const THRESHOLD = { bank: 1500000, coop: 500000 }

const DEATH = 'Death certificate (carry the original for verification)'
const ID = 'Your identity and address proof: Aadhaar, passport, voter ID or driving licence'

const simplified = (kind: 'bank' | 'coop'): Rule => ({
  id: `simplified-${kind}`,
  when: { dispute: 'no', nominee: 'no', will: 'no', kind, amount: { lte: THRESHOLD[kind] } },
  title: 'Legal heirs, simplified route',
  explain:
    'There is no nominee, but the total is within the limit, so the bank must settle without asking for a succession certificate or any court paper. The heirs who are claiming sign the claim form and a bond of indemnity. Heirs who are not claiming sign a no-objection letter. Someone who knows the family, and is not an heir, signs a declaration naming the heirs.',
  forms: ['I-B', 'I-C', 'I-D', 'I-E'],
  documents: [
    DEATH,
    ID,
    'A legal heir certificate, if you have one. If not, the declaration in Annex I-E takes its place',
    'Stamp paper for Annex I-C and I-D, at the value your state sets',
  ],
  source: { ...RBI, para: 'Paragraph 10(a), with the limit in paragraph 7(h)' },
})

const above = (kind: 'bank' | 'coop'): Rule => ({
  id: `above-${kind}`,
  when: { dispute: 'no', nominee: 'no', will: 'no', kind, amount: { gt: THRESHOLD[kind] } },
  title: 'Legal heirs, above the limit',
  explain:
    'There is no nominee and the total is above the limit. The bank can settle on a succession certificate from a court. Without one, it can accept a legal heir certificate, or the Annex I-E declaration sworn as an affidavit before a notary, together with the same forms as the simplified route. It may also ask for a surety: a third person who signs Annex I-C to stand behind the claim.',
  forms: ['I-B', 'I-C', 'I-D', 'I-E'],
  documents: [
    DEATH,
    ID,
    'A succession certificate, or a legal heir certificate, or Annex I-E sworn before a notary',
    'A surety who can cover the amount, if the bank asks for one',
    'Stamp paper for Annex I-C and I-D, at the value your state sets',
  ],
  lawyer:
    'A succession certificate comes from a civil court and needs a lawyer. Ask the branch first whether it will accept the affidavit and surety instead, and whether it has set a higher limit of its own.',
  source: { ...RBI, para: 'Paragraph 10(b)' },
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
    source: { ...RBI, para: 'Paragraph 11(b)' },
  },
  {
    id: 'nominee',
    when: { dispute: 'no', nominee: 'yes' },
    title: 'Nominee or surviving joint holder',
    explain:
      'The account has a nominee, or it is a joint account that passes to the survivor. The bank must pay on one form and two documents, whatever the amount. It may not ask for a succession certificate, a probate or a surety. The nominee receives the money as trustee for the legal heirs.',
    forms: ['I-A'],
    documents: [DEATH, ID],
    source: { ...RBI, para: 'Paragraphs 8 and 9' },
  },
  {
    id: 'will',
    when: { dispute: 'no', nominee: 'no', will: 'yes' },
    title: 'There is a Will',
    explain:
      'With an undisputed Will, the bank can settle on a probate or a letter of administration. It may also choose to act on the Will without probate if it is satisfied the Will is genuine, and then it asks for the claim form, a bond of indemnity and no-objection letters. That choice is the bank\'s.',
    forms: ['I-B', 'I-C', 'I-D'],
    documents: [DEATH, ID, 'The original Will and a copy', 'Probate or letter of administration, if the bank asks for it'],
    lawyer: 'If the bank insists on probate, that goes through a court and needs a lawyer.',
    source: { ...RBI, para: 'Paragraph 11(a)' },
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

// What the bank owes the family once every document is in.
export const TIMELINE = {
  days: 15,
  text: 'The bank must settle within 15 calendar days of receiving every document. If the delay is its fault, it owes interest at Bank Rate plus 4% a year on the amount.',
  para: 'Paragraphs 31 and 33',
}
