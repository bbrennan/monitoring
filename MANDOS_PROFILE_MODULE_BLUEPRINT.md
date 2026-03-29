# MANDOS `.profile()` — Module Blueprint v3

**Version:** 3.1  
**Date:** 2026-03-29  
**Audience:** Internal Mandos design / implementation  
**Scope:** Single-dataset feature integrity profiling for model readiness

---

## 1. Purpose

`mandos.profile()` is a **single-dataset feature integrity profiler**.

Its job is not to be a giant exploratory analytics report. Its job is to answer, quickly and clearly:

1. **Is this dataset safe to use?**
2. **If not, which features are unsafe or suspicious?**
3. **What is wrong, and where should I inspect first?**

This method exists to prevent:
- long fire drills during model development
- hidden preprocessing failures
- category corruption
- null injection
- sentinel mishandling
- feature values that look valid at a glance but are wrong in practice

---

## 2. What `.profile()` Does

`.profile()` inspects **one dataset only** and returns a `ProfileResult` object.

Core responsibilities:
- inspect schema and feature types
- compute descriptive metrics via Snowflake pushdown
- evaluate explicit `FeatureRules`
- run Mandos built-in defect detectors
- classify findings by severity
- provide a concise table-wide summary and clear feature-level inspection paths

### Plain-English definition

`.profile()` tells the user:
- whether the dataset is usable
- which features need attention
- the likely reason each feature is flagged
- the evidence behind each finding

---

## 3. What `.profile()` Does **Not** Do

`.profile()` does **not**:
- compare against a baseline or training set
- determine drift over time
- perform monitoring / alerting
- silently clean, trim, normalize, impute, or transform data
- try to explain all business semantics from statistics alone
- produce an endless all-in-one notebook dashboard by default

Role boundaries:
- **`profile()`** = inspect one dataset for integrity and usability
- **`compare()`** = compare current vs baseline
- **`monitor()`** = recurring production surveillance

---

## 4. Core Design Principle

**Mandos never transforms user data.**  
**Mandos only computes evidence and reports findings.**

Mandos may compute internal analytical comparisons such as:
- raw distinct count vs trimmed distinct count
- raw distinct count vs case-folded distinct count
- raw labels vs punctuation/spacing-normalized labels

These are used only to **detect defects**. They are never written back and never treated as silent fixes.

---

## 5. Configuration Model

Mandos should use a **three-layer model**:

### 5.1 `FeatureRules` — hard feature-level contracts
These are explicit truths defined by the user for specific features.

Examples:
- dtype
- nullable
- valid values
- valid numeric range
- known sentinel values
- official floor/cap if part of preprocessing

Any violation is called out prominently.

### 5.2 Built-in defect detectors — Mandos rubric
These are automatic, always-on checks Mandos runs with no user configuration.

Examples:
- whitespace padding
- case inconsistency
- category alias inconsistency
- constant feature
- binary collapse
- suspicious sentinel spike
- mass at cap/floor
- dtype/coercion mismatch

This is Mandos' predefined grading rubric.

### 5.3 `profile_options` — run / display behavior only
These are a small set of concrete options for execution and presentation.

Examples:
- `summary_max_issues`
- `include_charts`
- `show_good_features`
- `sentinel_detection_mode`
- `category_similarity_mode`

These are **not** arbitrary severity knobs.

---

## 6. Result Model

`.profile()` should produce two separate layers:

### 6.1 Raw metrics
Descriptive evidence only.

Examples:
- row count
- null count / missing rate
- distinct count
- mean / std / quantiles
- zero rate
- top categories
- dominant value rate
- raw distinct vs trimmed distinct
- raw distinct vs case-folded distinct
- sentinel hit rate
- floor rate / cap rate

Raw metrics do **not** automatically carry severity.

### 6.2 Findings
Interpretations derived from FeatureRules and raw metrics.

Examples:
- `domain_violation`
- `unexpected_nulls`
- `whitespace_padding_detected`
- `case_inconsistency_detected`
- `possible_category_alias_inconsistency`
- `possible_sentinel_handling_failure`
- `mass_at_cap_detected`
- `constant_feature_detected`
- `binary_collapse_detected`

**Severity belongs to findings, not to metrics.**

---

## 7. Severity Model

