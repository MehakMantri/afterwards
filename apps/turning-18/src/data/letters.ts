import { dmy, letter, today } from '@afterwards/engine'
import { FORMS } from './forms'
import { route, type Case, type Item } from './model'

const BLANK = '________________'

// What goes to the fund house or the branch: forms first, then supporting documents.
export function enclosures(item: Item): string[] {
  const r = route(item)
  return [...r.forms.map((f) => `${FORMS[f].title}, signed`), ...r.documents]
}

export function coverLetter(c: Case, item: Item, now = today()) {
  const r = route(item)
  const folios = item.folios.filter((f) => f.trim())
  return letter(`Cover letter, ${item.name}`, [
    'Request to change status from minor to major',
    `To: The Trustees\n${item.name || BLANK} Mutual Fund\n\nDate: ${dmy(now)}`,
    `Dear Madam / Sir,\n\nI, ${c.me.name || BLANK}, was born on ${dmy(c.me.dob) || '____________'} and have attained majority. I hold ${folios.length > 1 ? 'folios' : 'folio'} ${folios.join(', ') || BLANK} with you, opened in my name through my guardian${c.me.guardianName ? `, ${c.me.guardianName}` : ''}.`,
    'Please change my status from minor to major in these folios, delete the guardian\'s name, and update my KYC, contact and bank details as given in the enclosed Form MAM.',
    `This request is made under ${r.source.para} of ${r.source.title}.`,
    `Enclosed:\n${enclosures(item).map((x, i) => `${i + 1}. ${x}`).join('\n')}`,
    'Kindly acknowledge receipt and confirm once the change is made.',
    `Yours faithfully,\n\n\n${c.me.name || BLANK}${c.me.mobile ? ` (${c.me.mobile})` : ''}`,
  ])
}

// Banks have no common form for this, so the app writes a letter that asks for what the rule requires and quotes it.
export function bankLetter(c: Case, item: Item, now = today()) {
  const r = route(item)
  const byGuardian = item.operated === 'guardian'
  return letter(`Letter to ${item.name}`, [
    'Account of a minor who has attained majority: fresh operating instructions',
    `To: The Branch Manager\n${item.name || BLANK}\n${item.branch || BLANK}\n\nDate: ${dmy(now)}`,
    `Dear Madam / Sir,\n\nAccount number ${item.account || BLANK} was opened in my name, ${c.me.name || BLANK}, while I was a minor${byGuardian ? `, and was operated by my guardian${c.me.guardianName ? `, ${c.me.guardianName}` : ''}` : ''}. I was born on ${dmy(c.me.dob) || '____________'} and have attained majority.`,
    `${r.source.para} of the ${r.source.title} says: "On attaining the age of majority, fresh operating instructions and specimen signature of the account holder shall be obtained and kept on record. Moreover, if the account is operated by the guardian, the balance shall be got confirmed."`,
    `I request you to:\n1. record that I will operate this account myself from now on;\n2. take my specimen signature on record;${byGuardian ? '\n3. confirm the balance in the account to me in writing as on today; and\n4.' : ' and\n3.'} update my PAN, mobile number and address in your records.`,
    'If the bank has a form of its own for this, please give it to me and I will fill it in. I am carrying my identity and address proof in original.',
    `Yours faithfully,\n\n\n${c.me.name || BLANK}${c.me.mobile ? ` (${c.me.mobile})` : ''}`,
  ])
}

export function checklistPage(item: Item) {
  return letter(`Checklist, ${item.name}`, [
    `Checklist for ${item.name || 'this request'}: keep this page`,
    enclosures(item).map((x) => `[   ]  ${x}`).join('\n\n'),
    'Sign Form MAM yourself on page 2, and have your signature attested before you send it.',
    'Ask for an acknowledgement. Until the change is made, nothing can be bought, sold or switched in the folio.',
  ])
}
