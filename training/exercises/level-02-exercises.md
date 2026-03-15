# Level 2 — First App: Exercises

> **EastWest Bank — Digital Platforms & Innovations**
>
> Covers: A04 (Components and JSX), A05 (Your First Test), B01 (Project Setup)

---

## Exercise 1: Transaction History Component

**Difficulty:** Starter

### Learning Objectives

- Build a typed React component with an interface for props
- Use `.map()` with proper `key` props to render a list
- Apply conditional rendering for empty states and conditional styling
- Format currency values using `Intl.NumberFormat`

### Requirements

Create `src/features/accounts/components/transaction-history.tsx`:

A `TransactionHistory` component that accepts an array of transactions and renders them as a list.

### Props Interface

```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string; // ISO date string
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
}
```

### Visual Requirements

- Display a title (defaults to "Recent Transactions")
- Show an empty state message when no transactions exist: "No transactions found for this period."
- Each transaction row displays: description, formatted date (e.g., "Mar 12, 2026"), amount in PHP
- Credit amounts display in green with a `+` prefix
- Debit amounts display in red with a `-` prefix
- Pending transactions show a yellow "Pending" badge
- Failed transactions show a red "Failed" badge

### Acceptance Criteria

- [ ] Component renders with sample data visible at `http://localhost:5173`
- [ ] Empty array shows the empty state message
- [ ] Credits are green, debits are red
- [ ] Dates are formatted correctly
- [ ] All amounts show the ₱ symbol with two decimal places
- [ ] Each list item has a unique `key` using `transaction.id`
- [ ] `npx tsc --noEmit` passes

---

## Exercise 2: Account Summary Dashboard

**Difficulty:** Intermediate

### Learning Objectives

- Compose multiple components together (Card, Badge, Button)
- Use the EWB design system components from A06
- Implement data masking for account numbers (DPA compliance)
- Handle callback props for user actions

### Requirements

Create `src/features/accounts/components/account-dashboard.tsx`:

An `AccountDashboard` component that displays a summary of the user's accounts.

### Props Interface

```typescript
interface AccountSummary {
  id: string;
  accountName: string;
  accountNumber: string;
  type: 'savings' | 'checking' | 'time-deposit';
  balance: number;
  currency: string;
  isActive: boolean;
}

interface AccountDashboardProps {
  accounts: AccountSummary[];
  totalBalance: number;
  isLoading: boolean;
  onTransfer: (accountId: string) => void;
  onViewDetails: (accountId: string) => void;
}
```

### Visual Requirements

- Show total balance across all accounts at the top, formatted as PHP
- Display each account in a Card component with:
  - Account name and masked account number (last 4 digits only)
  - Account type Badge (use EWB colors)
  - Balance formatted as PHP
  - Active/inactive status indicator
  - "Transfer" and "Details" buttons (only for active accounts)
- Show a loading skeleton when `isLoading` is true
- Show "No accounts found. Contact your branch to get started." when the array is empty

### Acceptance Criteria

- [ ] Total balance displays correctly formatted
- [ ] Account numbers are masked (e.g., "••••7890")
- [ ] Full account numbers never appear on screen
- [ ] Active accounts show action buttons; inactive accounts do not
- [ ] Loading state shows placeholder content
- [ ] Empty state shows a helpful message
- [ ] `npx tsc --noEmit` passes

---

## Exercise 3: Testing the Transaction History

**Difficulty:** Intermediate

### Learning Objectives

- Write component tests with Vitest and React Testing Library
- Use RTL query priority (`getByRole`, `getByText`, `queryByText`)
- Test conditional rendering and user interactions
- Use `vi.fn()` to verify callback behavior

### Requirements

Create `src/features/accounts/components/transaction-history.test.tsx`:

Write tests for the `TransactionHistory` component from Exercise 1.

### Required Test Cases

```typescript
describe('TransactionHistory', () => {
  describe('rendering', () => {
    // 1. Displays the default title "Recent Transactions"
    // 2. Displays a custom title when provided
    // 3. Formats credit amounts with ₱ symbol and green color
    // 4. Formats debit amounts with ₱ symbol and red color
    // 5. Formats dates in readable format
  });

  describe('empty state', () => {
    // 6. Shows "No transactions found" when array is empty
    // 7. Does not show the empty message when transactions exist
  });

  describe('status badges', () => {
    // 8. Shows "Pending" badge for pending transactions
    // 9. Shows "Failed" badge for failed transactions
    // 10. Does not show a badge for completed transactions
  });
});
```

### Acceptance Criteria

- [ ] All 10 test cases pass with `npm run test:run`
- [ ] Tests use `getByRole` and `getByText` queries (no `getByTestId`)
- [ ] Tests follow the Arrange-Act-Assert pattern
- [ ] Shared test data is defined once as a module-level constant and reused across tests
- [ ] No implementation details tested (no CSS classes, no internal state)

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
