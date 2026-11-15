import { Choice, Head, Text } from '@afterwards/engine'
import { age, type Case, type Me } from './data/model'

type Props = { data: Case; set: (c: Case) => void }

export function Details({ data, set }: Props) {
  const m = data.me
  const me = (patch: Partial<Me>) => set({ ...data, me: { ...m, ...patch } })
  const years = age(m.dob)
  const funds = data.items.some((i) => i.kind === 'fund')

  return (
    <>
      <Head title="Your details, entered once.">
        Everything here is copied onto every form and letter that needs it. Leave a box empty if you do not know it yet; it stays blank for you to
        write in by hand.
      </Head>

      {years !== undefined && years < 18 && (
        <div className="note" role="alert">
          <b>You are not 18 yet.</b> These requests can only be made from your 18th birthday. You can fill everything in now and print it on the
          day.
        </div>
      )}

      <section className="card">
        <span className="num">You</span>
        <h2 style={{ marginBottom: 18 }}>{m.name || 'Your details'}</h2>
        <div className="grid">
          <Text label="Full name, as on your PAN card" value={m.name} onChange={(name) => me({ name })} w={4} />
          <Text label="Date of birth" type="date" value={m.dob} onChange={(dob) => me({ dob })} w={2} />
          <Text label="PAN" value={m.pan} onChange={(pan) => me({ pan: pan.toUpperCase() })} w={2} hint="Ten characters. Get one in your own name first if you have none." />
          <Text label="Mobile number" value={m.mobile} onChange={(mobile) => me({ mobile: mobile.replace(/[^\d]/g, '').slice(0, 10) })} w={2} inputMode="tel" hint="Ten digits, your own." />
          <Text label="Email" value={m.email} onChange={(email) => me({ email })} w={2} inputMode="email" />
          <Text label="Address line 1" value={m.address1} onChange={(address1) => me({ address1 })} w={6} />
          <Text label="Address line 2" value={m.address2} onChange={(address2) => me({ address2 })} w={6} />
          <Text label="City" value={m.city} onChange={(city) => me({ city, place: m.place || city })} w={2} />
          <Text label="State" value={m.state} onChange={(state) => me({ state })} w={2} />
          <Text label="PIN" value={m.pin} onChange={(pin) => me({ pin: pin.replace(/[^\d]/g, '').slice(0, 6) })} w={2} inputMode="numeric" />
        </div>
      </section>

      <section className="card">
        <span className="num">The guardian on record</span>
        <h2>Whoever opened these for you</h2>
        <p className="sub" style={{ marginBottom: 18 }}>Their name is removed from the folio or account once the change is made.</p>
        <div className="grid">
          <Text label="Guardian's full name" value={m.guardianName} onChange={(guardianName) => me({ guardianName })} />
          <Choice
            label="They are your"
            value={m.guardianRelation}
            onChange={(guardianRelation) => me({ guardianRelation })}
            w={3}
            options={[
              { v: 'Father', l: 'Father' },
              { v: 'Mother', l: 'Mother' },
              { v: 'Court', l: 'Court-appointed guardian' },
            ]}
          />
        </div>
      </section>

      <section className="card">
        <span className="num">Your own bank account</span>
        <h2>Where your money should be paid</h2>
        <p className="sub" style={{ marginBottom: 18 }}>
          It must be in your name. If your account is still a minor's account, sort that out first: the letter in step 3 does it.
        </p>
        <div className="grid">
          <Text label="Bank name" value={m.bankName} onChange={(bankName) => me({ bankName })} />
          <Text label="Branch" value={m.bankBranch} onChange={(bankBranch) => me({ bankBranch })} />
          <Text label="Account number" value={m.bankAccount} onChange={(bankAccount) => me({ bankAccount })} inputMode="numeric" />
          <Text label="IFSC" value={m.bankIfsc} onChange={(bankIfsc) => me({ bankIfsc: bankIfsc.toUpperCase().slice(0, 11) })} w={2} hint="Eleven characters, printed on your cheque book." />
          <Choice
            label="Type"
            value={m.bankType}
            onChange={(bankType) => me({ bankType })}
            w={3}
            options={[
              { v: 'SB', l: 'Savings' },
              { v: 'CA', l: 'Current' },
            ]}
          />
          <Text label="Branch city" value={m.bankCity} onChange={(bankCity) => me({ bankCity })} w={4} />
          <Text label="Branch PIN" value={m.bankPin} onChange={(bankPin) => me({ bankPin: bankPin.replace(/[^\d]/g, '').slice(0, 6) })} w={2} inputMode="numeric" />
        </div>
      </section>

      {funds && (
        <section className="card">
          <span className="num">Asked on the mutual fund form</span>
          <h2 style={{ marginBottom: 18 }}>A few more boxes</h2>
          <div className="grid">
            <Text label="Country of birth" value={m.birthCountry} onChange={(birthCountry) => me({ birthCountry })} w={2} />
            <Text label="Place of birth" value={m.birthPlace} onChange={(birthPlace) => me({ birthPlace })} w={2} />
            <Text label="Nationality" value={m.nationality} onChange={(nationality) => me({ nationality })} w={2} />
            <Choice
              label="Occupation"
              value={m.occupation}
              onChange={(occupation) => me({ occupation })}
              options={[
                { v: 'student', l: 'Student' },
                { v: 'private', l: 'Private sector job' },
                { v: 'other', l: 'Something else' },
              ]}
              hint="For anything else, tick the right box on the printed form."
            />
            <Text label="Place of signing" value={m.place} onChange={(place) => me({ place })} w={2} />
          </div>
        </section>
      )}
    </>
  )
}
