# Testing & CI

This project uses Vitest for unit tests and a GitHub Actions workflow for CI.

Commands

- `npm install` — install dependencies
- `npm run test` — run Vitest in watch mode
- `npm run test:ci` — run Vitest once (suitable for CI)
- `npm run coverage` — generate coverage report

CI

A workflow is included at `.github/workflows/ci.yml` which runs the typecheck, tests, and build on pushes and pull requests.
