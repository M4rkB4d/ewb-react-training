# Level 3 — Building UI
## Slide Deck Outline

### Slide 1: Title Slide
- Level 3 — Building UI
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Build a component library with the EWB brand using Tailwind CSS 4
- Implement forms with React Hook Form and Zod validation
- Build accessible interfaces that meet WCAG 2.1 AA requirements
- Apply banking-specific UI patterns (data masking, currency formatting, multi-step wizards)

### Slide 3: Design Tokens
- Design tokens are the single source of truth for visual decisions
- EWB color palette: primary (purple), navy, gold, lime, magenta
- Semantic tokens: `bg-primary` means intent, not a specific hex code
- Rebranding becomes a config change, not a codebase-wide search and replace
- *Speaker notes: Show the Tailwind theme config with EWB tokens. Changing one value updates every component.*

### Slide 4: Building the Component Library
- `Button` — primary, secondary, outline, ghost, error variants
- `Input` — text, password (with toggle), currency, masked account number
- `Card` — container for account summaries, transaction details
- `Badge` — status indicators (active, dormant, frozen, pending)
- *Speaker notes: Demo each component variant. Emphasize consistency — every team uses the same components.*

### Slide 5: The cn() Utility and Variants
- `cn()` merges Tailwind classes with proper conflict resolution
- Pattern: base classes + variant classes + conditional classes + overrides
- Keeps component APIs clean — consumers pass variant props, not class strings
- Dark mode works with Tailwind 4's native dark mode support
- *Speaker notes: Show cn() resolving a conflict — e.g., `cn('bg-red-500', 'bg-blue-500')` picks the last one correctly.*

### Slide 6: Why React Hook Form
- Controlled forms re-render on every keystroke — performance problem at scale
- React Hook Form uses uncontrolled inputs with refs — minimal re-renders
- Banking forms: 15+ fields, real-time validation, conditional logic
- Integrates with the EWB Input components seamlessly
- *Speaker notes: Show a side-by-side render count comparison — useState form vs. React Hook Form.*

### Slide 7: Zod Validation for Banking Forms
- Schema-first: define shape and rules, then infer the TypeScript type
- `@hookform/resolvers` connects Zod schemas to React Hook Form
- Banking-specific rules: Philippine phone numbers, account number formats, transfer limits
- Client-side validation is UX — server-side validation is security (always do both)
- *Speaker notes: Build a fund transfer schema live — amount (positive, max daily limit), account number (format check), description (required).*

### Slide 8: Multi-Step Fund Transfer Wizard
- Step 1: Select source account → Step 2: Enter recipient → Step 3: Amount → Step 4: Confirm
- Each step has its own Zod schema, validated independently
- Form state persists across steps (no data loss on back/forward)
- Confirm step shows all data for review before submission
- *Speaker notes: This is one of the most common banking UI patterns. Demo the wizard with validation errors at each step.*

### Slide 9: Preventing Double Submission
- Financial transactions must never submit twice
- Disable submit button during `isSubmitting` state
- Show loading indicator during API call
- Handle success/error states explicitly (idle → submitting → success/error)
- *Speaker notes: This is a compliance requirement, not a UX nicety. Double-debiting a customer is a regulatory incident.*

### Slide 10: Data Masking in Forms
- PII must be masked by default (DPA compliance — RA 10173)
- Account numbers: `****-****-1234` with unmask toggle
- Sensitive fields: mask on blur, unmask on focus
- Never log unmasked values to the console
- *Speaker notes: Show the masked input component. Emphasize that this is a legal requirement under the Data Privacy Act.*

### Slide 11: Accessibility — Why It Is Mandatory
- BSP Circular 1033 requires accessible electronic payment services
- WCAG 2.1 Level AA is the standard for banking applications
- Accessible code is better code — benefits all users, not just those with disabilities
- Our testing queries (`getByRole`, `getByLabelText`) already enforce basic accessibility
- *Speaker notes: This is not optional. Inaccessible banking interfaces exclude customers and violate BSP requirements.*

### Slide 12: Semantic HTML and Landmarks
- Proper heading hierarchy: one `h1` per page, sequential levels
- Landmark regions: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Screen readers use landmarks to navigate — skipping them breaks the experience
- Use native HTML elements before reaching for ARIA attributes
- *Speaker notes: Demo a screen reader navigating a page with proper landmarks vs. a page of div soup.*

### Slide 13: Keyboard Navigation and Focus Management
- Every interactive element must be keyboard-accessible (Tab, Enter, Escape)
- Focus trapping in modals — focus cannot escape to background content
- Focus management in wizards — move focus to the new step heading
- Skip links for main content navigation
- *Speaker notes: Demo keyboard-only navigation through the transfer wizard. Every step should be reachable without a mouse.*

### Slide 14: ARIA — When and When Not
- First rule of ARIA: do not use ARIA if a native HTML element works
- `aria-label` for elements without visible text (icon buttons)
- `aria-live` regions for dynamic content (transaction status updates)
- `aria-describedby` to connect error messages to form fields
- *Speaker notes: Show a common mistake — adding role="button" to a div instead of using a button element. Native elements are always preferred.*

### Slide 15: Key Takeaways
- Design tokens and a shared component library ensure brand consistency
- React Hook Form + Zod = performant, validated banking forms
- Prevent double submission on all financial transactions
- Accessibility is mandatory (BSP 1033) and makes code better for everyone
- Next: Level 4 — State & Routing
