type Props = { onStart: () => void; onExample: () => void; onRulebook: () => void }

export function Landing({ onStart, onExample, onRulebook }: Props) {
  return (
    <>
      <section className="wrap hero">
        <div>
          <span className="eyebrow">Free · Private · India</span>
          <h1>
            Yours, <em>at eighteen.</em>
          </h1>
          <p className="lede">
            A mutual fund or bank account your parents opened for you does not become yours by itself. On your 18th birthday it freezes until you
            ask for it. Turning 18 tells you what each one needs, and fills in the forms.
          </p>
          <div className="cta">
            <button className="btn" onClick={onStart}>
              Start with one account
            </button>
            <button className="btn ghost" onClick={onExample}>
              See it with an example
            </button>
          </div>
          <p className="fine">No sign-up. No fee. Nothing you type leaves this device.</p>
        </div>

        <div className="sheets" aria-hidden="true">
          <div className="sheet">
            <small>Letter</small>
            <b>To the Branch Manager</b>
            <div className="row">Account No. <i /></div>
            <div className="row">fresh operating instructions <i /></div>
            <div className="row"><i /></div>
            <div className="row"><i /></div>
          </div>
          <div className="sheet">
            <small>Annexure 1</small>
            <b>Bank Attestation</b>
            <div className="row">This is to certify that <i /></div>
            <div className="row">Account number <i /></div>
            <div className="row"><i /></div>
            <div className="row"><i /></div>
          </div>
          <div className="sheet">
            <small>Form MAM</small>
            <b>Change in status from Minor to Major</b>
            <div className="row">Mutual Fund <i>Parag Parikh</i></div>
            <div className="row">Name <i>Ananya Rao</i></div>
            <div className="row">Date of birth <i>27/10/2008</i></div>
            <div className="row">Folio No. <i>12345678</i></div>
            <div className="row">Guardian <i>Kavita Rao</i></div>
            <div className="row">IFSC <i>CNRB0001234</i></div>
            <span className="stamp">FILLED</span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="stats">
          <div className="stat">
            <strong>Day one</strong>
            <span>of being 18 is when a fund folio freezes for your guardian and every SIP on it stops</span>
          </div>
          <div className="stat">
            <strong>1 form</strong>
            <span>Form MAM, the industry's common request form, filled here from one set of answers</span>
          </div>
          <div className="stat">
            <strong>3 things first</strong>
            <span>your own PAN, your KYC, and a bank account in your name, in that order</span>
          </div>
          <div className="stat">
            <strong>0 bytes</strong>
            <span>of your details sent anywhere. There is no server to send them to</span>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <span className="eyebrow">How it works</span>
        <h2 style={{ marginTop: 14 }}>Three short steps, in plain words.</h2>
        <div className="steps">
          <div className="step">
            <h3>List what was opened for you</h3>
            <p>Each fund house, bank account or demat account. You see what each one needs as you answer.</p>
          </div>
          <div className="step">
            <h3>Enter your details once</h3>
            <p>Name, PAN, address and your own bank account go in a single time.</p>
          </div>
          <div className="step">
            <h3>Print, sign, send, track</h3>
            <p>Download the official form already filled, a cover letter and a checklist, as one file if you like.</p>
          </div>
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="split">
          <div className="quote">
            <blockquote>
              “No further transactions shall be allowed till the status of the minor is changed to major.”
            </blockquote>
            <cite>SEBI circular of 24 December 2019, paragraph 1(b), on mutual fund units held in the name of a minor.</cite>
          </div>
          <div>
            <span className="eyebrow">Why trust it</span>
            <h2 style={{ marginTop: 14 }}>A rulebook you can check, not advice you have to believe.</h2>
            <ul className="ticks">
              <li>
                <div>
                  <b>Every rule shows its source</b>
                  <span>
                    SEBI, AMFI, the Reserve Bank of India, each with its paragraph and a link.{' '}
                    <button className="link" style={{ padding: 0 }} onClick={onRulebook}>
                      Read the whole rulebook
                    </button>
                  </span>
                </div>
              </li>
              <li>
                <div>
                  <b>No rule without a source</b>
                  <span>Where we could not read an official text, the app stays silent instead of guessing.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>Your declarations stay yours</b>
                  <span>Tax status, income and nomination boxes are left for you to tick. The app only copies facts.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className="also">
          <div>
            <span className="eyebrow">Same engine, another moment</span>
            <h2 style={{ margin: '10px 0 8px', fontSize: 26 }}>Afterwards</h2>
            <p>
              Turning 18 runs on a small open engine: questions, a rulebook where every rule carries its source, and official forms filled in the
              browser. The same engine helps a family claim a relative's bank accounts after a death.
            </p>
          </div>
          {/* ponytail: relative link to the first app, which is deployed one folder up; in dev run npm run dev */}
          <a className="btn ghost" href="../">
            Open Afterwards
          </a>
        </div>
      </section>

      <footer className="wrap foot">
        <p>
          <b>Not legal or financial advice.</b> Turning 18 prepares standard forms from your answers. A fund house or bank may ask for more, or for
          its own form. Check everything before you sign.
        </p>
        <p>Covers mutual funds, bank accounts and demat accounts. Open source, MIT licence.</p>
      </footer>
    </>
  )
}
