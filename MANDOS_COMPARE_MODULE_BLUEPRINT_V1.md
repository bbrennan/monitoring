# MANDOS `.compare()` — Module Blueprint v1

**Version:** 1.0  
**Date:** 2026-03-29  
**Audience:** Internal Mandos design / implementation  
**Scope:** Two-dataset validation for baseline compatibility and drift diagnosis

---

## 1. Purpose

`mandos.compare()` is the **two-dataset counterpart** to `mandos.profile()`.

Its job is to answer, quickly and clearly:

1. **How does Dataset B differ from Dataset A?**
2. **Do those differences threaten model validity or deployment readiness?**
3. **Which features changed materially, and what changed about them?**
4. **Where should the user inspect first?**

This method exists to prevent:
- deployment of data that is no longer compatible with training / baseline assumptions
- hidden preprocessing regressions that only become obvious when compared to a trusted reference
- false confidence from looking at a single dataset in isolation
- week-long manual diffing of feature distributions, category domains, and score behavior

---

## 2. Plain-English Definition

`.compare()` is **baseline compatibility validation**.

- `profile()` asks: **"Is this dataset usable on its own?"**
- `compare()` asks: **"What changed from A to B, and does that change matter?"**
- `monitor()` asks: **"What changed in production over time, and do we need to act now?"**

`compare()` should feel like the direct cousin of `profile()`:
- same overall philosophy
- same result object style
- same summary → issues → inspect workflow
- more assertive about deltas, drift, spikes, and new defects

---

## 3. What `.compare()` Does

`.compare()` compares **two datasets** and returns a `CompareResult` object.

Core responsibilities:
- resolve two input datasets into a common internal reference model
- run profile-like validation logic on each side
- compute feature-level and dataset-level deltas
- detect drift and compatibility problems
- classify findings by severity
- provide a concise table-wide summary and clear feature-level inspection paths

### Conceptual model

`compare()` should be implemented as:

**`profile(A)` + `profile(B)` + delta / drift detectors**

That means `compare()` is not just a PSI engine. It is a validation engine that happens to include drift metrics.

---

## 4. What `.compare()` Does **Not** Do

`.compare()` does **not**:
- perform scheduling or alerting
- manage longitudinal production history across many snapshots
- silently clean, normalize, trim, impute, or transform either dataset
- try to replace `monitor()`
- produce a giant all-in-one dashboard by default
- require the user to manually interpret dozens of raw metrics before knowing what matters

Role boundaries:
- **`profile()`** = inspect one dataset for integrity and usability
- **`compare()`** = assess compatibility between two datasets
- **`monitor()`** = recurring production surveillance and alerting

---

## 5. Input Design

### 5.1 Public API principle

`compare()` should expose **one API** that accepts different input forms.

Do **not** split the surface into:
- `compare_tables()`
- `compare_to_baseline()`
- `compare_snapshot()`

That adds complexity without adding conceptual clarity.

### 5.2 Supported input forms

For v1, `compare()` should accept:

#### A. Snowflake table or view name
This is the primary production path.

```python
c = mandos.compare(
    left="DB.SCHEMA.TRAIN_BASELINE",
    right="DB.SCHEMA.CURRENT_SNAPSHOT",
    session=session,
)
```

#### B. `baseline_id`
This should be a first-class convenience.

```python
c = mandos.compare(
    baseline_id="zuul2_rtl_subprime_v17",
    right="DB.SCHEMA.CURRENT_SNAPSHOT",
    session=session,
)
```

This matches the enterprise Mandos workflow well.

#### C. Pandas DataFrames
Useful for notebook experimentation, unit tests, and small local validation.

```python
c = mandos.compare(
    left=train_df,
    right=current_df,
    feature_rules=feature_rules,
)
```

#### D. Any persisted Snowflake table
Yes. A baseline is just a privileged, curated persisted dataset. The API should not block comparison against any valid persisted table when the user has access.

### 5.3 Internal design

All inputs should be normalized into an internal `DatasetRef` abstraction.

Possible internal forms:
- `DatasetRef(kind="snowflake_table", name=...)`
- `DatasetRef(kind="baseline_id", id=...)`
- `DatasetRef(kind="pandas_df", obj=...)`

This keeps the public API simple while allowing flexible resolution logic.

