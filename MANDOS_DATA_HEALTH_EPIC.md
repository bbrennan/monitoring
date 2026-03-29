# MANDOS Data Health Epic

**Version:** 1.0  
**Date:** 2026-03-29  
**Audience:** Internal Mandos design, implementation, and AI-assisted development  
**Purpose:** Define the shared vision, goals, boundaries, and family relationship of `mandos.profile()`, `mandos.compare()`, and `mandos.monitor()`.

---

## 1. Executive Summary

Mandos is an internal Toyota Financial Services library for **feature integrity validation, dataset compatibility validation, and production model/data monitoring**.

It exists because data issues have repeatedly caused:
- long fire drills during model development
- silent preprocessing failures
- model failures in production
- avoidable business loss

Mandos should provide one coherent family of tools across the model lifecycle:

- **`profile()`** = validate one dataset for model readiness
- **`compare()`** = compare two datasets for compatibility and drift
- **`monitor()`** = operationalize baseline-vs-snapshot monitoring in production with persistence and trends

The family should feel consistent, opinionated, and easy to learn.

---

## 2. Problem Statement

Toyota Financial Services data scientists repeatedly face the same categories of failure:

1. **Hidden formatting defects**
   - whitespace padding
   - case inconsistency
   - similar-but-not-identical categorical values
   - values that visually look fine but break joins, filters, and grouping

2. **Preprocessing / feature engineering failures**
   - sentinel values treated as real values
   - missing-imputation logic failing silently
   - unexpected mass at floor/cap
   - binary or categorical collapse

3. **Baseline compatibility failures**
   - training and current data no longer meaningfully aligned
   - silent changes in feature domains or distributions
   - production snapshots drifting away from approved baseline expectations

4. **Operational blind spots**
   - data quality degradation detected only after model decline
   - no standardized trend-aware monitoring evidence in Snowflake
   - inconsistent, manual, or one-off investigation workflows

Mandos is meant to solve these problems directly.

---

## 3. Why These Three Modules Exist

These three modules are not separate products. They are one lifecycle-oriented family.

### Family analogy

A helpful mental model:

- **`profile()` and `compare()` are siblings**
  - both are analyst-facing, ad hoc, development-phase tools
  - both return rich diagnostic result objects
  - both help a user understand what is wrong right now

- **`monitor()` is the operational parent**
  - it uses the same ideas as `profile()` and `compare()`
  - but adds persistence, baseline management, production runs, and trend analysis
  - it turns development-time validation ideas into recurring production surveillance

### Why not just one giant module?

Because the user questions are different:

- `profile()` asks: **Is this dataset usable on its own?**
- `compare()` asks: **What changed from A to B, and does it matter?**
- `monitor()` asks: **Is production still healthy relative to the approved baseline, and how is that changing over time?**

One module trying to do all three would become a god object.

---

## 4. Goals

Mandos should:

1. **Quickly tell a user whether data is fit for model use**
2. **Quickly identify exactly what is wrong when data is not fit**
3. **Catch both explicit contract violations and common hidden defect patterns**
4. **Use a consistent mental model across development and production**
5. **Be Snowflake-first for real enterprise scale**
6. **Persist monitoring evidence in Snowflake for audit and trend analysis**
7. **Minimize subjective threshold tuning and configuration sprawl**
8. **Produce outputs that are useful both in notebooks and in formal review contexts**
9. **Be clear enough that an implementation copilot can build from the docs without guessing**

---

## 5. Non-Goals

Mandos should **not**:

- silently clean, trim, normalize, or otherwise transform user data
- act as a data engineering remediation layer
- become a generic open-source profiling tool for every data science use case
- replace BI dashboards, semantic layers, or enterprise monitoring platforms wholesale
- become a giant visual notebook report with endless sections by default
- allow users to tune dozens of arbitrary thresholds until warnings disappear
- mutate source production tables

Mandos is a **detector and reporter**, not a fixer.

---

## 6. Shared Design Principles

### 6.1 Clarity over cleverness
Mandos should be simple to understand and hard to misuse.

### 6.2 Snowflake-first
Production-scale execution should happen in Snowflake with aggregate results returned to Python.

### 6.3 Contracts first, built-in rubric second
Users define explicit `FeatureRules` where real domain knowledge exists. Mandos handles the rest through built-in defect detectors.

### 6.4 Severity belongs to findings, not raw metrics
Means, percentiles, skewness, and distinct counts are evidence. Mandos turns evidence into findings.

### 6.5 Triage first, diagnosis second
The first surface should tell the user **where to look**. Deeper inspection should explain **why**.

