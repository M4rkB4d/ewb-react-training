# Training Program — Measurement Framework

> **EastWest Bank — Digital Platforms & Innovations**
>
> How to measure whether this program is working, and prove it.

---

## Why Measure

This framework exists to answer one question: **Is this training program worth the investment?**

Thirteen working days of a developer's time costs the company roughly ₱80,000–₱150,000 in salary alone (excluding opportunity cost). If the program works, it should pay for itself within the first quarter through faster delivery, fewer bugs, and cleaner audit results.

---

## Baseline: Capture Before Training

Before the first cohort starts, record these numbers. Without a baseline, improvement is just a claim.

### Developer Metrics (per developer)

| Metric | How to Measure | Where to Find It |
|--------|---------------|-------------------|
| **Time to first meaningful PR** | Days from start date to first merged PR that isn't a typo fix | Azure DevOps / GitHub |
| **Time to independent feature delivery** | Days from start date to first feature shipped without pair programming | Team lead assessment |
| **PR review rejection rate** | % of PRs sent back for rework in first 3 months | Azure DevOps |
| **Production bug rate** | Bugs attributed to dev in first 6 months | Bug tracker |

### Team/Org Metrics

| Metric | How to Measure | Where to Find It |
|--------|---------------|-------------------|
| **Security audit findings** | Number of frontend-related findings per audit cycle | Internal audit reports |
| **BSP compliance gaps** | Frontend-related items flagged during BSP examination | Compliance team |
| **Onboarding cost (external)** | Cost of external React training per developer before this program | HR/L&D records |
| **Mean time to resolve frontend incidents** | Average resolution time for P1/P2 frontend bugs | Incident management |
| **Code review turnaround** | Average time from PR opened to PR merged | Azure DevOps |

---

## Pre-Training Assessment (Pretest)

Administer the [pretest](quizzes/pretest.md) on Day 1 morning, before any instruction. This 20-question diagnostic (multiple choice + true/false) samples all 9 levels and establishes each trainee's baseline.

### Pretest Scoring

| Score Range | Interpretation | Recommended Action |
|-------------|---------------|--------------------|
| 0–5 (0–25%) | Beginner — limited React/web security knowledge | Standard 13-day track. Extra attention on Levels 1–3. |
| 6–10 (30–50%) | Intermediate — solid web fundamentals, gaps in React or banking security | Standard track. May move faster through Levels 1–2. |
| 11–15 (55–75%) | Advanced — strong foundation | Consider pairing with beginners as peer mentor. Focus on Levels 5–9. |
| 16–20 (80–100%) | Expert — already knows most material | Offer the [3-day fast-track](QUICK_START.md) instead. |

### Pretest-to-Quiz Learning Gain

The primary value of the pretest is measuring learning gain. After each level quiz, compare scores:

| Metric | How to Calculate | Target |
|--------|-----------------|--------|
| **Per-level gain** | Level quiz score % minus pretest score % | ≥ 20 percentage points |
| **Overall gain** | Average of all 9 quiz scores minus pretest score % | ≥ 30 percentage points |
| **Cohort average gain** | Average overall gain across all trainees | ≥ 25 percentage points |

### Pretest Level Mapping

Each pretest question maps to a specific level, enabling per-topic baseline measurement:

| Pretest Questions | Level | Topic |
|-------------------|-------|-------|
| 1–3 | Level 1 | React fundamentals, TypeScript, state model |
| 4–5 | Level 2 | JSX compilation, test co-location |
| 6–8 | Level 3 | Design system, accessibility (WCAG), form validation |
| 9–10 | Level 4 | Client vs server state, protected routes |
| 11–12 | Level 5 | JWT security, token storage |
| 13–14 | Level 6 | Error boundaries, React Compiler |
| 15–16 | Level 7 | Security headers, CI/CD |
| 17 | Level 8 | Architecture dependency rules |
| 18–20 | Level 9 | SPA vs SSR, Next.js defaults, compliance rendering |

Use the level mapping to identify which levels each trainee already understands and which need the most attention.

---

## During Training: Track These

### Per-Learner Scorecard

Track for every participant across all 13 days:

| Indicator | Target | Red Flag |
|-----------|--------|----------|
| Pretest score | Record as baseline | Score ≥ 16 → consider fast-track instead |
| Quiz average (9 quizzes) | ≥ 70% | Below 50% on any single quiz |
| Exercise completion rate | 100% of required, 70% of recommended | Skipping required exercises |
| Capstone score | ≥ 70% overall, no criterion below 50% | Fails capstone on first attempt |
| Daily checkpoint pass rate | Self-assessed "yes" on all checkpoints | 2+ consecutive "no" answers |
| Questions asked per day | 2-5 (healthy engagement) | Zero questions (disengaged or lost) |
| Exercise completion | Learner completes all required exercises | Learner unable to finish exercises without extensive help |

### Cohort-Level Tracking

| Indicator | Target | Action If Missed |
|-----------|--------|-----------------|
| Cohort capstone pass rate | ≥ 85% first attempt | Review failing criteria — is the training unclear, or is the capstone too hard? |
| Average quiz score trend | Rising across levels (L1 < L5 < L9) | If scores drop at specific levels, that level's guide may need improvement |
| Exercise time accuracy | Actual within 30% of estimated | Adjust estimates for next cohort |
| NPS / satisfaction score | ≥ 7/10 | Collect specific feedback on what to fix |
| Drop-off rate | < 5% | Investigate why — pacing? difficulty? relevance? |

