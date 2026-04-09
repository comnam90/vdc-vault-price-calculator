# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-07
**Commit:** bc8e926
**Branch:** mvp-phases-1-6

## OVERVIEW

Client-side SPA for comparing Veeam Data Cloud Vault pricing against DIY cloud storage in VDC-supported regions. The app fetches `vdc_vault` region availability from the public VDC Services Map API, combines that with static Vault/cloud pricing data, and renders a calculator-driven comparison UI. React 19 + Vite 7.3 + TypeScript 5.9 + Tailwind 4.1 + shadcn/ui + Recharts + TanStack Table.

## STATUS: MVP COMPLETE + PHASE 5 POLISH

Core flow is complete: region fetch -> calculator inputs -> comparison engine -> summary cards/chart/breakdown. Phase 5 polish is in place: reduced-motion-safe animation classes, improved calculator control labeling, and responsive 4-card layout at `lg`/1024px+. Current verification baseline: 101 tests across 25 test files, lint clean, production build succeeds, Cloudflare Pages workflows present.

## STRUCTURE

```text
./
├── README.md                         # Product summary, disclaimers, stack, dev commands
├── CLAUDE.md                        # This project knowledge base
├── docs/plans/mvp-implementation.md # Source implementation plan/spec
├── package.json                     # Scripts, dependencies, lint-staged config
├── vite.config.ts                   # React + Tailwind + Vitest config, @ alias
├── tsconfig.json                    # Project references
├── eslint.config.js                 # TS + React Hooks + React Refresh flat config
├── commitlint.config.js             # Conventional Commits config
├── .husky/
│   ├── pre-commit                   # Runs lint-staged
│   └── commit-msg                   # Runs commitlint
├── .github/workflows/
│   ├── ci.yml                       # Lint + test on push/PR
│   ├── publish.yml                  # Manual Cloudflare Pages deploy
│   └── release.yml                  # Release Please + deploy on release
└── src/
    ├── main.tsx                     # React 19 StrictMode entry
    ├── App.tsx                      # Top-level state, region loading/error, result gating
    ├── index.css                    # Tailwind v4 theme, motion tokens, semantic colors
    ├── data/
    │   ├── cloud-pricing.ts         # Static pricing for 60+ VDC regions
    │   └── vault-pricing.ts         # Vault Foundation/Advanced Core + Non-Core placeholders
    ├── hooks/
    │   └── use-regions.ts           # Fetch/caching hook for region availability
    ├── lib/
    │   ├── api-client.ts            # Public API fetch + cache/inflight dedupe
    │   ├── comparison-engine.ts     # Orchestrates Vault + DIY totals
    │   ├── vault-calculator.ts      # Vault term-cost math
    │   ├── diy-calculator.ts        # DIY storage/op/egress math
    │   ├── format-utils.ts          # USD, compact-number, presentation helpers
    │   ├── constants.ts             # Shared calculator/API constants
    │   └── utils.ts                 # Shared `cn()` helper
    ├── types/
    │   ├── calculator.ts            # Inputs, breakdowns, comparison result types
    │   ├── pricing.ts               # Pricing dataset types
    │   └── region.ts                # Region/provider/service availability types
    ├── components/
    │   ├── calculator/              # Capacity, term, region inputs, form composition
    │   ├── layout/                  # Header/footer chrome
    │   ├── results/                 # Cards, chart, breakdown table, assumptions, alerts
    │   └── ui/                      # shadcn/radix primitives
    └── __tests__/                   # 25 focused unit/component test files + setup
```

## WHERE TO LOOK

| Need                              | Location                                                                                   | Notes                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Product intent                    | `README.md`                                                                                | Scope, disclaimer, supported comparison modes                            |
| Authoritative implementation spec | `docs/plans/mvp-implementation.md`                                                         | Phase-by-phase requirements used to build the MVP                        |
| App orchestration                 | `src/App.tsx`                                                                              | Owns complete calculator inputs, region load state, result gating        |
| Region API integration            | `src/hooks/use-regions.ts`, `src/lib/api-client.ts`                                        | Public fetch, local cache, inflight request dedupe                       |
| Static pricing sources            | `src/data/cloud-pricing.ts`, `src/data/vault-pricing.ts`                                   | Cloud pricing by VDC region ID; Vault RRP values + Non-Core placeholders |
| Core comparison logic             | `src/lib/comparison-engine.ts`, `src/lib/vault-calculator.ts`, `src/lib/diy-calculator.ts` | Pure, test-driven cost math                                              |
| Calculator UI                     | `src/components/calculator/`                                                               | Region selector, term selector, capacity input, parent form              |
| Results UI                        | `src/components/results/`                                                                  | Summary cards, chart, breakdown, assumptions, non-core alert             |
| Design tokens + motion            | `src/index.css`                                                                            | Tailwind v4 token mapping, color system, motion variables                |
| Shared types                      | `src/types/`                                                                               | Use these before introducing new shapes                                  |
| Test patterns                     | `src/__tests__/`                                                                           | Role-first component tests, shared setup, no snapshots                   |
| CI/CD                             | `.github/workflows/`                                                                       | CI, Release Please deploy path, manual publish workflow                  |

## DATA SOURCES

- **Region availability:** `https://vdcmap.bcthomas.com/api/v1/regions?service=vdc_vault`
- **Vault pricing:** static values in `src/data/vault-pricing.ts`
- **DIY cloud pricing:** static dataset in `src/data/cloud-pricing.ts`

Pricing is approximate and public-list-based. No discounts, reserved pricing, negotiated rates, taxes, or vendor quotes are modeled.

## CONVENTIONS

