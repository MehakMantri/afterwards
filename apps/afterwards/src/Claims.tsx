import { Checklist, Countdown, Downloads, Head, Tracker, fill, inr, savePdf, slug, unprintable, type Doc } from '@afterwards/engine'
import { RouteBox } from './Accounts'
import { EARLIER, FORM_NOTES, FORMS } from './data/forms'
import { checklistPage, coverLetter, enclosures, lateLetter } from './data/letters'
import { answered, clockRuns, formsFor, overdue, pdfData, total, type Case, type Claim, type Status } from './data/model'
import { TIMELINE } from './data/rulebook'

type Props = { data: Case; set: (c: Case) => void; onRulebook: () => void }

const STATUS: Record<Status, string> = { todo: 'Not submitted', submitted: 'Submitted', query: 'Bank asked for more', paid: 'Paid' }

function ClaimCard({ data, claim, update, onRulebook }: { data: Case; claim: Claim; update: (patch: Partial<Claim>) => void; onRulebook: () => void }) {
  const forms = formsFor(data, claim)
  const base = slug(claim.bank, 'bank')
  const filled = pdfData(data, claim)

  // The order here is the order of the one-file packet: letter on top, forms, then the checklist to keep.
  const docs: Doc[] = [
    { id: 'letter', title: 'Cover letter', note: 'Lists what you are handing over and asks for a dated acknowledgement.', file: `${base}-cover-letter.pdf`, make: () => coverLetter(data, claim), ghost: true },
    ...forms.map((f) => ({
      id: f,
      title: FORMS[f].title,
      note: `${FORM_NOTES[f]} Earlier prints call it Annex ${EARLIER[f]}.`,
      file: `${base}-Annex-${f}.pdf`,
      make: () => fill(FORMS[f], filled),
    })),
    { id: 'checklist', title: 'Checklist to keep', note: 'One page to tick off at the counter.', file: `${base}-checklist.pdf`, make: () => checklistPage(data, claim), ghost: true },
  ]
  const lost = unprintable({ deceased: data.deceased, claimants: data.claimants, heirs: data.heirs, declarant: data.declarant, bank: claim.bank, branch: claim.branch })
  const items = enclosures(data, claim)
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

      <RouteBox claim={claim} onRulebook={onRulebook} />

      {forms.length > 0 && (
        <>
          <h3>Your filled forms</h3>
          <Downloads
            docs={docs}
            packetFile={`${base}-claim-packet.pdf`}
            packetTitle={`Claim packet, ${claim.bank}`}
            warning={
              lost.length > 0 && (
                <>
                  <b>Some details are not in English letters</b> and would come out blank on the forms. Go back to step 1 or 2 and retype the
                  fields marked in red.
                </>
              )
            }
          />
        </>
      )}

      {items.length > 0 && (
        <>
          <h3>Take to the branch</h3>
          <Checklist items={items} checked={claim.checked} onToggle={toggle} />
        </>
      )}

      {forms.length > 0 && (
        <>
          <h3>Track this claim</h3>
          <Tracker
            id={claim.id}
            statuses={STATUS}
            status={claim.status}
            idle="todo"
            date={claim.submittedOn}
            dateLabel="Date you handed in every document"
            onChange={(p) => update({ ...(p.status && { status: p.status }), ...(p.date !== undefined && { submittedOn: p.date }) })}
          >
            {claim.status === 'query' && (
              <div className="clock">
                The clock is paused. The {TIMELINE.days} days count from the day the bank has every document, so hand in what it asked for, set the
                new date above, and mark the claim as submitted again.
              </div>
            )}
            {clockRuns(claim) && (
              <Countdown
                startedOn={claim.submittedOn}
                days={TIMELINE.days}
                running={(left, due) => (
                  <>
                    <b>
                      {left} {left === 1 ? 'day' : 'days'} left.
                    </b>{' '}
                    The bank should settle by {due}, if it had every document on the day you submitted.
                  </>
                )}
                late={(by) => (
                  <>
                    <b>
                      {by} {by === 1 ? 'day' : 'days'} overdue.
                    </b>{' '}
                    If the delay is the bank's fault it owes interest at Bank Rate plus 4% a year ({TIMELINE.interestPara}). The letter below asks
                    for settlement and interest, and quotes the rule.
                  </>
                )}
              />
            )}
            {overdue(claim) && (
              <button className="btn small" style={{ marginTop: 12 }} onClick={async () => savePdf(await lateLetter(data, claim), `${base}-delay-letter.pdf`)}>
                Download the letter to the branch manager
              </button>
            )}
          </Tracker>
        </>
      )}
    </section>
  )
}

export function Claims({ data, set, onRulebook }: Props) {
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
              <span>
                to be claimed across {ready.length} {ready.length === 1 ? 'bank' : 'banks'}
              </span>
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
            <ClaimCard
              key={c.id}
              data={data}
              claim={c}
              onRulebook={onRulebook}
              update={(patch) => set({ ...data, claims: data.claims.map((x) => (x.id === c.id ? { ...x, ...patch } : x)) })}
            />
          ))}
        </>
      )}
    </>
  )
}
