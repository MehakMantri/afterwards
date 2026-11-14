import { TIMELINE } from './data/rulebook'

const RBI_URL = 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12901&Mode=0'

export function Landing({ onStart, onExample }: { onStart: () => void; onExample: () => void }) {
  return (
    <>
      <section className="wrap hero">
        <div>
          <span className="eyebrow">Free · Private · India</span>
          <h1>
            The paperwork, <em>after.</em>
          </h1>
          <p className="lede">
            When someone in the family dies, their bank accounts do not come to you by themselves. Afterwards tells you exactly which forms each bank
            must accept, and fills them in for you.
          </p>
          <div className="cta">
            <button className="btn" onClick={onStart}>
              Start with one bank account
            </button>
            <button className="btn ghost" onClick={onExample}>
              See it with an example family
            </button>
          </div>
          <p className="fine">No sign-up. No fee. Nothing you type leaves this device.</p>
        </div>

        <div className="sheets" aria-hidden="true">
          <div className="sheet">
            <small>Annex I-C</small>
            <b>Bond of Indemnity</b>
            <div className="row">In consideration of <i /></div>
            <div className="row">the sum of Rupees <i /></div>
            <div className="row"><i /></div>
            <div className="row"><i /></div>
          </div>
          <div className="sheet">
            <small>Annex I-B</small>
            <b>Claim by legal heirs</b>
            <div className="row">I / We <i /></div>
            <div className="row">Religion <i /></div>
            <div className="row"><i /></div>
            <div className="row"><i /></div>
          </div>
          <div className="sheet">
            <small>Annex I-A</small>
            <b>Application for Settlement of Claim</b>
            <div className="row">Bank <i>State Bank of India</i></div>
            <div className="row">Name of deceased <i>Ramesh Kumar Iyer</i></div>
            <div className="row">I / We <i>Lakshmi Iyer</i></div>
            <div className="row">Date and place of death <i>18/09/2026, Pune</i></div>
            <div className="row">Account No. <i>30211234567</i></div>
            <div className="row">Amount <i>2,84,500</i></div>
            <span className="stamp">FILLED</span>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className="stats">
          <div className="stat">
            <strong>₹72,454 cr</strong>
            <span>lying unclaimed in Indian banks, as told to the Rajya Sabha on 10 February 2026</span>
          </div>
          <div className="stat">
            <strong>{TIMELINE.days} days</strong>
            <span>is all a bank now gets to settle, once it has every document</span>
          </div>
          <div className="stat">
            <strong>5 forms</strong>
            <span>the same for every bank since March 2026, filled here from one set of answers</span>
          </div>
          <div className="stat">
            <strong>0 bytes</strong>
            <span>of your family's details sent anywhere. There is no server to send them to</span>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <span className="eyebrow">How it works</span>
        <h2 style={{ marginTop: 14 }}>Three short steps, in plain words.</h2>
        <div className="steps">
          <div className="step">
            <h3>Tell us about the accounts</h3>
            <p>Which bank, roughly how much, and whether there was a nominee. You see the route for each bank as you answer.</p>
          </div>
          <div className="step">
            <h3>Enter the details once</h3>
            <p>Names, dates and account numbers go in a single time. You never copy the same address onto five forms.</p>
          </div>
          <div className="step">
            <h3>Print, sign, submit, track</h3>
            <p>Download the official forms already filled, with a cover letter and a checklist. Then track each claim against the 15-day clock.</p>
          </div>
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 0 }}>
        <div className="split">
          <div className="quote">
            <blockquote>
              “No succession certificate, letter of administration, probate or surety bond is required, irrespective of the amount” when the account
              has a nominee.
            </blockquote>
            <cite>
              What the Reserve Bank of India directed every bank to follow by 31 March 2026.{' '}
              <a href={RBI_URL} target="_blank" rel="noreferrer">
                Read the Directions
              </a>
            </cite>
          </div>
          <div>
            <span className="eyebrow">Why trust it</span>
            <h2 style={{ marginTop: 14 }}>A rulebook you can check, not advice you have to believe.</h2>
            <ul className="ticks">
              <li>
                <div>
                  <b>Every rule shows its source</b>
                  <span>Each route names the paragraph of the RBI Directions it comes from, with a link.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>No AI decides anything</b>
                  <span>A fixed, open rulebook picks the forms. The same answers always give the same result.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>It says when to get a lawyer</b>
                  <span>Disputes and court papers are outside what a form can do, and Afterwards tells you so.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="wrap foot">
        <p>
          <b>Not legal advice.</b> Afterwards prepares standard forms from your answers. Banks may ask for more, and may set a higher limit of their
          own. Check the filled forms before you sign them.
        </p>
        <p>Covers bank deposits. Lockers, provident fund, insurance, shares and mutual funds are not covered yet. Open source, MIT licence.</p>
      </footer>
    </>
  )
}
