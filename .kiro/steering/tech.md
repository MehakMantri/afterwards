# Tech

- npm workspaces. Vite, React, TypeScript. Static hosting, no backend.
- `pdf-lib` writes text onto the official PDF pages at fixed coordinates.
  One field-map JSON per form. Do not redraw form layouts.
- State in `localStorage`, behind one small module in the engine.
- Tests: Vitest and fast-check. Rule logic gets property-based tests.
- No new dependency for something a few lines can do.

## Commands

- `npm run dev` starts Afterwards; `npm run dev:18` starts Turning 18
- `npm run build` type-checks and builds both apps
- `npm run samples` fills every form with example data into `samples/`
- `npm test` runs all tests
