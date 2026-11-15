import { useEffect, type ReactNode } from 'react'
import { useStored } from './store'

// The frame every app shares: header, privacy pill, erase button, numbered steps, back and continue.
// An app supplies its name, its home page, its steps and any extra pages (such as the rulebook).

export type Step = { id: string; label: string; render: (go: (view: string) => void) => ReactNode }

type Props = {
  storageKey: string
  name: string
  logo: ReactNode
  home: (go: (view: string) => void) => ReactNode
  steps: Step[]
  pages?: Record<string, { label: string; render: () => ReactNode }>
  onErase: () => void
}

export function Shell({ storageKey, name, logo, home, steps, pages = {}, onErase }: Props) {
  const [stored, setView] = useStored<string>(`${storageKey}.view.v1`, 'home')
  // A view saved by an older version may no longer exist.
  const view = stored === 'home' || stored in pages || steps.some((s) => s.id === stored) ? stored : 'home'
  const at = steps.findIndex((s) => s.id === view)

  // Braces matter: newer browsers return a Promise from scrollTo, and React would treat it as a cleanup function.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const erase = () => {
    if (window.confirm('Erase everything you have typed from this device? This cannot be undone.')) {
      onErase()
      setView('home')
    }
  }

  return (
    <>
      <div className="wrap bar">
        <button className="brand" onClick={() => setView('home')} aria-label={`${name}, home`}>
          {logo}
          {name}
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
        <main>{home(setView)}</main>
      ) : at < 0 ? (
        <main className="narrow">
          {pages[view].render()}
          <div className="nav">
            <button className="btn ghost" onClick={() => setView('home')}>
              ← Back
            </button>
            <button className="btn" onClick={() => setView(steps[0].id)}>
              Start →
            </button>
          </div>
        </main>
      ) : (
        <main className="narrow">
          <nav className="stepper" aria-label="Steps">
            {steps.map((s, i) => (
              <button key={s.id} aria-current={s.id === view ? 'step' : undefined} onClick={() => setView(s.id)}>
                <span>{i + 1}</span>
                {s.label}
              </button>
            ))}
          </nav>

          {steps[at].render(setView)}

          <div className="nav">
            <button className="btn ghost" onClick={() => setView(at > 0 ? steps[at - 1].id : 'home')}>
              ← Back
            </button>
            {at < steps.length - 1 && (
              <button className="btn" onClick={() => setView(steps[at + 1].id)}>
                Continue →
              </button>
            )}
          </div>
        </main>
      )}
    </>
  )
}
