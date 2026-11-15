import { useState, type ReactNode } from 'react'
import { addDays, deadline } from './clock'
import { dmy } from './format'
import { fillForm, merge, type FormDef } from './pdf'
import type { Cond, Rule } from './rules'
import { Head } from './ui'

// Screens every app shares. All wording that names a real-world institution comes in as props.

// ---------- a rule, shown to the person it applies to ----------

export function Source({ rule }: { rule: Rule }) {
  return (
    <p className="src">
      Source: {rule.source.para},{' '}
      <a href={rule.source.url} target="_blank" rel="noreferrer">
        {rule.source.title}
      </a>
      . Checked {dmy(rule.source.checked)}.
    </p>
  )
}

type RuleCardProps = { rule: Rule; formName: (id: string) => string; tone?: '' | 'warn' | 'stop'; onRulebook?: () => void }

export function RuleCard({ rule, formName, tone, onRulebook }: RuleCardProps) {
  return (
    <div className={`route ${tone ?? (rule.lawyer ? 'warn' : '')}`} aria-live="polite">
      <div className="route-top">
        <h4>{rule.title}</h4>
        <div className="chips">
          {rule.forms.map((f) => (
            <span className="chip" key={f}>
              {formName(f)}
            </span>
          ))}
        </div>
      </div>
      <p>{rule.explain}</p>
      {rule.lawyer && <p className="lawyer">{rule.lawyer}</p>}
      <Source rule={rule} />
      {onRulebook && (
        <button className="link" style={{ padding: 0, marginTop: 6 }} onClick={onRulebook}>
          See every rule
        </button>
      )}
    </div>
  )
}

// ---------- the whole rulebook, in the open ----------

// One plain sentence per condition of a rule. `say` belongs to the app; a key it cannot word is shown raw, never hidden.
export function conditions(rule: Rule, say: (key: string, cond: Cond) => string | undefined): string[] {
  return Object.entries(rule.when).map(([k, c]) => say(k, c) ?? `${k}: ${JSON.stringify(c)}`)
}

type RulebookProps = {
  title: string
  intro: ReactNode
  rules: Rule[]
  say: (key: string, cond: Cond) => string | undefined
  formName: (id: string) => string
  children?: ReactNode
}

export function Rulebook({ title, intro, rules, say, formName, children }: RulebookProps) {
  // A rule with no conditions is the "not enough answers yet" fallback, not a rule about the world.
  const real = rules.filter((r) => Object.keys(r.when).length > 0)
  return (
    <>
      <Head title={title}>{intro}</Head>
      {real.map((r, i) => (
        <section className="card" key={r.id} id={`rule-${r.id}`}>
          <span className="num">
            Rule {i + 1} of {real.length}
          </span>
          <h2>{r.title}</h2>
          <h3>When</h3>
          <ul className="plain">
            {conditions(r, say).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <h3>What happens</h3>
          <p>{r.explain}</p>
          {r.lawyer && <p className="lawyer">{r.lawyer}</p>}
          {r.forms.length > 0 && (
            <>
              <h3>Forms</h3>
              <div className="chips">
                {r.forms.map((f) => (
                  <span className="chip" key={f}>
                    {formName(f)}
                  </span>
                ))}
              </div>
            </>
          )}
          {r.documents.length > 0 && (
            <>
              <h3>Documents</h3>
              <ul className="plain">
                {r.documents.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </>
          )}
          <Source rule={r} />
        </section>
      ))}
      {children}
    </>
  )
}

// ---------- filled forms and letters to download ----------

export type Doc = { id: string; title: string; note: string; file: string; make: () => Promise<Uint8Array>; ghost?: boolean }

const templates = new Map<string, Promise<ArrayBuffer>>()
function loadTemplate(path: string) {
  const url = import.meta.env.BASE_URL + path
  if (!templates.has(url))
    templates.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error('The official form could not be loaded. Check your connection and try again.')
        return r.arrayBuffer()
      }),
    )
  return templates.get(url)!
}

export const fill = async (form: FormDef, data: unknown) => fillForm(await loadTemplate(form.template), form, data)

export function savePdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export const slug = (s: string, fallback = 'file') => s.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || fallback

// The order of a packet is the order of `docs`.
export const packet = async (docs: Doc[], title: string) => merge(await Promise.all(docs.map((d) => d.make())), title)

type DownloadsProps = { docs: Doc[]; packetFile: string; packetTitle: string; warning?: ReactNode }

export function Downloads({ docs, packetFile, packetTitle, warning }: DownloadsProps) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
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
  return (
    <>
      {warning && (
        <div className="note" role="alert">
          {warning}
        </div>
      )}
      <div className="docs">
        {docs.length > 1 && (
          <div className="doc all">
            <span className="ico">PDF</span>
            <div>
              <b>Everything in one file</b>
              <span>All {docs.length} papers below, in the order to hand them over. Print once.</span>
            </div>
            <button className="btn small" disabled={busy !== ''} onClick={() => run('all', async () => savePdf(await packet(docs, packetTitle), packetFile))}>
              {busy === 'all' ? 'Preparing…' : 'Download all'}
            </button>
          </div>
        )}
        {docs.map((d) => (
          <div className="doc" key={d.id}>
            <span className="ico">PDF</span>
            <div>
              <b>{d.title}</b>
              <span>{d.note}</span>
            </div>
            <button className={`btn small ${d.ghost ? 'ghost' : ''}`} disabled={busy !== ''} onClick={() => run(d.id, async () => savePdf(await d.make(), d.file))}>
              {busy === d.id ? 'Preparing…' : 'Download'}
            </button>
          </div>
        ))}
      </div>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

// ---------- what to carry ----------

export function Checklist({ items, checked, onToggle }: { items: string[]; checked: string[]; onToggle: (item: string) => void }) {
  return (
    <ul className="check">
      {items.map((item) => (
        <li key={item}>
          <label>
            <input type="checkbox" checked={checked.includes(item)} onChange={() => onToggle(item)} />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

// ---------- where it stands ----------

type TrackerProps<S extends string> = {
  id: string
  statuses: Record<S, string>
  status: S
  // The status that means "nothing handed in yet": no date is asked for.
  idle: S
  date: string
  dateLabel: string
  onChange: (patch: { status?: S; date?: string }) => void
  children?: ReactNode
}

export function Tracker<S extends string>({ id, statuses, status, idle, date, dateLabel, onChange, children }: TrackerProps<S>) {
  return (
    <>
      <div className="grid">
        <div className="f">
          <label htmlFor={`st-${id}`}>Where it stands</label>
          <select id={`st-${id}`} value={status} onChange={(e) => onChange({ status: e.target.value as S })}>
            {Object.entries<string>(statuses).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {status !== idle && (
          <div className="f">
            <label htmlFor={`on-${id}`}>{dateLabel}</label>
            <input id={`on-${id}`} type="date" value={date} onChange={(e) => onChange({ date: e.target.value })} />
          </div>
        )}
      </div>
      {children}
    </>
  )
}

// A countdown to a deadline counted in calendar days. The app words both states.
type CountdownProps = {
  startedOn: string
  days: number
  now?: string
  running: (left: number, due: string) => ReactNode
  late: (overdueBy: number, due: string) => ReactNode
}

export function Countdown({ startedOn, days, now, running, late }: CountdownProps) {
  if (!startedOn) return null
  const d = deadline(startedOn, days, now)
  const due = dmy(addDays(startedOn, days))
  return <div className={`clock ${d.late ? 'late' : ''}`}>{d.late ? late(d.overdueBy, due) : running(d.left, due)}</div>
}
