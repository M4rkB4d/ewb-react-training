# B01 — Project Setup

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 2 — First App · Est. 3 hours

---

## What You Will Learn

By the end of this guide, you will:

- Install and verify Node.js 24 LTS
- Create a new React 19 project with Vite 7 and TypeScript
- Configure the EastWest Bank design system with Tailwind CSS 4
- Set up ESLint with strict TypeScript rules
- Organize your project using the feature-slice folder structure
- Configure path aliases for clean imports
- Set up Husky pre-commit hooks for code quality
- Understand every file in the project scaffold

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed Level 1 guides (A01, A02, A03) | Level 1 |
| A code editor (VS Code recommended) | [code.visualstudio.com](https://code.visualstudio.com) |
| A terminal (Git Bash on Windows, Terminal on macOS/Linux) | Included with Git |
| Git installed | [git-scm.com](https://git-scm.com) |

---

## Phase 1 — Node.js 24 LTS

### Why Node 24?

Node.js 24 is the current Active LTS (Long-Term Support) release. Active LTS means
it receives security updates and bug fixes until April 2028. For a banking application,
LTS is not optional — running a non-LTS version in production is an IT risk management
concern (BSP Circular 808).

### Install Node.js

Download Node.js 24 from [nodejs.org](https://nodejs.org). Choose the LTS version.

After installation, verify:

```bash
node --version
# Expected: v24.x.x (24.14.0 or later)

npm --version
# Expected: 11.x.x
```

> **BSP 808 Note:** Using a supported LTS runtime is a baseline IT risk management
> control. Document your Node.js version in your project's README for audit purposes.

### Node Version Manager (Recommended)

If your team works on multiple projects with different Node versions, use a version
manager. Note that **Windows and macOS/Linux use different tools** with the same name:

- **Windows:** Install [nvm-windows](https://github.com/coreybutler/nvm-windows) (a separate project from Unix nvm)
- **macOS/Linux:** Install [nvm](https://github.com/nvm-sh/nvm)

**Windows (nvm-windows):**
```bash
nvm install 24
nvm use 24
```

**macOS/Linux (nvm):**
```bash
nvm install 24
nvm use 24
nvm alias default 24
```

> The `nvm alias default` command only exists in Unix nvm. On Windows, `nvm use`
> sets the active version. To persist across terminal sessions on Windows, run
> `nvm use 24` from an elevated (Administrator) terminal.

### Checkpoint 1

Run `node --version` and confirm you see `v24.x.x`. If you see an older version,
check that your version manager is pointing to Node 24.

---

## Phase 2 — Create the Project

### Scaffold with Vite 7

Vite is the build tool for EastWest Bank React applications. It provides instant
hot module replacement (HMR) during development and optimized production builds.

```bash
npm create vite@7 ewb-banking-app -- --template react-ts
```

This creates a new directory `ewb-banking-app` with React 19 and TypeScript preconfigured.

```bash
cd ewb-banking-app
npm install
```

### Verify the scaffold works

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. You should see the default Vite + React
page. Press `Ctrl+C` to stop the dev server.

### What Vite created

```
ewb-banking-app/
├── public/
│   └── vite.svg              ← Static assets (served as-is)
├── src/
│   ├── App.css               ← We will replace this
│   ├── App.tsx                ← Main application component
│   ├── index.css              ← We will replace this
│   ├── main.tsx               ← Application entry point
│   └── vite-env.d.ts          ← Vite TypeScript declarations
├── index.html                 ← HTML entry point
├── package.json               ← Dependencies and scripts
├── tsconfig.json              ← TypeScript configuration (references)
├── tsconfig.app.json          ← TypeScript config for app code
├── tsconfig.node.json         ← TypeScript config for Vite config
├── vite.config.ts             ← Vite configuration
└── eslint.config.js           ← ESLint configuration
```

Every file has a purpose. We will modify most of them in this guide.

### Checkpoint 2

Confirm that `npm run dev` starts successfully and you can see the default page
at `http://localhost:5173`.

---

## Phase 3 — Install Dependencies

### Core Dependencies

Install the production dependencies for an EastWest Bank React application:

```bash
npm install zustand @tanstack/react-query zod react-hook-form \
  @hookform/resolvers react-router axios
```

| Package | Version | Purpose |
|---------|---------|---------|
| zustand | 5.x | Client state management |
| @tanstack/react-query | 5.x | Server state management |
| zod | 4.x | Runtime validation |
| react-hook-form | 7.x | Form management |
| @hookform/resolvers | 5.x | Zod resolver for React Hook Form |
| react-router | 7.x | Client-side routing |
| axios | latest | HTTP client |

### Styling

```bash
npm install -D tailwindcss @tailwindcss/vite
```

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.x | Utility-first CSS framework |
| @tailwindcss/vite | 4.x | Vite plugin for Tailwind |

### Development Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom msw husky lint-staged
```

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | 4.x | Test runner |
| @testing-library/react | latest | React component testing |
| @testing-library/jest-dom | latest | DOM assertion matchers |
| @testing-library/user-event | latest | User interaction simulation |
| jsdom | latest | DOM environment for tests |
| msw | 2.x | API mocking for tests |
| husky | latest | Git hooks |
| lint-staged | latest | Run linters on staged files |

### Verify installation

```bash
npm ls --depth=0
```

This should show all packages installed without errors. If you see `ERESOLVE` errors,
check that you are using Node 24 and npm 11.

### Checkpoint 3

Run `npm ls --depth=0` and verify all packages are installed. You should see zero
`ERR!` or `WARN` messages about peer dependencies.

---

## Phase 4 — Configure Tailwind CSS 4

Tailwind CSS 4 uses a new configuration approach with the `@theme` directive directly
in CSS — no more `tailwind.config.js` file.

### Add the Vite plugin

Update `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

### Create the EastWest Bank theme

Replace the contents of `src/index.css` with the EWB design system:

```css
/* src/index.css */
@import 'tailwindcss';

/* ──────────────────────────────────────────────
   EastWest Bank Design System — Tailwind 4 Theme
   ────────────────────────────────────────────── */
@theme {
  /* Brand Colors */
  --color-ewb-purple: #500778;
  --color-ewb-purple-50: #f5f0f7;
  --color-ewb-purple-100: #e8d9ef;
  --color-ewb-purple-200: #d1b3df;
  --color-ewb-purple-300: #b080c8;
  --color-ewb-purple-400: #8a4dab;
  --color-ewb-purple-500: #6b2a8e;
  --color-ewb-purple-600: #500778;
  --color-ewb-purple-700: #400660;
  --color-ewb-purple-800: #300448;
  --color-ewb-purple-900: #200330;

  --color-ewb-magenta: #b1006f;
  --color-ewb-magenta-50: #fdf0f7;
  --color-ewb-magenta-100: #f9d4e8;
  --color-ewb-magenta-200: #f0a3ce;
  --color-ewb-magenta-300: #e066ab;
  --color-ewb-magenta-400: #cc338d;
  --color-ewb-magenta-500: #b1006f;
  --color-ewb-magenta-600: #8e0059;
  --color-ewb-magenta-700: #6b0043;

  --color-ewb-gold: #dba464;
  --color-ewb-gold-50: #fdf8f0;
  --color-ewb-gold-100: #f9ecd4;
  --color-ewb-gold-200: #f0d5a3;
  --color-ewb-gold-300: #e5be7c;
  --color-ewb-gold-400: #dba464;
  --color-ewb-gold-500: #c4883f;
  --color-ewb-gold-600: #a06b2a;
  --color-ewb-gold-700: #7c5220;

  --color-ewb-lime: #d5e04d;
  --color-ewb-lime-50: #fafcf0;
  --color-ewb-lime-100: #f2f6d1;
  --color-ewb-lime-200: #e6ed9f;
  --color-ewb-lime-300: #d5e04d;
  --color-ewb-lime-400: #c2cc3a;
  --color-ewb-lime-500: #a3ab2a;
  --color-ewb-lime-600: #7f851f;

  --color-ewb-navy: #06357A;
  --color-ewb-navy-50: #f0f4fa;
  --color-ewb-navy-100: #d4e0f2;
  --color-ewb-navy-200: #a3bfe0;
  --color-ewb-navy-300: #6694c8;
  --color-ewb-navy-400: #3370ad;
  --color-ewb-navy-500: #134f94;
  --color-ewb-navy-600: #06357A;
  --color-ewb-navy-700: #052a62;

  /* Semantic Tokens */
  --color-primary: var(--color-ewb-purple);
  --color-secondary: var(--color-ewb-navy);
  --color-accent: var(--color-ewb-gold);
  --color-success: var(--color-ewb-lime);
  --color-error: #dc2626;
  --color-warning: #f59e0b;
  --color-info: var(--color-ewb-navy);

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

/* ──────────────────────────────────────────────
   Base Styles
   ────────────────────────────────────────────── */
body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Focus styles for accessibility (BSP 1033) */
:focus-visible {
  outline: 2px solid var(--color-ewb-purple);
  outline-offset: 2px;
}

/* Reduced motion support (WCAG 2.1) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Remove default styles

Delete `src/App.css` — we use Tailwind utility classes instead:

```bash
# macOS/Linux/Git Bash
rm src/App.css

# Windows (PowerShell)
Remove-Item src/App.css
```

### Update App.tsx

Replace `src/App.tsx` with a minimal starting point:

```tsx
// src/App.tsx
export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-ewb-purple px-6 py-4">
        <h1 className="text-xl font-semibold text-white">
          EastWest Bank
        </h1>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to EWB Banking
        </h2>
        <p className="mt-2 text-gray-600">
          Your project is set up and ready to build.
        </p>
      </main>
    </div>
  );
}
```

Remove the `App.css` import from App.tsx if it exists, and remove the SVG logo import.

### Verify Tailwind is working

```bash
npm run dev
```

You should see the EastWest Bank purple header (`#500778`) with white text. If the
header is not purple, check that:
1. `@tailwindcss/vite` is in your Vite config plugins array
2. `src/index.css` contains the `@import 'tailwindcss'` directive
3. `main.tsx` imports `./index.css`

### Checkpoint 4

Run `npm run dev` and verify:
- The page has an EWB purple header (#500778)
- White text on the purple background is clearly readable
- The body uses the Inter font family (or system fallback)

---

## Phase 5 — TypeScript Configuration

### Strict mode everywhere

The scaffold creates three TypeScript configs. We need to ensure strict mode is
enabled with additional banking-appropriate settings.

Update `tsconfig.app.json`:

```jsonc
// tsconfig.app.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict — non-negotiable for banking */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**Key settings explained:**

| Setting | What It Does | Why |
|---------|-------------|-----|
| `strict: true` | Enables all strict type checks | Catches bugs at compile time |
| `noUncheckedIndexedAccess` | Array/object access may be `undefined` | Prevents runtime crashes from missing data |
| `exactOptionalPropertyTypes` | `prop?: string` means `string \| undefined`, not `string \| undefined \| null` | Precise optional handling |
| `noImplicitOverride` | Must use `override` keyword | Prevents accidental method shadowing |
| `noFallthroughCasesInSwitch` | Switch cases must break or return | Prevents logic bugs |

> **BSP 808 Note:** Strict TypeScript is a proactive risk management control. Type
> errors caught at compile time are bugs that never reach production.

### Path aliases in Vite

Tell Vite to resolve the `@/` path alias. Update `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

Now you can import from anywhere in `src/` using clean paths:

```typescript
// Instead of: import { Button } from '../../../components/ui/button';
// You write:  import { Button } from '@/components/ui/button';
```

### Checkpoint 5

Run `npx tsc --noEmit` from the project root. It should complete with zero errors.
If you get errors, check that `App.tsx` no longer imports `App.css`.

---

## Phase 6 — Project Structure

### The Feature-Slice Architecture

EastWest Bank projects use a feature-slice folder structure. Each feature is self-contained
with its own components, hooks, types, and tests.

Create the following directory structure inside `src/`:

```bash
# macOS/Linux/Git Bash
mkdir -p src/components/ui src/features src/hooks src/lib src/types src/styles

# Windows (PowerShell)
mkdir src/components/ui, src/features, src/hooks, src/lib, src/types, src/styles
```

The full structure:

```
src/
├── components/
│   └── ui/                ← Shared UI components (Button, Input, Card)
├── features/              ← Feature modules (each self-contained)
│   ├── accounts/          ← Account listing, details
│   │   ├── components/    ← Feature-specific components
│   │   ├── hooks/         ← Feature-specific hooks
│   │   ├── types.ts       ← Feature-specific types
│   │   └── index.ts       ← Public API (barrel export)
│   ├── auth/              ← Authentication flows
│   ├── payments/          ← Payment processing
│   └── transfers/         ← Fund transfers
├── hooks/                 ← Shared hooks (useDebounce, useMediaQuery)
├── lib/                   ← Utilities (formatCurrency, maskAccountNumber)
├── types/                 ← Shared types (ApiResponse, User, Account)
├── styles/                ← Additional CSS if needed
├── App.tsx                ← Root component
├── main.tsx               ← Entry point
└── index.css              ← Tailwind + EWB theme
```

### Why feature-slice?

| Approach | Problem |
|----------|---------|
| Group by type (all components in `/components`, all hooks in `/hooks`) | Related files are scattered. Changing a feature means editing 5 directories. |
| Group by feature (everything for accounts in `/features/accounts/`) | Related files are together. Changing a feature means editing 1 directory. |

Feature-slice scales with the application. When you have 3 features, the benefit is
small. When you have 30 features (a realistic banking application), feature-slice
is the difference between navigating a codebase and drowning in it.

### Create the utility files

Create `src/lib/utils.ts` — the className merge utility:

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install the required packages:

```bash
npm install clsx tailwind-merge
```

This `cn()` utility is used throughout the design system to merge Tailwind classes
intelligently. You will use it in every component starting from A06.

### Create shared types

Create `src/types/common.ts`:

```typescript
// src/types/common.ts

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** API error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

/** Philippine Peso currency value (stored as centavos for precision) */
export type Centavos = number & { readonly __brand: 'Centavos' };
```

Create `src/types/index.ts`:

```typescript
// src/types/index.ts
export type { ApiResponse, PaginatedResponse, ApiError, Centavos } from './common';
```

### Checkpoint 6

Verify your directory structure matches the one described above. Run `npx tsc --noEmit`
again to ensure no type errors were introduced.

---

## Phase 7 — ESLint Configuration

### Strict linting for banking code

The Vite scaffold includes a basic ESLint config. We need to enhance it for banking
application standards.

Update `eslint.config.js`:

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Banking-specific rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
    },
  },
);
```

**Key rules explained:**

| Rule | Why |
|------|-----|
| `no-console` (warn) | Production code should use structured logging, not console.log |
| `no-eval` / `no-implied-eval` | `eval()` is an XSS attack vector (PCI-DSS, BSP 982) |
| `no-explicit-any` | `any` disables type checking — use `unknown` instead (A02) |
| `no-non-null-assertion` | The `!` operator hides potential null crashes |
| `strict-boolean-expressions` | Prevents truthy/falsy bugs (`0`, `""`, `NaN` are falsy) |

### Add lint script

Your `package.json` should already have a lint script from the scaffold. Verify it:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

Run the linter:

```bash
npm run lint
```

Fix any issues it reports. The most common fix is removing `console.log` statements
from the scaffold code.

### Checkpoint 7

Run `npm run lint` and resolve all errors. Warnings about `no-console` in development
code are acceptable during setup but must be resolved before production deployment.

---

## Phase 8 — Testing Setup

### Configure Vitest

Create `vitest.config.ts` in the project root:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

### Create the test setup file

```bash
mkdir -p src/test
```

Create `src/test/setup.ts`:

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

This imports the custom matchers (like `toBeInTheDocument()`, `toHaveTextContent()`)
into every test file automatically.

### Add test scripts to package.json

Update the `scripts` section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

| Script | What It Does |
|--------|-------------|
| `npm test` | Runs tests in watch mode (re-runs on file changes) |
| `npm run test:run` | Runs tests once and exits (for CI) |
| `npm run test:coverage` | Runs tests with coverage report |

### Write a smoke test

Create `src/App.test.tsx`:

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the EastWest Bank header', () => {
    render(<App />);
    expect(screen.getByText('EastWest Bank')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to EWB Banking')).toBeInTheDocument();
  });
});
```

Run the test:

```bash
npm run test:run
```

You should see both tests pass. This is your first test — BSP Circular 808 compliance
starts here.

### Checkpoint 8

Run `npm run test:run` and verify both tests pass with zero failures.

---

## Phase 9 — Git Hooks

### Why pre-commit hooks?

Pre-commit hooks run automatically before every commit. They prevent bad code from
entering the repository. For a banking application, this is a change management
control (BSP 808, SOX).

### Set up Husky

```bash
npx husky init
```

This creates a `.husky/` directory with a `pre-commit` hook.

### Configure lint-staged

Add lint-staged configuration to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

Install Prettier:

```bash
npm install -D prettier
```

Update `.husky/pre-commit`:

```bash
npx lint-staged
```

### What happens on every commit

1. You run `git commit`
2. Husky triggers the pre-commit hook
3. lint-staged identifies which files you changed
4. For TypeScript files: ESLint runs and fixes auto-fixable issues, then Vitest runs
   only the tests related to your changed files
5. For other files: Prettier formats them
6. If any check fails, the commit is blocked

This means you cannot commit code that fails linting or breaks tests. This is
intentional. This is a safety net.

### Create Prettier config

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### Checkpoint 9

Stage a file with a deliberate lint error (e.g., add `console.log("test")` to App.tsx),
try to commit, and verify the commit is blocked. Fix the error, then commit successfully.

---

## Phase 10 — Environment Variables

### Vite environment variable pattern

Vite exposes environment variables that start with `VITE_` to your application code.
Never put secrets in `VITE_` variables — they are embedded in the built JavaScript
and visible to anyone who views the page source.

Create `.env.example`:

```bash
# .env.example — Copy to .env.local and fill in values
# NEVER commit .env.local to version control

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_PASSKEYS=false
VITE_ENABLE_BIOMETRICS=false

# Environment
VITE_APP_ENV=development
```

Create `.env.local`:

```bash
# macOS/Linux/Git Bash
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

### Validate environment variables at startup

Create `src/lib/env.ts`:

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_API_TIMEOUT: z.coerce.number().positive().default(30000),
  VITE_ENABLE_PASSKEYS: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('false'),
  VITE_ENABLE_BIOMETRICS: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default('false'),
  VITE_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

function validateEnv() {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Invalid environment variables:\n${formatted}\n\nCheck .env.local against .env.example`,
    );
  }

  return result.data;
}