### `CRITICAL`
Use when:
- a FeatureRule is materially violated
- values are outside valid domain/range
- non-nullable features contain nulls
- a feature is effectively unusable for model consumption
- there is strong evidence of broken preprocessing or pipeline logic

### `WARN`
Use when:
- the feature looks suspicious and needs review
- formatting/category inconsistencies exist
- cap/floor/sentinel behavior looks abnormal but not definitively broken
- the issue could affect joins, filters, segmentation, or downstream logic

### `INFO`
Use when:
- the condition is descriptive rather than defective
- the feature is skewed, zero-inflated, low-cardinality, or heavy-tailed
- the user should know the condition but not necessarily act on it

### `GOOD`
Use when:
- no notable findings are present

---

## 8. `FeatureRules` Specification

These are the supported feature-level contracts for v1.

### 8.1 Core rules
- `dtype`
- `nullable`
- `valid_values`
- `min_value`
- `max_value`
- `floor_value`
- `cap_value`
- `sentinel_values`

### 8.2 Common guardrails
These make sense for users to specify when known:
- `max_missing_rate`
- `max_zero_rate`

### 8.3 Advanced / optional guardrails
These are useful but should not be required:
- `max_floor_rate`
- `max_cap_rate`
- `min_distinct_count`
- `max_distinct_count`

### 8.4 Guidance
- `valid_values` is stronger than distinct-count guardrails for categorical features.
- `min_distinct_count` is especially useful for binary or low-cardinality features.
- `max_floor_rate` / `max_cap_rate` are most useful when floor/cap are official parts of preprocessing.
- If a user does not specify these advanced guardrails, Mandos should still **report** the underlying evidence through built-in detectors.

---

## 9. Automatic Built-In Defect Detectors

These run automatically when the column type makes sense.

### 9.1 String / categorical detectors

#### A. Whitespace padding
Evidence:
- percent with leading/trailing whitespace
- raw distinct count vs trimmed distinct count
- top changed categories after trim comparison

Finding:
- `whitespace_padding_detected`

#### B. Case inconsistency
Evidence:
- raw distinct count vs case-folded distinct count
- category groups differing only by case

Finding:
- `case_inconsistency_detected`

#### C. Category alias inconsistency
Evidence:
- likely near-duplicate labels after punctuation/spacing/case normalization
- examples such as `Retail Prime` vs `Retail_Prime`

Finding:
- `possible_category_alias_inconsistency`

#### D. Domain violation
Evidence:
- values outside explicit `valid_values`
- top unexpected categories

Finding:
- `domain_violation`

### 9.2 Numeric detectors

#### A. Impossible values
Evidence:
- values below `min_value`
- values above `max_value`

Finding:
- `range_violation`

#### B. Sentinel spikes / survival
Evidence:
- hits on known `sentinel_values`
- suspicious extreme repeated values when `sentinel_detection_mode` allows it

Finding:
- `possible_sentinel_handling_failure`

#### C. Mass at floor / cap
Evidence:
- floor rate
- cap rate
- concentration exactly at floor/cap values

Findings:
- `mass_at_floor_detected`
- `mass_at_cap_detected`

#### D. Constant / near-constant feature
Evidence:
- distinct count
- dominant value rate

Findings:
- `constant_feature_detected`
- `near_constant_feature_detected`

#### E. Binary collapse
Evidence:
- expected binary domain but only one observed class
- extreme dominant class share

Finding:
- `binary_collapse_detected`

### 9.3 Missingness and type detectors

#### A. Unexpected nulls
Evidence:
- missing rate
- nullability violation

Finding:
- `unexpected_nulls`

#### B. Dtype / coercion mismatch
Evidence:
- parse failure rate
- non-numeric content in numeric feature
- unexpected non-binary values in binary feature

Finding:
- `dtype_or_coercion_issue`

---

## 10. Informational Conditions

These should usually be surfaced as `INFO`, not treated as defects by default:
- right-skewed distribution
- heavy tails
- zero inflation
- low cardinality
- multimodality
- high dominant category share when still contract-valid
- broad numeric range

These conditions are useful context for the user, but they should not dominate the verdict unless supported by stronger evidence.

---

## 11. Profile Options

These are run-level controls with concrete meanings.

### 11.1 Recommended v1 options
- `summary_max_issues: int = 10`
- `include_charts: bool = True`
- `show_good_features: bool = False`
- `sentinel_detection_mode: "known_only" | "known_plus_suspicious"`
- `category_similarity_mode: "off" | "standard"`

