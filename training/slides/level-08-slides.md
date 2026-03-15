# Level 8 — Mastery
## Slide Deck Outline

### Slide 1: Title Slide
- Level 8 — Mastery
- EastWest Bank React Training
- Digital Platforms & Innovations

### Slide 2: Learning Objectives
- Apply feature-slice architecture and Domain-Driven Design to frontend code
- Choose between WebSocket, SSE, and polling for real-time banking features
- Implement internationalization for English, Filipino, and Chinese
- Build a complete banking feature (Bill Payment) integrating all Level 1–8 concepts

### Slide 3: Feature-Slice Architecture
- `src/features/` — each feature is a self-contained module (accounts, transfers, payments)
- Each feature owns its own: components, API layer, store slices, types, tests
- Features communicate through defined interfaces — no reaching into another feature's internals
- Scales to 50+ screens and 20+ developers without becoming unmaintainable
- *Speaker notes: Show the folder structure for the accounts feature. Compare to a flat structure where everything is in shared folders — that breaks at scale.*

### Slide 4: Domain-Driven Design for Frontend
- Bounded contexts: accounts, transfers, payments, compliance — each has its own vocabulary
- Ubiquitous language: use the same terms the business uses (not programmer jargon)
- Entities and value objects: `Account` is an entity (has identity), `Money` is a value object
- The domain model lives in TypeScript types and Zod schemas
- *Speaker notes: Banking has rich domain language — debit, credit, ledger, settlement. Use it consistently in code, types, and variable names.*

### Slide 5: Module Boundaries and Dependencies
- Dependency rule: features can import from `shared/`, never from other features
- Cross-feature communication: events or shared stores (not direct imports)
- Facade pattern: expose a clean public API from each feature module
- Micro-frontend readiness: clear boundaries today make future extraction possible
- *Speaker notes: Draw the dependency graph. If accounts imports from transfers, you have a coupling problem. The Facade pattern prevents this.*

### Slide 6: Real-Time Patterns — Choosing the Right Tool
- **Polling**: client asks server repeatedly (account balances — every 30s)
- **SSE (Server-Sent Events)**: server pushes updates (transaction alerts, exchange rates)
- **WebSocket**: bidirectional real-time (customer support chat, live trading)
- Decision factors: update frequency, direction, complexity, infrastructure cost
- *Speaker notes: Show the decision matrix. Most banking features need polling or SSE — WebSocket is reserved for truly bidirectional use cases.*

### Slide 7: Smart Polling
- Adaptive intervals: poll every 5s while a transfer is pending, every 60s otherwise
- Stop polling when the tab is not visible (`document.visibilityState`)
- TanStack Query integration: `refetchInterval` with dynamic timing
- Exponential backoff when the server is slow or returning errors
- *Speaker notes: Demo smart polling for a transfer status — frequent while pending, stops when complete. Show the network tab.*

### Slide 8: Server-Sent Events (SSE)
- One-way stream: server pushes events to the browser
- Automatic reconnection built into the `EventSource` API
- Use cases: transaction notifications, exchange rate tickers, system alerts
- Integrate with TanStack Query: SSE updates invalidate relevant queries
- *Speaker notes: Demo an SSE connection receiving transaction alerts. Show how each event triggers a query invalidation to refresh the accounts list.*

### Slide 9: WebSocket Patterns
- Bidirectional communication: customer support chat, real-time collaboration
- Reconnection logic with exponential backoff and maximum retry count
- Connection state management: connecting, connected, disconnected, reconnecting
- Heartbeat mechanism to detect dead connections (60s interval)
- *Speaker notes: Show the WebSocket hook with reconnection. Demonstrate disconnecting the network and watching it reconnect automatically.*

### Slide 10: Internationalization Setup
- `react-intl` for message formatting, pluralization, and locale-aware numbers
- Three locales: English (en-US), Filipino (fil-PH), Chinese (zh-Hans)
- Lazy-loaded message bundles — only the active locale is downloaded
- Locale switcher component persists preference to user settings
- *Speaker notes: Show the IntlProvider setup. Explain that message bundles are code-split — switching locale loads a small JSON file, not the entire app.*

### Slide 11: Currency and Date Formatting
- Philippine Peso formatting: `₱1,234,567.89` with locale-aware grouping
- Date formatting respects locale: `March 14, 2026` vs. `Marso 14, 2026`
- Pluralization rules differ by language — `react-intl` handles this automatically
- Never hardcode currency symbols or date formats — always use the formatter
- *Speaker notes: Demo switching from English to Filipino — dates, currencies, and labels all update. Show a pluralization example (1 transaction vs. 5 transactions).*

### Slide 12: Integration Capstone — Bill Payment Feature
- A complete feature built from scratch using every concept from Levels 1–8
- Multi-step wizard: select biller → enter details → review → confirm → receipt
- Touches: components, forms, validation, state, routing, API, auth, errors, tests
- Feature-slice architecture: `src/features/bill-payment/` with full module structure
- *Speaker notes: This is where it all comes together. Walk through the feature architecture before coding — identify the components, stores, API calls, and test cases.*

### Slide 13: Capstone — Architecture Breakdown
- Components: `BillerCard`, `PaymentWizard`, `PaymentReceipt`, `BillerSearch`
- State: payment draft in Zustand, biller list and payment history in TanStack Query
- Routing: `/payments`, `/payments/new`, `/payments/history`, `/payments/:id`
- Compliance: audit trail for every payment, consent before first-time biller
- *Speaker notes: Show the architecture diagram. Each piece maps to a guide they have already completed — this is integration, not new concepts.*

### Slide 14: Capstone — The Test Pyramid Applied
- Unit: Zod schemas, currency formatting, biller search filtering
- Integration: wizard form submission with mock API, error handling flows
- E2E (Playwright): login → search biller → pay → verify receipt → check history
- Coverage target: 80%+ for the payment flow (BSP 808 financial feature requirement)
- *Speaker notes: The capstone is not complete without tests. Show the test plan — which tests exist at which level of the pyramid.*

### Slide 15: Key Takeaways
- Feature-slice architecture enforces boundaries that scale to large teams
- Choose the right real-time pattern: polling for most, SSE for push, WebSocket for bidirectional
- Internationalization is infrastructure — build it in, do not bolt it on
- The capstone proves mastery by integrating every concept into one feature
- Next: Level 9 — Public-Facing Applications
