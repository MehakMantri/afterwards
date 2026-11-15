import { Rulebook, Shell, inr, useStored } from '@afterwards/engine'
import { Accounts } from './Accounts'
import { Claims } from './Claims'
import { EARLIER, formName } from './data/forms'
import { emptyCase, exampleCase, type Case } from './data/model'
import { RULEBOOK, THRESHOLD, TIMELINE, say } from './data/rulebook'
import { Landing } from './Landing'
import { People } from './People'
import { Logo } from './ui'

const KEY = 'afterwards'

function Rules() {
  return (
    <Rulebook
      title="The whole rulebook."
      intro={
        <>
          These are all the rules Afterwards knows, exactly as the app uses them. Each one names the paragraph of the Reserve Bank of India's
          Directions it comes from, so you, a bank officer or a lawyer can check it. If a rule here is wrong, the app is wrong: tell us.
        </>
      }
      rules={RULEBOOK}
      say={say}
      formName={formName}
    >
      <section className="card">
        <span className="num">For every rule above</span>
        <h2>The deadline, and what a late bank owes</h2>
        <p style={{ marginTop: 12 }}>{TIMELINE.text}</p>
        <p className="src">
          Source: {TIMELINE.para},{' '}
          <a href={TIMELINE.source.url} target="_blank" rel="noreferrer">
            {TIMELINE.source.title}
          </a>
          .
        </p>
        <h3>The limit</h3>
        <p>
          {inr(THRESHOLD.bank)} (15 lakh) at regular banks and {inr(THRESHOLD.coop)} (5 lakh) at co-operative banks. A bank may set a higher limit
          of its own, never a lower one.
        </p>
        <h3>The forms</h3>
        <ul className="plain">
          {Object.entries(EARLIER).map(([now, was]) => (
            <li key={now}>
              {formName(now)}, first issued as Annex {was}. Some branches still hand out prints with the earlier label; the form is the same.
            </li>
          ))}
        </ul>
        <h3>What these rules do not cover</h3>
        <p>
          Government savings schemes run through banks, such as the Public Provident Fund and the Senior Citizen Savings Scheme (paragraph 282).
          Lockers, insurance, provident fund, shares and mutual funds. Co-operative banks follow the same rules under their own Directions; the
          limit shown for them is cited from the Directions as first issued on 26 September 2025.
        </p>
        <h3>Words used here</h3>
        <ul className="plain">
          <li>
            <b>Nominee:</b> the person the account holder named, at the bank, to receive the money.
          </li>
          <li>
            <b>Legal heir:</b> a family member entitled to a share under the succession law that applies to the family.
          </li>
          <li>
            <b>Succession certificate, probate, letter of administration:</b> papers issued by a court. They take months and need a lawyer.
          </li>
          <li>
            <b>Bond of indemnity:</b> a signed promise to repay the bank if someone with a better claim appears later.
          </li>
          <li>
            <b>Lakh:</b> one hundred thousand. 15 lakh rupees is 1,500,000 rupees.
          </li>
        </ul>
      </section>
    </Rulebook>
  )
}

function App() {
  const [data, setData] = useStored<Case>(`${KEY}.case.v1`, emptyCase())
  return (
    <Shell
      storageKey={KEY}
      name="Afterwards"
      logo={<Logo />}
      onErase={() => setData(emptyCase())}
      home={(go) => (
        <Landing
          onStart={() => go('accounts')}
          onRulebook={() => go('rules')}
          onExample={() => {
            setData(exampleCase())
            go('claims')
          }}
        />
      )}
      pages={{ rules: { label: 'Rulebook', render: () => <Rules /> } }}
      steps={[
        { id: 'accounts', label: 'Accounts', render: (go) => <Accounts data={data} set={setData} onRulebook={() => go('rules')} /> },
        { id: 'people', label: 'Details', render: () => <People data={data} set={setData} /> },
        { id: 'claims', label: 'Claims', render: (go) => <Claims data={data} set={setData} onRulebook={() => go('rules')} /> },
      ]}
    />
  )
}

export default App