### 11.2 Explicit non-goal
Do **not** include vague knobs like:
- `strictness`
- generic severity multipliers
- free-form threshold tuning for Mandos rubric

Mandos should stay opinionated.

---

## 12. Public API

```python
p = mandos.profile(
    session=session,
    table="DB.SCHEMA.TABLE",
    feature_rules=feature_rules,
    profile_options=profile_options,
)
```

### 12.1 Core methods
- `summary()`
- `issues()`
- `inspect(feature)`
- `metrics()`
- `export()`

### 12.2 Behavior
- evaluating `p` in a notebook should render the same as `p.summary()`
- `summary()` should be the default high-level triage surface
- `issues()` and `metrics()` should return DataFrames
- `inspect()` should render a single-feature diagnostic card

---

## 13. Display Design

Mandos should use a **hybrid display model**.

### 13.1 `summary()` — rich notebook HTML
Purpose:
- answer whether the dataset is usable
- identify which features need inspection
- keep the output compact and readable

Contents:
- dataset title / metadata
- verdict banner: `GOOD TO USE` / `REVIEW` / `ACTION REQUIRED`
- compact cards: row count, column count, critical features, warning features
- short ranked issue table
- simple next-step hints: `issues()`, `inspect()`, `export()`

### 13.2 `issues()` — DataFrame
Purpose:
- actionable findings table for sorting/filtering/export

Columns:
- `feature`
- `status`
- `finding_type`
- `reason`
- `evidence`
- `suggested_action`

### 13.3 `inspect(feature)` — rich typed card
Purpose:
- diagnose one feature deeply

Numeric features:
- key findings
- contract display
- histogram / cap-floor-sentinel evidence
- supporting metrics

Categorical features:
- key findings
- contract display
- top raw categories
- near-duplicate category examples
- domain violations

Binary features:
- key findings
- class balance
- collapse / invalid-domain evidence

### 13.4 `metrics()` — DataFrame
Purpose:
- raw evidence for debugging and power users

### 13.5 `export()` — HTML / PDF / JSON
Purpose:
- sharing, audit, and artifact generation

Full HTML/PDF reports should exist as **exports**, not as the default notebook experience.

---

## 14. Default Notebook Workflow

Mandos should encourage this workflow:

```python
p = mandos.profile(...)
p.summary()           # high-level verdict
p.issues()            # ranked findings table
p.inspect("LTV")      # feature-level diagnosis
p.export("profile.html")
```

Mental model:
- `summary()` = triage
- `inspect()` = diagnosis

---

## 15. Implementation Priorities

### Phase 1 — core engine
- schema + type detection
- raw metric computation via Snowflake pushdown
- FeatureRule evaluation
- built-in detector evaluation
- finding severity assignment
- `ProfileResult` object

### Phase 2 — default presentation
- notebook HTML summary
- issues DataFrame
- typed inspect card
- metrics DataFrame

### Phase 3 — export
- HTML export
- PDF export
- JSON export

---

## 16. Final Design Summary

`mandos.profile()` should be:
- **single-dataset**
- **feature-integrity-first**
- **contract-aware**
- **detector-driven**
- **opinionated, not threshold-heavy**
- **concise by default**

The success test is simple:

> Can `.profile()` quickly tell a Toyota DS user whether a dataset is safe to use, and if not, tell them exactly what is wrong and where to inspect next?

If yes, the design is working.

---

## 17. Display Design — Visual Specification

This section provides the concrete visual layouts for `summary()` and `inspect()`. These are the screens a user actually sees.

### 17.1 Design Decisions

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| Chart data computation | Lazy — computed on `inspect()`, not during profiling | Keeps `.profile()` fast. Detectors ensure `summary()` has zero false negatives. |
| Score column in MVP | Treated as a normal numeric column with its FeatureRule | `score_type`-aware detectors are a v2 feature. |
| Hint line in `summary()` | One quiet line in muted mono text | Teaches the API to new users without being a tutorial. |
| `export()` signature | `p.export("profile.html")` — format inferred from extension | One method, no format argument. Supports `.html`, `.pdf`, `.json`. |
| Zero-inflated display | Two-part chart in `inspect()`: proportion bar + non-zero histogram | Standard histograms are unreadable when one bin has 200K values. |
| Threshold annotations | `summary()` = plain language only. `inspect()` = plain language + evidence. `export()` = everything. | Progressive disclosure on the evidence itself. |

