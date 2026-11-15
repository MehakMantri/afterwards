import { Rulebook, Shell, useStored } from '@afterwards/engine'
import { Accounts } from './Accounts'
import { formName } from './data/forms'
import { emptyCase, exampleCase, type Case } from './data/model'
import { AMFI_URL, ORDER, RULEBOOK, say } from './data/rulebook'
import { Details } from './Details'
import { Landing } from './Landing'
import { Papers } from './Papers'

const KEY = 'turning18'

function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#2c6a4d" />
      <text x="16" y="21.5" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fontWeight="700" fill="#fffdf8">
        18
      </text>
    </svg>
  )
}

function Rules() {
  return (
    <Rulebook
      title="The whole rulebook."
      intro={
        <>
          These are all the rules Turning 18 knows, exactly as the app uses them. Each one names the official text it comes from, so you, a fund
          house or a bank officer can check it. Where we could not read an official source, there is no rule.
        </>
      }
      rules={RULEBOOK}
      say={say}
      formName={formName}
    >
      <section className="card">
        <span className="num">For the mutual fund rules above</span>
        <h2>Do these first</h2>
        <ol className="plain" style={{ marginTop: 12 }}>
          {ORDER.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="src">
          Source: {ORDER.para},{' '}
          <a href={AMFI_URL} target="_blank" rel="noreferrer">
            AMFI Best Practices Guidelines Circular No. 86/2020-21
          </a>
          , 16 July 2020.
        </p>
        <h3>About the forms</h3>
        <p>
          Form MAM and Annexure 1 are the formats published by AMFI, the association of mutual fund houses, for all its members. They are not
          annexed to a SEBI circular. Some fund houses print their own copy with the same fields; if yours insists on its own, the details here
          are the ones it asks for.
        </p>
        <h3>What these rules do not cover</h3>
        <p>
          Public Provident Fund, Sukanya Samriddhi and post office accounts, and updating your PAN or Aadhaar. We could not read an official
          text for those, so the app says nothing about them rather than guess. Co-operative banks follow their own Directions.
        </p>
        <h3>Words used here</h3>
        <ul className="plain">
          <li>
            <b>Folio:</b> your account number with one mutual fund house.
          </li>
          <li>
            <b>KYC:</b> "know your customer", the one-time identity check every investor in India completes.
          </li>
          <li>
            <b>PAN:</b> the ten-character tax identity number.
          </li>
          <li>
            <b>SIP, STP, SWP:</b> standing instructions to invest, switch or withdraw a fixed amount every month.
          </li>
          <li>
            <b>Demat account:</b> the account that holds shares electronically, kept with a depository participant such as a broker.
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
      name="Turning 18"
      logo={<Logo />}
      onErase={() => setData(emptyCase())}
      home={(go) => (
        <Landing
          onStart={() => go('accounts')}
          onRulebook={() => go('rules')}
          onExample={() => {
            setData(exampleCase())
            go('papers')
          }}
        />
      )}
      pages={{ rules: { label: 'Rulebook', render: () => <Rules /> } }}
      steps={[
        { id: 'accounts', label: 'Accounts', render: (go) => <Accounts data={data} set={setData} onRulebook={() => go('rules')} /> },
        { id: 'details', label: 'Your details', render: () => <Details data={data} set={setData} /> },
        { id: 'papers', label: 'Paperwork', render: (go) => <Papers data={data} set={setData} onRulebook={() => go('rules')} /> },
      ]}
    />
  )
}

export default App