### 5.4 Recommended v1 priority

1. Snowflake table / view name
2. `baseline_id`
3. Pandas DataFrame

Mandos is Snowflake-first. Pandas support is valuable, but it should not define the product.

---

## 6. Configuration Model

`compare()` should mirror the same three-layer design as `profile()`.

### 6.1 `FeatureRules` — hard feature-level contracts
Same concept as `profile()`.

These are truths about features, not about drift sensitivity.

Examples:
- dtype
- nullable
- valid values
- valid numeric range
- known sentinel values
- floor / cap when official parts of preprocessing

Any new or newly worsened violation on the right side must be surfaced prominently.

### 6.2 Built-in compare detectors — Mandos rubric
These are automatic, always-on comparison checks Mandos runs with no user tuning.

Examples:
- schema mismatch
- missing feature on right side
- dtype changed
- category domain changed
- new category introduced
- category disappeared
- distribution shift
- score shift
- whitespace padding worsened
- sentinel spike emerged
- cap / floor mass increased sharply
- binary collapse emerged

### 6.3 `compare_options` — run / display behavior only
Small set of concrete options for execution and presentation.

Examples:
- `summary_max_issues`
- `include_charts`
- `show_good_features`
- `score_column`
- `segment_columns`
- `binning_strategy`
- `max_category_examples`

These are not free-form severity knobs.

---

## 7. Result Model

Like `profile()`, `.compare()` should separate **raw comparison metrics** from **interpreted findings**.

### 7.1 Raw comparison metrics
Descriptive evidence only.

Examples:
- row count delta
- missing rate delta
- distinct count delta
- mean / std / quantile deltas
- PSI / CSI / score PSI
- cap rate delta
- floor rate delta
- zero rate delta
- category share delta
- new category count
- disappeared category count
- raw distinct vs normalized distinct deltas

Raw comparison metrics do **not** automatically carry severity.

### 7.2 Findings
Interpretations derived from FeatureRules and raw deltas.

Examples:
- `schema_mismatch`
- `missing_feature_on_right`
- `dtype_changed`
- `new_domain_violation`
- `new_nullable_violation`
- `distribution_shift_detected`
- `score_shift_detected`
- `whitespace_padding_delta_detected`
- `case_inconsistency_delta_detected`
- `possible_sentinel_handling_regression`
- `mass_at_cap_increase_detected`
- `constant_feature_emerged`
- `binary_collapse_emerged`

**Severity belongs to findings, not to metrics.**

---

## 8. Severity Model

### `CRITICAL`
Use when:
- schema incompatibility threatens model use
- a FeatureRule is violated on the right side
- a new / worsened violation materially affects compatibility
- a severe distribution or score shift suggests the data is not safely comparable
- there is strong evidence of broken preprocessing, mapping, or pipeline logic

### `WARN`
Use when:
- a feature changed materially and needs review
- category/domain changes are suspicious but not definitively fatal
- cap/floor/sentinel behavior worsened
- drift exists in important features without clear proof of breakage

### `INFO`
Use when:
- a notable change exists, but it may be expected
- a feature moved meaningfully but remains compatible with contracts
- the user should know about the change, but not necessarily act immediately

### `GOOD`
Use when:
- no notable comparison findings are present

---

## 9. Core Comparison Buckets

### 9.1 Dataset-level deltas
These provide table-wide context.

Metrics:
- row count left / right
- row count delta
- duplicate rate left / right / delta
- total missing values left / right / delta
- feature count left / right
- schema mismatch count

Findings:
- `row_count_changed_materially`
- `schema_mismatch`
- `duplicate_rate_changed`

### 9.2 Feature contract deltas
These are strongest when `FeatureRules` exist.

Examples:
- nullable violation appears on right side
- valid domain violation appears on right side
- valid range violation appears on right side
- cap / floor behavior exceeds contract
- sentinel values appear or increase unexpectedly

These should be among the most severe findings.

### 9.3 Distribution drift
For numeric features:
- mean / std / quantile deltas
- PSI / CSI
- zero-rate delta
- floor-rate delta
- cap-rate delta
- histogram or bin shift

For categorical features:
- top-category share delta
- new categories introduced
- previous categories disappeared
- domain mass changed materially