### 17.2 Verdict Mapping

| Condition | Verdict text | Severity color |
|-----------|-------------|----------------|
| Any CRITICAL finding exists | `ACTION REQUIRED` | Red `#EF4444` |
| No CRITICAL, but WARN findings exist | `REVIEW` | Amber `#F59E0B` |
| Only GOOD and INFO | `GOOD TO USE` | Green `#10B981` |

---

### 17.3 `summary()` — Layout

This is the default view. It must fit on one screen without scrolling.

```
+--------------------------------------------------------------+
|  mandos                                                      |
|  DO_1023_ZUUL_CURRENT · RTL_SUBPRIME · 2026-03-28 14:08     |
+--------------------------------------------------------------+
|                                                              |
|  +========================================================+  |
|  |  (!)  ACTION REQUIRED                                  |  |
|  |  3 critical findings · 5 warnings · 224,257 rows       |  |
|  +========================================================+  |
|                                                              |
|  +----------+ +----------+ +----------+ +----------+        |
|  | ROWS     | | COLUMNS  | | CRITICAL | | WARNINGS |        |
|  | 224,257  | | 24       | | 3        | | 5        |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                              |
|  Flagged Features                              8 of 24      |
|  +----------------------------------------------------------+|
|  | Feature                   | Finding              |Status ||
|  |---------------------------+----------------------+-------||
|  | ISSAMEADDRESS             | constant feature      | CRIT ||
|  | ZUUL2_SCORE               | mass at cap (17.6%)   | CRIT ||
|  | MEAN_VANTAGE_V4_SCORE     | unexpected nulls      | CRIT ||
|  | AP_VEHICLE_PAYMENT_PRXY3  | skewness flag         | WARN ||
|  | LOG_PAY_TO_INCOME_PRXY3   | skewness flag         | WARN ||
|  | P13_IQF9416               | high zero rate (92%)  | WARN ||
|  | P13_COL3291               | high zero rate (93%)  | WARN ||
|  | AP_PERCENT_ADVANCED_RATIO | possible sentinel..   | WARN ||
|  +----------------------------------------------------------+|
|                                                              |
|  Next: issues() · inspect("ISSAMEADDRESS") · export()        |
+--------------------------------------------------------------+
```

#### Components

1. **Header line.** `mandos` logo text followed by table name, snapshot name, and run timestamp. One line, compact.

2. **Verdict banner.** Full-width colored banner. Contains the verdict text and a one-line summary count. This is the first thing the eye hits. It answers "is this data safe?" in 2 seconds.

3. **Metric cards.** Four cards in a horizontal row. Row count, column count, critical count, warning count. These directly answer "how big is the dataset?" and "how big is the problem?" They do NOT show missing rate, duplicate rate, or type counts — those are stats, not triage.

4. **Flagged features table.** Only features with CRITICAL or WARN findings. Sorted by severity (CRITICAL first), then alphabetically within severity. Each row shows:
   - Feature name (monospace font)
   - Finding description (plain language, short — e.g. "mass at cap (17.6%)", "unexpected nulls", "constant feature")
   - Status badge (CRIT / WARN)

   The "8 of 24" label in the table header tells the user how many features were checked vs how many had issues. This replaces the need to show 16 green rows.

   The table respects `summary_max_issues` from profile_options (default 10). If more findings exist, a line says "Showing 10 of 14 findings. Run issues() for complete list."

5. **Hint line.** One line, muted mono text, at the bottom. Shows the three natural next actions. Styled like pandas' `[5 rows x 3 columns]` — unobtrusive but present.

#### What summary() does NOT contain
- Column profile cards or histograms
- Metric values (mean, std, percentiles)
- Raw metric evidence or threshold annotations
- Score correlations
- Passing features
- Charts of any kind

Summary is text only. Fast to render, small HTML, all signal.

---

### 17.4 `inspect()` — Layout

`inspect()` renders a single-feature diagnostic card. The layout adapts based on column display type, but all types follow the same structure:

**Findings → Contract → Evidence chart → Metrics**

