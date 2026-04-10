# VDC Vault Price Calculator — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an unofficial TCO comparison SPA that lets users compare Veeam Data Cloud Vault (Foundation/Advanced) costs against DIY cloud storage (Azure Blob Hot/Cool or AWS S3 Standard/IA) across 60+ global regions.

**Architecture:** Single-page React app with no backend. Regions fetched from the public VDC Services Map API (`vdcmap.bcthomas.com`). Cloud storage pricing stored as static JSON. All calculation logic isolated in pure functions for testability. State managed via `useState`/`useMemo` in App.tsx — no state library needed.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4, shadcn/ui (new-york), TanStack Table v8, Recharts v3, Vitest + React Testing Library, Cloudflare Pages. All versions match `vdc-vault-readiness` exactly.

---

## File Structure

```
vdc-vault-price-calculator/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── .prettierrc
├── commitlint.config.js
├── components.json
├── index.html
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .github/workflows/
│   ├── ci.yml
│   ├── release.yml
│   └── publish.yml
├── docs/plans/
│   └── mvp-implementation.md          # This file
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   ├── region.ts                  # Region, CloudProvider, VaultEdition, VaultTier, VaultService
    │   ├── pricing.ts                 # CloudStoragePricing, RegionCloudPricing, VaultPricing
    │   └── calculator.ts             # CalculatorInputs, CostBreakdown, ComparisonResult
    ├── data/
    │   ├── cloud-pricing.ts           # Static Azure/AWS pricing keyed by VDC API region ID
    │   └── vault-pricing.ts           # VDC Vault edition/tier price table
    ├── lib/
    │   ├── utils.ts                   # cn() — clsx + tailwind-merge
    │   ├── constants.ts               # API base URL, operation size, read/egress factors, TiB conversions
    │   ├── vault-calculator.ts        # calculateVaultCost() — pure function
    │   ├── diy-calculator.ts          # calculateDiyCost() — returns CostBreakdown with 5 line items
    │   ├── comparison-engine.ts       # buildComparison() — orchestrates 4-way comparison
    │   ├── api-client.ts              # fetchRegions() with client-side caching
    │   └── format-utils.ts            # formatUSD(), formatUSDCompact(), formatPerTbMonth()
    ├── hooks/
    │   └── use-regions.ts             # useRegions() — fetch + loading + error state
    ├── components/
    │   ├── ui/                        # shadcn primitives (installed via CLI)
    │   ├── layout/
    │   │   ├── site-header.tsx
    │   │   └── site-footer.tsx
    │   ├── calculator/
    │   │   ├── region-selector.tsx     # Searchable select grouped by provider
    │   │   ├── term-selector.tsx       # 1-5 year toggle group
    │   │   ├── capacity-input.tsx      # Number input with TiB suffix
    │   │   └── calculator-form.tsx     # Composes the 3 inputs
    │   └── results/
    │       ├── summary-cards.tsx       # 4 comparison cards
    │       ├── comparison-chart.tsx    # Recharts stacked bar chart
    │       ├── cost-breakdown-table.tsx # TanStack Table with all line items
    │       ├── assumptions.tsx         # Collapsible calculation assumptions
    │       ├── non-core-banner.tsx     # Alert for Non-Core "pricing TBD" regions
    │       └── results-panel.tsx       # Composes all results components
    └── __tests__/
        ├── setup.ts                   # @testing-library/jest-dom import
        ├── smoke.test.ts              # Build sanity
        ├── types.test.ts              # Type contract verification
        ├── cloud-pricing.test.ts      # Static data integrity
        ├── vault-calculator.test.ts
        ├── diy-calculator.test.ts
        ├── comparison-engine.test.ts
        ├── format-utils.test.ts
        ├── api-client.test.ts
        ├── use-regions.test.tsx
        ├── site-header.test.tsx
        ├── site-footer.test.tsx
        ├── region-selector.test.tsx
        ├── term-selector.test.tsx
        ├── capacity-input.test.tsx
        ├── calculator-form.test.tsx
        ├── summary-cards.test.tsx
        ├── comparison-chart.test.tsx
        ├── cost-breakdown-table.test.tsx
        ├── assumptions.test.tsx
        ├── non-core-banner.test.tsx
        ├── results-panel.test.tsx
        ├── app.test.tsx
        └── reduced-motion.test.tsx
```

---

## Phase 0: Repository Bootstrap & Tooling

### Task 0.1: Scaffold Vite Project

**Files:**

- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold Vite React-TS template**

```bash
cd /home/localadmin/git/github/comnam90/vdc-vault-price-calculator
npm create vite@latest . -- --template react-ts
```

Accept overwrite prompts for existing files. This generates the base project.

- [ ] **Step 2: Install production dependencies**

```bash
npm install @tailwindcss/cli@^4.1.18 @tailwindcss/vite@^4.1.18 tailwindcss@^4.1.18 \
  class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.4.0 \
  lucide-react@^0.563.0 radix-ui@^1.4.3 \
  @tanstack/react-table@^8.21.3 recharts@^3.7.0
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D @commitlint/cli@^20.4.1 @commitlint/config-conventional@^20.4.1 \
  @testing-library/jest-dom@^6.9.1 @testing-library/react@^16.3.2 \
  @vitest/coverage-v8@^4.0.18 vitest@^4.0.18 jsdom@^28.0.0 \
  husky@^9.1.7 lint-staged@^16.2.7 \
  prettier@^3.8.1 prettier-plugin-tailwindcss@^0.7.2 \
  shadcn@^3.8.3 tw-animate-css@^1.4.0 \
  autoprefixer@^10.4.24 postcss@^8.5.6
```

- [ ] **Step 4: Verify install succeeds**

```bash
npm ls --depth=0
```

Expected: No missing peer dependencies.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite react-ts project with dependencies"
```

---

### Task 0.2: Configure TypeScript, ESLint, Prettier, Commitlint

**Files:**

- Modify: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`
- Create: `.prettierrc`, `commitlint.config.js`

- [ ] **Step 1: Replace tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 2: Replace tsconfig.app.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client", "vitest/globals"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Replace tsconfig.node.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Replace eslint.config.js**

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
```

- [ ] **Step 5: Create .prettierrc**

```json
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 6: Create commitlint.config.js**

```js
export default { extends: ["@commitlint/config-conventional"] };
```

- [ ] **Step 7: Add lint-staged config to package.json**

Add to `package.json`:

```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx,cjs,mjs,json,md}": ["prettier --write"]
  }
}
```