### 6.6 One family, one UX language
All three modules should feel related and use familiar method patterns.

---

## 7. Shared Configuration Philosophy

Mandos uses a simple layered model.

### 7.1 FeatureRules
Feature-level hard contracts defined by the user.

Examples:
- `dtype`
- `nullable`
- `valid_values`
- `min_value`
- `max_value`
- `floor_value`
- `cap_value`
- `sentinel_values`
- selected guardrails such as `max_missing_rate` when truly known

These are not tuning knobs. They are truths about a feature.

### 7.2 Built-in defect detectors
Always-on Mandos rubric.

Examples:
- whitespace padding
- case inconsistency
- similar-but-not-identical category values
- constant feature
- binary collapse
- suspicious sentinel spike
- mass at floor/cap
- dtype/coercion issue
- domain anomaly

Users should not need to configure these to get value.

### 7.3 Module options
Small, concrete run/display behavior settings.

Examples:
- `summary_max_issues`
- `include_charts`
- `show_good_features`
- `sentinel_detection_mode`
- `category_similarity_mode`

These should control execution or presentation, not vague “strictness.”

---

## 8. Shared API Philosophy

All three modules should feel like they belong together.

### 8.1 Common result pattern
Each result object should emphasize:

- `summary()` → high-level triage
- `issues()` → ranked actionable findings
- `inspect()` → feature-level diagnosis
- `metrics()` → raw evidence

This creates one consistent user journey:

**triage → investigate → export/report**

### 8.2 Why this matters
A user should not have to relearn Mandos when moving from development to production.

---

## 9. Module Responsibilities

## 9.1 `profile()`

### Purpose
Single-dataset feature integrity validation.

### Core question
**Is this dataset usable, and if not, what is wrong?**

### Typical use cases
- first look at a new dataset
- EDA for model inputs
- feature integrity review before modeling
- root-cause analysis of suspicious columns

### Primary outputs
- concise notebook triage via `summary()`
- dataframe of findings via `issues()`
- feature-level charts and evidence via `inspect()`
- optional exported HTML/PDF artifacts via:
  - `export_html()`
  - `export_pdf()`

### Tone
Mostly descriptive and defect-focused, not drift-focused.

---

## 9.2 `compare()`

### Purpose
Two-dataset compatibility and drift validation.

### Core question
**What changed from Dataset A to Dataset B, and does that change matter?**

### Typical use cases
- train vs current validation
- baseline vs candidate dataset
- pre-launch model validation
- refit dataset review
- current snapshot vs known-good dataset

### Primary outputs
- concise table-wide compatibility summary via `summary()`
- ranked drift / compatibility findings via `issues()`
- side-by-side feature diagnosis via `inspect()`
- formal pre-launch validation artifacts via:
  - `export_html()`
  - `export_pdf()`

### Tone
More assertive than `profile()` about deltas, drift, spikes, and new defects.

---

## 9.3 `monitor()`

### Purpose
Production monitoring using persisted baselines, recurrent snapshots, persistence, and trend analysis.

### Core question
**Is production still healthy relative to the approved baseline, and how is that changing over time?**

### Typical use cases
- production DQ monitoring
- feature drift monitoring
- score distribution monitoring
- model performance monitoring when labels are available
- incident review and trend analysis

### Primary workflow
- `monitor().build_baseline()` once at onboarding or refit
- `monitor().run()` repeatedly on production snapshots
- persist results to Mandos-owned Snowflake tables
- analyze with `summary()`, `issues()`, `inspect()`, `history()`, and `trends()`
- generate formal production monitoring artifacts via `report()`

### Tone
Operational, persistent, trend-aware, and audit-oriented.

---

## 10. Reporting and Export Conventions

This family should distinguish between **development/validation exports** and **formal production reports**.

### `profile()` and `compare()`
Use:
- `export_html()`
- `export_pdf()`

Why:
- these modules are mainly ad hoc, development, and pre-launch validation tools
- users often want a portable artifact of the current analysis
- “export” correctly implies packaging a notebook/development analysis result

### `monitor()`
Use:
- `report()`

Why:
- production monitoring output is more formal and operational
- the artifact should feel standardized, repeatable, and audit-ready
- “report” better fits recurring production evidence than generic export wording

This naming distinction should be preserved in implementation.

---

## 11. Shared Presentation Design

Mandos should use a **hybrid presentation model**.

### 11.1 Notebook-first triage
Use a compact, polished HTML/rich display for `summary()`.

This should answer fast:
- is the dataset / comparison / run healthy?
- which features need attention?
- what should I inspect first?

