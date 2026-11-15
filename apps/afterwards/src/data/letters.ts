import { deadline, dmy, inr, letter, today } from '@afterwards/engine'
import { FORMS } from './forms'
import { formsFor, route, total, type Case, type Claim } from './model'
import { TIMELINE } from './rulebook'

const BLANK = '________________'
const to = (claim: Claim) => `To: The Branch Manager\n${claim.bank || BLANK}\n${claim.branch || BLANK}`
const signers = (data: Case) =>
  data.claimants
    .filter((p) => p.name.trim())
    .map((p) => `${p.name}${p.mobile ? ` (${p.mobile})` : ''}`)
    .join('\n\n\n') || BLANK

// What goes to the branch: forms first, then supporting documents. The cover letter and the checklist list the same things.
export function enclosures(data: Case, claim: Claim): string[] {
  return [...formsFor(data, claim).map((f) => `${FORMS[f].title}, signed`), ...route(claim).documents]
}

export function coverLetter(data: Case, claim: Claim, now = today()) {
  const r = route(claim)
  return letter(`Cover letter, ${claim.bank}`, [
    'Claim for settlement of the accounts of a deceased customer',
    `${to(claim)}\n\nDate: ${dmy(now)}`,
    `Dear Madam / Sir,\n\nI am / We are submitting a claim for the deposit accounts held in the name of the late ${data.deceased.name || BLANK}, who died on ${dmy(data.deceased.deathDate) || '____________'}. The total standing in these accounts is about ${inr(total(claim))}.`,
    `This claim is made under ${r.source.para} of the ${r.source.title}.`,
    `Enclosed:\n${enclosures(data, claim).map((x, i) => `${i + 1}. ${x}`).join('\n')}`,
    `Under ${TIMELINE.para} of the ${TIMELINE.source.title}, the claim is to be settled within ${TIMELINE.days} calendar days of the bank receiving all required documents. Kindly give a dated acknowledgement of this submission.`,
    `Yours faithfully,\n\n\n${signers(data)}`,
  ])
}

// A page to tick off at the counter. It goes last in the packet and stays with the family.
export function checklistPage(data: Case, claim: Claim) {
  return letter(`Checklist, ${claim.bank}`, [
    `Checklist for ${claim.bank || 'the bank'}: keep this page`,
    enclosures(data, claim).map((x) => `[   ]  ${x}`).join('\n\n'),
    `Ask for a dated acknowledgement when you hand these in. The bank has ${TIMELINE.days} calendar days from the day it has every document.`,
    'Carry the originals of the death certificate and your identity proof. The branch checks them and hands them back.',
  ])
}

// The letter for a bank that has let the deadline pass. Every figure and quotation comes from the rulebook.
export function lateLetter(data: Case, claim: Claim, now = today()) {
  const d = deadline(claim.submittedOn, TIMELINE.days, now)
  return letter(`Delay in settlement, ${claim.bank}`, [
    'Delay in settling a deceased customer claim: request for settlement with interest',
    `${to(claim)}\n\nDate: ${dmy(now)}`,
    `Dear Madam / Sir,\n\nOn ${dmy(claim.submittedOn)} I / we submitted every document required for the claim on the deposit accounts of the late ${data.deceased.name || BLANK} at your branch, for about ${inr(total(claim))}. ${d.elapsed} calendar days have passed. The claim was due to be settled by ${dmy(d.due)} and has not been.`,
    `The ${TIMELINE.source.title}, ${TIMELINE.deadlinePara}, say: "${TIMELINE.deadlineQuote}"`,
    `The same Directions, ${TIMELINE.interestPara}, require the bank to tell the claimant the reasons for any delay, and say: "${TIMELINE.interestQuote}"`,
    `I / We request that you:\n1. settle the claim without further delay;\n2. tell me / us in writing the reasons for the delay; and\n3. pay interest for the period of delay as the Directions require, if the delay is attributable to the bank.`,
    'If I / we do not hear from you within seven days, I / we will take this to your bank\'s grievance redressal officer and, after that, to the Reserve Bank of India Ombudsman.',
    `Yours faithfully,\n\n\n${signers(data)}`,
  ])
}
