# Structure

- `engine/` knows nothing about any life event. It takes rulebooks, form maps and wording as data and
  runs them. No institution names, form names or life-event words in engine source: a test enforces it.
- `engine/` holds: rule evaluator, PDF filler, deadline arithmetic, the app frame, the shared screens
  (rule card, rulebook page, downloads, checklist, tracker, countdown), form inputs and the stylesheet.
- `apps/<name>/` holds one life event: `src/data/rulebook.ts`, `src/data/forms.ts` (field maps),
  `src/data/model.ts`, `src/data/letters.ts`, the official PDFs under `public/forms/`, and the question
  screens and home page built from engine inputs.
- A feature belongs in the engine if both apps need it; otherwise in the app.
- Tests sit next to the file they test: `thing.ts`, `thing.test.ts`.
- `apps/turning-18` builds into `apps/afterwards/dist/turning-18`, so one deployment serves both.