This ordering is deliberate. The user already knows something is wrong (`summary()` told them). They came here to understand *what* and *why*. So findings are at the top with plain-language explanations. The contract shows what was expected. The chart shows the evidence visually. The metrics are at the bottom for anyone who needs the numbers.

Charts are computed lazily — the first call to `inspect()` triggers the histogram/category-count SQL for that column. Subsequent calls use cached results.

---

#### 17.4.1 Numeric Feature — `p.inspect("ZUUL2_SCORE")`

```
+--------------------------------------------------------------+
|  ZUUL2_SCORE                              numeric · CRITICAL  |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  CRIT  mass at cap detected                              ||
|  |        17.6% of values are at or above cap (999).        ||
|  |        This may indicate integer truncation in the       ||
|  |        source pipeline.                                  ||
|  |                                                          ||
|  |        metric: capping_rate = 0.176                      ||
|  |        rule: FeatureRule cap_value = 999                  ||
|  +----------------------------------------------------------+|
|                                                              |
|  Contract (FeatureRule)                                       |
|  +----------------------------------------------------------+|
|  |  floor: 100     cap: 999     nullable: no                ||
|  +----------------------------------------------------------+|
|                                                              |
|  Distribution                                                |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |                                ####                      ||
|  |                            ########                      ||
|  |                        ##############                    ||
|  |                    ######################           ##   ||
|  |              ################################### #####   ||
|  |  ............################################### #####   ||
|  |  |                                                  |    ||
|  |  100                                              999    ||
|  |  floor                                            cap    ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       P25       844.79               ||
|  |  missing      0.00%       P50       906.55               ||
|  |  mean       886.86        P75       951.04               ||
|  |  std         86.81        P99       994.00               ||
|  |  min           139        max          999               ||
|  |  skewness    -1.47        kurtosis    3.17               ||
|  |  zero_rate   0.00%        capping   17.6%                ||
|  |  flooring    0.00%                                       ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

**Key details:**

- The finding block includes both the plain-language reason AND the evidence (metric name, value, which rule triggered it). This is the "drill deeper" layer that `summary()` omits.

- The histogram annotates the floor and cap from the FeatureRule as markers on the x-axis. This makes cap/floor spikes visually obvious. If no FeatureRule is defined, the histogram renders without markers.

- If there are sentinel values defined in the FeatureRule, they are also annotated on the histogram (e.g., a dashed marker at -999 with label "sentinel").

- If the feature has multiple findings, they all appear in the Findings section, stacked vertically, ordered by severity.

- If the feature has no findings (status = GOOD), the findings section says: "No findings. Feature looks healthy."

---

#### 17.4.2 Categorical Feature — `p.inspect("AP_VEHICLE_MAKE")`

Healthy example:

```
+--------------------------------------------------------------+
|  AP_VEHICLE_MAKE                         categorical · GOOD   |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  No findings. Feature looks healthy.                     ||
|  +----------------------------------------------------------+|
|                                                              |
|  Contract (FeatureRule)                                       |
|  +----------------------------------------------------------+|
|  |  valid_values: [TOYOTA, LEXUS, MAZDA, NonTLM]            ||
|  |  nullable: no                                            ||
|  +----------------------------------------------------------+|
|                                                              |
|  Top Categories                                              |
|  +----------------------------------------------------------+|
|  |  TOYOTA  ======================================  168,432 ||
|  |  LEXUS   =========                               26,910 ||
|  |  NonTLM  =======                                 20,143 ||
|  |  MAZDA   =====                                    8,772 ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       top_value    TOYOTA            ||
|  |  missing      0.00%       top_rate      75.1%            ||
|  |  distinct         4                                      ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

Categorical feature with whitespace problem:

