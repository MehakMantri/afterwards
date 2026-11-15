import { dmy, evaluate, today, type Facts, type Rule } from '@afterwards/engine'
import { RULEBOOK } from './rulebook'

export type YesNo = '' | 'yes' | 'no'
export type Kind = 'fund' | 'bank' | 'demat'
export type Status = 'todo' | 'submitted' | 'query' | 'done'

export type Item = {
  id: string
  kind: Kind
  name: string
  branch: string
  folios: string[]
  account: string
  guardian: YesNo
  sip: YesNo
  operated: '' | 'guardian' | 'self'
  status: Status
  submittedOn: string
  checked: string[]
}

export type Me = {
  name: string
  dob: string
  pan: string
  mobile: string
  email: string
  address1: string
  address2: string
  city: string
  state: string
  pin: string
  place: string
  guardianName: string
  guardianRelation: '' | 'Father' | 'Mother' | 'Court'
  birthCountry: string
  birthPlace: string
  nationality: string
  occupation: '' | 'student' | 'private' | 'other'
  bankName: string
  bankBranch: string
  bankCity: string
  bankPin: string
  bankAccount: string
  bankIfsc: string
  bankType: 'SB' | 'CA'
}

export type Case = { me: Me; items: Item[] }

export const newItem = (kind: Kind = 'fund'): Item => ({
  id: Math.random().toString(36).slice(2, 9),
  kind,
  name: '',
  branch: '',
  folios: [''],
  account: '',
  guardian: '',
  sip: '',
  operated: '',
  status: 'todo',
  submittedOn: '',
  checked: [],
})

export const emptyCase = (): Case => ({
  me: {
    name: '', dob: '', pan: '', mobile: '', email: '', address1: '', address2: '', city: '', state: '', pin: '', place: '',
    guardianName: '', guardianRelation: '', birthCountry: 'India', birthPlace: '', nationality: 'Indian', occupation: '',
    bankName: '', bankBranch: '', bankCity: '', bankPin: '', bankAccount: '', bankIfsc: '', bankType: 'SB',
  },
  items: [newItem()],
})

// An invented person, so anyone can see the whole flow in half a minute.
export const exampleCase = (): Case => ({
  me: {
    name: 'Ananya Rao', dob: '2008-10-27', pan: 'ABCPR1234K', mobile: '9820000000', email: 'ananya@example.org',
    address1: '22 Lake View Apartments, 5th Cross', address2: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pin: '560038', place: 'Bengaluru',
    guardianName: 'Kavita Rao', guardianRelation: 'Mother', birthCountry: 'India', birthPlace: 'Mysuru', nationality: 'Indian', occupation: 'student',
    bankName: 'Canara Bank', bankBranch: 'Indiranagar', bankCity: 'Bengaluru', bankPin: '560038', bankAccount: '110012345678', bankIfsc: 'CNRB0001234', bankType: 'SB',
  },
  items: [
    { ...newItem('fund'), id: 'ex-fund-1', name: 'Parag Parikh', folios: ['12345678', '12345912'], guardian: 'yes', sip: 'yes' },
    { ...newItem('fund'), id: 'ex-fund-2', name: 'Nippon India', folios: ['477123456789'], guardian: 'no', sip: 'no' },
    { ...newItem('bank'), id: 'ex-bank', name: 'Canara Bank', branch: 'Indiranagar, Bengaluru', account: '110012345678', operated: 'guardian' },
  ],
})

export function facts(i: Item): Facts {
  return { kind: i.kind, guardian: i.guardian || undefined, sip: i.sip || undefined, operated: i.operated || undefined }
}

export const route = (i: Item): Rule => evaluate(RULEBOOK, facts(i))!
export const answered = (i: Item) => route(i).id !== 'unknown'

// Whole years on a given day. Nobody under 18 can make this request, so the app says so instead of filling forms.
export function age(dob: string, on = today()): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return undefined
  const years = Number(on.slice(0, 4)) - Number(dob.slice(0, 4))
  return on.slice(5) < dob.slice(5) ? years - 1 : years
}

// The flat object the field maps read from.
export function pdfData(c: Case, item: Item, now = today()) {
  const m = c.me
  const [y = '', mo = '', d = ''] = /^\d{4}-\d{2}-\d{2}$/.test(m.dob) ? m.dob.split('-') : []
  return {
    today: dmy(now),
    fund: item.name,
    me: { ...m, dobD: d, dobM: mo, dobY: y, pan: m.pan.toUpperCase(), bankIfsc: m.bankIfsc.toUpperCase() },
    folios: item.folios.filter((f) => f.trim()),
    flags: {
      father: m.guardianRelation === 'Father',
      mother: m.guardianRelation === 'Mother',
      court: m.guardianRelation === 'Court',
      savings: m.bankType === 'SB',
      current: m.bankType === 'CA',
      student: m.occupation === 'student',
      privateJob: m.occupation === 'private',
      byGuardian: item.guardian === 'yes',
      byBanker: item.guardian === 'no',
    },
  }
}