---

## After Training: Prove ROI (3-Month and 6-Month Checkpoints)

### 3-Month Check (per trained developer)

| Metric | Expected Improvement | How to Verify |
|--------|---------------------|---------------|
| **Time to first PR** | 50% faster than untrained hires | Compare with pre-program baseline |
| **PR rejection rate** | < 15% (vs. typical 30-40% for new hires) | Azure DevOps analytics |
| **TypeScript strict compliance** | 100% of new code passes `tsc --strict` | CI pipeline data |
| **Zod validation coverage** | All API responses validated | Code review checklist |
| **Security header compliance** | CSP, HSTS, X-Frame-Options on all new pages | Automated scan (e.g., Mozilla Observatory) |
| **Test coverage on new code** | ≥ 60% line coverage on features they built | CI coverage reports |

### 6-Month Check (team/org level)

| Metric | Expected Improvement | How to Verify |
|--------|---------------------|---------------|
| **Frontend security audit findings** | 40% reduction vs. previous audit cycle | Audit report comparison |
| **BSP examination gaps (frontend)** | Zero frontend-related findings | BSP examination results |
| **Production incident rate (frontend)** | 30% reduction | Incident tracker |
| **Onboarding time (new React devs)** | From ~8 weeks to ~3 weeks productive | Team lead assessment |
| **External training spend** | Reduced to zero for React (this program replaces it) | L&D budget |
| **Code consistency** | 80%+ of PRs follow documented patterns on first submission | Code review data |

---

## The Business Case (What to Show Leadership)

### Cost of the Program

| Item | Notes |
|------|-------|
| Developer time during training (13 days × N developers) | Work with HR/Finance for actual cost per developer-day |
| Program development time | Already invested (sunk cost) |
| Infrastructure (companion repo, Azure sandbox) | Minimal — uses existing Azure subscription |

### Value of the Program

| Benefit | How to Quantify |
|---------|----------------|
| **Eliminated external training cost** | Compare against vendor quotes for React bootcamps, Udemy Business, or contract training firms. Get actual numbers from L&D. |
| **Faster onboarding** | Measure weeks saved × developer daily cost. Finance can provide blended rates without disclosing individual salaries. |
| **Reduced production bugs** | Count P1/P2 incidents before vs. after. Each incident has a cost in developer hours — incident management can estimate. |
| **Cleaner BSP audits** | Each audit finding has a remediation cost. Compliance team can estimate average remediation effort per finding. |
| **Standardized codebase** | Measure PR review turnaround and rejection rate improvement. Translates to velocity gains over 12 months. |
| **Compliance risk reduction** | BSP non-compliance fines are public record. The program directly reduces frontend-related compliance exposure. |

### ROI Framework

```
ROI = (Value generated - Program cost) / Program cost × 100

To build your ROI case:
1. Get blended developer-day cost from Finance (no individual salaries needed)
2. Get external training quotes from L&D (what would this cost externally?)
3. Get incident cost estimates from Engineering (avg hours per P1/P2)
4. Get audit finding cost from Compliance (avg remediation per finding)
5. Plug in actual numbers — the framework above gives you what to measure
```

---

## How to Present This

### To Your Direct Manager

> "The React training program has trained [N] developers across [X] cohorts. Average capstone pass rate is [Y]%. Developers who completed the program are shipping their first PR [Z] days faster than untrained hires, and our last BSP examination had zero frontend-related findings for the first time."

### To Senior Leadership

> "We replaced external training spend with an internal program that delivers better outcomes: faster onboarding, zero BSP audit gaps, and a [X]% reduction in frontend production incidents. The program scales to every new React hire at zero marginal cost."

### To HR/L&D

> "The program includes 37 guides, 9 quizzes with answer keys, 27 hands-on exercises, and a graded capstone project. It has a 13-day structured curriculum with two tracks (beginner and fast-track). All materials are maintained internally and updated with each technology upgrade."

---

## Data Collection Checklist

Before the first cohort, make sure you have:

- [ ] Baseline metrics captured (see "Baseline" section above)
- [ ] Pretest printed or ready to distribute on Day 1 morning
- [ ] Quiz scoring spreadsheet set up (pretest + 9 level quizzes × N learners)
- [ ] Capstone grading rubric printed for team leads
- [ ] Azure DevOps query saved for PR rejection rate
- [ ] Incident tracker tagged for "frontend" category
- [ ] Calendar reminders for 3-month and 6-month check-ins
- [ ] Previous BSP examination report on hand for comparison

---

## Continuous Improvement

After each cohort:

1. **Compare pretest vs quiz scores** — calculate per-trainee learning gain. If gain is below 20 points for a specific level, that level's guides may need improvement.
2. **Review quiz score distribution** — which questions did everyone get wrong? Fix the guide or the question.
3. **Review exercise time accuracy** — update estimates based on actual data.
4. **Collect 3 specific improvement suggestions** from each learner.
5. **Update guides** if tech stack changes (React version, library updates, new BSP circulars).
6. **Archive cohort data** — you need multi-cohort trends to show sustained impact.

---

*EastWest Bank Digital Platforms & Innovations | Confidential*