### 9.4 Score drift
If a score column is available:
- score distribution shift
- cut-point mass changes
- segment score shift
- score PSI

### 9.5 Defect-pattern changes
This is where Mandos should be especially useful.

Examples:
- whitespace padding newly appears or worsens
- case inconsistency newly appears or worsens
- alias inconsistency appears
- sentinel spike newly appears
- binary collapse emerges
- constant feature emerges

These are often more actionable than generic drift metrics alone.

---

## 10. Compare-Specific Built-In Detectors

These run automatically when the column type makes sense.

### 10.1 Structural detectors
- `schema_mismatch`
- `missing_feature_on_right`
- `unexpected_new_feature_on_right`
- `dtype_changed`

### 10.2 Contract / quality detectors
- `new_nullable_violation`
- `new_domain_violation`
- `new_range_violation`
- `new_sentinel_presence`
- `mass_at_floor_increase_detected`
- `mass_at_cap_increase_detected`

### 10.3 Drift detectors
- `distribution_shift_detected`
- `zero_rate_shift_detected`
- `binary_balance_shift_detected`
- `score_shift_detected`
- `top_category_shift_detected`
- `new_category_introduced`
- `category_disappeared`

### 10.4 Defect-pattern delta detectors
- `whitespace_padding_delta_detected`
- `case_inconsistency_delta_detected`
- `category_alias_inconsistency_delta_detected`
- `constant_feature_emerged`
- `binary_collapse_emerged`
- `possible_sentinel_handling_regression`

---

## 11. FeatureRules in Compare

`compare()` should not introduce a new rules system.

It should reuse the same `FeatureRules` spec as `profile()`:
- `dtype`
- `nullable`
- `valid_values`
- `min_value`
- `max_value`
- `floor_value`
- `cap_value`
- `sentinel_values`
- optional guardrails such as `max_missing_rate`, `max_zero_rate`, `max_floor_rate`, `max_cap_rate`, `min_distinct_count`, `max_distinct_count`

### Compare-specific interpretation

The focus is not only whether a rule is violated, but whether:
- the violation is new on the right side
- the violation materially worsened on the right side
- the right side remains compatible with the baseline expectation

---

## 12. API Design

`compare()` should mirror `profile()` so users do not have to learn a new mental model.

### Recommended result API
- `summary()`
- `issues()`
- `inspect(feature)`
- `metrics()`
- `export()`

### Example usage

```python
c = mandos.compare(
    baseline_id="zuul2_rtl_subprime_v17",
    right="DB.SCHEMA.CURRENT_SNAPSHOT",
    session=session,
    feature_rules=feature_rules,
)

c.summary()
c.issues()
c.inspect("BANKRUPTCY_CNT")
c.metrics()
c.export("compare.html")
```

This is much cleaner than exposing many separate report-specific methods.

---

## 13. Presentation Design

The compare presentation should use the same high-level pattern as `profile()`:

- compact HTML for table-wide triage
- DataFrame output for issue investigation
- feature-level inspect views with typed charts and evidence
- exportable HTML / PDF for sharing or audit

### 13.1 `summary()` — table-wide triage
Purpose:
- Is Dataset B compatible with Dataset A?
- Which features changed materially?
- What type of changes occurred?

Recommended layout:
- header: `DATA COMPARE`
- left and right run metadata
- verdict banner:
  - `COMPATIBLE`
  - `REVIEW REQUIRED`
  - `NOT COMPATIBLE`
- 4 compact cards:
  - row delta
  - schema delta
  - critical changed features
  - warning changed features
- top issues table:
  - feature
  - status
  - change type
  - why it matters

#### Example issue rows
- `BANKRUPTCY_CNT | CRITICAL | sentinel_spike_delta | 9999 mass increased from 0.2% to 24.7%`
- `VEHICLE_MAKE | WARN | category_domain_change | 3 new raw categories introduced`
- `LTV | WARN | cap_mass_delta | values at cap rose from 1.1% to 14.5%`

### 13.2 `issues()` — DataFrame
This should be the investigation workhorse.

Recommended columns:
- `feature`
- `severity`
- `finding_type`
- `left_value`
- `right_value`
- `delta`
- `reason`
- `suggested_action`

### 13.3 `inspect(feature)` — typed side-by-side diagnosis
This is the core drill-down surface.