- [ ] **Step 8: Add scripts to package.json**

Ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "prepare": "husky",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 9: Verify lint passes**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: configure typescript, eslint, prettier, and commitlint"
```

---

### Task 0.3: Configure Vite, Tailwind, and Vitest

**Files:**

- Modify: `vite.config.ts`, `src/index.css`, `src/main.tsx`, `index.html`
- Create: `src/lib/utils.ts`, `src/__tests__/setup.ts`

- [ ] **Step 1: Replace vite.config.ts**

```ts
import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf-8"),
);
const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(commitHash),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.ts",
  },
});
```

- [ ] **Step 2: Replace index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
    />
    <title>VDC Vault Price Calculator</title>
    <meta
      name="description"
      content="Unofficial Veeam Data Cloud Vault TCO comparison tool. Compare VDC Vault costs against DIY cloud storage across 60+ regions."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Replace src/index.css**

Copy the full `index.css` from `vdc-vault-readiness` (Veeam brand palette, motion tokens, @theme inline block, @layer base). Remove the project-specific keyframes (`attention-pulse`, `success-ring`, `drag-pulse`, `shake`, `celebrate-in`) — those are specific to the readiness app. Keep:

- Tailwind imports (`@import "tailwindcss"`, `@import "tw-animate-css"`)
- `:root` CSS variables (radius, motion tokens, Veeam palette, semantic tokens, chart colors)
- Dark mode overrides (`@media (prefers-color-scheme: dark)`)
- `@theme inline` block (font, radius, color mappings)
- `@layer base` block (scrollbar-gutter, border, body)

- [ ] **Step 4: Replace src/main.tsx**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 5: Replace src/App.tsx with placeholder**

```tsx
function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <h1 className="p-8 text-2xl font-semibold">VDC Vault Price Calculator</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Create src/lib/utils.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Create src/**tests**/setup.ts**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 8: Verify build passes**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: configure vite, tailwind v4, vitest, and veeam theme"
```

---

### Task 0.4: Set Up Husky, shadcn/ui, and CI Workflows

**Files:**

- Create: `.husky/pre-commit`, `.husky/commit-msg`, `components.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/publish.yml`

- [ ] **Step 1: Initialize Husky**

```bash
npx husky init
```

- [ ] **Step 2: Write .husky/pre-commit**

```bash
npx lint-staged
```

- [ ] **Step 3: Write .husky/commit-msg**

```bash
npx --no -- commitlint --edit $1
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: style = new-york, base color = neutral, CSS variables = yes. This creates `components.json`. Verify it matches:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

- [ ] **Step 5: Install shadcn base components**

```bash
npx shadcn@latest add button card select input label tooltip badge separator table tabs alert popover command collapsible scroll-area
```

- [ ] **Step 6: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request: {}

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6.0.2

      - name: Setup Node
        uses: actions/setup-node@v6.2.0
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm install --yes

      - name: Lint
        run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6.0.2

      - name: Setup Node
        uses: actions/setup-node@v6.2.0
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm install --yes

      - name: Test
        run: npm run test:run
```

- [ ] **Step 7: Create .github/workflows/release.yml**

```yaml
name: Release Please

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write
  deployments: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          release-type: node

  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    needs: release-please
    if: ${{ needs.release-please.outputs.release_created == 'true' }}
    steps:
      - uses: actions/checkout@v4

      - name: Install & Build
        run: |
          npm install
          npm run build

      - name: Deploy to Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./dist --project-name=vdc-vault-price-calculator --branch=main
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 8: Create .github/workflows/publish.yml**

```yaml
name: Deploy to Cloudflare Pages (Manual)

on:
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - name: Install & Build
        run: |
          npm install
          npm run build

      - name: Deploy to Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./dist --project-name=vdc-vault-price-calculator --branch=main
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add husky hooks, shadcn/ui, and ci/cd workflows"
```

---

### Task 0.5: Smoke Test

**Files:**

- Create: `src/__tests__/smoke.test.ts`

