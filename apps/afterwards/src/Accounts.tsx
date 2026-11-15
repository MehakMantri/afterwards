import { Cell, Choice, Head, RuleCard, Text, YESNO, inr } from '@afterwards/engine'
import { formName } from './data/forms'
import { answered, newAccount, newClaim, route, total, type Case, type Claim } from './data/model'
import { THRESHOLD } from './data/rulebook'

type Props = { data: Case; set: (c: Case) => void; onRulebook: () => void }

export function RouteBox({ claim, onRulebook }: { claim: Claim; onRulebook?: () => void }) {
  if (!answered(claim))
    return (
      <div className="route idle" aria-live="polite">
        Answer the questions above, and add at least one amount, to see what this bank must accept.
      </div>
    )
  const r = route(claim)
  return <RuleCard rule={r} formName={formName} tone={r.id === 'dispute' ? 'stop' : undefined} onRulebook={onRulebook} />
}

export function Accounts({ data, set, onRulebook }: Props) {
  const update = (id: string, patch: Partial<Claim>) => set({ ...data, claims: data.claims.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  return (
    <>
      <Head title="Where did they bank?">
        Add each bank once. If you are unsure of an amount, a passbook or a recent statement is enough; a rough figure still shows the right route.
      </Head>

      {data.claims.map((c, n) => (
        <section className="card" key={c.id}>
          <div className="card-head">
            <div>
              <span className="num">Bank {n + 1}</span>
              <h2>{c.bank || 'New bank'}</h2>
              {total(c) > 0 && <p className="sub">{inr(total(c))} in total</p>}
            </div>
            {data.claims.length > 1 && (
              <button className="link" onClick={() => set({ ...data, claims: data.claims.filter((x) => x.id !== c.id) })}>
                Remove
              </button>
            )}
          </div>

          <div className="grid">
            <Text label="Bank name" value={c.bank} onChange={(bank) => update(c.id, { bank })} placeholder="State Bank of India" />
            <Text label="Branch" value={c.branch} onChange={(branch) => update(c.id, { branch })} placeholder="Where the account is held" />
            <Choice
              label="What kind of bank is it?"
              value={c.kind}
              onChange={(kind) => update(c.id, { kind })}
              options={[
                { v: 'bank', l: 'A regular bank' },
                { v: 'coop', l: 'A co-operative bank' },
              ]}
              hint={`The limit for claims without a nominee is ${inr(THRESHOLD.bank)} (15 lakh) at regular banks and ${inr(THRESHOLD.coop)} (5 lakh) at co-operative banks, which are smaller, member-owned banks.`}
            />
            <Choice
              label="Is there a nominee, or is it a joint account that passes to the survivor?"
              value={c.nominee}
              onChange={(nominee) => update(c.id, { nominee })}
              options={YESNO}
              hint="A nominee is the person the account holder named to receive the money. The passbook, the account opening form or the branch can tell you."
            />
            {c.nominee === 'no' && (
              <Choice label="Did they leave a Will?" value={c.will} onChange={(will) => update(c.id, { will })} options={YESNO} />
            )}
            <Choice
              label="Is anyone in the family disputing who should get this money?"
              value={c.dispute}
              onChange={(dispute) => update(c.id, { dispute })}
              options={YESNO}
            />
          </div>

          <h3>Accounts at this bank</h3>
          <div className="table">
            <div className="trow thead">
              <span className="th">Type</span>
              <span className="th">Account number</span>
              <span className="th">Amount (₹)</span>
              <span className="th">Maturity date, if a deposit</span>
              <span />
            </div>
            {c.accounts.map((a, i) => {
              const edit = (patch: Partial<typeof a>) => update(c.id, { accounts: c.accounts.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
              return (
                <div className="trow" key={i}>
                  <select aria-label="Type" value={a.nature} onChange={(e) => edit({ nature: e.target.value })}>
                    <option value="SB">Savings</option>
                    <option value="CA">Current</option>
                    <option value="TD">Fixed deposit</option>
                    <option value="RD">Recurring deposit</option>
                  </select>
                  <Cell label="Account number" value={a.number} onChange={(number) => edit({ number })} inputMode="numeric" />
                  <Cell label="Amount (₹)" value={a.amount} onChange={(amount) => edit({ amount: amount.replace(/[^\d]/g, '') })} inputMode="numeric" />
                  <Cell label="Maturity date" type="date" value={a.maturity} onChange={(maturity) => edit({ maturity })} />
                  {c.accounts.length > 1 ? (
                    <button className="x" aria-label="Remove this account" onClick={() => update(c.id, { accounts: c.accounts.filter((_, j) => j !== i) })}>
                      ×
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              )
            })}
            {c.accounts.length < 4 && (
              <button className="add" onClick={() => update(c.id, { accounts: [...c.accounts, newAccount()] })}>
                + Another account at this bank
              </button>
            )}
          </div>

          <RouteBox claim={c} onRulebook={onRulebook} />
        </section>
      ))}

      <button className="add big" onClick={() => set({ ...data, claims: [...data.claims, newClaim()] })}>
        + Add another bank
      </button>
    </>
  )
}
