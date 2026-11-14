# Structure

- `engine/` knows nothing about death claims. It takes a rulebook, questions and
  field maps as data and runs them. No institution names in engine code.
- `apps/<name>/` holds only data and copy for one life event: rulebook JSON,
  field maps, official PDFs, text. Plus a thin React shell.
- A feature belongs in the engine if both apps need it; otherwise in the app.
- Tests sit next to the file they test: `thing.ts`, `thing.test.ts`.
