# A05 — Your First Test

> **EastWest Bank — Digital Platforms & Innovations**
>
> Part A (Core) · Level 2 — First App · Est. 2 hours

---

## What You Will Learn

By the end of this guide, you will:

- Understand why testing is mandatory for banking applications
- Write component tests with Vitest and React Testing Library
- Use queries that match how users interact with your UI
- Test user interactions: clicks, typing, conditional rendering
- Understand the testing philosophy: test behavior, not implementation
- Write tests for the AccountCard component from A04
- Run tests in watch mode and interpret results

---

## Prerequisites

| Requirement | Where |
|------------|-------|
| Completed B01 — Project Setup | Level 2 |
| Completed A04 — Components and JSX | Level 2 |
| Vitest and React Testing Library installed | B01 Phase 8 |
| The AccountCard component from A04 | Level 2 |

---

## Why Testing Is Not Optional

In a todo app, a bug means a missing grocery item. In a banking app, a bug means:

- A customer sees the wrong balance and makes financial decisions based on it
- A transfer goes to the wrong account
- Sensitive data is displayed unmasked
- An inactive account allows transactions

BSP Circular 808 requires banks to manage IT risks systematically. Automated tests
are the most effective risk management control a frontend developer has. Every test
you write is a guarantee that a specific behavior works correctly — today and after
every future code change.

Testing is introduced at Level 2 — not Level 6 — because every component you build
from this point forward should have tests. Testing is not a phase. Testing is a habit.

---

## Phase 1 — The Testing Stack

### Vitest

Vitest is the test runner. It discovers test files, executes them, and reports results.
Vitest is built on Vite, so it uses the same configuration (path aliases, TypeScript,
JSX) — no separate setup needed.

### React Testing Library (RTL)

RTL provides utilities to render React components in a test environment and interact
with them. Its core philosophy: **test components the way users use them**.

Users do not care about component state, prop values, or internal hooks. Users see
text on screen, click buttons, type in inputs, and read results. Your tests should
do the same.

### jest-dom

Extends Vitest's assertions with DOM-specific matchers like `toBeInTheDocument()`,
`toHaveTextContent()`, `toBeVisible()`, and `toBeDisabled()`. Already configured
in `src/test/setup.ts` (from B01).

### The testing equation

```
Vitest (runner) + RTL (rendering) + jest-dom (assertions) = Component tests
```

---

## Phase 2 — Your First Test

### Test file conventions

Test files go next to the component they test:

```
src/features/accounts/components/
├── account-card.tsx           ← Component
└── account-card.test.tsx      ← Test
```

This co-location means you can see at a glance whether a component has tests. If
there is no `.test.tsx` file next to it, it is untested.

### Anatomy of a test file

```tsx
// src/features/accounts/components/account-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccountCard } from './account-card';

describe('AccountCard', () => {
  it('displays the account name', () => {
    render(
      <AccountCard
        accountName="Personal Savings"
        accountNumber="1234567890"
        accountType="savings"
        balance={150000}
        isActive={true}
      />,
    );

    expect(screen.getByText('Personal Savings')).toBeInTheDocument();
  });
});
```

**Breaking it down:**

| Part | Purpose |
|------|---------|
| `import { render, screen }` | RTL utilities to render and query components |
| `import { describe, it, expect }` | Vitest test structure and assertions |
| `describe('AccountCard', ...)` | Groups related tests under a label |
| `it('displays the account name', ...)` | A single test case with a human-readable description |
| `render(<AccountCard ... />)` | Renders the component in a virtual DOM |
| `screen.getByText(...)` | Finds an element by its visible text |
| `expect(...).toBeInTheDocument()` | Asserts the element exists in the document |

### Run it

```bash
npm run test:run
```

You should see:

```
 ✓ src/features/accounts/components/account-card.test.tsx (1 test)
   ✓ AccountCard > displays the account name

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

### Watch mode

During development, use watch mode:

```bash
npm test
```

Vitest watches your files and re-runs relevant tests when you save. This instant
feedback loop is essential — you should always have `npm test` running in a terminal
while developing.

### Checkpoint 1

Write and run your first test. Verify it passes. Then break it intentionally
(change the expected text) and confirm Vitest reports a failure. Fix it and confirm
it passes again.

---

## Phase 3 — RTL Queries

### The query priority

React Testing Library provides several ways to find elements. Use them in this order:

| Priority | Query | When to Use |
|----------|-------|-------------|
| 1 | `getByRole` | Buttons, links, headings, inputs with labels |
| 2 | `getByLabelText` | Form inputs with associated labels |
| 3 | `getByPlaceholderText` | Inputs with placeholder text |
| 4 | `getByText` | Non-interactive text content |
| 5 | `getByDisplayValue` | Inputs with a current value |
| 6 | `getByAltText` | Images with alt text |
| 7 | `getByTestId` | Last resort — when no accessible query works |

**Why this order?** The higher-priority queries match how users and assistive
technologies find elements. A screen reader user finds a button by its role and
label, not by its CSS class or test ID.

### Query variants

| Variant | Returns | Throws on Missing? | Use For |
|---------|---------|--------------------|---------|
| `getBy...` | Element | Yes | Elements that must exist |
| `queryBy...` | Element or `null` | No | Elements that may not exist |
| `findBy...` | Promise\<Element\> | Yes | Elements that appear asynchronously |

```tsx
// Element MUST exist — throws if missing
const heading = screen.getByText('Personal Savings');

