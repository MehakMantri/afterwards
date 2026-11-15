import { answered, formsFor, newClaimant, type Case, type Claimant } from './data/model'
import { Cell, Choice, Head, Text } from '@afterwards/engine'

type Props = { data: Case; set: (c: Case) => void }

export function People({ data, set }: Props) {
  const d = data.deceased
  const dec = (patch: Partial<Case['deceased']>) => set({ ...data, deceased: { ...d, ...patch } })
  const person = (i: number, patch: Partial<Claimant>) => set({ ...data, claimants: data.claimants.map((p, j) => (j === i ? { ...p, ...patch } : p)) })

  // Only ask for what the chosen routes actually need.
  const needed = new Set(data.claims.filter(answered).flatMap((c) => formsFor({ ...data, heirs: [{ name: 'x', relation: '', age: '' }] }, c)))
  const heirRoute = needed.has('VI')
  const needsDeclarant = needed.has('IX')

  return (
    <>
      <Head title="The details, entered once.">
        Everything here is copied onto every form that needs it. Leave a box empty if you do not know it yet; it stays blank on the form for you to
        write in by hand.
      </Head>

      <section className="card">
        <span className="num">The person who died</span>
        <h2 style={{ marginBottom: 18 }}>{d.name || 'Their details'}</h2>
        <div className="grid">
          <Text label="Full name, as on the bank account" value={d.name} onChange={(name) => dec({ name })} w={4} />
          <Text label="Age at death" value={d.age} onChange={(age) => dec({ age })} w={2} inputMode="numeric" />
          <Text label="Date of death" type="date" value={d.deathDate} onChange={(deathDate) => dec({ deathDate })} />
          <Text label="Place of death" value={d.deathPlace} onChange={(deathPlace) => dec({ deathPlace })} />
          <Text label="Death certificate number" value={d.certNo} onChange={(certNo) => dec({ certNo })} w={2} />
          <Text label="Certificate date" type="date" value={d.certDate} onChange={(certDate) => dec({ certDate })} w={2} />
          <Text label="Issued by" value={d.certAuthority} onChange={(certAuthority) => dec({ certAuthority })} w={2} placeholder="Municipal corporation" />
          <Choice
            label="Marital status at death"
            value={d.marital}
            onChange={(marital) => dec({ marital })}
            options={[
              { v: 'Married', l: 'Married' },
              { v: 'Unmarried', l: 'Unmarried' },
              { v: 'Widow(er)', l: 'Widow or widower' },
            ]}
          />
          <Text label="Address" value={d.address} onChange={(address) => dec({ address })} w={6} />
          <Text label="City or district" value={d.city} onChange={(city) => dec({ city })} w={2} />
          <Text label="PIN" value={d.pin} onChange={(pin) => dec({ pin })} w={2} inputMode="numeric" />
          <Text label="State" value={d.state} onChange={(state) => dec({ state })} w={2} />
          {heirRoute && (
            <>
              <Text label="Religion" value={d.religion} onChange={(religion) => dec({ religion })} hint="The form for legal heirs asks for this." />
              <Text label="Succession law that applies" value={d.law} onChange={(law) => dec({ law })} placeholder="Hindu, Mohammedan, Indian Succession Act…" hint="Unsure? Leave it empty and ask the branch." />
            </>
          )}
        </div>
      </section>

      <section className="card">
        <span className="num">Who is claiming</span>
        <h2>{heirRoute ? 'The nominee, or the heirs who will receive the money' : 'The nominee or surviving joint holder'}</h2>
        <p className="sub" style={{ marginBottom: 18 }}>Up to four people. The money is paid into the account you give for each.</p>
        {data.claimants.map((p, i) => (
          <div key={i}>
            {i > 0 && <h3>Claimant {i + 1}</h3>}
            <div className="grid">
              <Text label="Full name" value={p.name} onChange={(name) => person(i, { name })} />
              <Text label="Relationship to the person who died" value={p.relation} onChange={(relation) => person(i, { relation })} w={2} placeholder="Wife, son…" />
              <Text label="Age" value={p.age} onChange={(age) => person(i, { age })} w={2} inputMode="numeric" />
              <Text label="Address" value={p.address} onChange={(address) => person(i, { address })} w={6} />
              <Text label="Mobile number" value={p.mobile} onChange={(mobile) => person(i, { mobile })} inputMode="tel" />
              <Text label="Email" value={p.email} onChange={(email) => person(i, { email })} inputMode="email" />
              <Text label="Pay into: bank name" value={p.payBank} onChange={(payBank) => person(i, { payBank })} />
              <Text label="Account number" value={p.payAccount} onChange={(payAccount) => person(i, { payAccount })} inputMode="numeric" />
              <Text label="IFSC" value={p.payIfsc} onChange={(payIfsc) => person(i, { payIfsc: payIfsc.toUpperCase() })} />
              <Text label="Branch" value={p.payBranch} onChange={(payBranch) => person(i, { payBranch })} />
            </div>
            {data.claimants.length > 1 && (
              <button className="link" style={{ marginTop: 8 }} onClick={() => set({ ...data, claimants: data.claimants.filter((_, j) => j !== i) })}>
                Remove claimant {i + 1}
              </button>
            )}
          </div>
        ))}
        {data.claimants.length < 4 && (
          <button className="add" style={{ marginTop: 18 }} onClick={() => set({ ...data, claimants: [...data.claimants, newClaimant()] })}>
            + Another claimant
          </button>
        )}
      </section>

      {heirRoute && (
        <section className="card">
          <span className="num">Other legal heirs</span>
          <h2>Heirs who are not claiming</h2>
          <p className="sub" style={{ marginBottom: 18 }}>
            Children, a spouse or parents who agree to let the claimants receive the money. Each signs the no-objection letter (Annex VIII).
          </p>
          <div className="table">
            {data.heirs.length > 0 && (
              <div className="trow heirs thead">
                <span className="th">Full name</span>
                <span className="th">Relationship</span>
                <span className="th">Age</span>
                <span />
              </div>
            )}
            {data.heirs.map((h, i) => {
              const edit = (patch: Partial<typeof h>) => set({ ...data, heirs: data.heirs.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
              return (
                <div className="trow heirs" key={i}>
                  <Cell label="Full name" value={h.name} onChange={(name) => edit({ name })} />
                  <Cell label="Relationship" value={h.relation} onChange={(relation) => edit({ relation })} />
                  <Cell label="Age" value={h.age} onChange={(age) => edit({ age })} inputMode="numeric" />
                  <button className="x" aria-label="Remove this heir" onClick={() => set({ ...data, heirs: data.heirs.filter((_, j) => j !== i) })}>
                    ×
                  </button>
                </div>
              )
            })}
            {data.claimants.length + data.heirs.length < 4 && (
              <button className="add" onClick={() => set({ ...data, heirs: [...data.heirs, { name: '', relation: '', age: '' }] })}>
                + Add an heir
              </button>
            )}
          </div>
        </section>
      )}

      {needsDeclarant && (
        <section className="card">
          <span className="num">The independent person</span>
          <h2>Someone who knows the family</h2>
          <p className="sub" style={{ marginBottom: 18 }}>
            A neighbour, a family friend or a colleague who is not an heir and gains nothing from the claim. They sign the declaration naming the
            heirs (Annex IX). The bank must find them acceptable.
          </p>
          <div className="grid">
            <Text label="Full name" value={data.declarant.name} onChange={(name) => set({ ...data, declarant: { ...data.declarant, name } })} />
            <Text label="Son or daughter of" value={data.declarant.parent} onChange={(parent) => set({ ...data, declarant: { ...data.declarant, parent } })} />
            <Text label="Address" value={data.declarant.address} onChange={(address) => set({ ...data, declarant: { ...data.declarant, address } })} w={4} />
            <Text label="Years they have known the family" value={data.declarant.years} onChange={(years) => set({ ...data, declarant: { ...data.declarant, years } })} w={2} inputMode="numeric" />
          </div>
        </section>
      )}
    </>
  )
}