```
+--------------------------------------------------------------+
|  AP_CUST_RESIDENCE_CD                    categorical · WARN   |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  WARN  whitespace padding detected                       ||
|  |        3 categories have leading/trailing spaces.         ||
|  |        Raw distinct: 12 -> Trimmed distinct: 9.          ||
|  |        This can break joins and filters silently.         ||
|  |                                                          ||
|  |        Examples:                                         ||
|  |        "B " (4,231 rows) -> likely should be "B"         ||
|  |        " R" (891 rows) -> likely should be "R"           ||
|  |        "L " (312 rows) -> likely should be "L"           ||
|  |                                                          ||
|  |        metric: whitespace_rate = 0.024                   ||
|  |        metric: raw_distinct = 12, trimmed_distinct = 9   ||
|  +----------------------------------------------------------+|
|                                                              |
|  Top Categories (raw values)                                 |
|  +----------------------------------------------------------+|
|  |  B      ======================================    98,432 ||
|  |  R      ========================                  56,210 ||
|  |  L      ====================                      42,143 ||
|  |  2      ============                              21,881 ||
|  |  B_     ==                                         4,231 ||
|  |  _R     |                                            891 ||
|  |  L_     |                                            312 ||
|  |  ...                                                     ||
|  +----------------------------------------------------------+|
|  _ = whitespace                                              |
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       top_value    B                 ||
|  |  missing      0.00%       top_rate      43.9%            ||
|  |  distinct        12       trimmed_distinct    9          ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

**Key details:**

- Category bars are sorted by count descending. They show the raw (actual) values, not cleaned versions.

- When whitespace padding is detected, the affected values are shown in the category bars with a visible whitespace marker (`_` in ASCII, or a colored background in rendered HTML) so the user can see the duplicates.

- The finding includes concrete examples with row counts. This is critical — saying "whitespace detected" is abstract, saying `"B " (4,231 rows)` is actionable.

- If `valid_values` is defined in the FeatureRule, any values outside the domain are shown in the category bars with a distinct color or annotation (e.g., "unexpected") so they're visually separated from expected values.

---

#### 17.4.3 Binary Feature — `p.inspect("IS_COAPPLICATION")`

Healthy:

```
+--------------------------------------------------------------+
|  IS_COAPPLICATION                            binary · GOOD    |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  No findings. Feature looks healthy.                     ||
|  +----------------------------------------------------------+|
|                                                              |
|  Class Balance                                               |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |  0  ==========================================    86.1%  ||
|  |  1  ========                                      13.9%  ||
|  |                                                          ||
|  |  193,039 vs 31,218                                       ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       class_0     193,039            ||
|  |  missing      0.00%       class_1      31,218            ||
|  |  imbalance    86.1%                                      ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

Binary feature with collapse:

```
+--------------------------------------------------------------+
|  ISSAMEADDRESS                           binary · CRITICAL    |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  CRIT  constant feature detected                         ||
|  |        Column has only 1 distinct value. All 224,257     ||
|  |        rows are 0. This feature provides no signal       ||
|  |        and cannot discriminate between outcomes.         ||
|  |                                                          ||
|  |        metric: distinct_count = 1                        ||
|  |        metric: dominant_value_rate = 1.000               ||
|  +----------------------------------------------------------+|
|                                                              |
|  Class Balance                                               |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |  0  ================================================ 100%||
|  |  1                                                    0% ||
|  |                                                          ||
|  |  224,257 vs 0                                            ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       class_0     224,257            ||
|  |  missing      0.00%       class_1           0            ||
|  |  distinct         1       imbalance   100.0%             ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

**Key detail:** The binary chart is a proportion bar — one horizontal bar divided into two segments. Simple and immediate. The finding explains the business impact: "provides no signal and cannot discriminate."

---

#### 17.4.4 Zero-Inflated Feature — `p.inspect("P13_IQF9416")`

```
+--------------------------------------------------------------+
|  P13_IQF9416                    numeric (zero-inflated) · WARN|
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  WARN  high zero rate                                    ||
|  |        92.2% of values are zero. This feature may have   ||
|  |        limited predictive value for most of the          ||
|  |        population.                                       ||
|  |                                                          ||
|  |        metric: zero_rate = 0.922                         ||
|  |                                                          ||
|  |  WARN  mass at floor detected                            ||
|  |        96.9% of values are at or below floor (0).        ||
|  |                                                          ||
|  |        metric: flooring_rate = 0.969                     ||
|  |        rule: FeatureRule floor_value = 0                  ||
|  +----------------------------------------------------------+|
|                                                              |
|  Contract (FeatureRule)                                       |
|  +----------------------------------------------------------+|
|  |  floor: 0      cap: 10      max_zero_rate: 0.95         ||
|  +----------------------------------------------------------+|
|                                                              |
|  Zero / Non-Zero Split                                       |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |  Zero     ==========================================  92%||
|  |  Non-zero ====                                         8%||
|  |                                                          ||
|  |  206,775 zeros · 17,334 non-zero                        ||
|  +----------------------------------------------------------+|
|                                                              |
|  Non-Zero Distribution                                       |
|  +----------------------------------------------------------+|
|  |                                                          ||
|  |  ########                                                ||
|  |  ############                                            ||
|  |  ################                                        ||
|  |  ####################                                    ||
|  |  |         |         |         |         |               ||
|  |  0         1         2         3         4               ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      218,109       zero_rate    92.2%             ||
|  |  missing      2.74%       nz_count     17,334            ||
|  |  mean        0.056        nz_mean       0.72             ||
|  |  std         0.249        nz_std        0.93             ||
|  |  min            0         nz_min        0.06             ||
|  |  max            4         nz_max        4.00             ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