// Element MIGHT NOT exist — returns null if missing
const warning = screen.queryByText('Low balance warning');

// Element will APPEAR LATER — waits up to timeout
const result = await screen.findByText('Transfer complete');
```

### Examples with the AccountCard

```tsx
// Find the account name heading
screen.getByText('Personal Savings');

// Find the masked account number
screen.getByText('••••7890');

// Find the account type badge
screen.getByText('Savings');

// Find a button by its role and name
screen.getByRole('button', { name: 'Transfer' });

// Check something does NOT exist
expect(screen.queryByRole('button', { name: 'Transfer' })).not.toBeInTheDocument();
```

### Checkpoint 2

Using the query priority list, determine the best query for each:
1. A "Submit" button
2. A text paragraph that says "No transactions found."
3. An email input with label "Email Address"
4. An image of the EWB logo

Answers: 1→`getByRole('button', { name: 'Submit' })`, 2→`getByText('No transactions found.')`,
3→`getByLabelText('Email Address')`, 4→`getByAltText(...)` or `getByRole('img', { name: ... })`

---

## Phase 4 — Testing the AccountCard

### Full test suite

```tsx
// src/features/accounts/components/account-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AccountCard } from './account-card';

const defaultProps = {
  accountName: 'Personal Savings',
  accountNumber: '1234567890',
  accountType: 'savings' as const,
  balance: 150000,
  isActive: true,
};