For numeric features:
- side-by-side distributions
- key delta metrics
- PSI / CSI
- cap / floor / sentinel deltas
- feature contract

For categorical features:
- top categories side by side
- new categories
- disappeared categories
- case / whitespace / alias evidence
- domain violations

For binary features:
- class balance side by side
- distinct count
- collapse or imbalance emergence

### 13.4 `metrics()` — DataFrame
Full raw comparison metrics. Useful for debugging and advanced analysis.

### 13.5 `export()`
Generate HTML / PDF / JSON artifact for audit and sharing.

---

## 14. Rendering Guidance

Like `profile()`, the default notebook experience should be **hybrid**, not a giant monolithic report.

### Use rich HTML for:
- `summary()`
- `inspect(feature)`

### Use DataFrames for:
- `issues()`
- `metrics()`

### Use exports for:
- full HTML artifact
- consultant-grade PDF
- JSON for persistence or downstream use

This keeps compare clear, compact, and consistent with profile.

---

## 15. Snowflake-First Execution Strategy

Mandos should remain Snowflake-first.

### Principles
- compute aggregated statistics in Snowflake
- minimize round-trips
- do not pull full tables to Python unless the user explicitly passes Pandas DataFrames
- reuse the same typed metric and display logic as much as possible

### Core execution flow
1. resolve both datasets into `DatasetRef`
2. compute profile-like metrics for left side
3. compute profile-like metrics for right side
4. compute comparison deltas and drift metrics
5. generate findings
6. package into `CompareResult`

### Recommended approach
Use shared primitives wherever possible so `compare()` is not implemented as a separate one-off code path.

---

## 16. Relationship to Persisted Baselines and Snapshots

Mandos should treat `baseline_id` as a convenience layer over persisted Snowflake artifacts.

### Design recommendation
A baseline is not a fundamentally different object from other persisted datasets.
It is a curated, approved reference dataset.

Therefore:
- `baseline_id` should be supported as a first-class convenience
- any valid persisted Snowflake table should also be supported
- compare should not artificially restrict the right side to “snapshots only”

This keeps the API flexible while still supporting the enterprise workflow.

---

## 17. Example Usage Patterns

### A. Baseline ID vs current snapshot
```python
c = mandos.compare(
    baseline_id="zuul2_rtl_subprime_v17",
    right="MLHUB_OPS.MANDOS_SNAPSHOTS.ZUUL2_2026_03_28",
    session=session,
    feature_rules=feature_rules,
)
```

### B. Two Snowflake tables
```python
c = mandos.compare(
    left="DB.SCHEMA.TRAIN_BASELINE",
    right="DB.SCHEMA.VALIDATION_DATA",
    session=session,
    feature_rules=feature_rules,
)
```

### C. Two Pandas DataFrames
```python
c = mandos.compare(
    left=train_df,
    right=valid_df,
    feature_rules=feature_rules,
)
```

---

## 18. Implementation Checklist

### Phase 1: Core comparison engine
- [ ] Input resolution into `DatasetRef`
- [ ] Shared metric computation primitives with `profile()`
- [ ] Left-side and right-side validation
- [ ] Delta computation layer
- [ ] Drift metric computation (numeric / categorical / score)
- [ ] Built-in compare detectors
- [ ] `CompareResult` dataclass

### Phase 2: Display — summary and inspect
- [ ] `summary()` HTML layout
- [ ] left/right metadata display
- [ ] verdict banner
- [ ] top issues table
- [ ] typed side-by-side inspect cards
- [ ] reusable chart components where possible

### Phase 3: DataFrame and export surfaces
- [ ] `issues()` DataFrame
- [ ] `metrics()` DataFrame
- [ ] `export()` HTML / PDF / JSON

### Phase 4: Performance and safety
- [ ] Snowflake-first pushdown
- [ ] minimal round-trips
- [ ] pagination / bounded summary size
- [ ] support for large category domains and wide tables

---

## 19. Final Design Principle

**`compare()` should be the narrow, serious validation step between “looks fine alone” and “safe relative to baseline.”**

It should not be a god object.
It should not be only a PSI calculator.
It should not require users to interpret a wall of metrics.

It should answer:
- what changed
- whether the change matters
- which features are responsible
- where to inspect first

That is the Mandos version of compare.