**Key details:**

- Two-part chart. The top chart is a proportion bar showing zero vs non-zero split (same visual style as the binary proportion bar). The bottom chart is a histogram of ONLY the non-zero values.

- This is critical for features like P13 bureau variables where 90%+ being zero is expected. A standard histogram would show one bar at 200K and the rest invisible. The two-part display makes the non-zero distribution actually readable.

- Zero-inflated is a display type, not a severity. The column is detected as zero-inflated when `zero_rate > 0.50`. The INFO finding "zero inflation" from Section 10 may accompany the chart, but the severity is determined by whether a FeatureRule or built-in detector threshold is breached.

- The metrics section shows both overall stats (mean, std, min, max) AND non-zero-specific stats (nz_mean, nz_std, nz_min, nz_max). This gives the user both views without requiring them to mentally subtract the zero mass.

---

### 17.5 `inspect()` — No FeatureRule Defined

When a feature has no FeatureRule, the contract section is omitted and the card is slightly shorter. The built-in detectors still run. The histogram renders without floor/cap annotations.

```
+--------------------------------------------------------------+
|  AP_APPL_INCOME                          numeric · WARN       |
+--------------------------------------------------------------+
|                                                              |
|  Findings                                                    |
|  +----------------------------------------------------------+|
|  |  WARN  skewness flag                                     ||
|  |        Feature is heavily right-skewed (skewness = 67.1).||
|  |        This is informational and may be expected for      ||
|  |        income distributions.                             ||
|  |                                                          ||
|  |        metric: skewness = 67.10                          ||
|  +----------------------------------------------------------+|
|                                                              |
|  No FeatureRule defined for this column.                      |
|                                                              |
|  Distribution                                                |
|  +----------------------------------------------------------+|
|  |  (histogram SVG renders here)                            ||
|  +----------------------------------------------------------+|
|                                                              |
|  Metrics                                                     |
|  +----------------------------------------------------------+|
|  |  count      224,257       P25       2,800.00             ||
|  |  missing      0.00%       P50       4,100.00             ||
|  |  mean      5,826.43       P75       6,200.00             ||
|  |  std       8,441.22       P99      31,500.00             ||
|  |  min           0.00       max     950,000.00             ||
|  |  skewness    67.10        kurtosis  8,891.00             ||
|  +----------------------------------------------------------+|
|                                                              |
+--------------------------------------------------------------+
```

The line "No FeatureRule defined for this column." is a quiet prompt that defining a contract would unlock additional checks (floor/cap rates, sentinel detection, nullability enforcement). It is not a warning, just context.

---

### 17.6 `summary()` and `inspect()` — Relationship

The two displays form a **triage → diagnosis** workflow:

| | `summary()` | `inspect(feature)` |
|---|---|---|
| **Purpose** | Is the dataset safe? What's wrong? | Why is this feature flagged? Show me the evidence. |
| **Scope** | All features, one screen | One feature, full detail |
| **Findings** | Short plain-language description | Full explanation + metric evidence + rule source |
| **Charts** | None | Type-appropriate chart (histogram / bars / proportion) |
| **Metrics** | None | Full stat table |
| **Contract** | Not shown | Displayed if FeatureRule exists |
| **HTML size** | < 50 KB | < 30 KB per feature |
| **Computation** | All metrics + detectors computed eagerly | Chart data (bins, category counts) computed lazily on first call |

---

## 18. Rendering Architecture

### 18.1 Notebook Output

All notebook output is a single HTML document wrapped in an iframe via `_repr_html_()`.