### 11.2 DataFrame evidence
Use dataframe outputs for:
- `issues()`
- `metrics()`
- raw history/trend tables

Why:
- users want to sort, filter, search, and export evidence

### 11.3 Typed inspection views
Use targeted HTML cards and charts in `inspect()`.

Examples:
- numeric feature histogram and cap/sentinel evidence
- categorical top values and alias/case issues
- side-by-side compare feature diagnostics
- trend-aware monitor feature inspection over time

### 11.4 What to avoid
Do not make the default experience a giant ydata-style endless report.

The main surfaces should be:
- concise `summary()`
- precise `inspect()`
- sortable `issues()`

---

## 12. Snowflake Architecture and Persistence Model

## 12.1 `profile()` and `compare()`
These should be able to operate ad hoc against:
- Snowflake tables/views
- persisted baseline identifiers where appropriate
- Pandas DataFrames for local/dev use

But production-scale logic should still be Snowflake-first.

## 12.2 `monitor()`
This is explicitly Snowflake read/write native.

It should:
- read source baseline tables and production snapshots
- write baseline artifacts, run metadata, metrics, findings, and statuses
- support trend analysis from persisted aggregate monitoring data
- avoid repeated scanning of historical raw snapshots for trend views

### Persistence principle
Monitoring evidence should be stored in Mandos-owned Snowflake structures so that:
- results are auditable
- dashboards can be built on top
- trend analysis is cheap and repeatable
- prior runs do not need to be recomputed from raw data

---

## 13. Expected User Workflow

### Development / ad hoc workflow
1. User runs `profile()` on a new dataset
2. User reviews `summary()`
3. User investigates flagged features via `inspect()`
4. User exports HTML/PDF if needed for sharing

### Pre-launch validation workflow
1. User runs `compare()` between training/baseline and current candidate data
2. User reviews `summary()` for compatibility and drift findings
3. User inspects changed features
4. User exports PDF/HTML for validation evidence

### Production monitoring workflow
1. Model owner runs `monitor().build_baseline()` when a model is onboarded or refit
2. Scheduled processes run `monitor().run()` against recurrent production snapshots
3. Mandos persists run evidence to Snowflake
4. Users review current run triage plus `history()` / `trends()`
5. `monitor().report()` generates formal production monitoring artifacts

---

## 14. Boundaries Between Modules

These boundaries should stay sharp.

### `profile()` should not
- compare to baseline
- do trend analysis
- pretend descriptive conditions are drift problems

### `compare()` should not
- own scheduling or historical monitoring orchestration
- become the production persistence layer

### `monitor()` should not
- replace ad hoc exploration
- mutate source tables
- act like a separate product with a different UX language

---

## 15. Why This Design Is Better Than Threshold Soup

Mandos should not force users to invent arbitrary thresholds for every possible metric.

That leads to:
- inconsistent usage
- threshold sprawl
- hidden subjectivity
- poor onboarding
- users tuning warnings away instead of understanding the data

Instead, Mandos should use:
- **FeatureRules** for explicit truths
- **built-in defect detectors** for common failure patterns
- **small concrete module options** for execution/presentation behavior

This is simpler, clearer, and more robust for internal use.

---

## 16. Implementation Guidance for Claude Sonnet / Copilot

These docs should be interpreted as follows:

1. The Epic doc defines the **shared product vision and boundaries**
2. The module blueprints define the **implementation details per module**
3. The implementation should prioritize:
   - consistent API shape
   - shared result-object patterns
   - shared rendering philosophy
   - shared severity language
   - shared Snowflake-first computation approach
4. When in doubt, prefer:
   - less configuration
   - more opinionated defaults
   - clearer boundaries
   - smaller surfaces with stronger semantics

The implementation should make the three modules feel like one family, not three unrelated utilities.

---

## 17. Future Extensions (Out of Scope for Current Epic)

The following may be added later, but are not required for the current design:
- segmentation-aware monitoring at multiple levels
- richer incident / alert routing workflows
- dashboard/UI integration details
- feature-family metadata layers
- model-performance estimation without labels beyond current scope
- deeper business KPI tracking in production

These should not distract from the current goal of building a strong and coherent data health family.

---

## 18. Final Product Statement

**Mandos provides one coherent family of tools for data health across the model lifecycle:**

- **`profile()`** validates one dataset for model readiness  
- **`compare()`** validates compatibility and drift between two datasets  
- **`monitor()`** operationalizes baseline-based production monitoring with persistence and trends  

Together, these modules exist to help Toyota Financial Services data scientists answer a simple but critical question:

> **Can I trust this data for my model, and if not, what exactly is wrong?**