export const env = validateEnv();
```

Now importing `env` from anywhere gives you fully typed and validated environment
variables. If a required variable is missing or invalid, the application crashes
immediately at startup — not when the variable is first used deep inside a feature.

### Add .env.local to .gitignore

Verify `.gitignore` includes:

```
.env.local
.env.*.local
```

The Vite scaffold includes this by default. Never commit `.env.local` — it may contain
environment-specific values.

> **BSP 982 Note:** Environment variables that control security features (like
> `VITE_ENABLE_PASSKEYS`) must be validated at startup. A misconfigured environment
> that silently disables authentication is a security incident.

### Checkpoint 10

Import `env` in `App.tsx` and log `env.VITE_APP_ENV` to verify environment validation
works. Then remove the log before committing (remember — `no-console` rule).

---

## Phase 11 — Build Verification

### Verify everything works together

Run the complete verification sequence:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Tests
npm run test:run

# 4. Production build
npm run build

# 5. Preview production build
npm run preview
```

All five commands must succeed with zero errors.

### What the build produces

After `npm run build`, check the `dist/` directory:

```
dist/
├── assets/
│   ├── index-[hash].css    ← Your Tailwind CSS (purged, minified)
│   └── index-[hash].js     ← Your React app (bundled, minified)
└── index.html               ← HTML with hashed asset references
```