```python
class ProfileResult:
    def _repr_html_(self):
        """Auto-renders summary() when the object is evaluated in a notebook."""
        html = self._build_summary_html(theme="dark")
        escaped = html_module.escape(html)
        return (
            f'<iframe srcdoc="{escaped}" '
            f'style="width:100%;height:{self._summary_height}px;border:none;'
            f'border-radius:10px;" sandbox="allow-scripts"></iframe>'
        )
```

Why iframe + srcdoc:
- CSS isolation — Mandos styles do not bleed into the notebook.
- Reduced cell output size — a single iframe tag instead of a massive DOM.
- Consistent rendering across JupyterLab, JupyterHub, VS Code.

### 18.2 JupyterHub Kernel Crash Prevention

Known cause: enterprise JupyterHub has an IOPub data rate limit (~1 MB/s default). Large HTML cell output exceeds this limit and kills the kernel.

| Problem | Root cause | Fix |
|---------|-----------|-----|
| `IOPub data rate exceeded` | HTML output too large | `summary()` < 50 KB. `inspect()` < 30 KB. |
| Memory spike on display | Base64 images, large JS | All charts are inline SVG strings. No matplotlib, no plotly, no bokeh. |
| Slow rendering | Thousands of DOM elements | Iframe isolation. Flagged features only in summary. |
| Font loading failure | Google Fonts blocked by firewall | `@font-face` with `local()` fallback, then system fonts. |

### 18.3 All Charts Are Inline SVG

Every chart is a Python function that returns an SVG string. No external charting libraries.

Chart types needed for `inspect()`:

| Chart | Used for | Display type |
|-------|---------|--------------|
| Histogram (vertical bars) | Distribution of continuous and score features | `continuous`, `score` |
| Horizontal value-count bars | Category frequencies, low-cardinality integers | `categorical`, `low_cardinality` |
| Proportion bar | Class balance, zero/non-zero split | `binary`, `zero_inflated` (zero split) |
| Non-zero histogram | Distribution of non-zero values only | `zero_inflated` (detail) |

All histograms should annotate floor/cap/sentinel values from FeatureRule as vertical markers on the x-axis when defined.

### 18.4 Font Stack

```
UI / prose:    IBM Plex Sans, -apple-system, sans-serif
Data / code:   JetBrains Mono, Fira Code, monospace
```

Include `@font-face` rules pointing to `local()` font names for enterprise environments where Google Fonts is blocked. The CSS fallback chain handles the worst case gracefully.

### 18.5 Theme

Both `summary()` and `inspect()` render in the **dark theme** for notebook use.

| Element | Value |
|---------|-------|
| Page background | `#0C1018` |
| Card/panel background | `rgba(255,255,255, 0.025)` |
| Card border | `rgba(255,255,255, 0.06)` |
| Table header background | `rgba(255,255,255, 0.03)` |
| Primary text | `#E6EDF3` |
| Secondary text | `rgba(255,255,255, 0.35)` |
| Muted text | `rgba(255,255,255, 0.25)` |

Severity colors:

| Status | Color |
|--------|-------|
| CRITICAL | `#EF4444` |
| WARN | `#F59E0B` |
| INFO | `#6366F1` |
| GOOD | `#10B981` |

The `export()` method renders in a **light theme** for HTML/PDF output. Same components, inverted palette.

---

## 19. Open Design Questions

These items are noted for future discussion and are not blockers for MVP implementation.

1. **Score-type-aware detectors.** When Mandos supports probability models or classification outputs, the score column should get specialized checks (bounded [0,1] for probabilities, infinity detection for logits, class balance for classifications). Deferred to v2.

2. **Score correlations.** Spearman rank correlation between features and the score column is useful but is a comparison concept. Dropped from `.profile()` MVP. May return as an optional method or move to `.compare()`.

3. **`inspect()` chart annotations.** Should the histogram visually annotate floor/cap/sentinel values from the FeatureRule as vertical marker lines? Recommended yes — makes cap spikes immediately readable. Needs design for how markers render in SVG.

4. **`suggested_action` field.** The `issues()` DataFrame includes a `suggested_action` column. Should `inspect()` also display suggested actions? Deferred — the plain-language finding reason is sufficient for MVP. Actions can be added once the team has patterns for common fixes.

5. **Multi-feature inspect.** Should `p.inspect("FEAT_A", "FEAT_B")` render two cards sequentially? Useful for comparing related features side by side. Low priority for MVP.
