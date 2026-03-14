# Level 1 — Welcome: Instructor Demo

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 15-20 minutes
>
> Covers: A01 (What Is React), A02 (TypeScript for React), A03 (Thinking in Compliance)

---

## Setup Before the Demo

- Have VS Code open with a blank TypeScript file
- Have a browser open to the React documentation (react.dev)
- Have a terminal ready to run `npx tsc --noEmit`
- Prepare a `demo.ts` file with the code snippets below ready to paste

---

## Part 1: Why React Matters (3 minutes)

### Show: Imperative vs. Declarative

Open a blank file and type this imperative example:

```javascript
// The old way
document.getElementById('balance').textContent = '₱125,430.50';
document.getElementById('name').textContent = 'Maria Santos';

function updateBalance(newBalance) {
  document.getElementById('balance').textContent = formatCurrency(newBalance);
  document.getElementById('balance').classList.add('updated');
  setTimeout(() => {
    document.getElementById('balance').classList.remove('updated');
  }, 1000);
}
```

**Talking point:** "Imagine doing this for 50 fields across 30 pages. You spend more time tracking DOM elements than building features."

Now show the React equivalent:

```tsx
function AccountBalance({ balance, name }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{formatCurrency(balance)}</p>
    </div>
  );
}
```

**Talking point:** "You describe what the UI looks like. React handles the updates. This is the fundamental shift — from *how* to *what*."

**Emphasize:** "UI = f(state). The UI is a function of the data. Change the data, the UI updates. This equation is everything."

---

## Part 2: TypeScript Catches Bugs (5 minutes)

### Live Code: The Money Bug

Type this in `demo.ts`:

```typescript
// Without types — this bug ships to production
function transferFunds(from, to, amount) {
  return amount + 500; // processing fee
}

const result = transferFunds('ACC001', 'ACC002', '1000');
// result is "1000500" — string concatenation, not addition
```

**Talking point:** "In a banking application, this bug means a customer's transfer is wrong. TypeScript prevents this."

Now add types:

```typescript
function transferFunds(from: string, to: string, amount: number): number {
  return amount + 500;
}

// This line now has a red squiggly — TypeScript catches it
const result = transferFunds('ACC001', 'ACC002', '1000');
```

**Show the error in VS Code.** Let the audience see the red underline and the error message.

### Live Code: Discriminated Unions

```typescript
type TransferState =
  | { status: 'idle' }
  | { status: 'processing'; transactionId: string }
  | { status: 'completed'; transactionId: string; completedAt: string }
  | { status: 'failed'; error: { message: string; retryable: boolean } };

function renderTransfer(state: TransferState) {
  switch (state.status) {
    case 'idle':
      return 'Ready';
    case 'processing':
      return `Processing: ${state.transactionId}`;
    case 'completed':
      return `Done at ${state.completedAt}`;
    case 'failed':
      return state.error.message;
  }
}
```

**Talking point:** "TypeScript knows exactly which properties exist in each state. Try accessing `state.error` in the 'idle' case — it won't let you. This is type narrowing, and it prevents an entire class of bugs."

Run `npx tsc --noEmit` to show it compiles cleanly.

---

## Part 3: Zod — Runtime Validation (4 minutes)

### Live Code: API Data You Cannot Trust

```typescript
import { z } from 'zod';

const accountSchema = z.object({
  id: z.string().min(1),
  accountNumber: z.string().regex(/^\d{10}$/),
  balance: z.number().int().nonnegative(), // centavos
  currency: z.enum(['PHP', 'USD', 'EUR']),
});

type Account = z.infer<typeof accountSchema>;
```

**Talking point:** "TypeScript checks your code at compile time. But API data arrives at runtime — TypeScript can't help there. Zod bridges the gap."

Show `safeParse` with good and bad data:

```typescript
// Good data — passes
const good = accountSchema.safeParse({
  id: 'ACC001',
  accountNumber: '1234567890',
  balance: 50000,
  currency: 'PHP',
});
console.log(good.success); // true

// Bad data — fails gracefully
const bad = accountSchema.safeParse({
  id: 123,  // wrong type
  accountNumber: '12345',  // too short
  balance: -100,  // negative
  currency: 'GBP',  // not in enum
});
console.log(bad.success); // false
console.log(bad.error.issues); // detailed error list
```

**Emphasize:** "Define the schema once, get both the TypeScript type AND runtime validation. They're always in sync."

---

## Part 4: Why Compliance Matters (5 minutes)

### Show: The Compliance Stack

Draw or display the compliance stack diagram:

```
International Standards  (PCI-DSS, ISO 27001)
         ↓
Philippine Laws          (DPA, AMLA)
         ↓
BSP Circulars            (808, 982, 1033, 1213)
         ↓
EWB Policies
         ↓
Your React Code          ← You are here
```

**Talking point:** "Every line of React code you write sits at the bottom of this stack. You don't need to memorize every circular, but you need to know which ones affect your daily work."

### Show: The Seven Questions

Walk through the compliance checklist for a "Fund Transfer" feature:

1. Does it handle personal information? **Yes** — DPA applies (mask account numbers)
2. Does it involve authentication? **Yes** — BSP 982/1213 (passkeys)
3. Does it process financial transactions? **Yes** — BSP 1033, AMLA (limits, confirmations)
4. Does it display sensitive data? **Yes** — Masking required
5. Does it need to work for everyone? **Always yes** — BSP 1033 (accessibility)
6. Can errors go undetected? **Must not** — BSP 1019 (monitoring)
7. Does it change production? **Yes** — BSP 808, SOX (tests, change management)

**Talking point:** "Seven questions, thirty seconds. Ask them before building any feature. This is how compliance becomes a habit, not a phase."

### Highlight: AFASA Deadline

**Talking point:** "BSP 1213 — passkeys by June 2026. That's three months from now. Every authentication flow we build must support passkeys. This is not a future concern — it's a current priority."

---

## Wrap-Up (2 minutes)

### Key Messages

1. React is declarative — describe what, not how
2. TypeScript catches bugs before production — non-negotiable for banking
3. Zod validates at runtime what TypeScript can't
4. Compliance is engineering, not paperwork
5. The AFASA passkey deadline is June 2026

### Transition to Level 2

"Now you understand the foundations. Level 2 is where you build — set up a real project, write your first components, and prove they work with tests."

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] VS Code open with `demo.ts` file ready and TypeScript extension active
- [ ] `npx tsc --noEmit` runs without errors on existing code
- [ ] Zod installed in the demo project (`npm ls zod` shows a version)
- [ ] Code snippets pre-loaded in a separate file for quick paste

### Common Issues

**TypeScript red squiggly does not appear in VS Code**
- Cause: TypeScript language server not running, or file not saved as `.ts`
- Recovery: Run `npx tsc --noEmit` in the terminal instead — the error shows there. Say "VS Code shows this inline, but the terminal catches it too."

**Zod `safeParse` output is not visible or unclear**
- Cause: Console not open, or Node not executing the script
- Recovery: Run `npx tsx demo.ts` in the terminal. If tsx is not installed, paste the snippet into the browser console using a plain object validation example without imports.

**Audience asks about a BSP circular you do not know**
- Cause: Obscure or recently issued circular
- Recovery: Acknowledge it, note it down, and say "Good catch — I will verify the specifics and follow up. The principle still applies: every circular maps to frontend controls."

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
