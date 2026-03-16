# Level 2 Answer Key — First App

> **EastWest Bank — Digital Platforms & Innovations**
>
> React Training Program · Level 2 Instructor Reference

---

## Quiz Answers

### Question 1 — Answer: B

`<div className="card"><input type="text" /></div>` is valid JSX. Option A uses `class` instead of `className` and has an unclosed `<input>` tag. Option C has two root elements without a fragment wrapper. Option D uses `for` instead of `htmlFor`.

### Question 2 — Answer: False

JSX curly braces accept JavaScript expressions, not statements. You cannot use `if`, `for`, or `while` directly inside JSX. Use the ternary operator (`condition ? a : b`), logical AND (`condition && element`), or early returns before the JSX return.

### Question 3 — Answer: B

A fragment (`<>...</>`) groups multiple elements without adding an extra DOM node to the output. It solves the one-root-element-per-return rule without polluting the DOM with unnecessary wrapper `<div>` elements.

### Question 4 — Answer: C

React uses keys to track which list items changed, were added, or were removed between renders. Keys must be stable and unique within the list. Using array indices causes bugs when items are reordered, inserted, or deleted because the indices shift and React re-renders the wrong items.

### Question 5 — Answer: True

Props flow one direction: parent to child. This is called "unidirectional data flow." A child component receives props as read-only data and reports actions back to the parent through event handler callbacks (e.g., `onTransfer`).

### Question 6 — Answer: B

Props that accept handler functions use the `on` prefix (e.g., `onTransfer`, `onClick`). The functions that implement the handling logic use the `handle` prefix (e.g., `handleTransfer`, `handleClick`). This convention makes it clear what is a callback interface versus what is an implementation.

### Question 7 — Answer: B

React 19 accepts `ref` as a regular prop on custom components. The `forwardRef` wrapper required in React 18 and earlier is no longer needed. You simply add `ref?: React.Ref<HTMLElement>` to your props interface.

### Question 8 — Answer: B

Without an explicit `type` attribute, buttons inside a `<form>` default to `type="submit"`, which will submit the form when clicked. Adding `type="button"` prevents this unintended behavior for buttons that should perform other actions like navigation or toggling.

### Question 9 — Answer: False

You should test user-visible behavior, not implementation details. Testing internal state values and CSS class names makes tests brittle — they break when you refactor the component's internals even if the visible behavior is unchanged. Test what users see and do.

### Question 10 — Answer: C

`getByRole('button', { name: 'Submit' })` is the highest-priority query for buttons. It matches how real users and screen readers find elements — by their role and accessible name. `getByTestId` is a last resort, and `getByClassName` does not exist in RTL.

### Question 11 — Answer: B

`userEvent` simulates the full sequence of events a real user produces — clicking fires pointerdown, mousedown, pointerup, mouseup, then click. `fireEvent` fires only the single event you specify. Always prefer `userEvent` because it catches bugs that `fireEvent` misses.

### Question 12 — Answer: B

`vi.fn()` creates a mock function that records every call made to it, including arguments. You can then assert on it with `expect(mockFn).toHaveBeenCalledWith('expected-arg')` or `expect(mockFn).toHaveBeenCalledOnce()`.

### Question 13 — Answer: True

Co-locating test files with their components (`account-card.tsx` and `account-card.test.tsx` in the same directory) makes it immediately visible whether a component has tests. If there is no `.test.tsx` file next to it, it is untested.

### Question 14 — Answer: B

`strict: true` enables all strict type-checking options in TypeScript, including `strictNullChecks`, `strictFunctionTypes`, and `strictPropertyInitialization`. It catches the widest range of bugs at compile time with zero runtime cost — critical for banking code.

### Question 15 — Answer: B

Feature-slice architecture keeps all related files for a feature in one directory (components, hooks, types, tests). Changing a feature means editing one directory instead of five. This scales well — a banking application with 30 features remains navigable.

### Question 16 — Answer: False

Pre-commit hooks are a change management control required by BSP Circular 808 and SOX. They prevent code that fails linting or breaks tests from entering the repository. Bypassing them for "urgent" deployments is precisely the scenario they are designed to prevent.

### Question 17 — Answer: B

The Zod-based environment validation in `env.ts` uses `safeParse` on `import.meta.env` at startup. If any required variable is missing or invalid, the application throws an error immediately — not hours later when the missing value is first used deep inside a feature.

### Question 18 — Answer: B

BSP Circular 808 (IT Risk Management) requires banks to manage IT risks systematically, including testing all changes before deployment. Automated tests are the most effective risk management control a frontend developer has. Every test guarantees a specific behavior works correctly.

### Question 19 — Answer: True

With `noUncheckedIndexedAccess` enabled, accessing `array[0]` returns `T | undefined` instead of `T`, forcing you to handle the case where the element might not exist. This prevents runtime crashes from out-of-bounds access on empty or shorter-than-expected arrays.

### Question 20 — Answer: C

The Data Privacy Act (RA 10173) requires masking of personal information. Account numbers are personal data that can identify a customer's financial relationship. The standard masking pattern shows only the last 4 digits (e.g., "------7890") to prevent exposure through shoulder surfing or screenshots.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
