[![CI](https://github.com/markwaldron7string/coverage-modeller/actions/workflows/test.yml/badge.svg)](https://github.com/markwaldron7string/coverage-modeller/actions/workflows/test.yml)
[![Live Demo](https://img.shields.io/badge/Live_Demo-coverage--modeller.vercel.app-000?logo=vercel)](https://coverage-modeller.vercel.app/)

# Coverage Modeller

After seven years in insurance underwriting, the hardest conversation to have
with a customer was always the trade-off conversation: is the lower-deductible
policy actually worth it for your situation? Coverage Modeller makes that
question answerable in real time.

An interactive tool for modelling auto insurance coverage scenarios and
comparing out-of-pocket costs across different deductible and coverage
combinations.

**Live demo:** https://coverage-modeller.vercel.app/

> 🚧 Work in progress - built as a portfolio project.

## Tech stack

Next.js (App Router) · React · TypeScript (strict) · TailwindCSS · Zustand ·
Jest + React Testing Library · GitHub Actions CI

## Performance & accessibility

Lighthouse audit — incognito Chrome on the deployed production build:

| Category       | Score |
| -------------- | ----- |
| Performance    | 100   |
| Accessibility  | 96    |
| Best Practices | 96    |
| SEO            | 100   |

![Lighthouse report](docs/lighthouse.png)

Accessibility was built to WCAG 2.1 AA from the start — native semantic form
controls, ARIA live regions for derived results, full keyboard operability, and
information never conveyed by colour alone. Full audit notes, including the axe
DevTools results and the manual keyboard pass, are in
[docs/accessibility.md](docs/accessibility.md).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm test` – run the test suite
- `npm run lint` – lint
- `npm run format` – format with Prettier