import { useState } from 'react'
import { dmy, fillForm, inr, letter } from '@afterwards/engine'
import { RouteBox } from './Accounts'
import { FORM_NOTES, FORMS, TEMPLATE } from './data/forms'
import { answered, formsFor, pdfData, route, total, type Case, type Claim, type Status } from './data/model'
import { TIMELINE } from './data/rulebook'
import { Head } from './ui'

type Props = { data: Case; set: (c: Case) => void }

const STATUS: Record<Status, string> = { todo: 'Not submitted', submitted: 'Submitted', query: 'Bank asked for more', paid: 'Paid' }

let template: Promise<ArrayBuffer> | undefined
const loadTemplate = () =>
  (template ??= fetch(import.meta.env.BASE_URL + TEMPLATE).then((r) => {
    if (!r.ok) throw new Error('The official form could not be loaded.')
    return r.arrayBuffer()
  }))

function save(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

const slug = (s: string) => s.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'bank'

function coverLetter(data: Case, claim: Claim) {
  const r = route(claim)
  const forms = formsFor(data, claim)
  const who = data.claimants.filter((p) => p.name.trim())
  return letter(`Cover letter, ${claim.bank}`, [
    'Claim for settlement of the accounts of a deceased customer',
    `To: The Branch Manager\n${claim.bank || '________________'}\n${claim.branch || '________________'}\n\nDate: ${dmy(new Date().toISOString())}`,
    `Dear Madam / Sir,\n\nI am / We are submitting a claim for the deposit accounts held in the name of the late ${data.deceased.name || '________________'}, who died on ${dmy(data.deceased.deathDate) || '____________'}. The total standing in these accounts is about ${inr(total(claim))}.`,
    `This claim is made under ${r.source.para} of the ${r.source.title}.`,
    `Enclosed:\n${[...forms.map((f) => FORMS[f].title), ...r.documents].map((x, i) => `${i + 1}. ${x}`).join('\n')}`,
    `Under ${TIMELINE.para} of the same Directions, the claim is to be settled within ${TIMELINE.days} calendar days of the bank receiving all required documents. Kindly give a dated acknowledgement of this submission.`,
    `Yours faithfully,\n\n\n${who.map((p) => `${p.name}${p.mobile ? ` (${p.mobile})` : ''}`).join('\n\n\n') || '________________'}`,
  ])
}

function Clock({ claim }: { claim: Claim }) {
  if (claim.status === 'todo' || claim.status === 'paid' || !claim.submittedOn) return null
  const due = new Date(claim.submittedOn)
  due.setDate(due.getDate() + TIMELINE.days)
  const left = Math.ceil((due.getTime() - Date.now()) / 86400000)
  return (
    <div className={`clock ${left < 0 ? 'late' : ''}`}>
      {left >= 0 ? (
        <>
          <b>{left} {left === 1 ? 'day' : 'days'} left.</b> The bank should settle by {dmy(due.toISOString())}, if it had every document on the day you
          submitted.
        </>
      ) : (
        <>
          <b>{-left} {left === -1 ? 'day' : 'days'} overdue.</b> If the delay is the bank's fault it owes interest at Bank Rate plus 4% a year. Write to
          the branch manager and quote {TIMELINE.para}.
        </>
      )}
    </div>
  )
}

function ClaimCard({ data, claim, update }: { data: Case; claim: Claim; update: (patch: Partial<Claim>) => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const r = route(claim)
  const forms = formsFor(data, claim)
  const base = slug(claim.bank)

  const run = async (key: string, job: () => Promise<void>) => {
    setBusy(key)
    setError('')
    try {
      await job()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong making the PDF.')
    }
    setBusy('')
  }
  const download = (id: string) =>
    run(id, async () => save(await fillForm(await loadTemplate(), FORMS[id], pdfData(data, claim)), `${base}-Annex-${id}.pdf`))

  const checklist = [...forms.map((f) => `Annex ${f}, printed and signed`), ...r.documents]
  const toggle = (item: string) => update({ checked: claim.checked.includes(item) ? claim.checked.filter((x) => x !== item) : [...claim.checked, item] })

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>{claim.bank || 'Unnamed bank'}</h2>
          <p className="sub">
            {claim.branch && `${claim.branch} · `}
            {inr(total(claim))}
          </p>
        </div>
        <span className={`status ${claim.status}`}>{STATUS[claim.status]}</span>
      </div>

      <RouteBox claim={claim} />

      {forms.length > 0 && (
        <>
          <h3>Your filled forms</h3>
          <div className="docs">
            {forms.map((f) => (
              <div className="doc" key={f}>
                <span className="ico">PDF</span>
                <div>
                  <b>{FORMS[f].title}</b>
                  <span>{FORM_NOTES[f]}</span>
                </div>
                <button className="btn small" disabled={busy !== ''} onClick={() => download(f)}>
                  {busy === f ? 'Preparing…' : 'Download'}
                </button>
              </div>
            ))}
            <div className="doc">
              <span className="ico">PDF</span>
              <div>
                <b>Cover letter</b>
                <span>Lists what you are handing over and asks for a dated acknowledgement.</span>
              </div>
              <button className="btn small ghost" disabled={busy !== ''} onClick={() => run('letter', async () => save(await coverLetter(data, claim), `${base}-cover-letter.pdf`))}>
                {busy === 'letter' ? 'Preparing…' : 'Download'}
              </button>
            </div>
          </div>
          {error && <p className="err" role="alert">{error}</p>}
        </>
      )}

      {checklist.length > 0 && (
        <>
          <h3>Take to the branch</h3>
          <ul className="check">
            {checklist.map((item) => (
              <li key={item}>
                <label>
                  <input type="checkbox" checked={claim.checked.includes(item)} onChange={() => toggle(item)} />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {forms.length > 0 && (
        <>
          <h3>Track this claim</h3>
          <div className="grid">
            <div className="f">
              <label htmlFor={`st-${claim.id}`}>Where it stands</label>
              <select id={`st-${claim.id}`} value={claim.status} onChange={(e) => update({ status: e.target.value as Status })}>
                {Object.entries(STATUS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {claim.status !== 'todo' && (
              <div className="f">
                <label htmlFor={`on-${claim.id}`}>Date you handed in every document</label>
                <input id={`on-${claim.id}`} type="date" value={claim.submittedOn} onChange={(e) => update({ submittedOn: e.target.value })} />
              </div>
            )}
          </div>
          <Clock claim={claim} />
        </>
      )}
    </section>
  )
}

export function Claims({ data, set }: Props) {
  const ready = data.claims.filter(answered)
  const paid = ready.filter((c) => c.status === 'paid')
  const sum = (list: Claim[]) => list.reduce((s, c) => s + total(c), 0)

  return (
    <>
      <Head title="Your claims.">
        Download each form, check it, then print and sign. The forms are the official RBI ones with your details written in; anything left blank is
        for you to complete by hand.
      </Head>

      {ready.length === 0 ? (
        <div className="note">No bank has all its questions answered yet. Go back to step 1 to finish at least one.</div>
      ) : (
        <>
          <div className="summary">
            <div className="sum">
              <strong>{inr(sum(ready))}</strong>
              <span>to be claimed across {ready.length} {ready.length === 1 ? 'bank' : 'banks'}</span>
            </div>
            <div className="sum">
              <strong>{ready.filter((c) => c.status === 'submitted' || c.status === 'query').length}</strong>
              <span>with the bank now</span>
            </div>
            <div className="sum">
              <strong>{inr(sum(paid))}</strong>
              <span>paid so far</span>
            </div>
          </div>
          {!data.deceased.name.trim() && <div className="note">The forms will be mostly blank until you fill in step 2.</div>}
          {ready.map((c) => (
            <ClaimCard key={c.id} data={data} claim={c} update={(patch) => set({ ...data, claims: data.claims.map((x) => (x.id === c.id ? { ...x, ...patch } : x)) })} />
          ))}
        </>
      )}
    </>
  )
}
