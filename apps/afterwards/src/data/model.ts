import { deadline, dmy, evaluate, inr, rupeesInWords, today, type Facts, type Rule } from '@afterwards/engine'
import { RULEBOOK, TIMELINE } from './rulebook'

export type YesNo = '' | 'yes' | 'no'
export type Status = 'todo' | 'submitted' | 'query' | 'paid'

export type Account = { nature: string; number: string; amount: string; maturity: string }

export type Claim = {
  id: string
  bank: string
  branch: string
  kind: 'bank' | 'coop'
  nominee: YesNo
  will: YesNo
  dispute: YesNo
  accounts: Account[]
  status: Status
  submittedOn: string
  checked: string[]
}

export type Claimant = {
  name: string
  relation: string
  age: string
  address: string
  mobile: string
  email: string
  payBank: string
  payAccount: string
  payIfsc: string
  payBranch: string
}

export type Heir = { name: string; relation: string; age: string }

export type Case = {
  deceased: {
    name: string
    deathDate: string
    deathPlace: string
    certNo: string
    certDate: string
    certAuthority: string
    age: string
    marital: string
    address: string
    city: string
    pin: string
    state: string
    country: string
    religion: string
    law: string
  }
  claimants: Claimant[]
  heirs: Heir[]
  declarant: { name: string; parent: string; address: string; years: string }
  claims: Claim[]
}

export const newAccount = (): Account => ({ nature: 'SB', number: '', amount: '', maturity: '' })

export const newClaim = (): Claim => ({
  id: Math.random().toString(36).slice(2, 9),
  bank: '',
  branch: '',
  kind: 'bank',
  nominee: '',
  will: '',
  dispute: '',
  accounts: [newAccount()],
  status: 'todo',
  submittedOn: '',
  checked: [],
})

export const newClaimant = (): Claimant => ({
  name: '', relation: '', age: '', address: '', mobile: '', email: '', payBank: '', payAccount: '', payIfsc: '', payBranch: '',
})

export const emptyCase = (): Case => ({
  deceased: {
    name: '', deathDate: '', deathPlace: '', certNo: '', certDate: '', certAuthority: '', age: '', marital: '',
    address: '', city: '', pin: '', state: '', country: 'India', religion: '', law: '',
  },
  claimants: [newClaimant()],
  heirs: [],
  declarant: { name: '', parent: '', address: '', years: '' },
  claims: [newClaim()],
})

// An invented family, so anyone can see the whole flow in half a minute.
export const exampleCase = (): Case => ({
  deceased: {
    name: 'Ramesh Kumar Iyer', deathDate: '2026-09-18', deathPlace: 'Pune', certNo: 'PMC/D/2026/48213', certDate: '2026-09-24',
    certAuthority: 'Pune Municipal Corporation', age: '71', marital: 'Married', address: '14 Shanti Kunj, Prabhat Road, Erandwane',
    city: 'Pune', pin: '411004', state: 'Maharashtra', country: 'India', religion: 'Hindu', law: 'Hindu',
  },
  claimants: [
    {
      name: 'Lakshmi Iyer', relation: 'Wife', age: '66', address: '14 Shanti Kunj, Prabhat Road, Erandwane, Pune 411004',
      mobile: '98200 00000', email: 'lakshmi@example.org', payBank: 'Bank of Maharashtra', payAccount: '60012345678',
      payIfsc: 'MAHB0000123', payBranch: 'Deccan Gymkhana, Pune',
    },
  ],
  heirs: [
    { name: 'Anand Iyer', relation: 'Son', age: '41' },
    { name: 'Meera Krishnan', relation: 'Daughter', age: '38' },
  ],
  declarant: { name: 'Suresh Deshpande', parent: 'Vasant Deshpande', address: '16 Shanti Kunj, Prabhat Road, Pune 411004', years: '22' },
  claims: [
    {
      ...newClaim(), id: 'ex-sbi', bank: 'State Bank of India', branch: 'Deccan Gymkhana, Pune', nominee: 'yes', will: 'no', dispute: 'no',
      accounts: [
        { nature: 'SB', number: '30211234567', amount: '284500', maturity: '' },
        { nature: 'TD', number: '30298765432', amount: '500000', maturity: '2027-03-31' },
      ],
    },
    {
      ...newClaim(), id: 'ex-pnb', bank: 'Punjab National Bank', branch: 'Karve Road, Pune', nominee: 'no', will: 'no', dispute: 'no',
      accounts: [{ nature: 'SB', number: '0452000100234567', amount: '415000', maturity: '' }],
    },
  ],
})

export const total = (c: Claim) => c.accounts.reduce((s, a) => s + (Number(a.amount) || 0), 0)

export const answered = (c: Claim) => c.dispute !== '' && c.nominee !== '' && (c.nominee === 'yes' || c.will !== '') && total(c) > 0

export function facts(c: Claim): Facts {
  return { kind: c.kind, nominee: c.nominee || undefined, will: c.will || undefined, dispute: c.dispute || undefined, amount: total(c) }
}

export const route = (c: Claim): Rule => evaluate(RULEBOOK, facts(c))!

// The clock runs only while the bank holds every document and has not paid.
// "Bank asked for more" stops it: the 15 days count from the day the last document goes in.
export const clockRuns = (c: Claim) => c.status === 'submitted' && c.submittedOn !== ''

// The letter about delay is offered only once the deadline has passed on a running clock.
export const overdue = (c: Claim, now = today()) => clockRuns(c) && deadline(c.submittedOn, TIMELINE.days, now).late

// Which forms this claim actually needs. Annex VIII only matters when some heirs are not claiming.
export function formsFor(c: Case, claim: Claim): string[] {
  return route(claim).forms.filter((f) => f !== 'VIII' || c.heirs.some((h) => h.name.trim()))
}

// The flat object the field maps read from.
export function pdfData(c: Case, claim: Claim) {
  const claimants = c.claimants.filter((p) => p.name.trim())
  const heirs = c.heirs.filter((h) => h.name.trim())
  const rule = route(claim)
  return {
    today: dmy(new Date().toISOString()),
    claim: { bank: claim.bank, branch: claim.branch },
    deceased: { ...c.deceased, deathDate: dmy(c.deceased.deathDate), certDate: dmy(c.deceased.certDate) },
    claimants,
    claimantNames: claimants.map((p) => p.name).join(', '),
    accounts: claim.accounts
      .filter((a) => a.number || a.amount)
      .map((a) => ({ ...a, amount: a.amount ? Math.round(Number(a.amount)).toLocaleString('en-IN') : '', maturity: dmy(a.maturity) })),
    total: inr(total(claim)).replace('₹', ''),
    totalWords: rupeesInWords(total(claim)),
    heirs,
    allHeirs: [
      ...claimants.map((p) => ({ ...p, disclaimer: 'No' })),
      ...heirs.map((h) => ({ ...h, address: '', mobile: '', email: '', disclaimer: 'Yes' })),
    ],
    declarant: c.declarant,
    flags: { always: true, noWill: claim.will === 'no', hasWill: claim.will === 'yes', hasHeirs: heirs.length > 0, declaration: rule.forms.includes('IX') },
  }
}