- [ ] **Step 1: Write the smoke test**

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("can import App", async () => {
    const mod = await import("@/App");
    expect(mod.default).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm run test:run
```

Expected: 1 test PASS.

- [ ] **Step 3: Verify full build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/smoke.test.ts
git commit -m "test: add smoke test"
```

- [ ] **Step 5: Push all Phase 0 work**

```bash
git push
```

---

## Phase 1: Type System & Static Data

### Task 1.1: Define Core Types

**Files:**

- Create: `src/types/region.ts`, `src/types/pricing.ts`, `src/types/calculator.ts`

- [ ] **Step 1: Create src/types/region.ts**

```ts
export type CloudProvider = "AWS" | "Azure";
export type VaultEdition = "Foundation" | "Advanced";
export type VaultTier = "Core" | "Non-Core";

export interface VaultService {
  edition: VaultEdition;
  tier: VaultTier;
}

export interface Region {
  id: string;
  name: string;
  provider: CloudProvider;
  coords: [number, number];
  aliases: string[];
  services: {
    vdc_vault: VaultService[];
  };
}
```

- [ ] **Step 2: Create src/types/pricing.ts**

```ts
import type { CloudProvider, VaultEdition, VaultTier } from "./region";

export interface CloudStoragePricing {
  /** Storage cost per GB per month */
  storagePerGbMonth: number;
  /** Write operations cost — per 10K ops (Azure) or per 1K ops (AWS) */
  writeOpsCost: number;
  /** Read operations cost — per 10K ops (Azure) or per 1K ops (AWS) */
  readOpsCost: number;
  /** Operations denominator: 10000 for Azure, 1000 for AWS */
  opsBatchSize: number;
  /** Data retrieval cost per GB (0 for hot/standard tiers) */
  retrievalPerGb: number;
  /** Internet egress cost per GB */
  egressPerGb: number;
}

export interface RegionCloudPricing {
  regionId: string;
  provider: CloudProvider;
  /** Azure Hot or AWS S3 Standard */
  option1: CloudStoragePricing;
  /** Azure Cool or AWS S3 Infrequent Access */
  option2: CloudStoragePricing;
  option1Label: string;
  option2Label: string;
}

export interface VaultPricing {
  edition: VaultEdition;
  tier: VaultTier;
  /** USD per TB per month. 0 means pricing TBD. */
  pricePerTbMonth: number;
}
```

- [ ] **Step 3: Create src/types/calculator.ts**

```ts
export interface CalculatorInputs {
  regionId: string;
  termYears: number;
  capacityTiB: number;
}

export interface CostBreakdown {
  storage: number;
  writeOps: number;
  readOps: number;
  dataRetrieval: number;
  internetEgress: number;
  total: number;
}

export interface VaultCostResult {
  /** Total cost over term, or null if edition not available / pricing TBD */
  total: number | null;
  /** Monthly cost per TB, or null */
  perTbMonth: number | null;
  /** True when tier is Non-Core and pricing is not yet set */
  pricingTbd: boolean;
}

export interface ComparisonResult {
  vaultFoundation: VaultCostResult;
  vaultAdvanced: VaultCostResult;
  diyOption1: CostBreakdown;
  diyOption2: CostBreakdown;
  diyOption1Label: string;
  diyOption2Label: string;
}
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat(types): define region, pricing, and calculator types"
```

---

### Task 1.2: Add Constants

**Files:**

- Create: `src/lib/constants.ts`

- [ ] **Step 1: Create src/lib/constants.ts**

```ts
export const VDC_API_BASE = "https://vdcmap.bcthomas.com/api/v1";

/** Each write/read operation processes 1 MB of data */
export const OPERATION_SIZE_MB = 1;

/** 20% of stored data is read back per year */
export const ANNUAL_READ_FACTOR = 0.2;

/** 20% of stored data is egressed per year */
export const ANNUAL_EGRESS_FACTOR = 0.2;

/** 1 TiB = 1024 GB */
export const TIB_TO_GB = 1024;

/** 1 TiB = 1,048,576 MB */
export const TIB_TO_MB = 1024 * 1024;

/** Months per year */
export const MONTHS_PER_YEAR = 12;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat(lib): add calculator constants"
```

---

### Task 1.3: Add Vault Pricing Data

**Files:**

- Create: `src/data/vault-pricing.ts`

- [ ] **Step 1: Create src/data/vault-pricing.ts**

```ts
import type { VaultPricing } from "@/types/pricing";

/**
 * VDC Vault pricing per TB per month (USD).
 * Source: Veeam published RRP.
 * Non-Core pricing is TBD — set to 0 as placeholder.
 */
export const VAULT_PRICING: VaultPricing[] = [
  { edition: "Foundation", tier: "Core", pricePerTbMonth: 14 },
  { edition: "Advanced", tier: "Core", pricePerTbMonth: 24 },
  { edition: "Foundation", tier: "Non-Core", pricePerTbMonth: 0 },
  { edition: "Advanced", tier: "Non-Core", pricePerTbMonth: 0 },
];

/**
 * Look up vault price for a given edition + tier combo.
 * Returns the pricing entry or undefined if not found.
 */
export function getVaultPrice(
  edition: string,
  tier: string,
): VaultPricing | undefined {
  return VAULT_PRICING.find((p) => p.edition === edition && p.tier === tier);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/vault-pricing.ts
git commit -m "feat(data): add vault pricing table"
```

---

### Task 1.4: Add Cloud Pricing Data

**Files:**

- Create: `src/data/cloud-pricing.ts`

This is the largest static data file. It maps each VDC API region ID to its corresponding Azure/AWS storage pricing. The region IDs from the VDC API (`aws-us-east-1`, `azure-us-east`, etc.) are used directly as keys.

- [ ] **Step 1: Create src/data/cloud-pricing.ts**

Create the file with a `Record<string, RegionCloudPricing>` export. For each of the 62 VDC Vault regions, include `option1` (Hot/Standard) and `option2` (Cool/IA) pricing.

**Key pricing baselines (USD, as of early 2026):**

AWS regions (S3):

- `opsBatchSize`: 1000
- Standard: storage ~$0.023/GB/mo, PUT $0.005/1K, GET $0.0004/1K, retrieval $0, egress $0.09/GB
- IA: storage ~$0.0125/GB/mo, PUT $0.01/1K, GET $0.001/1K, retrieval $0.01/GB, egress $0.09/GB
- Regional variations: AP/SA/ME regions ~10-25% higher

Azure regions (Blob LRS):

- `opsBatchSize`: 10000
- Hot: storage ~$0.0208/GB/mo, write $0.055/10K, read $0.0044/10K, retrieval $0, egress $0.087/GB
- Cool: storage ~$0.0115/GB/mo, write $0.10/10K, read $0.01/10K, retrieval $0.01/GB, egress $0.087/GB
- Regional variations: non-US regions vary 10-30%

Structure each entry as:

```ts
"aws-us-east-1": {
  regionId: "aws-us-east-1",
  provider: "AWS",
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  },
  option2: {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.09,
  },
},
```

For Azure regions use:

```ts
"azure-us-east": {
  regionId: "azure-us-east",
  provider: "Azure",
  option1Label: "Blob Hot",
  option2Label: "Blob Cool",
  option1: {
    storagePerGbMonth: 0.0208,
    writeOpsCost: 0.055,
    readOpsCost: 0.0044,
    opsBatchSize: 10000,
    retrievalPerGb: 0,
    egressPerGb: 0.087,
  },
  option2: {
    storagePerGbMonth: 0.0115,
    writeOpsCost: 0.10,
    readOpsCost: 0.01,
    opsBatchSize: 10000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.087,
  },
},
```

Include all 62 regions from the VDC API. Research the correct regional pricing for each — major regions have distinct pricing. When exact regional pricing is unclear, use the closest available published rate.

Add a file-level comment:

```ts
/**
 * Static cloud storage pricing data keyed by VDC API region ID.
 * Source: Published Azure Blob Storage and AWS S3 list prices (approximate).
 * Last updated: YYYY-MM-DD
 *
 * DISCLAIMER: This is unofficial. Prices are approximate public list prices
 * and do not account for discounts, reserved capacity, or negotiated rates.
 */
```

- [ ] **Step 2: Commit**

```bash
git add src/data/cloud-pricing.ts
git commit -m "feat(data): add static cloud storage pricing for all regions"
```

---

### Task 1.5: Type Contract and Data Integrity Tests

**Files:**

- Create: `src/__tests__/types.test.ts`, `src/__tests__/cloud-pricing.test.ts`

- [ ] **Step 1: Write src/**tests**/types.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { VAULT_PRICING } from "@/data/vault-pricing";
import { CLOUD_PRICING } from "@/data/cloud-pricing";

describe("type contracts", () => {
  it("vault pricing entries have non-negative prices", () => {
    for (const entry of VAULT_PRICING) {
      expect(entry.pricePerTbMonth).toBeGreaterThanOrEqual(0);
    }
  });

  it("vault pricing covers all 4 edition/tier combos", () => {
    expect(VAULT_PRICING).toHaveLength(4);
    const keys = VAULT_PRICING.map((p) => `${p.edition}-${p.tier}`);
    expect(keys).toContain("Foundation-Core");
    expect(keys).toContain("Advanced-Core");
    expect(keys).toContain("Foundation-Non-Core");
    expect(keys).toContain("Advanced-Non-Core");
  });

  it("cloud pricing region IDs are lowercase-hyphenated", () => {
    for (const regionId of Object.keys(CLOUD_PRICING)) {
      expect(regionId).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("cloud pricing provider matches region ID prefix", () => {
    for (const [regionId, pricing] of Object.entries(CLOUD_PRICING)) {
      if (regionId.startsWith("aws-")) {
        expect(pricing.provider).toBe("AWS");
      } else if (regionId.startsWith("azure-")) {
        expect(pricing.provider).toBe("Azure");
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/types.test.ts
```

- [ ] **Step 3: Write src/**tests**/cloud-pricing.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { CLOUD_PRICING } from "@/data/cloud-pricing";

describe("cloud pricing data integrity", () => {
  const entries = Object.entries(CLOUD_PRICING);

  it("has pricing for at least 60 regions", () => {
    expect(entries.length).toBeGreaterThanOrEqual(60);
  });

  it("every entry has required fields with valid numbers", () => {
    for (const [regionId, pricing] of entries) {
      expect(pricing.regionId).toBe(regionId);
      for (const option of [pricing.option1, pricing.option2]) {
        expect(option.storagePerGbMonth).toBeGreaterThan(0);
        expect(option.writeOpsCost).toBeGreaterThan(0);
        expect(option.readOpsCost).toBeGreaterThan(0);
        expect(option.opsBatchSize).toBeGreaterThan(0);
        expect(option.retrievalPerGb).toBeGreaterThanOrEqual(0);
        expect(option.egressPerGb).toBeGreaterThan(0);
        expect(Number.isFinite(option.storagePerGbMonth)).toBe(true);
      }
    }
  });

  it("option1 storage rate >= option2 storage rate (hot/standard costs more)", () => {
    for (const [, pricing] of entries) {
      expect(pricing.option1.storagePerGbMonth).toBeGreaterThanOrEqual(
        pricing.option2.storagePerGbMonth,
      );
    }
  });

  it("AWS regions use 1000 ops batch size", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "AWS") {
        expect(pricing.option1.opsBatchSize).toBe(1000);
        expect(pricing.option2.opsBatchSize).toBe(1000);
      }
    }
  });

  it("Azure regions use 10000 ops batch size", () => {
    for (const [, pricing] of entries) {
      if (pricing.provider === "Azure") {
        expect(pricing.option1.opsBatchSize).toBe(10000);
        expect(pricing.option2.opsBatchSize).toBe(10000);
      }
    }
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npm run test:run -- src/__tests__/types.test.ts src/__tests__/cloud-pricing.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/types.test.ts src/__tests__/cloud-pricing.test.ts
git commit -m "test: add type contract and pricing data integrity tests"
```

- [ ] **Step 6: Push Phase 1**

```bash
git push
```

---

## Phase 2: Calculation Engine (Pure Logic, TDD)

### Task 2.1: Vault Cost Calculator

**Files:**

- Create: `src/__tests__/vault-calculator.test.ts`, `src/lib/vault-calculator.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { calculateVaultCost } from "@/lib/vault-calculator";

describe("calculateVaultCost", () => {
  it("calculates Core Foundation cost correctly", () => {
    // 10 TiB * $14/TB/mo * 36 months = $5,040
    const result = calculateVaultCost(10, 3, "Foundation", "Core");
    expect(result.total).toBe(5040);
    expect(result.perTbMonth).toBe(14);
    expect(result.pricingTbd).toBe(false);
  });

  it("calculates Core Advanced cost correctly", () => {
    // 10 TiB * $24/TB/mo * 12 months = $2,880
    const result = calculateVaultCost(10, 1, "Advanced", "Core");
    expect(result.total).toBe(2880);
    expect(result.perTbMonth).toBe(24);
  });

  it("returns pricingTbd for Non-Core editions", () => {
    const result = calculateVaultCost(10, 1, "Foundation", "Non-Core");
    expect(result.total).toBeNull();
    expect(result.perTbMonth).toBeNull();
    expect(result.pricingTbd).toBe(true);
  });

  it("returns null when edition/tier combo not found", () => {
    // This shouldn't happen in practice but handles gracefully
    const result = calculateVaultCost(
      10,
      1,
      "Foundation" as string,
      "Unknown" as string,
    );
    expect(result.total).toBeNull();
  });

  it("handles 1 TiB for 1 year", () => {
    // 1 TiB * $14/TB/mo * 12 = $168
    const result = calculateVaultCost(1, 1, "Foundation", "Core");
    expect(result.total).toBe(168);
  });

  it("handles 5 year term", () => {
    // 100 TiB * $24/TB/mo * 60 months = $144,000
    const result = calculateVaultCost(100, 5, "Advanced", "Core");
    expect(result.total).toBe(144000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/__tests__/vault-calculator.test.ts
```

Expected: FAIL — `calculateVaultCost` not defined.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { VaultCostResult } from "@/types/calculator";
import { getVaultPrice } from "@/data/vault-pricing";
import { MONTHS_PER_YEAR } from "./constants";

/**
 * Calculate total VDC Vault cost over the term.
 *
 * @param capacityTiB - Storage capacity in TiB
 * @param termYears - Contract term in years (1-5)
 * @param edition - "Foundation" or "Advanced"
 * @param tier - "Core" or "Non-Core"
 * @returns VaultCostResult with total, perTbMonth, and pricingTbd flag
 */
export function calculateVaultCost(
  capacityTiB: number,
  termYears: number,
  edition: string,
  tier: string,
): VaultCostResult {
  const pricing = getVaultPrice(edition, tier);

  if (!pricing) {
    return { total: null, perTbMonth: null, pricingTbd: false };
  }

  if (pricing.pricePerTbMonth === 0) {
    return { total: null, perTbMonth: null, pricingTbd: true };
  }

  const termMonths = termYears * MONTHS_PER_YEAR;
  const total = capacityTiB * pricing.pricePerTbMonth * termMonths;

  return {
    total,
    perTbMonth: pricing.pricePerTbMonth,
    pricingTbd: false,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/vault-calculator.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/vault-calculator.test.ts src/lib/vault-calculator.ts
git commit -m "feat(calc): implement vault cost calculator with tests"
```

---

### Task 2.2: DIY Cloud Cost Calculator

**Files:**

- Create: `src/__tests__/diy-calculator.test.ts`, `src/lib/diy-calculator.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import {
  calculateStorageCost,
  calculateWriteOpsCost,
  calculateReadOpsCost,
  calculateRetrievalCost,
  calculateEgressCost,
  calculateDiyCost,
} from "@/lib/diy-calculator";
import type { CloudStoragePricing } from "@/types/pricing";

describe("individual cost functions", () => {
  describe("calculateStorageCost", () => {
    it("calculates storage for 10 TiB over 36 months at $0.023/GB/mo", () => {
      // 10 * 1024 GB * $0.023 * 36 = $8,478.72
      const result = calculateStorageCost(10, 0.023, 36);
      expect(result).toBeCloseTo(8478.72, 2);
    });
  });

  describe("calculateWriteOpsCost", () => {
    it("calculates write ops for 10 TiB over 36 months (AWS)", () => {
      // capacity in MB = 10 * 1024 * 1024 = 10,485,760 MB
      // ops per month = 10,485,760 / 1 MB = 10,485,760 ops
      // cost per op = $0.005 / 1000 = $0.000005
      // total = 10,485,760 * $0.000005 * 36 = $1,887.44
      const result = calculateWriteOpsCost(10, 0.005, 1000, 36);
      expect(result).toBeCloseTo(1887.4368, 2);
    });

    it("calculates write ops for Azure (per 10K batch)", () => {
      // ops per month = 10,485,760
      // cost per op = $0.055 / 10000 = $0.0000055
      // total = 10,485,760 * $0.0000055 * 36 = $2,076.18
      const result = calculateWriteOpsCost(10, 0.055, 10000, 36);
      expect(result).toBeCloseTo(2076.1805, 2);
    });
  });

  describe("calculateReadOpsCost", () => {
    it("calculates read ops for 10 TiB over 3 years (AWS)", () => {
      // capacity in MB = 10,485,760
      // read ops per year = 10,485,760 * 0.20 = 2,097,152
      // cost per op = $0.0004 / 1000 = $0.0000004
      // total = 2,097,152 * $0.0000004 * 3 = $2.52
      const result = calculateReadOpsCost(10, 0.0004, 1000, 3);
      expect(result).toBeCloseTo(2.5166, 2);
    });
  });

  describe("calculateRetrievalCost", () => {
    it("returns 0 when retrieval rate is 0 (hot/standard)", () => {
      const result = calculateRetrievalCost(10, 0, 3);
      expect(result).toBe(0);
    });

    it("calculates retrieval for IA tier", () => {
      // 10 TiB * 1024 GB * 20% * $0.01/GB * 3 years = $61.44
      const result = calculateRetrievalCost(10, 0.01, 3);
      expect(result).toBeCloseTo(61.44, 2);
    });
  });

  describe("calculateEgressCost", () => {
    it("calculates egress for 10 TiB over 3 years", () => {
      // 10 * 1024 * 0.20 * $0.09 * 3 = $552.96
      const result = calculateEgressCost(10, 0.09, 3);
      expect(result).toBeCloseTo(552.96, 2);
    });
  });
});

describe("calculateDiyCost", () => {
  const awsStandard: CloudStoragePricing = {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  };

  it("returns a CostBreakdown with all 5 components and total", () => {
    const result = calculateDiyCost(10, 3, awsStandard);
    expect(result.storage).toBeGreaterThan(0);
    expect(result.writeOps).toBeGreaterThan(0);
    expect(result.readOps).toBeGreaterThan(0);
    expect(result.dataRetrieval).toBe(0); // Standard has no retrieval cost
    expect(result.internetEgress).toBeGreaterThan(0);
    expect(result.total).toBeCloseTo(
      result.storage +
        result.writeOps +
        result.readOps +
        result.dataRetrieval +
        result.internetEgress,
      2,
    );
  });

  it("1 TiB for 1 year produces sensible results", () => {
    const result = calculateDiyCost(1, 1, awsStandard);
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(10000); // sanity check
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/__tests__/diy-calculator.test.ts
```

Expected: FAIL — functions not defined.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { CloudStoragePricing } from "@/types/pricing";
import type { CostBreakdown } from "@/types/calculator";
import {
  TIB_TO_GB,
  TIB_TO_MB,
  OPERATION_SIZE_MB,
  ANNUAL_READ_FACTOR,
  ANNUAL_EGRESS_FACTOR,
  MONTHS_PER_YEAR,
} from "./constants";

/**
 * Storage cost = capacity_GB * rate/GB/mo * term_months
 */
export function calculateStorageCost(
  capacityTiB: number,
  ratePerGbMonth: number,
  termMonths: number,
): number {
  return capacityTiB * TIB_TO_GB * ratePerGbMonth * termMonths;
}

/**
 * Write ops = (capacity_MB / operation_size_MB) * cost_per_op * term_months
 * cost_per_op = opsCost / opsBatchSize
 */
export function calculateWriteOpsCost(
  capacityTiB: number,
  opsCost: number,
  opsBatchSize: number,
  termMonths: number,
): number {
  const opsPerMonth = (capacityTiB * TIB_TO_MB) / OPERATION_SIZE_MB;
  const costPerOp = opsCost / opsBatchSize;
  return opsPerMonth * costPerOp * termMonths;
}

/**
 * Read ops = (capacity_MB * read_factor / operation_size_MB) * cost_per_op * term_years
 */
export function calculateReadOpsCost(
  capacityTiB: number,
  opsCost: number,
  opsBatchSize: number,
  termYears: number,
): number {
  const opsPerYear =
    (capacityTiB * TIB_TO_MB * ANNUAL_READ_FACTOR) / OPERATION_SIZE_MB;
  const costPerOp = opsCost / opsBatchSize;
  return opsPerYear * costPerOp * termYears;
}

/**
 * Data retrieval = capacity_GB * read_factor * rate/GB * term_years
 */
export function calculateRetrievalCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
): number {
  return capacityTiB * TIB_TO_GB * ANNUAL_READ_FACTOR * ratePerGb * termYears;
}

/**
 * Internet egress = capacity_GB * egress_factor * rate/GB * term_years
 */
export function calculateEgressCost(
  capacityTiB: number,
  ratePerGb: number,
  termYears: number,
): number {
  return capacityTiB * TIB_TO_GB * ANNUAL_EGRESS_FACTOR * ratePerGb * termYears;
}

/**
 * Calculate full DIY cloud cost breakdown.
 */
export function calculateDiyCost(
  capacityTiB: number,
  termYears: number,
  pricing: CloudStoragePricing,
): CostBreakdown {
  const termMonths = termYears * MONTHS_PER_YEAR;

  const storage = calculateStorageCost(
    capacityTiB,
    pricing.storagePerGbMonth,
    termMonths,
  );
  const writeOps = calculateWriteOpsCost(
    capacityTiB,
    pricing.writeOpsCost,
    pricing.opsBatchSize,
    termMonths,
  );
  const readOps = calculateReadOpsCost(
    capacityTiB,
    pricing.readOpsCost,
    pricing.opsBatchSize,
    termYears,
  );
  const dataRetrieval = calculateRetrievalCost(
    capacityTiB,
    pricing.retrievalPerGb,
    termYears,
  );
  const internetEgress = calculateEgressCost(
    capacityTiB,
    pricing.egressPerGb,
    termYears,
  );

  return {
    storage,
    writeOps,
    readOps,
    dataRetrieval,
    internetEgress,
    total: storage + writeOps + readOps + dataRetrieval + internetEgress,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/diy-calculator.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/diy-calculator.test.ts src/lib/diy-calculator.ts
git commit -m "feat(calc): implement DIY cloud cost calculator with tests"
```

---

### Task 2.3: Comparison Engine

**Files:**

- Create: `src/__tests__/comparison-engine.test.ts`, `src/lib/comparison-engine.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { buildComparison } from "@/lib/comparison-engine";
import type { Region } from "@/types/region";
import type { RegionCloudPricing } from "@/types/pricing";

const coreRegion: Region = {
  id: "aws-us-east-1",
  name: "US East 1 (N. Virginia)",
  provider: "AWS",
  coords: [38.9, -77.4],
  aliases: [],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Core" },
      { edition: "Advanced", tier: "Core" },
    ],
  },
};

const nonCoreRegion: Region = {
  id: "azure-us-east",
  name: "East US (Virginia)",
  provider: "Azure",
  coords: [37.37, -79.82],
  aliases: [],
  services: {
    vdc_vault: [
      { edition: "Foundation", tier: "Non-Core" },
      { edition: "Advanced", tier: "Non-Core" },
    ],
  },
};

const advancedOnlyRegion: Region = {
  id: "aws-ap-east-1",
  name: "AP East 1 (Hong Kong)",
  provider: "AWS",
  coords: [22.32, 113.9],
  aliases: [],
  services: {
    vdc_vault: [{ edition: "Advanced", tier: "Core" }],
  },
};

const awsPricing: RegionCloudPricing = {
  regionId: "aws-us-east-1",
  provider: "AWS",
  option1Label: "S3 Standard",
  option2Label: "S3 Infrequent Access",
  option1: {
    storagePerGbMonth: 0.023,
    writeOpsCost: 0.005,
    readOpsCost: 0.0004,
    opsBatchSize: 1000,
    retrievalPerGb: 0,
    egressPerGb: 0.09,
  },
  option2: {
    storagePerGbMonth: 0.0125,
    writeOpsCost: 0.01,
    readOpsCost: 0.001,
    opsBatchSize: 1000,
    retrievalPerGb: 0.01,
    egressPerGb: 0.09,
  },
};

describe("buildComparison", () => {
  it("returns 4-way comparison for a Core region", () => {
    const result = buildComparison(
      { regionId: "aws-us-east-1", termYears: 3, capacityTiB: 10 },
      coreRegion,
      awsPricing,
    );

    expect(result.vaultFoundation.total).toBe(5040);
    expect(result.vaultAdvanced.total).toBe(8640);
    expect(result.diyOption1.total).toBeGreaterThan(0);
    expect(result.diyOption2.total).toBeGreaterThan(0);
    expect(result.diyOption1Label).toBe("S3 Standard");
    expect(result.diyOption2Label).toBe("S3 Infrequent Access");
  });

  it("returns pricingTbd for Non-Core regions", () => {
    // Note: pricing values are synthetic for this test — we only need to verify
    // that Non-Core tier returns pricingTbd and DIY costs still calculate.
    const azurePricing: RegionCloudPricing = {
      ...awsPricing,
      regionId: "azure-us-east",
      provider: "Azure",
      option1Label: "Blob Hot",
      option2Label: "Blob Cool",
    };

    const result = buildComparison(
      { regionId: "azure-us-east", termYears: 1, capacityTiB: 5 },
      nonCoreRegion,
      azurePricing,
    );

    expect(result.vaultFoundation.pricingTbd).toBe(true);
    expect(result.vaultFoundation.total).toBeNull();
    expect(result.vaultAdvanced.pricingTbd).toBe(true);
    // DIY costs should still be calculated
    expect(result.diyOption1.total).toBeGreaterThan(0);
  });

  it("returns null Foundation for Advanced-only region", () => {
    const result = buildComparison(
      { regionId: "aws-ap-east-1", termYears: 1, capacityTiB: 10 },
      advancedOnlyRegion,
      awsPricing,
    );

    expect(result.vaultFoundation.total).toBeNull();
    expect(result.vaultFoundation.pricingTbd).toBe(false);
    expect(result.vaultAdvanced.total).toBe(2880);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- src/__tests__/comparison-engine.test.ts
```

- [ ] **Step 3: Write minimal implementation**

```ts
import type {
  CalculatorInputs,
  ComparisonResult,
  VaultCostResult,
} from "@/types/calculator";
import type { Region } from "@/types/region";
import type { RegionCloudPricing } from "@/types/pricing";
import { calculateVaultCost } from "./vault-calculator";
import { calculateDiyCost } from "./diy-calculator";

/**
 * Build a 4-way TCO comparison for the given inputs.
 */
export function buildComparison(
  inputs: CalculatorInputs,
  region: Region,
  cloudPricing: RegionCloudPricing,
): ComparisonResult {
  const { termYears, capacityTiB } = inputs;
  const vaultServices = region.services.vdc_vault;

  const foundationService = vaultServices.find(
    (s) => s.edition === "Foundation",
  );
  const advancedService = vaultServices.find((s) => s.edition === "Advanced");

  const vaultFoundation: VaultCostResult = foundationService
    ? calculateVaultCost(
        capacityTiB,
        termYears,
        foundationService.edition,
        foundationService.tier,
      )
    : { total: null, perTbMonth: null, pricingTbd: false };

  const vaultAdvanced: VaultCostResult = advancedService
    ? calculateVaultCost(
        capacityTiB,
        termYears,
        advancedService.edition,
        advancedService.tier,
      )
    : { total: null, perTbMonth: null, pricingTbd: false };

  const diyOption1 = calculateDiyCost(
    capacityTiB,
    termYears,
    cloudPricing.option1,
  );
  const diyOption2 = calculateDiyCost(
    capacityTiB,
    termYears,
    cloudPricing.option2,
  );

  return {
    vaultFoundation,
    vaultAdvanced,
    diyOption1,
    diyOption2,
    diyOption1Label: cloudPricing.option1Label,
    diyOption2Label: cloudPricing.option2Label,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/comparison-engine.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/comparison-engine.test.ts src/lib/comparison-engine.ts
git commit -m "feat(calc): implement 4-way comparison engine with tests"
```

---

### Task 2.4: Formatting Utilities

**Files:**

- Create: `src/__tests__/format-utils.test.ts`, `src/lib/format-utils.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import {
  formatUSD,
  formatUSDCompact,
  formatPerTbMonth,
} from "@/lib/format-utils";

describe("formatUSD", () => {
  it("formats whole numbers", () => {
    expect(formatUSD(1234)).toBe("$1,234.00");
  });

  it("formats decimals", () => {
    expect(formatUSD(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0.00");
  });

  it("formats large numbers", () => {
    expect(formatUSD(1234567.89)).toBe("$1,234,567.89");
  });
});

describe("formatUSDCompact", () => {
  it("formats thousands", () => {
    expect(formatUSDCompact(1234)).toBe("$1.2K");
  });

  it("formats millions", () => {
    expect(formatUSDCompact(1234567)).toBe("$1.2M");
  });

  it("formats small numbers without compact", () => {
    expect(formatUSDCompact(42)).toBe("$42");
  });
});

describe("formatPerTbMonth", () => {
  it("formats per-TB monthly rate", () => {
    expect(formatPerTbMonth(14)).toBe("$14/TB/mo");
  });

  it("returns TBD for null", () => {
    expect(formatPerTbMonth(null)).toBe("TBD");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

```ts
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumSignificantDigits: 2,
});

export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

export function formatUSDCompact(value: number): string {
  return usdCompactFormatter.format(value);
}

export function formatPerTbMonth(value: number | null): string {
  if (value === null) return "TBD";
  return `$${value}/TB/mo`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/format-utils.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/format-utils.test.ts src/lib/format-utils.ts
git commit -m "feat(lib): implement formatting utilities with tests"
```

- [ ] **Step 6: Push Phase 2**

```bash
git push
```

---

## Phase 3: API Integration

### Task 3.1: API Client

**Files:**

- Create: `src/__tests__/api-client.test.ts`, `src/lib/api-client.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRegions, clearRegionCache } from "@/lib/api-client";
import type { Region } from "@/types/region";

const mockRegions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East 1 (N. Virginia)",
    provider: "AWS",
    coords: [38.9, -77.4],
    aliases: [],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Core" }] },
  },
  {
    id: "azure-us-east",
    name: "East US (Virginia)",
    provider: "Azure",
    coords: [37.37, -79.82],
    aliases: [],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Non-Core" }] },
  },
];

beforeEach(() => {
  clearRegionCache();
  vi.restoreAllMocks();
});

describe("fetchRegions", () => {
  it("fetches and returns all regions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockRegions }),
      }),
    );

    const regions = await fetchRegions();
    expect(regions).toEqual(mockRegions);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("caches results after first fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: mockRegions }),
      }),
    );

    await fetchRegions();
    await fetchRegions();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(fetchRegions()).rejects.toThrow("API error: 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    await expect(fetchRegions()).rejects.toThrow("Network error");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Region } from "@/types/region";
import { VDC_API_BASE } from "./constants";

let cache: Region[] | null = null;

/**
 * Fetch all VDC Vault regions from the API.
 * Results are cached client-side after the first call.
 */
export async function fetchRegions(): Promise<Region[]> {
  if (cache) return cache;

  const res = await fetch(`${VDC_API_BASE}/regions?service=vdc_vault`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json = await res.json();
  cache = json.data as Region[];
  return cache;
}

export function clearRegionCache(): void {
  cache = null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/api-client.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/api-client.test.ts src/lib/api-client.ts
git commit -m "feat(api): implement region fetching with caching and tests"
```

---

### Task 3.2: useRegions Hook

**Files:**

- Create: `src/__tests__/use-regions.test.tsx`, `src/hooks/use-regions.ts`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRegions } from "@/hooks/use-regions";
import * as apiClient from "@/lib/api-client";
import type { Region } from "@/types/region";

const mockRegions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East 1",
    provider: "AWS",
    coords: [38.9, -77.4],
    aliases: [],
    services: { vdc_vault: [{ edition: "Foundation", tier: "Core" }] },
  },
];

vi.mock("@/lib/api-client");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useRegions", () => {
  it("starts in loading state", () => {
    vi.mocked(apiClient.fetchRegions).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useRegions());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.regions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("returns regions on success", async () => {
    vi.mocked(apiClient.fetchRegions).mockResolvedValue(mockRegions);
    const { result } = renderHook(() => useRegions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.regions).toEqual(mockRegions);
    expect(result.current.error).toBeNull();
  });

  it("returns error on failure", async () => {
    vi.mocked(apiClient.fetchRegions).mockRejectedValue(
      new Error("Network error"),
    );
    const { result } = renderHook(() => useRegions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.regions).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write minimal implementation**

```ts
import { useEffect, useState } from "react";
import type { Region } from "@/types/region";
import { fetchRegions } from "@/lib/api-client";

interface UseRegionsResult {
  regions: Region[];
  isLoading: boolean;
  error: string | null;
}

export function useRegions(): UseRegionsResult {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchRegions()
      .then((data) => {
        if (!cancelled) {
          setRegions(data);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { regions, isLoading, error };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- src/__tests__/use-regions.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/use-regions.test.tsx src/hooks/use-regions.ts
git commit -m "feat(hooks): implement useRegions hook with tests"
```

- [ ] **Step 6: Push Phase 3**

```bash
git push
```

---

## Phase 4: UI Components (Mobile-First, WCAG AA)

> Each component follows TDD: write test first, verify fail, implement, verify pass, commit. Tests use React Testing Library with `getByRole` → `getByText` → `getByTestId` priority.

### Task 4.1: Site Header & Footer

**Files:**

- Create: `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`
- Create: `src/__tests__/site-header.test.tsx`, `src/__tests__/site-footer.test.tsx`

- [ ] **Step 1: Write site-header test**

Test that it renders the app title and an "Unofficial" badge.

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement site-header**

Use shadcn `Badge` for the "Unofficial" indicator. Include a link to the GitHub repo. Use semantic `<header>` element.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Write site-footer test**

Test that it renders the disclaimer text ("Not affiliated with Veeam"), version (`__APP_VERSION__`), and commit hash (`__APP_COMMIT__`).

- [ ] **Step 6: Run test — verify FAIL**
- [ ] **Step 7: Implement site-footer**

Use semantic `<footer>`. Include: disclaimer, data sources note, version/commit display.

- [ ] **Step 8: Run test — verify PASS**
- [ ] **Step 9: Commit**

```bash
git add src/components/layout/ src/__tests__/site-header.test.tsx src/__tests__/site-footer.test.tsx
git commit -m "feat(ui): add site header and footer with disclaimer"
```

---

### Task 4.2: Region Selector

**Files:**

- Create: `src/components/calculator/region-selector.tsx`, `src/__tests__/region-selector.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders a combobox/select with placeholder text
- Shows loading skeleton while `isLoading` is true
- Groups options by provider (AWS, Azure) with group headings
- Displays region name in each option
- Calls `onRegionChange(region)` when a region is selected
- Keyboard navigable (`role="combobox"` or `role="listbox"`)

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement region-selector**

Use shadcn `Popover` + `Command` pattern (Combobox) for searchable dropdown:

- Group by provider with `CommandGroup` headings
- Show provider badge (AWS/Azure) next to region name
- Search filters by region name and aliases
- `aria-label="Select a region"`

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git add src/components/calculator/region-selector.tsx src/__tests__/region-selector.test.tsx
git commit -m "feat(ui): add searchable region selector with provider grouping"
```

---

### Task 4.3: Term Selector

**Files:**

- Create: `src/components/calculator/term-selector.tsx`, `src/__tests__/term-selector.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders 5 options labeled "1 Year" through "5 Years"
- Default selection is 1 year
- Calls `onTermChange(years)` when selection changes
- Has `role="radiogroup"` with `role="radio"` items
- Keyboard navigable (arrow keys)

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement term-selector**

Use a segmented control / toggle group with proper radio semantics. Mobile: buttons wrap. Desktop: single row.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git add src/components/calculator/term-selector.tsx src/__tests__/term-selector.test.tsx
git commit -m "feat(ui): add term length selector"
```

---

### Task 4.4: Capacity Input

**Files:**

- Create: `src/components/calculator/capacity-input.tsx`, `src/__tests__/capacity-input.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders a number input with "TiB" suffix label
- Has associated `<label>` element
- Calls `onCapacityChange(value)` on input change
- Rejects non-numeric input
- Has `min="1"` attribute

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement capacity-input**

Use shadcn `Input` with `type="number"`, `min={1}`, `step={1}`. Add inline "TiB" suffix using a flex container. `<Label htmlFor>` for accessibility.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git add src/components/calculator/capacity-input.tsx src/__tests__/capacity-input.test.tsx
git commit -m "feat(ui): add capacity input with validation"
```

---

### Task 4.5: Calculator Form

**Files:**

- Create: `src/components/calculator/calculator-form.tsx`, `src/__tests__/calculator-form.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders all 3 input components
- Passes region list from `useRegions()` to RegionSelector
- Shows loading state when regions are loading
- Calls parent callback with `CalculatorInputs` when all fields populated

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement calculator-form**

Compose `RegionSelector`, `TermSelector`, `CapacityInput` inside a shadcn `Card`. Responsive layout: stacked on mobile, row on larger screens. Wrap in `<form>` for semantics (no submit — inputs drive state immediately).

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git add src/components/calculator/calculator-form.tsx src/__tests__/calculator-form.test.tsx
git commit -m "feat(ui): compose calculator form"
```

---

### Task 4.6: Summary Cards

**Files:**

- Create: `src/components/results/summary-cards.tsx`, `src/__tests__/summary-cards.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders 4 cards with labels: "VDC Vault Foundation", "VDC Vault Advanced", `diyOption1Label`, `diyOption2Label`
- Shows formatted dollar total on each card
- Shows per-TB/month rate
- Shows "Pricing TBD" when `pricingTbd` is true
- Shows "N/A" when `total` is null and not TBD (edition not available)
- Highlights the cheapest option with a visual indicator

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement summary-cards**

4 shadcn `Card` components in a responsive grid (1 col on mobile, 2 on tablet, 4 on desktop). Each card shows: title, total cost (large), per-TB/month rate (small). Cheapest gets a subtle success tint (`bg-card-tint-success`).

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): add summary comparison cards"
```

---

### Task 4.7: Stacked Bar Comparison Chart

**Files:**

- Create: `src/components/results/comparison-chart.tsx`, `src/__tests__/comparison-chart.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders a Recharts `BarChart` (check for `role="img"` or chart container)
- Has 4 bars (or fewer if some Vault options are null/TBD)
- DIY bars are stacked with 5 segments (Storage, Write Ops, Read Ops, Retrieval, Egress)
- Vault bars are solid single color
- Has an `aria-label` for screen readers
- Chart is wrapped in `ResponsiveContainer`

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement comparison-chart**

Use Recharts:

- `ResponsiveContainer` for fluid width
- `BarChart` with `Bar` elements
- DIY bars use `stackId="diy1"` / `stackId="diy2"` with 5 `Bar` segments each
- Vault bars are single `Bar` elements
- Color palette from Veeam brand CSS variables
- `Tooltip` shows breakdown on hover
- Chart container has `role="img"` and `aria-label` describing the comparison

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): add stacked bar comparison chart"
```

---

### Task 4.8: Cost Breakdown Table

**Files:**

- Create: `src/components/results/cost-breakdown-table.tsx`, `src/__tests__/cost-breakdown-table.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Renders a table with column headers: Category, VDC Foundation, VDC Advanced, DIY Option 1, DIY Option 2
- Has rows: Storage, Write Operations, Read Operations, Data Retrieval, Internet Egress, **Total**
- Vault columns show "--" for individual line items (only total is meaningful)
- Total row is bold
- Shows "TBD" for Non-Core Vault cells
- Shows "N/A" for unavailable editions

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement cost-breakdown-table**

Use TanStack Table with shadcn `Table` components. Define columns with `createColumnHelper`. Total row uses `tfoot`. Format all currency values with `formatUSD()`.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): add cost breakdown table"
```

---

### Task 4.9: Assumptions Panel & Non-Core Banner

**Files:**

- Create: `src/components/results/assumptions.tsx`, `src/components/results/non-core-banner.tsx`
- Create: `src/__tests__/assumptions.test.tsx`, `src/__tests__/non-core-banner.test.tsx`

- [ ] **Step 1: Write assumptions test**

Test:

- Renders a collapsible section (shadcn `Collapsible` or `details`/`summary`)
- Lists: "1 MB operation size", "20% annual read-back", "20% annual egress", pricing disclaimer

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement assumptions**
- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Write non-core-banner test**

Test:

- Hidden when `pricingTbd` is false for both Vault results
- Shows alert when either Vault result has `pricingTbd: true`
- Contains explanatory text about Non-Core pricing not yet announced

- [ ] **Step 6: Run test — verify FAIL**
- [ ] **Step 7: Implement non-core-banner**

Use shadcn `Alert` with info variant.

- [ ] **Step 8: Run test — verify PASS**
- [ ] **Step 9: Commit**

```bash
git commit -m "feat(ui): add assumptions panel and non-core banner"
```

---

### Task 4.10: Results Panel

**Files:**

- Create: `src/components/results/results-panel.tsx`, `src/__tests__/results-panel.test.tsx`

- [ ] **Step 1: Write tests**

Test:

- Not rendered when `comparison` is null
- Renders SummaryCards, ComparisonChart, CostBreakdownTable when comparison data present
- Shows NonCoreBanner when applicable
- Uses shadcn `Tabs` for "Overview" (cards + chart) and "Breakdown" (table + assumptions)

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement results-panel**
- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(ui): compose results panel with tabs"
```

---

### Task 4.11: Wire App.tsx

**Files:**

- Modify: `src/App.tsx`
- Create: `src/__tests__/app.test.tsx`

- [ ] **Step 1: Write app tests**

Test:

- Renders header, form, and footer on initial load
- Does not render results panel initially
- Shows results when region, term, and capacity are all set
- Loading state while regions fetch
- Error state when API fails

- [ ] **Step 2: Run test — verify FAIL**
- [ ] **Step 3: Implement App.tsx**

State management:

```tsx
const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
const [termYears, setTermYears] = useState(1);
const [capacityTiB, setCapacityTiB] = useState(10);

const comparison = useMemo(() => {
  if (!selectedRegion) return null;
  const pricing = CLOUD_PRICING[selectedRegion.id];
  if (!pricing) return null;
  return buildComparison(
    { regionId: selectedRegion.id, termYears, capacityTiB },
    selectedRegion,
    pricing,
  );
}, [selectedRegion, termYears, capacityTiB]);
```

Layout: `SiteHeader` → `main` (CalculatorForm + ResultsPanel) → `SiteFooter`. Use `max-w-5xl mx-auto` for content width. `aria-live="polite"` region wrapping ResultsPanel.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Run full test suite**

```bash
npm run test:run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: wire app with calculator state and results display"
```

- [ ] **Step 7: Push Phase 4**

```bash
git push
```

---

## Phase 5: Polish & Accessibility

### Task 5.1: Motion Tokens & Reduced Motion

**Files:**

- Modify: `src/index.css` (if needed — tokens already exist from Phase 0)
- Create: `src/__tests__/reduced-motion.test.tsx`

- [ ] **Step 1: Write reduced-motion test**

Verify all animation classes in the app use `motion-safe:` prefix. Render each component that uses animation, capture class lists, assert no bare `animate-*` classes without `motion-safe:` prefix.

- [ ] **Step 2: Run test — verify FAIL** (if any component uses bare animation)
- [ ] **Step 3: Fix any bare animation classes**

Add entrance animations to results panel (fade + slide from bottom), summary cards (stagger entrance). All prefixed with `motion-safe:`.

- [ ] **Step 4: Run test — verify PASS**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(a11y): add motion tokens and reduced-motion support"
```

---

### Task 5.2: Accessibility Audit

**Files:**

- Modify: various components as needed

- [ ] **Step 1: Verify all form inputs have associated labels**

Check: RegionSelector, TermSelector, CapacityInput all have `<label>` elements with `htmlFor` matching input `id`.

- [ ] **Step 2: Verify focus indicators**

All interactive elements (buttons, inputs, links) should have visible focus rings via the `outline-ring/50` base style.

- [ ] **Step 3: Verify aria-live region**

The results area should have `aria-live="polite"` so screen readers announce changes.

- [ ] **Step 4: Verify chart accessibility**

The chart should have `role="img"` with a descriptive `aria-label`. The breakdown table serves as the text alternative.

- [ ] **Step 5: Verify color contrast**

All text meets WCAG AA 4.5:1 ratio. The Veeam brand palette from `vdc-vault-readiness` was already designed for this.

- [ ] **Step 6: Commit any fixes**

```bash
git commit -m "feat(a11y): add aria labels, live regions, and focus management"
```

---

### Task 5.3: Responsive Layout Refinement

**Files:**

- Modify: various components

- [ ] **Step 1: Test at 320px width**

Verify: single column layout, stacked inputs, chart readable, table scrolls horizontally.

- [ ] **Step 2: Test at 768px width**

Verify: 2-column card grid, better spacing.

- [ ] **Step 3: Test at 1024px+ width**

Verify: 4-column card grid, comfortable reading width.

- [ ] **Step 4: Commit any refinements**

```bash
git commit -m "refactor(ui): responsive layout refinements"
```

- [ ] **Step 5: Push Phase 5**

```bash
git push
```

---

## Phase 6: Deployment & Documentation

### Task 6.1: CLAUDE.md

**Files:**

- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Follow the exact format from `vdc-vault-readiness/CLAUDE.md`. Include:

- Overview (what the app does, tech stack)
- Structure (file tree)
- Where to Look table
- Conventions (imports, styling, motion, testing, state management)
- Anti-patterns
- Commands
- Engineering Standards (TDD, GitHub Flow, Conventional Commits, SOLID/DRY)
- CI/CD notes

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md project knowledge base"
```

---

### Task 6.2: Verify Build & Deploy Readiness

- [ ] **Step 1: Full test suite**

```bash
npm run test:run
```

Expected: 100+ tests, all PASS.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: 0 errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: Clean build. Check `dist/` output size is reasonable.

- [ ] **Step 4: Preview**

```bash
npm run preview
```

Manually verify the app works: select a region, adjust term/capacity, see results update.

- [ ] **Step 5: Push final changes**

```bash
git push
```

---

### Task 6.3: Configure Cloudflare Pages

- [ ] **Step 1: Set GitHub repo secrets**

The user needs to manually add these secrets to the repo:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

These are the same values used for `vdc-vault-readiness`.

- [ ] **Step 2: Trigger manual deploy**

Once secrets are set:

```bash
gh workflow run publish.yml
```

- [ ] **Step 3: Verify deployment**

Check the Cloudflare Pages dashboard for successful deployment.

---

## Verification Checklist

- [ ] `npm run test:run` — all tests pass (100+ tests)
- [ ] `npm run lint` — no errors
- [ ] `npm run build` — clean production build
- [ ] Select an AWS region → see S3 Standard vs S3 IA comparison
- [ ] Select an Azure region → see Blob Hot vs Blob Cool comparison
- [ ] Select a Core region → see Foundation + Advanced pricing
- [ ] Select a Non-Core region → see "Pricing TBD" with DIY costs still shown
- [ ] Select an Advanced-only region → Foundation shows "N/A"
- [ ] Adjust term (1-5 years) → totals update proportionally
- [ ] Adjust capacity → totals update proportionally
- [ ] Mobile layout (320px) → single column, no overflow
- [ ] Keyboard-only navigation works throughout
- [ ] Screen reader announces results changes
- [ ] Reduced motion → no animations
- [ ] Dark mode → correct Veeam palette
