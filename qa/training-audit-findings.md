# Training Materials vs Guides — Cross-Reference Audit

Generated: 2026-03-16
Audited: 29 training files (slides, quizzes, exercises, answer-keys, demos, meta-docs) against 37 guides

---

## Totals

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 9 |
| MEDIUM | 10 |
| LOW | 8 |
| **TOTAL** | **30** |

---

## CRITICAL (3)

### T-C01. MfaForm answer key API mismatch (level-05-answers.md)
Answer key's MfaForm calls `verifyMfa.mutate({ code, mfaToken })` with two properties. Guide B04 defines `useVerifyMfa` to accept only `code: string` (reads mfaToken from store). TypeScript compile error.
**Fix**: Align answer key with B04's zero-prop MfaForm.

### T-C02. ewb-lime in answer key (level-06-answers.md)
TransactionList solution uses `text-ewb-lime-700` for credit amounts. Fails WCAG contrast — branch uses emerald-600.
**Fix**: Replace `text-ewb-lime-700` with `text-emerald-700`.

### T-C03. Broken acceptance criterion (level-07-exercises.md)
Exercise 3 requires "SOX change management pattern from B07" but answer key only shows SecurityAudit and VerifyHeaders — no approval gate or production deployment stage.
**Fix**: Add approval gate YAML to answer key, or rephrase criterion.

---

## HIGH (9)

### T-H01. Systemic ewb-lime in training materials
Affects: level-06-answers, level-08-answers, level-09-answers, QUICK_START.md
All use ewb-lime tokens that fail WCAG. Needs bulk replace with emerald.

### T-H02. TRANSFER_CONFIRM vs CONFIRM_TRANSFER (level-08-answers.md)
Event name mismatch vs level-06 AuditAction type. TypeScript error.

### T-H03. Instructor Guide missing Day 10 (INSTRUCTOR_GUIDE.md)
Level 7 covers Days 8-10 per ONBOARDING.md but Instructor Guide only has Days 8-9. B07 and A17 undocumented.

### T-H04. Next.js 16 version pinning (slides/level-09-slides.md)
Slides use `create-next-app@16` but guide A21 uses `@latest`. May fail if 16 not published.

### T-H05. Quiz Q3 duplicate (level-07-quiz vs level-05-quiz)
Same question about in-memory variables appears in both quizzes. Redundant.

### T-H06. useAuthInit not named in answer (level-05-answers.md)
Quiz Q12 asks about useAuthInit but answer never mentions the hook by name.

### T-H07. Demo transition error (level-06-demo.md)
Says "Levels 4-6 are complete" — should be "Levels 1-6".

### T-H08. Exercise centavo max verified (level-08-exercises.md)
₱500,000 = 50,000,000 centavos — math checks out. No fix needed.

### T-H09. Audit IP field in frontend slides (level-07-slides.md)
Slide says frontend emits IP in audit events — guides say IP is server-side only.

---

## MEDIUM (10)

### T-M01. Answer key uses simple retry, guide teaches mutex (level-05-answers)
### T-M02. Duplicate quiz question across levels (level-07 Q3 = level-05 Q3)
### T-M03. ONBOARDING Day 8 rationale missing from Instructor Guide
### T-M04. Docker image 200MB criterion unverifiable (level-09-exercises)
### T-M05. Audit IP field contradiction (level-07-slides)
### T-M06. React Compiler quiz question ambiguity (level-06-quiz Q4)
### T-M07. Azure Blob vs Container Apps nuance (level-07-answers Q9)
### T-M08. Demo i18n strings may not exist in locale files (level-08-demo)
### T-M09. MEASUREMENT_FRAMEWORK exercise count verified (27 correct)
### T-M10. Demo Part 1 SQL error example unrealistic (level-06-demo)

---

## LOW (8)

### T-L01. formatPHP transition note accurate (INSTRUCTOR_GUIDE)
### T-L02. Next.js 16 version in exercises (consistent with project standard)
### T-L03. Level-07 demo duration tight (15-20 min for 3-day content)
### T-L04. AFASA RA 12010 number not in guides (level-05-slides)
### T-L05. ewb-lime in level-09-answers (duplicate of systemic issue)
### T-L06. Quiz question count verified (12 correct)
### T-L07. QUICK_START color table uses ewb-lime for success
### T-L08. Frontend SQL error example in demo unrealistic

---

## Priority Actions

### Immediate (causes errors)
- T-C01: Fix MfaForm answer key API
- T-C02 + T-H01: Bulk replace ewb-lime → emerald in all training materials
- T-H02: Fix TRANSFER_CONFIRM → CONFIRM_TRANSFER

### Soon (confusing)
- T-C03: Add SOX approval gate to level-07 answer key
- T-H03: Add Day 10 to Instructor Guide
- T-H04: Fix create-next-app version in slides
- T-H09: Remove IP from frontend audit slide