- **Imports:** use `@/...` aliases across directories; keep relative imports local to the same folder
- **Styling:** compose classes with `cn()` from `@/lib/utils`; rely on Prettier to sort Tailwind classes
- **Motion:** every animation class must be `motion-safe:` gated; reduced-motion coverage exists in `src/__tests__/reduced-motion.test.tsx`
- **Accessibility:** prefer real labeling semantics (`Label` with `htmlFor`, or `fieldset`/`legend` for grouped controls); role-first queries in tests
- **State management:** `App.tsx` owns completed calculator input state; derived comparison data comes from `useMemo`, not duplicated mutable state
- **Data flow:** keep pricing and calculator logic pure in `src/lib/`; UI components should format and present results, not recalculate core totals
- **Components:** one exported component per file outside shadcn-generated UI primitives
- **Testing:** query priority is `getByRole`/`findByRole` first; add focused tests for calculator logic and interaction regressions; no snapshot tests
- **Hosting:** static frontend only; Cloudflare Pages deploys `dist/`

## ANTI-PATTERNS (FORBIDDEN)

| Pattern                                                 | Reason                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| `as any`, `@ts-ignore`, `@ts-expect-error`              | Keep the calculator and UI strongly typed                       |
| Bare `animate-*`, `fade-*`, `zoom-*`, `slide-*` classes | Must respect `prefers-reduced-motion`                           |
| Relative imports across folders                         | Use `@/` aliases for consistency                                |
| Silent catch/ignore behavior                            | Surface API/calculation failures explicitly                     |
| Backend-only assumptions in app code                    | This is a static client-side app                                |
| Guessing pricing when data is missing                   | If region pricing is unavailable, do not fabricate results      |
| Expanding calculator types for presentation-only needs  | Derive display-only helpers in results components when possible |
| Snapshot-heavy component tests                          | Prefer behavior and accessibility assertions                    |

## CRITICAL CONSTRAINTS

| Rule                       | Detail                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Term range**             | UI supports 1-5 year commitments                                                        |
| **Capacity unit**          | Calculator input is TiB, not TB or GB                                                   |
| **Region source**          | Only regions returned for `service=vdc_vault` are valid                                 |
| **Pricing keys**           | Cloud pricing is keyed by VDC region ID; mismatches must not silently fall back         |
| **Non-Core Vault pricing** | Modeled as `pricePerTbMonth: 0` with `pricingTbd: true`, surfaced via banner            |
| **Result visibility**      | Results render only when inputs are complete, region resolves, and cloud pricing exists |

## VAULT PRICING CAVEATS

- This tool is unofficial and not affiliated with Veeam
- Vault pricing uses published RRP, not account-specific quoting
- DIY pricing excludes discounts, reserved capacity, and negotiated rates
- Community API availability can change independently of this repo
- Non-Core Vault pricing is intentionally marked TBD rather than estimated

## COMMANDS

```bash
npm install           # Install dependencies
npm run dev           # Vite dev server
npm run build         # tsc -b && vite build
npm run lint          # eslint .
npm run preview       # Preview production build
npm run test          # Vitest watch mode
npm run test:run      # Single test run
npm run test:coverage # Coverage run
```

## ENGINEERING STANDARDS (NON-NEGOTIABLE)

### 1. Development Loop (TDD)

Use **Red-Green-Refactor** for new calculator logic, UI behavior changes, and regressions:

1. **Red:** add or update a failing test in `src/__tests__/`
2. **Green:** implement the smallest correct change
3. **Refactor:** extract shared logic, simplify names, remove duplication

### 2. Git Strategy (GitHub Flow)

- `main`: deployable branch
- `feature/*`, `fix/*`: short-lived work branches
- PRs target `main`

### 3. Commit Strategy (Conventional Commits)

Format: `type(scope): description`

Common types in this repo: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.

### 4. Code Quality (SOLID, DRY, KISS)

- Keep calculator rules in pure library functions
- Reuse existing types/data helpers before adding new ones
- Avoid scope creep outside the active MVP phase or issue
- Prefer explicit errors over silent fallbacks

## CI/CD

- **`ci.yml`**: runs `npm install --yes`, `npm run lint`, and `npm run test:run` on pushes to `main` and all PRs
- **`release.yml`**: runs Release Please on `main` and deploys to Cloudflare Pages when a release is created
- **`publish.yml`**: manual Cloudflare Pages deployment workflow using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- **Deploy target**: Cloudflare Pages project `vdc-vault-tco-calculator`

## AGENT CAPABILITIES (MANDATORY PROTOCOLS)

### 1. Skill Loading

| Task Type                 | Required Skills                                            |
| ------------------------- | ---------------------------------------------------------- |
| New feature               | `brainstorming`, `test-driven-development`                 |
| Bug fix                   | `systematic-debugging`, `test-driven-development`          |
| UI polish / accessibility | `web-design-guidelines`                                    |
| Milestone completion      | `requesting-code-review`, `verification-before-completion` |

### 2. Authority Hierarchy

1. `docs/plans/mvp-implementation.md` - phase-by-phase requirements
2. `README.md` - product framing and disclaimers
3. `package.json` - locked scripts and dependency versions
4. GitHub workflows - CI/CD behavior
5. This file - quick project map and conventions

### 3. Verification Checkpoint

- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] `npm run preview` for deploy-facing UI changes
- [ ] Reduced-motion/accessibility behavior remains covered when UI animation or controls change

## NEXT STEPS

1. Keep pricing datasets current as public list prices change
2. Set Cloudflare secrets in GitHub if they are not already present
3. Trigger `publish.yml` for a manual Pages deployment when ready
4. Revisit bundle size if performance work becomes a priority
