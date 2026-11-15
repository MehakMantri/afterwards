import { Checklist, Downloads, Head, Tracker, fill, slug, unprintable, type Doc } from '@afterwards/engine'
import { RouteBox } from './Accounts'
import { FORM_NOTES, FORMS } from './data/forms'
import { bankLetter, checklistPage, coverLetter, enclosures } from './data/letters'
import { answered, pdfData, route, type Case, type Item, type Status } from './data/model'
import { ORDER } from './data/rulebook'

type Props = { data: Case; set: (c: Case) => void; onRulebook: () => void }

const STATUS: Record<Status, string> = { todo: 'Not sent', submitted: 'Sent', query: 'They asked for more', done: 'Done: it is in my name' }
const WHAT = { fund: 'Mutual fund', bank: 'Bank account', demat: 'Demat account' }

function docsFor(data: Case, item: Item): Doc[] {
  const base = slug(item.name, item.kind)
  if (item.kind === 'bank')
    return [{ id: 'letter', title: 'Letter to the branch manager', note: 'Asks for fresh operating instructions and quotes the rule. Sign it and hand it in.', file: `${base}-letter.pdf`, make: () => bankLetter(data, item) }]
  if (item.kind === 'demat') return []
  const filled = pdfData(data, item)
  return [
    { id: 'letter', title: 'Cover letter', note: 'Lists what you are sending and asks for an acknowledgement.', file: `${base}-cover-letter.pdf`, make: () => coverLetter(data, item), ghost: true },
    ...route(item).forms.map((f) => ({ id: f, title: FORMS[f].title, note: FORM_NOTES[f], file: `${base}-${f}.pdf`, make: () => fill(FORMS[f], filled) })),
    { id: 'checklist', title: 'Checklist to keep', note: 'One page to tick off before you post or hand it in.', file: `${base}-checklist.pdf`, make: () => checklistPage(item), ghost: true },
  ]
}

function ItemCard({ data, item, update, onRulebook }: { data: Case; item: Item; update: (patch: Partial<Item>) => void; onRulebook: () => void }) {
  const docs = docsFor(data, item)
  const lost = unprintable({ me: data.me, name: item.name, branch: item.branch })
  const items = enclosures(item)
  const toggle = (x: string) => update({ checked: item.checked.includes(x) ? item.checked.filter((y) => y !== x) : [...item.checked, x] })

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <span className="num">{WHAT[item.kind]}</span>
          <h2>{item.name || 'Unnamed'}</h2>
        </div>
        <span className={`status ${item.status === 'done' ? 'paid' : item.status}`}>{STATUS[item.status]}</span>
      </div>

      <RouteBox item={item} onRulebook={onRulebook} />

      {docs.length > 0 && (
        <>
          <h3>Your papers</h3>
          <Downloads
            docs={docs}
            packetFile={`${slug(item.name, item.kind)}-packet.pdf`}
            packetTitle={`Minor to major, ${item.name}`}
            warning={
              lost.length > 0 && (
                <>
                  <b>Some details are not in English letters</b> and would come out blank. Go back and retype the fields marked in red.
                </>
              )
            }
          />
        </>
      )}

      <h3>{item.kind === 'fund' ? 'Send to the fund house' : 'Take with you'}</h3>
      <Checklist items={items} checked={item.checked} onToggle={toggle} />

      <h3>Track it</h3>
      <Tracker
        id={item.id}
        statuses={STATUS}
        status={item.status}
        idle="todo"
        date={item.submittedOn}
        dateLabel="Date you sent or handed it in"
        onChange={(p) => update({ ...(p.status && { status: p.status }), ...(p.date !== undefined && { submittedOn: p.date }) })}
      />
    </section>
  )
}

export function Papers({ data, set, onRulebook }: Props) {
  const ready = data.items.filter(answered)
  const funds = ready.some((i) => i.kind === 'fund')

  return (
    <>
      <Head title="Your paperwork.">
        Download each form, check it, then print and sign. The forms are the official ones with your details written in; anything left blank is
        for you to complete by hand.
      </Head>

      {ready.length === 0 ? (
        <div className="note">No account has its questions answered yet. Go back to step 1 to finish at least one.</div>
      ) : (
        <>
          <div className="summary">
            <div className="sum">
              <strong>{ready.length}</strong>
              <span>{ready.length === 1 ? 'account' : 'accounts'} to move into your name</span>
            </div>
            <div className="sum">
              <strong>{ready.filter((i) => i.status === 'submitted' || i.status === 'query').length}</strong>
              <span>sent, waiting</span>
            </div>
            <div className="sum">
              <strong>{ready.filter((i) => i.status === 'done').length}</strong>
              <span>done</span>
            </div>
          </div>
          {funds && (
            <div className="note">
              <b>Before you send a mutual fund form, in this order:</b>
              <ol className="plain" style={{ marginTop: 8 }}>
                {ORDER.steps.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <span style={{ fontSize: 13 }}>Source: {ORDER.para}.</span>
            </div>
          )}
          {!data.me.name.trim() && <div className="note">The forms will be mostly blank until you fill in step 2.</div>}
          {ready.map((i) => (
            <ItemCard
              key={i.id}
              data={data}
              item={i}
              onRulebook={onRulebook}
              update={(patch) => set({ ...data, items: data.items.map((x) => (x.id === i.id ? { ...x, ...patch } : x)) })}
            />
          ))}
        </>
      )}
    </>
  )
}