describe('AccountCard', () => {
  // ── Rendering ──────────────────────────────────────

  it('displays the account name', () => {
    render(<AccountCard {...defaultProps} />);
    expect(screen.getByText('Personal Savings')).toBeInTheDocument();
  });

  it('masks the account number showing only last 4 digits', () => {
    render(<AccountCard {...defaultProps} />);
    // DPA compliance: full number must NOT appear
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
    // Only masked version should appear
    expect(screen.getByText('••••7890')).toBeInTheDocument();
  });

  it('displays the account type', () => {
    render(<AccountCard {...defaultProps} />);
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('formats the balance as Philippine Peso', () => {
    render(<AccountCard {...defaultProps} />);
    // Intl.NumberFormat with PHP produces ₱150,000.00
    expect(screen.getByText('₱150,000.00')).toBeInTheDocument();
  });

  it('displays balance with centavos', () => {
    render(<AccountCard {...defaultProps} balance={42500.5} />);
    expect(screen.getByText('₱42,500.50')).toBeInTheDocument();
  });

  // ── Conditional Rendering ──────────────────────────

  it('shows active indicator for active accounts', () => {
    render(<AccountCard {...defaultProps} isActive={true} />);
    expect(screen.getByLabelText('Active account')).toBeInTheDocument();
  });

  it('shows inactive indicator for inactive accounts', () => {
    render(<AccountCard {...defaultProps} isActive={false} />);
    expect(screen.getByLabelText('Inactive account')).toBeInTheDocument();
  });

  it('does not show action buttons for inactive accounts', () => {
    render(
      <AccountCard
        {...defaultProps}
        isActive={false}
        onTransfer={() => {}}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Transfer' })).not.toBeInTheDocument();
  });

  it('shows transfer button when onTransfer is provided and account is active', () => {
    render(
      <AccountCard
        {...defaultProps}
        isActive={true}
        onTransfer={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Transfer' })).toBeInTheDocument();
  });

  it('does not show transfer button when onTransfer is not provided', () => {
    render(<AccountCard {...defaultProps} isActive={true} />);
    expect(screen.queryByRole('button', { name: 'Transfer' })).not.toBeInTheDocument();
  });

  // ── User Interactions ──────────────────────────────

  it('calls onTransfer with account number when Transfer is clicked', async () => {
    const user = userEvent.setup();
    const handleTransfer = vi.fn();

    render(
      <AccountCard
        {...defaultProps}
        onTransfer={handleTransfer}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Transfer' }));

    expect(handleTransfer).toHaveBeenCalledOnce();
    expect(handleTransfer).toHaveBeenCalledWith('1234567890');
  });

  it('calls onViewDetails with account number when View Details is clicked', async () => {
    const user = userEvent.setup();
    const handleViewDetails = vi.fn();

    render(
      <AccountCard
        {...defaultProps}
        onViewDetails={handleViewDetails}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'View Details' }));

    expect(handleViewDetails).toHaveBeenCalledOnce();
    expect(handleViewDetails).toHaveBeenCalledWith('1234567890');
  });

  // ── Edge Cases ─────────────────────────────────────

  it('handles zero balance', () => {
    render(<AccountCard {...defaultProps} balance={0} />);
    expect(screen.getByText('₱0.00')).toBeInTheDocument();
  });

  it('defaults currency to PHP', () => {
    render(<AccountCard {...defaultProps} />);
    // ₱ symbol confirms PHP currency
    expect(screen.getByText('₱150,000.00')).toBeInTheDocument();
  });
});
```

### Run the full suite

```bash
npm run test:run
```

Expected output:

```
 ✓ src/features/accounts/components/account-card.test.tsx (12 tests)
   ✓ AccountCard > displays the account name
   ✓ AccountCard > masks the account number showing only last 4 digits
   ✓ AccountCard > displays the account type
   ✓ AccountCard > formats the balance as Philippine Peso
   ✓ AccountCard > displays balance with centavos
   ✓ AccountCard > shows active indicator for active accounts
   ✓ AccountCard > shows inactive indicator for inactive accounts
   ✓ AccountCard > does not show action buttons for inactive accounts
   ✓ AccountCard > shows transfer button when onTransfer is provided and account is active
   ✓ AccountCard > does not show transfer button when onTransfer is not provided
   ✓ AccountCard > calls onTransfer with account number when Transfer is clicked
   ✓ AccountCard > calls onViewDetails with account number when View Details is clicked

 Test Files  1 passed (1)
      Tests  12 passed (12)
```

### What these tests verify

| Test | Compliance |
|------|-----------|
| Masks account number | DPA — personal data masking |
| Formats as PHP | Business logic correctness |
| No buttons on inactive accounts | BSP 982 — access control |
| Transfer callback with full account number | Functional correctness (masked display, full data in callback) |
| Zero balance handling | Edge case for financial data |

### Checkpoint 3

Run the test suite and verify all 12 tests pass. If any fail, read the error message
carefully — it will tell you exactly what was expected vs. what was found.

---

## Phase 5 — Testing User Interactions

### userEvent vs fireEvent

React Testing Library provides two ways to simulate user interactions:

| Method | Simulates | Use For |
|--------|-----------|---------|
| `userEvent` | Real user behavior (delays, focus, blur) | Almost everything |
| `fireEvent` | Direct DOM events (no intermediate events) | Low-level edge cases only |

**Always prefer `userEvent`.** It simulates what actually happens when a user clicks
or types — focus events, pointer events, keyboard events — not just the final event.

```tsx
import userEvent from '@testing-library/user-event';

// Setup a user instance
const user = userEvent.setup();

// Click a button (fires: pointerdown, mousedown, pointerup, mouseup, click)
await user.click(screen.getByRole('button', { name: 'Submit' }));

// Type in an input (fires: focus, keydown, input, keyup for each character)
await user.type(screen.getByLabelText('Amount'), '50000');

// Clear and type (select all, delete, then type)
await user.clear(screen.getByLabelText('Amount'));
await user.type(screen.getByLabelText('Amount'), '75000');

// Press a key
await user.keyboard('{Enter}');

// Tab to next element
await user.tab();
```

### Testing a form interaction

```tsx
// src/features/accounts/components/search-bar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  it('calls onSearch with the trimmed query on submit', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search transactions...');
    await user.type(input, '  groceries  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(handleSearch).toHaveBeenCalledWith('groceries');
  });

  it('submits on Enter key', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('Search transactions...');
    await user.type(input, 'payment{Enter}');

    expect(handleSearch).toHaveBeenCalledWith('payment');
  });

  it('does not submit an empty query', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    await user.click(screen.getByRole('button', { name: 'Search' }));

    // handleSearch should NOT be called with empty or whitespace
    expect(handleSearch).not.toHaveBeenCalled();
  });
});
```

### Mock functions with vi.fn()

`vi.fn()` creates a mock function that records how it was called:

```tsx
const mockFn = vi.fn();

