import type { Cond, Rule } from '@afterwards/engine'

// Every rule cites the paragraph it comes from. Do not add a rule without one.
// Each source below was read at its official address on the `checked` date.
//
// Deliberately left out, because no official text could be read for them: Public Provident Fund,
// Sukanya Samriddhi and post office accounts, and PAN and Aadhaar updates. NSDL demat rules too.

// SEBI sets the rule; AMFI, the fund industry's association, supplies the procedure and the form.
const FUNDS = {
  title: 'SEBI circular SEBI/HO/IMD/DF3/CIR/P/2019/166, and AMFI Best Practices Circular 86/2020-21',
  url: 'https://www.sebi.gov.in/sebi_data/attachdocs/dec-2019/1577190160220.pdf',
  date: '2019-12-24',
  checked: '2026-11-15',
}

export const AMFI_URL =
  'https://www.amfiindia.com/Themes/Theme1/downloads/circulars/SEBI/CU116-AMFI%20BP%20cir%20No.%2086-16-Jul-2020-%20Updated%20Guidelines%20reg.%20Minors%20Account%20and%20change%20of%20status%20from%20Minor%20to%20Major.pdf'

const RBI = {
  title: 'RBI (Commercial Banks - Responsible Business Conduct) Directions, 2025',
  url: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140',
  date: '2026-10-01',
  checked: '2026-11-15',
}

const CDSL = {
  title: 'CDSL investor FAQ, "Demat CDSL Way XV: Account Opening"',
  url: 'https://www.cdslindia.com/downloads/investors/faqs/15%20demat%20cdsl%20way%20-%20xv%20-%20account%20opening%20-%202023.pdf',
  date: '2023',
  checked: '2026-11-15',
}

type YN = 'yes' | 'no'

const fund = (guardian: YN, sip: YN): Rule => ({
  id: `fund-${guardian === 'yes' ? 'guardian' : 'banker'}${sip === 'yes' ? '-sip' : ''}`,
  when: { kind: 'fund', guardian, sip },
  title: guardian === 'yes' ? 'Mutual fund: your guardian attests your signature' : 'Mutual fund: your bank attests your signature',
  explain:
    'From your 18th birthday the folio is frozen for your guardian, and nobody can buy, sell or change anything in it until it is moved into your name. You ask for that on Form MAM, giving your KYC details and your own bank account. ' +
    (guardian === 'yes'
      ? 'Your signature on the form is attested by the parent or guardian named on the folio, in the space on page 2.'
      : 'Your signature on the form must be attested. If the guardian named on the folio cannot sign, your bank manager can do it on Annexure 1, or a notary can attest the form itself.') +
    (sip === 'yes' ? ' Any SIP, STP or SWP on the folio stopped on your birthday. To carry on, give a fresh instruction along with the form.' : ''),
  forms: guardian === 'yes' ? ['MAM'] : ['MAM', 'A1'],
  documents: [
    'A copy of your PAN card',
    'Your KYC acknowledgement, or a filled KYC form',
    'A cancelled cheque with your name printed on it, or your latest bank statement or passbook',
    'A nomination form, or tick "I do not wish to make a nomination" on Form MAM',
    ...(sip === 'yes' ? ["A fresh SIP, STP or SWP instruction on the fund house's own form"] : []),
  ],
  source: { ...FUNDS, para: `SEBI paragraph 1(b)${sip === 'yes' ? ' and 1(c)' : ''}; AMFI paragraphs 3.1 to 3.5` },
})

const bank = (operated: 'guardian' | 'self'): Rule => ({
  id: `bank-${operated}`,
  when: { kind: 'bank', operated },
  title: operated === 'guardian' ? 'Bank account your guardian operated' : 'Bank account you already operate',
  explain:
    'When you turn 18 the bank must take fresh operating instructions and a new specimen signature from you and keep them on record. ' +
    (operated === 'guardian' ? 'Because your guardian operated the account, the bank must also get the balance confirmed. ' : '') +
    'The bank is meant to tell you about this in advance. There is no common form across banks, so your branch may hand you its own; the letter here asks for the change and quotes the rule.',
  forms: [],
  documents: ['Your PAN card and Aadhaar, original and a copy. The Directions leave the list of documents to each bank, so ask the branch what else it needs'],
  source: { ...RBI, para: 'Paragraph 188' },
})

export const RULEBOOK: Rule[] = [
  fund('yes', 'no'),
  fund('yes', 'yes'),
  fund('no', 'no'),
  fund('no', 'yes'),
  bank('guardian'),
  bank('self'),
  {
    id: 'demat',
    when: { kind: 'demat' },
    title: 'Demat account',
    explain:
      'There are two ways. Either the old account is closed, a new one is opened in your name and the shares are moved across. Or the old account stays: you sign the rights and obligations document with the depository participant, complete the formalities of opening an account, and your guardian\'s details are deleted. Your depository participant (the broker or bank that holds the account) decides which, and uses its own forms.',
    forms: [],
    documents: ['Ask your depository participant for its minor-to-major forms and document list'],
    lawyer: 'This comes from a CDSL investor FAQ, not from a regulation, and covers accounts held with CDSL. We found no equivalent official text for NSDL: ask your depository participant.',
    source: { ...CDSL, para: 'Question 14' },
  },
  {
    id: 'unknown',
    when: {},
    title: 'We cannot tell yet',
    explain: 'Answer the questions for this account and what to do will appear here.',
    forms: [],
    documents: [],
    source: { ...FUNDS, para: 'Not applicable' },
  },
]

// What to do before sending Form MAM. From AMFI Best Practices Circular 86/2020-21, paragraph 3.1.1.
export const ORDER = {
  steps: ['Get a PAN card in your own name', 'Complete KYC', 'Move your bank account into your own name, or open a new one, and get a cheque book with your name printed'],
  para: 'AMFI paragraph 3.1.1',
}

const SAY: Record<string, Record<string, string>> = {
  kind: { fund: 'It is a mutual fund folio opened for you as a child', bank: 'It is a bank account opened for you as a child', demat: 'It is a demat account opened for you as a child' },
  guardian: { yes: 'The parent or guardian named on the folio can sign', no: 'The parent or guardian named on the folio cannot sign' },
  sip: { yes: 'A SIP, STP or SWP was running on it', no: 'No SIP, STP or SWP was running on it' },
  operated: { guardian: 'Your guardian operated the account', self: 'You operated the account yourself' },
}

export const say = (key: string, cond: Cond) => (typeof cond === 'string' ? SAY[key]?.[cond] : undefined)
