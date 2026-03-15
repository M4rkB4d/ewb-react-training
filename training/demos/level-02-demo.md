# Level 2 — First App: Instructor Demo

> **EastWest Bank — Digital Platforms & Innovations**
>
> Duration: 15-20 minutes
>
> Covers: A04 (Components and JSX), A05 (Your First Test), B01 (Project Setup)

---

## Setup Before the Demo

- Have the EWB banking project scaffolded and running (`npm run dev` at `http://localhost:5173`)
- Have VS Code open to the project root
- Have a terminal split: one for the dev server, one for running tests
- Clear `src/App.tsx` to a minimal starting point

---

## Part 1: Build the AccountCard Live (8 minutes)

### Step 1: Start with the interface

Create `src/features/accounts/components/account-card.tsx` and type the interface:

```typescript
interface AccountCardProps {
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  isActive: boolean;
  onTransfer?: (accountNumber: string) => void;
}
```

**Talking point:** "Every component starts with an interface. This is the contract between the component and its consumer. TypeScript enforces it."

### Step 2: Scaffold the component

```tsx
export function AccountCard({
  accountName,
  accountNumber,
  accountType,
  balance,
  isActive,
  onTransfer,
}: AccountCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3>{accountName}</h3>
      <p>{accountNumber}</p>
      <p>{balance}</p>
    </div>
  );
}
```

**Show it in the browser.** Raw, unstyled. "It works, but it's showing the full account number. That's a compliance violation."

### Step 3: Add data masking

```tsx
const maskedNumber = `••••${accountNumber.slice(-4)}`;
```

Replace `{accountNumber}` with `{maskedNumber}`.

**Talking point:** "Data masking is not an afterthought. It's built into the component from the first version. DPA requires it. We never show full account numbers."

### Step 4: Add currency formatting

```tsx
const formattedBalance = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
}).format(balance);
```

Replace `{balance}` with `{formattedBalance}`.

**Show in browser.** "Now it shows ₱150,000.00 instead of 150000."

### Step 5: Add conditional rendering

Add the active/inactive indicator and conditional action buttons:

```tsx
{isActive && onTransfer != null && (
  <button
    type="button"
    onClick={() => onTransfer(accountNumber)}
    className="rounded-lg bg-ewb-purple px-4 py-2 text-sm text-white"
  >
    Transfer
  </button>
)}
```

**Talking point:** "Notice two things: `type='button'` — always explicit. And the callback passes the full account number, not the masked one. The display is masked, the data is not."

### Step 6: Add accessibility

```tsx
<span
  className={`inline-block h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
  aria-label={isActive ? 'Active account' : 'Inactive account'}
/>
```

**Talking point:** "A green dot means nothing to a screen reader. The `aria-label` gives it meaning. BSP 1033 requires this."

### Step 7: Use it in App.tsx

```tsx
<AccountCard
  accountName="Personal Savings"
  accountNumber="1234567890"
  accountType="savings"
  balance={150000} {/* Level 2: amount is pesos — centavos model starts at Level 5 (B03) */}
  isActive={true}
  onTransfer={(num) => alert(`Transfer from ${num}`)}
/>
```

**Show in browser.** The complete card with masked number, formatted balance, purple transfer button, and green status dot.

---

## Part 2: Test the AccountCard Live (7 minutes)

### Step 1: Create the test file

Create `src/features/accounts/components/account-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccountCard } from './account-card';