// After calling it:
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledOnce();
expect(mockFn).toHaveBeenCalledWith('expected-arg');
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).not.toHaveBeenCalled();
```

### Checkpoint 4

Write a test that:
1. Renders the SearchBar
2. Types "fund transfer" into the input
3. Presses Enter
4. Verifies `onSearch` was called with "fund transfer"

---

## Phase 6 — Testing Philosophy

### Test behavior, not implementation

**Wrong: testing implementation details**

```tsx
// Do NOT do this
it('sets state to the input value', () => {
  render(<SearchBar onSearch={() => {}} />);
  const input = screen.getByPlaceholderText('Search...');
  fireEvent.change(input, { target: { value: 'test' } });
  // Testing internal state — this is an implementation detail
  expect(input).toHaveValue('test');
});
```

**Right: testing user-visible behavior**

```tsx
// Do this instead
it('submits the search query', async () => {
  const user = userEvent.setup();
  const handleSearch = vi.fn();
  render(<SearchBar onSearch={handleSearch} />);

  await user.type(screen.getByPlaceholderText('Search...'), 'test');
  await user.click(screen.getByRole('button', { name: 'Search' }));

  expect(handleSearch).toHaveBeenCalledWith('test');
});
```

The first test breaks if you refactor how the component stores its internal state
(e.g., switching from `useState` to `useRef`). The second test keeps passing as long
as the user-visible behavior is the same.

### What to test

| Test | Example | Why |
|------|---------|-----|
| Rendering | "Displays the account name" | Users see it |
| Conditional rendering | "Shows warning when balance is low" | Users see it conditionally |
| User interaction | "Calls onTransfer when Transfer is clicked" | Users do it |
| Accessibility | "Has proper ARIA labels" | Screen reader users need it |
| Edge cases | "Handles zero balance" | Real data includes edge cases |
| Data formatting | "Formats currency as PHP" | Users rely on correct formatting |

### What NOT to test

| Skip | Why |
|------|-----|
| Internal state values | Implementation detail — refactoring would break tests |
| CSS class names | Implementation detail — style changes would break tests |
| Component lifecycle | Implementation detail — React manages this |
| Third-party library internals | Not your code — the library has its own tests |

### The arrange-act-assert pattern

Every test follows three steps:

```tsx
it('shows low balance warning when balance is under 5000', () => {
  // Arrange — set up the test
  render(<AccountCard {...defaultProps} balance={3000} />);

  // Act — (sometimes no action needed for render tests)

  // Assert — verify the result
  expect(screen.getByText('Low balance warning')).toBeInTheDocument();
});
```

```tsx
it('calls onTransfer when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup();
  const handleTransfer = vi.fn();
  render(<AccountCard {...defaultProps} onTransfer={handleTransfer} />);

  // Act
  await user.click(screen.getByRole('button', { name: 'Transfer' }));

  // Assert
  expect(handleTransfer).toHaveBeenCalledWith('1234567890');
});
```

### Checkpoint 5

Look at the AccountCard test suite from Phase 4. Identify which tests are:
- Render tests (no user action, just check what appears)
- Interaction tests (simulate user action, check result)
- Negative tests (verify something does NOT appear)

---

## Phase 7 — Common Assertions

### DOM assertions (from jest-dom)

```tsx
// Element exists in the document
expect(element).toBeInTheDocument();

// Element has specific text
expect(element).toHaveTextContent('₱150,000.00');

// Element is visible (not hidden by CSS)
expect(element).toBeVisible();

// Element is disabled
expect(element).toBeDisabled();

// Element has a CSS class
expect(element).toHaveClass('bg-ewb-purple');

// Element has an attribute
expect(element).toHaveAttribute('type', 'button');

// Element has specific accessible name
expect(element).toHaveAccessibleName('Transfer');

// Form input has value
expect(input).toHaveValue('50000');
```

### Negating assertions

Add `.not` before any matcher:

```tsx
expect(element).not.toBeInTheDocument();
expect(element).not.toBeDisabled();
expect(mockFn).not.toHaveBeenCalled();
```

### Testing accessible elements

```tsx
it('has accessible labels on status indicators', () => {
  render(<AccountCard {...defaultProps} isActive={true} />);
  expect(screen.getByLabelText('Active account')).toBeInTheDocument();
});

