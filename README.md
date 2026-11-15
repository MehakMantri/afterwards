# Afterwards

Free, private help with official paperwork at two moments in life, for India.

- **Afterwards:** a family claims a relative's bank accounts after a death.
- **Turning 18:** a young adult moves investments and accounts opened for them as a child into their own name.

Both answer the same question: which official form does this institution have to accept from me, and can someone fill it in? Both run on one small engine, in the browser, with no server.

Built for Kiroween 2026 (Skeleton Crew): one skeleton, two apps.

## What each app does

| | Afterwards | Turning 18 |
|---|---|---|
| You answer | Nominee, Will, dispute and amount, per bank | Fund house, bank or demat account; who can attest; any SIP running |
| It decides | Which of five routes the RBI rules give you | What each account needs to move into your name |
| It fills | RBI claim forms, Annex V to IX | AMFI Form MAM and Annexure 1 |
| It writes | Cover letter, checklist, and a letter if the bank misses its 15-day deadline | Cover letter, checklist, and a letter to the bank branch |
| Sources | RBI (Commercial Banks - Responsible Business Conduct) Directions, 2025, paragraphs 282 to 323 | SEBI circular of 24 Dec 2019, AMFI Best Practices Circular 86/2020-21, RBI Directions paragraph 188 |

In both apps:

- Every rule shows the paragraph it comes from, with a link and the date it was last checked.
- The whole rulebook is one public page inside the app.
- Where no official text could be read, there is no rule. The app says so instead of guessing.
- Everything you type stays in your browser. There is no account, no server and no AI at runtime.
- All papers for one institution download as a single file, in the order to hand them over.

## The skeleton

`engine/` knows nothing about banks, deaths, funds or birthdays. A test fails if such a word appears in its source. It provides:

| Part | File |
|---|---|
| Rule evaluator: first matching rule wins, every rule must carry a source | `engine/rules.ts` |
| PDF filler: writes text, ticks and boxed characters onto official pages at fixed coordinates; letters; merging | `engine/pdf.ts` |
| Deadline arithmetic in calendar days | `engine/clock.ts` |
| App frame: header, steps, navigation, erase-my-data | `engine/shell.tsx` |
| Shared screens: rule card, rulebook page, downloads, checklist, tracker, countdown | `engine/views.tsx` |
| Form inputs, formatting, local storage | `engine/ui.tsx`, `engine/format.ts`, `engine/store.ts` |
| The look | `engine/style.css` |

An app supplies data and wording:

| An app supplies | Afterwards | Turning 18 |
|---|---|---|
| Rulebook, with sources | `apps/afterwards/src/data/rulebook.ts` | `apps/turning-18/src/data/rulebook.ts` |
| Field maps for the official PDFs | `apps/afterwards/src/data/forms.ts` | `apps/turning-18/src/data/forms.ts` |
| Data model and example case | `.../data/model.ts` | `.../data/model.ts` |
| Letters | `.../data/letters.ts` | `.../data/letters.ts` |
| Its question screens and home page | `apps/afterwards/src/*.tsx` | `apps/turning-18/src/*.tsx` |

To add a third life event: write a rulebook where each rule cites its source, map the official PDFs, and write the question screens with the engine's inputs.

## Run it

```
npm install
npm run dev        # Afterwards, http://localhost:5173
npm run dev:18     # Turning 18
npm test           # 31 checks, including property-based tests on both rulebooks
npm run samples    # fills every form with example data into samples/, to check by eye
npm run build      # both apps into apps/afterwards/dist; Turning 18 is served at /turning-18/
```

## Known limits

- The RBI claim forms are filled onto one bank's print of the forms, which carries that bank's logo and the earlier labels (Annex I-A to I-E). The wording of the forms is the same. Replacing it with the RBI's own files is the next job.
- Afterwards covers bank deposits only. Turning 18 covers mutual funds, bank accounts and (as a checklist only) CDSL demat accounts.
- Co-operative banks follow their own RBI Directions. Their limit is cited from the Directions as first issued in September 2025.
- Forms are filled in English letters only. The app warns when a field uses another script.
- No lawyer or chartered accountant has reviewed the output yet.

## How it was built

The first version of Afterwards and the engine was written on 14 and 15 November 2026 with an AI coding assistant other than Kiro. Kiro steering files are in `.kiro/steering/`.

## Not legal or financial advice

These apps prepare standard forms from your answers. They say so when a case needs a lawyer. Check every form before you sign it.

## Licence

MIT
