import { Choice, Head, RuleCard, Text, YESNO } from '@afterwards/engine'
import { formName } from './data/forms'
import { answered, newItem, route, type Case, type Item, type Kind } from './data/model'

type Props = { data: Case; set: (c: Case) => void; onRulebook: () => void }

const KINDS: { v: Kind; l: string }[] = [
  { v: 'fund', l: 'Mutual fund' },
  { v: 'bank', l: 'Bank account' },
  { v: 'demat', l: 'Demat account' },
]
const NAME: Record<Kind, { label: string; hint: string; fresh: string }> = {
  fund: { label: 'Fund house', hint: 'Just the name, without "Mutual Fund". One entry per fund house.', fresh: 'New mutual fund' },
  bank: { label: 'Bank name', hint: '', fresh: 'New bank account' },
  demat: { label: 'Broker or bank that holds the demat account', hint: '', fresh: 'New demat account' },
}

export function RouteBox({ item, onRulebook }: { item: Item; onRulebook?: () => void }) {
  if (!answered(item))
    return (
      <div className="route idle" aria-live="polite">
        Answer the questions above to see what this needs.
      </div>
    )
  return <RuleCard rule={route(item)} formName={formName} onRulebook={onRulebook} />
}

export function Accounts({ data, set, onRulebook }: Props) {
  const update = (id: string, patch: Partial<Item>) => set({ ...data, items: data.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })

  return (
    <>
      <Head title="What was opened in your name?">
        Add each fund house, bank or demat account that a parent or guardian opened for you while you were under 18. Statements, the fund's
        emails or your parents can tell you.
      </Head>

      {data.items.map((i, n) => (
        <section className="card" key={i.id}>
          <div className="card-head">
            <div>
              <span className="num">Account {n + 1}</span>
              <h2>{i.name || NAME[i.kind].fresh}</h2>
            </div>
            {data.items.length > 1 && (
              <button className="link" onClick={() => set({ ...data, items: data.items.filter((x) => x.id !== i.id) })}>
                Remove
              </button>
            )}
          </div>

          <div className="grid">
            <Choice label="What is it?" value={i.kind} onChange={(kind) => update(i.id, { kind })} options={KINDS} />
            <Text label={NAME[i.kind].label} value={i.name} onChange={(name) => update(i.id, { name })} hint={NAME[i.kind].hint} w={i.kind === 'bank' ? 3 : 6} />

            {i.kind === 'fund' && (
              <>
                {i.folios.map((f, k) => (
                  <Text
                    key={k}
                    label={`Folio number ${k + 1}`}
                    value={f}
                    onChange={(v) => update(i.id, { folios: i.folios.map((x, j) => (j === k ? v : x)) })}
                    w={2}
                    hint={k === 0 ? 'Your account number with this fund house.' : undefined}
                  />
                ))}
                {i.folios.length < 9 && (
                  <div className="f w6">
                    <button className="add" onClick={() => update(i.id, { folios: [...i.folios, ''] })}>
                      + Another folio at this fund house
                    </button>
                  </div>
                )}
                <Choice
                  label="Can the parent or guardian named on the folio sign your form?"
                  value={i.guardian}
                  onChange={(guardian) => update(i.id, { guardian })}
                  options={YESNO}
                  hint="Your signature has to be attested. If they cannot, your bank manager or a notary can do it."
                />
                <Choice
                  label="Was a monthly SIP, STP or SWP running on it?"
                  value={i.sip}
                  onChange={(sip) => update(i.id, { sip })}
                  options={YESNO}
                  hint="A standing instruction to invest, switch or withdraw every month."
                />
              </>
            )}

            {i.kind === 'bank' && (
              <>
                <Text label="Branch" value={i.branch} onChange={(branch) => update(i.id, { branch })} />
                <Text label="Account number" value={i.account} onChange={(account) => update(i.id, { account })} inputMode="numeric" />
                <Choice
                  label="Who has been operating the account?"
                  value={i.operated}
                  onChange={(operated) => update(i.id, { operated })}
                  options={[
                    { v: 'guardian', l: 'My parent or guardian' },
                    { v: 'self', l: 'I have' },
                  ]}
                  hint="If you are not sure, ask the branch."
                />
              </>
            )}
          </div>

          <RouteBox item={i} onRulebook={onRulebook} />
        </section>
      ))}

      <button className="add big" onClick={() => set({ ...data, items: [...data.items, newItem()] })}>
        + Add another account
      </button>
    </>
  )
}
