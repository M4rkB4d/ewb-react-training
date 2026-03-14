# Level 1 — Welcome
## Slide Deck Outline

### Slide 1: Title Slide
- Level 1 — Welcome
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Explain what React is and why EastWest Bank chose it
- Read and write TypeScript for React components
- Understand the BSP regulatory landscape affecting frontend development
- Map compliance requirements to engineering practices

### Slide 3: What Is React?
- A JavaScript library for building user interfaces
- Core mental model: **UI = f(state)** — the UI is a function of data
- Declarative: describe *what* the UI looks like, not *how* to update it
- Used by major banks and financial institutions worldwide
- *Speaker notes: Contrast with imperative DOM manipulation — show the "old way" of updating a balance display vs. the React way.*

### Slide 4: Why React at EastWest Bank
- Component-based architecture scales across teams
- Strong TypeScript support catches bugs before production
- Massive ecosystem: battle-tested libraries for forms, state, routing
- Developer hiring pool — largest frontend community
- *Speaker notes: Emphasize that this is not about trends — it is about risk management. Fewer runtime bugs means fewer BSP incidents.*

### Slide 5: Components — The Building Blocks
- A component is a function that returns JSX
- Props: data passed in from a parent (read-only)
- Example: `AccountCard` component showing customer name and balance
- Components compose: small pieces build complex UIs
- *Speaker notes: Live demo — build an AccountCard with name and balance props. Show how changing props re-renders automatically.*

### Slide 6: State — Making Things Interactive
- `useState` — component-level data that can change
- When state changes, React re-renders the component
- Example: toggle between masked/unmasked account number
- `useEffect` — run side effects (API calls, timers, subscriptions)
- `useRef` — access DOM elements without triggering re-renders
- *Speaker notes: Show a balance toggle demo. Emphasize that state lives in the component, not in the DOM.*

### Slide 7: TypeScript for React — Why Strict Mode
- TypeScript catches type errors at compile time, not in production
- Banking example: preventing `"1000" + 500 = "1000500"` math bugs
- Strict mode: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- Every EWB project uses `strict: true` — no exceptions
- *Speaker notes: Show the transfer amount bug — string concatenation instead of addition. This is a real category of production incident.*

### Slide 8: Typing Component Props
- Use `interface` to define prop shapes
- Required vs. optional props with `?`
- Union types for constrained values: `status: 'active' | 'dormant' | 'closed'`
- Banking example: `TransactionRow` with amount, date, type, status
- *Speaker notes: Walk through typing an AccountCard. Show compiler errors when passing wrong types.*

### Slide 9: Zod — Runtime Validation
- TypeScript types disappear at runtime — they do not validate API responses
- Zod schemas validate data at runtime with full type inference
- Pattern: define Zod schema → infer TypeScript type → validate at boundaries
- Banking use: validate every API response before trusting it
- *Speaker notes: Show a Zod schema for an account object. Demonstrate what happens when the API returns unexpected data.*

### Slide 10: Advanced TypeScript Patterns
- Generics: reusable typed functions and hooks
- Discriminated unions: model states like `{ status: 'loading' } | { status: 'success', data: Account }`
- Utility types: `Pick`, `Omit`, `Partial`, `Record` for transforming interfaces
- These patterns appear throughout the curriculum — recognition now, mastery later
- *Speaker notes: Brief overview only — participants will use these extensively from Level 2 onward.*

### Slide 11: Thinking in Compliance
- Compliance is not a phase bolted on at the end — it is engineering discipline
- BSP regulates every digital banking application we build
- Getting it wrong: fines, audit findings, reputational damage, customer harm
- Getting it right: compliance is just good engineering by another name
- *Speaker notes: Set the tone early — compliance is woven into every guide, not isolated in one chapter.*

### Slide 12: The BSP Regulatory Landscape
- **BSP 808** — IT Risk Management (testing, change management)
- **BSP 982** — Information Security (authentication, session management, input validation)
- **BSP 1019** — Cyber-Risk (monitoring, audit trails, incident response)
- **BSP 1033** — E-Payment Services (accessibility, transaction logging)
- **BSP 1213 (AFASA)** — Phishing-resistant authentication by June 2026
- *Speaker notes: Participants do not need to memorize circular numbers. They need to know these exist and that we implement them.*

### Slide 13: Compliance Mapped to Code
- Input validation (Zod) → BSP 982
- Error boundaries and logging → BSP 1019
- Accessible interfaces (WCAG 2.1 AA) → BSP 1033
- Secure token storage → BSP 982
- Audit trails for financial operations → BSP 1019, 1033
- Passkeys and MFA → BSP 1213 (AFASA)
- *Speaker notes: This is the bridge — every compliance requirement has a concrete frontend implementation. We will build all of these.*

### Slide 14: Key Takeaways
- React is a component-based library where UI = f(state)
- TypeScript strict mode prevents entire categories of banking bugs
- Zod validates data at runtime where TypeScript cannot reach
- BSP compliance maps directly to frontend engineering practices
- Next: Level 2 — First App