The `[hash]` ensures cache busting — when you deploy a new version, the filename
changes and browsers fetch the new file instead of serving a stale cache.

### Check bundle size

```bash
npx vite build
```

Vite prints file sizes in the build output. For a fresh project, your JavaScript
bundle should be under 200 KB (gzipped). As you add features, monitor this number.
For detailed bundle analysis, see B05 (Performance Optimization) which covers
`rollup-plugin-visualizer`.

### Checkpoint 11

Run all five verification commands. If any fail, fix the issue before proceeding.
A project that does not build cleanly is a project that cannot be deployed.

---

## Key Takeaways

1. **Node 24 LTS is mandatory.** Not the latest, not the oldest — the current LTS
   release with support until April 2028.

2. **Vite 7 scaffolds React 19 + TypeScript** in one command. The scaffold gives you
   a working project in under a minute.

3. **Tailwind CSS 4 uses `@theme` in CSS** — no more JavaScript config files. The
   EWB theme defines brand colors, semantic tokens, and typography in one place.

4. **TypeScript strict mode is non-negotiable** for banking code. Every strict flag
   catches a category of bugs that would otherwise reach production.

5. **Feature-slice architecture** keeps related code together. One feature, one directory,
   one responsibility.

6. **Path aliases (`@/`)** eliminate `../../../` import chains and make refactoring
   safer.

