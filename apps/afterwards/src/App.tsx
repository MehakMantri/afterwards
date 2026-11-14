import { useEffect } from 'react'
import { useStored } from '@afterwards/engine'
import { Accounts } from './Accounts'
import { Claims } from './Claims'
import { emptyCase, exampleCase, type Case } from './data/model'
import { Landing } from './Landing'
import { People } from './People'
import { Logo } from './ui'

type View = 'home' | 'accounts' | 'people' | 'claims'
const STEPS: { id: View; label: string }[] = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'people', label: 'Details' },
  { id: 'claims', label: 'Claims' },
]

function App() {
  const [data, setData] = useStored<Case>('afterwards.case.v1', emptyCase())
  const [view, setView] = useStored<View>('afterwards.view.v1', 'home')
  const at = STEPS.findIndex((s) => s.id === view)

  // Braces matter: newer browsers return a Promise from scrollTo, and React would treat it as a cleanup function.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const erase = () => {
    if (window.confirm('Erase everything you have typed from this device? This cannot be undone.')) {
      setData(emptyCase())
      setView('home')
    }
  }

  return (
    <>
      <div className="wrap bar">
        <button className="brand" onClick={() => setView('home')} aria-label="Afterwards, home">
          <Logo />
          Afterwards
        </button>
        <div className="bar-right">
          <span className="pill">Stays on this device</span>
          {view !== 'home' && (
            <button className="link" onClick={erase}>
              Erase my data
            </button>
          )}
        </div>
      </div>

      {view === 'home' ? (
        <main>
          <Landing
            onStart={() => setView('accounts')}
            onExample={() => {
              setData(exampleCase())
              setView('claims')
            }}
          />
        </main>
      ) : (
        <main className="narrow">
          <nav className="stepper" aria-label="Steps">
            {STEPS.map((s, i) => (
              <button key={s.id} aria-current={s.id === view ? 'step' : undefined} onClick={() => setView(s.id)}>
                <span>{i + 1}</span>
                {s.label}
              </button>
            ))}
          </nav>

          {view === 'accounts' && <Accounts data={data} set={setData} />}
          {view === 'people' && <People data={data} set={setData} />}
          {view === 'claims' && <Claims data={data} set={setData} />}

          <div className="nav">
            <button className="btn ghost" onClick={() => setView(at > 0 ? STEPS[at - 1].id : 'home')}>
              ← Back
            </button>
            {at < STEPS.length - 1 && (
              <button className="btn" onClick={() => setView(STEPS[at + 1].id)}>
                Continue →
              </button>
            )}
          </div>
        </main>
      )}
    </>
  )
}

export default App