it('uses proper heading hierarchy', () => {
  render(<AccountCard {...defaultProps} />);
  // getByRole with heading level
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    'Personal Savings',
  );
});
```

> **BSP 1033 Note:** Testing accessibility attributes is a compliance control. If
> your tests verify ARIA labels and heading hierarchy, you have documented proof
> that accessibility requirements are met.

---

## Phase 8 — Test Organization

### Grouping with describe

```tsx
describe('AccountCard', () => {
  describe('rendering', () => {
    it('displays the account name', () => { /* ... */ });
    it('masks the account number', () => { /* ... */ });
    it('formats the balance as PHP', () => { /* ... */ });
  });

  describe('when account is active', () => {
    it('shows the active indicator', () => { /* ... */ });
    it('shows action buttons', () => { /* ... */ });
  });

  describe('when account is inactive', () => {
    it('shows the inactive indicator', () => { /* ... */ });
    it('hides action buttons', () => { /* ... */ });
  });

  describe('user interactions', () => {
    it('calls onTransfer on click', async () => { /* ... */ });
    it('calls onViewDetails on click', async () => { /* ... */ });
  });
});
```

Nested `describe` blocks create a readable hierarchy in test output:

```
AccountCard
  rendering
    ✓ displays the account name
    ✓ masks the account number
    ✓ formats the balance as PHP
  when account is active
    ✓ shows the active indicator
    ✓ shows action buttons
  when account is inactive
    ✓ shows the inactive indicator
    ✓ hides action buttons
  user interactions
    ✓ calls onTransfer on click
    ✓ calls onViewDetails on click
```

### Shared setup with defaultProps

Define default props once and override per test:

```tsx
const defaultProps = {
  accountName: 'Personal Savings',
  accountNumber: '1234567890',
  accountType: 'savings' as const,
  balance: 150000,
  isActive: true,
};

// Override specific props per test
render(<AccountCard {...defaultProps} balance={0} />);
render(<AccountCard {...defaultProps} isActive={false} />);
render(<AccountCard {...defaultProps} accountType="checking" />);
```

This keeps tests concise — each test only specifies what is different from the default.

### Test coverage

Run coverage to see which code is tested:

```bash
npm run test:coverage
```

This generates a report showing which lines, branches, and functions are covered.
For banking applications, aim for high coverage on:
- All user-visible rendering logic
- All conditional rendering branches
- All event handlers
- All data formatting functions

Coverage is a guide, not a target. 100% coverage with meaningless tests is worse
than 80% coverage with meaningful tests.

### Checkpoint 6

Run `npm run test:coverage` and review the report. Identify any untested branches
in the AccountCard component.

---

## Key Takeaways

1. **Testing is mandatory for banking code.** BSP 808 requires risk management.
   Automated tests are the most effective control for frontend code.

2. **Test behavior, not implementation.** Users see text and click buttons. Your tests
   should do the same. Never test internal state or CSS classes.

3. **Use the query priority:** `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
   Higher-priority queries match how real users find elements.

4. **Use `userEvent`, not `fireEvent`.** `userEvent` simulates real user behavior
   including focus, pointer, and keyboard events.

5. **Co-locate tests with components.** `account-card.tsx` and `account-card.test.tsx`
   live in the same directory. No test file = untested component.

6. **Use `vi.fn()` for mock functions.** Verify that event handlers are called with
   the correct arguments.

7. **Arrange-Act-Assert** structures every test: set up, do something, check result.

8. **Coverage is a guide.** Focus on meaningful tests for user-visible behavior,
   data formatting, and conditional rendering.

---

## Exercises

### Exercise 1 — Test the TransactionRow

If you built the `TransactionRow` component from A04 Exercise 1, write tests for it:
- Displays the transaction description
- Formats credit amounts in green with a + prefix
- Formats debit amounts in red
- Formats amounts as Philippine Peso
- Displays the formatted date

File: `src/features/accounts/components/transaction-row.test.tsx`

Run with `npm run test:run` and verify all tests pass.

### Exercise 2 — Test the StatusBadge

If you built the `StatusBadge` component from A04 Exercise 2, write tests for it:
- Renders the label text
- Applies correct styling for each variant (success, warning, error, info, pending)
- Uses `getByRole` or `getByText` queries (no test IDs)

File: `src/components/ui/status-badge.test.tsx`

### Exercise 3 — Test the Empty State

Write tests for an `AccountList` component:
- Shows "No accounts found" when the array is empty
- Renders the correct number of AccountCard components when accounts are provided
- Passes the correct props to each AccountCard

This is a test of composition — the AccountList renders AccountCards, and your tests
verify the integration works.

---

## What Comes Next

You can now build components and prove they work with automated tests. Level 2 is
complete — you have a running project, real banking components, and a test suite.

Level 3 takes your UI to the next level with the EastWest Bank design system,
forms with validation, and accessibility.

**Next guide:** [A06 — Design System Foundations](../level-03-building-ui/A06_design-system-foundations.md)
— where you build a complete component library with the EWB brand.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