7. **Pre-commit hooks** enforce quality gates before code enters the repository.
   This is a BSP 808 and SOX compliance control.

8. **Environment variables validated at startup** with Zod. Missing or invalid config
   crashes immediately, not hours later in production.

9. **Every tool is verified:** TypeScript compiles, ESLint passes, tests pass, build
   succeeds. If it does not build, it does not ship.

---

## Exercises

### Exercise 1 — Add a Footer Component

Create `src/components/ui/footer.tsx` with:
- The text "EastWest Bank" and the current year
- EWB purple background with white text
- Fixed to the bottom of the viewport

Import and render it in `App.tsx`. Verify with `npm run dev`.

### Exercise 2 — Add a Theme Toggle

Add a dark mode toggle to the header. For now, just toggle a CSS class on the
`<html>` element between `light` and `dark`. You do not need to implement full
dark mode styles yet — just the toggle mechanism.

Verify with `npm run dev` that clicking the toggle adds/removes the class.

### Exercise 3 — Environment Feature Flag

Add a new environment variable `VITE_SHOW_DEBUG_INFO` to `.env.example` and
`.env.local`. Update the Zod schema in `src/lib/env.ts`. When enabled, show a
small debug bar at the bottom of the page displaying the current environment
and API base URL.

Verify it appears when set to `true` and disappears when set to `false`.

---

## What Comes Next

Your project is scaffolded, configured, and verified. You have:
- A working React 19 + TypeScript + Vite 7 project
- The EastWest Bank design system in Tailwind CSS 4
- Strict TypeScript and ESLint configurations
- A test framework ready for your first real tests
- Pre-commit hooks guarding code quality
- Environment validation catching config errors at startup

**Next guide:** [A04 — Components and JSX](A04_components-and-jsx.md) — where you
build your first real banking components using the project you just set up.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
