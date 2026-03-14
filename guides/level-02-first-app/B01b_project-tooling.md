# B01b — Project Tooling and Quality Gates

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part B (Vite SPA) · Level 2 — First App · Est. 1.5 hours

---

## What You Will Learn

By the end of this guide, you will:

- Set up Husky pre-commit hooks with lint-staged for automated code quality checks
- Validate environment variables at startup using Zod schemas
- Run a full build verification sequence to confirm everything works together
- Understand how these quality gates map to BSP and SOX compliance controls

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B01 — Project Setup | [B01](B01_project-setup.md) |

---

## Phase 1 — Git Hooks

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

### Checkpoint 1

Stage a file with a deliberate lint error (e.g., add `console.log("test")` to App.tsx),
try to commit, and verify the commit is blocked. Fix the error, then commit successfully.

---

## Phase 2 — Environment Variables

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

### Checkpoint 2

Import `env` in `App.tsx` and log `env.VITE_APP_ENV` to verify environment validation
works. Then remove the log before committing (remember — `no-console` rule).

---

## Phase 3 — Build Verification

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

### Checkpoint 3

Run all five verification commands. If any fail, fix the issue before proceeding.
A project that does not build cleanly is a project that cannot be deployed.

---

## Key Takeaways

1. **Pre-commit hooks** enforce quality gates before code enters the repository.
   This is a BSP 808 and SOX compliance control.

2. **Environment variables validated at startup** with Zod. Missing or invalid config
   crashes immediately, not hours later in production.

3. **Every tool is verified:** TypeScript compiles, ESLint passes, tests pass, build
   succeeds. If it does not build, it does not ship.

---

## Exercises

### Exercise 1 — Environment Feature Flag

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