const defaultProps = {
  accountName: 'Personal Savings',
  accountNumber: '1234567890',
  accountType: 'savings' as const,
  balance: 150000,
  isActive: true,
};
```

**Talking point:** "`defaultProps` lets every test start from the same baseline. Override only what's different."

### Step 2: First test — rendering

```tsx
describe('AccountCard', () => {
  it('displays the account name', () => {
    render(<AccountCard {...defaultProps} />);
    expect(screen.getByText('Personal Savings')).toBeInTheDocument();
  });
});
```

Run `npm run test:run`. Show the green checkmark.

### Step 3: Compliance test — masking

```tsx
it('masks the account number showing only last 4 digits', () => {
  render(<AccountCard {...defaultProps} />);
  // Full number must NOT appear — DPA compliance
  expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
  // Masked version must appear
  expect(screen.getByText('••••7890')).toBeInTheDocument();
});
```

Run tests again. **Talking point:** "This test is a compliance control. It proves that the full account number never reaches the screen. If someone accidentally removes the masking, this test fails. That's the value of testing in a banking context."

### Step 4: Interaction test

```tsx
it('calls onTransfer when Transfer is clicked', async () => {
  const user = userEvent.setup();
  const handleTransfer = vi.fn();

  render(<AccountCard {...defaultProps} onTransfer={handleTransfer} />);
  await user.click(screen.getByRole('button', { name: 'Transfer' }));

  expect(handleTransfer).toHaveBeenCalledWith('1234567890');
});
```

**Talking point:** "Three things to notice. One: `userEvent`, not `fireEvent` — simulates real clicks. Two: `vi.fn()` records how the function was called. Three: `getByRole` — we find the button the way a screen reader would."

### Step 5: Negative test

```tsx
it('does not show Transfer button for inactive accounts', () => {
  render(
    <AccountCard {...defaultProps} isActive={false} onTransfer={() => {}} />,
  );
  expect(
    screen.queryByRole('button', { name: 'Transfer' }),
  ).not.toBeInTheDocument();
});
```

Run all tests. Show the full passing suite.

---

## Part 3: Project Structure Tour (3 minutes)

Walk through the directory structure in VS Code:

```
src/
├── components/ui/    ← "Shared components — Button, Input, Card"
├── features/         ← "Each feature is self-contained"
│   └── accounts/
│       └── components/
│           ├── account-card.tsx       ← "Component"
│           └── account-card.test.tsx  ← "Test lives next to it"
├── lib/              ← "Utilities — formatCurrency, masking"
├── types/            ← "Shared types — Account, Transaction"
└── index.css         ← "EWB theme — single source of truth"
```

**Talking point:** "Feature-slice means everything for accounts is in one place. When you have 30 features, this is the difference between navigating your code and drowning in it."

Show the Tailwind theme in `index.css` briefly. Point out the EWB purple value `#500778`.

---

## Wrap-Up (2 minutes)

### Key Messages

1. Components start with an interface — the contract
2. Data masking is built in from line one, not bolted on later
3. Tests prove compliance — the masking test is a regulatory control
4. `getByRole` tests accessibility and functionality simultaneously
5. Feature-slice keeps related code together

### Transition to Level 3

"You can now build components and prove they work. Level 3 gives you the design system, validated forms, and accessibility — the three pillars of a production banking UI."

---

---

## If Things Go Wrong

### Pre-Demo Checklist

- [ ] Dev server running at `http://localhost:5173` and showing content in the browser
- [ ] Test runner works: `npm run test:run` completes without config errors
- [ ] `@testing-library/react` and `@testing-library/user-event` installed
- [ ] VS Code split terminal ready: one for dev server, one for tests

### Common Issues

**Dev server fails to start or shows a blank page**
- Cause: Port conflict, missing dependencies, or Vite config error
- Recovery: Run `npx vite --port 5174` to try another port. If dependencies are missing, run `npm install` first. If still broken, switch to the companion repo's working branch.

**Test fails with "Cannot find module" or JSX transform error**
- Cause: Vitest not configured for JSX, or path alias (`@/`) not resolved
- Recovery: Show the test concept on the code itself — walk through what each assertion checks and why. Say "The test logic is what matters. We will fix the config in the exercise."

**`userEvent.click` does not trigger the callback**
- Cause: Button not rendered (conditional rendering hides it), or `userEvent.setup()` missing
- Recovery: Add `screen.debug()` to print the rendered DOM. Show the audience the output — this is itself a useful debugging technique to teach.

**AccountCard does not render the masked number**
- Cause: Masking logic not yet added, or component not imported correctly
- Recovery: Type the masking line live and save. If hot reload does not pick it up, refresh the browser manually.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
