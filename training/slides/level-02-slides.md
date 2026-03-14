# Level 2 — First App
## Slide Deck Outline

### Slide 1: Title Slide
- Level 2 — First App
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Set up a production-grade React 19 project with Vite 7 and TypeScript
- Build functional components with typed props and composition
- Write your first component tests with Vitest and React Testing Library
- Understand the EWB project structure and conventions

### Slide 3: Project Setup — Vite 7
- Vite 7: fast dev server with hot module replacement
- `npm create vite@latest ewb-portal -- --template react-ts`
- Node.js 22 LTS required — LTS is mandatory for banking (BSP 808)
- TypeScript strict mode enabled from day one
- *Speaker notes: Walk through the scaffolding command. Explain why we use Vite over Create React App (deprecated) or manual Webpack.*

### Slide 4: Project Structure — Feature-Slice
- `src/app/` — Application shell (router, providers, root component)
- `src/features/` — Business capabilities (accounts, transfers, payments)
- `src/shared/` — Reusable utilities, hooks, UI components
- `src/test/` — Test setup and utilities
- Path aliases: `@/features/accounts` instead of `../../../features/accounts`
- *Speaker notes: Show the folder structure. Emphasize that this scales — a 50-screen app with 20 developers needs clear boundaries.*

### Slide 5: Tooling Configuration
- Tailwind CSS 4 for the EWB design system (color tokens, spacing, typography)
- ESLint with strict TypeScript rules — catches bugs beyond type errors
- Husky pre-commit hooks — code quality enforced before every commit
- `cn()` utility for conditional class merging (clsx + tailwind-merge)
- *Speaker notes: Demo the pre-commit hook catching a linting error. This is BSP 808 change management at the developer level.*

### Slide 6: JSX Is Not HTML
- JSX is a syntax extension — it describes UI, not DOM manipulation
- Key differences: `className` not `class`, `htmlFor` not `for`, camelCase events
- JSX expressions: embed any JavaScript inside `{curly braces}`
- React 19 compiles JSX automatically — no manual `React.createElement`
- *Speaker notes: Show a side-by-side of HTML vs JSX. Common gotcha: forgetting className.*

### Slide 7: Building Components
- A component is a function that returns JSX
- Props are typed with TypeScript interfaces
- Children and composition: `<Card><AccountInfo /></Card>`
- Conditional rendering: `{isActive && <Badge>Active</Badge>}`
- *Speaker notes: Build AccountCard live — name, balance, status badge. Show how props flow from parent to child.*

### Slide 8: Handling Events
- Event handlers are typed: `React.MouseEvent`, `React.ChangeEvent`
- React 19: pass refs as regular props — no more `forwardRef`
- Banking example: mask/unmask account number on click
- Prevent default for form submissions
- *Speaker notes: Demo a click handler that toggles balance visibility. Show the TypeScript autocomplete on event types.*

### Slide 9: Component Design for Banking
- `AccountCard` — displays account summary with masked number
- `TransactionRow` — single transaction with amount, date, type
- `StatusBadge` — visual indicator (active, dormant, frozen, closed)
- Pattern: small, focused components that compose into complex UIs
- *Speaker notes: These three components will be used and extended throughout the rest of the curriculum.*

### Slide 10: Why Testing at Level 2
- In banking, a bug is not a missing grocery item — it is wrong balances, leaked data
- BSP 808 requires systematic IT risk management — tests are the primary control
- Testing is a habit, not a phase — every component gets tests from now on
- Introduced early so participants build the muscle memory
- *Speaker notes: Set expectations — no component is "done" without tests. This is non-negotiable for banking code.*

### Slide 11: Vitest + React Testing Library
- Vitest: fast, Vite-native test runner (compatible with Jest API)
- React Testing Library: test components the way users interact with them
- Philosophy: test behavior, not implementation details
- Queries: `getByRole`, `getByLabelText`, `getByText` — accessibility-first
- *Speaker notes: Explain why we use getByRole over getByTestId — it tests accessibility for free.*

### Slide 12: Writing Your First Test
- Render the component with `render(<AccountCard {...props} />)`
- Query for elements: `screen.getByText('Maria Santos')`
- Assert: `expect(element).toBeInTheDocument()`
- Test user interactions: `await userEvent.click(maskToggle)`
- *Speaker notes: Live demo — write a test for AccountCard. Show the test passing, then break it intentionally to show failure output.*

### Slide 13: Test Patterns for Banking Components
- Test that sensitive data is masked by default
- Test that currency formatting is correct (₱ symbol, commas, decimals)
- Test conditional rendering based on account status
- Test that frozen accounts disable action buttons
- *Speaker notes: These are banking-specific test patterns. A todo app never tests data masking — a banking app always does.*

### Slide 14: Running Tests
- `npm test` — run all tests once
- `npm run test:watch` — re-run on file changes (development workflow)
- `npm run test:coverage` — generate coverage report
- Target: 80%+ coverage for financial features (BSP 808)
- *Speaker notes: Demo watch mode. Show how changing a component immediately re-runs its tests.*

### Slide 15: Key Takeaways
- Vite 7 + React 19 + TypeScript strict mode is the EWB standard stack
- Feature-slice folder structure scales to large teams and applications
- Testing starts at Level 2 — every component gets tests
- Test behavior (what users see) not implementation (how code works)
- Next: Level 3 — Building UI
