# Mandos UX Redesign — Full Specification

> This document describes the proposed redesign of the Mandos model monitoring library's API surface, output display, and feature contract system. It is intended as a working specification for implementation.

---

## Background & Context

Mandos is a Snowflake-first model validation and monitoring platform. It computes data quality, drift, and model performance metrics and persists them to Snowflake in a standardized way. The current version (1.0.0) has strong computational capabilities but a UX that is more complex than it needs to be for the two core use cases the team cares about.

### The two jobs users actually need to do

**1. Ad-hoc / pre-production analysis**
- Profile a single dataset (understand distributions, DQ issues, correlations)
- Compare two datasets (train vs prod, before vs after, reference vs current)

**2. Production monitoring**
- Capture metrics and persist to Snowflake on a recurring basis
- Retrieve historical baselines and snapshots for trend analysis
- Generate auditable evidence for governance / model risk teams

Everything Mandos does maps to one of these two jobs. The redesign organizes the entire library around them.

---

## Core Problem with Current UX

The current API is **object-first, not job-first**. A user must know to create a `Monitor` object, then a `Baseline`, then call `.run()`, then call `result.issues()`, then call `result.plot.dq_heatmap()`. The mental model exposed to the user is the library's internal architecture, not the task they're trying to accomplish.

Additionally, the default output requires significant expertise to interpret:
- Raw metric names (`csi_numeric`, `skewness_flag`, `zero_rate`) instead of plain English
- One-size-fits-all histogram for every column regardless of data type
- FeatureRule violations mixed with DQ and drift issues in one undifferentiated table
- PSI/CSI bin charts only accessible via explicit plot method calls

---

## Proposed API — Three Entry Points

Replace the current top-level surface with exactly three functions, each matching one job:

```python
# Job 1: Understand a single dataset
result = mandos.profile(data)

# Job 2: Validate two datasets against each other
result = mandos.compare(reference, current)

# Job 3: Production monitoring against a persisted baseline
result = mandos.monitor(data, model="my-model/3.1")
```

### Key design rules

- `data` accepts either a pandas DataFrame or a Snowflake table string. The library detects which and routes internally. Users never call `Monitor.from_snowflake()` vs `Monitor.from_pandas()`.
- All three functions return the same `Result` object with a consistent interface.
- Users learn one result API regardless of which job they ran.
- `Monitor`, `Baseline`, and `RunResult` remain as internal classes but are not part of the primary user-facing API.

### Optional parameters for each entry point

```python
# Profile
result = mandos.profile(
    data,                          # DataFrame or "DB.SCHEMA.TABLE"
    score_column="SCORE",          # optional — enables PSI, Spearman
    feature_columns=["A","B","C"], # optional — default: all columns
    model="auto_approve/3.1",      # optional — for persistence
)

# Compare
result = mandos.compare(
    reference,                     # DataFrame or Snowflake table
    current,                       # DataFrame or Snowflake table
    score_column="SCORE",
    feature_columns=["A","B","C"],
    reference_where="SPLIT='TRAIN'",  # optional SQL filter
    current_where="SCORED_DATE >= '2026-01-01'",
)

# Monitor
result = mandos.monitor(
    data,                          # DataFrame or Snowflake table
    model="auto_approve/3.1",      # model ID — used to find/create baseline
    snapshot="2026-03",            # optional — labels this run
    rules="configs/auto_approve.yaml",  # optional — FeatureRule contracts
    persist=True,                  # default True for monitor jobs
)
```

### Baseline handling in monitor jobs

The current flow requires the user to explicitly build, save, and load baselines. The redesign automates this:

- On first run for a given `model` ID: Mandos builds the baseline from the provided data, persists it, and logs `"No baseline found for auto_approve/3.1. Building from current data and persisting."`
- On subsequent runs: Mandos loads the persisted baseline automatically by model ID.
- To force a baseline rebuild: pass `rebuild_baseline=True`.
- To use a specific baseline: pass `baseline_id="my-baseline-uuid"`.

The user never writes `model.save_baseline()` or `model.load_baseline()` in the normal flow.

---

## The Result Object — Consistent Interface

All three jobs return a `Result` with this interface:

```python
result.show()          # Main display. Intelligent, job-aware. Renders in Jupyter.
result.issues()        # DataFrame of all WARN/CRITICAL/ERROR rows only.
result.summary         # Dict — machine-readable health summary.
result.export(format="pdf", output_dir="reports/")  # PDF or HTML.

# Filtered issue views
result.issues(type="dq")      # Data quality issues only
result.issues(type="drift")   # Drift issues only
result.issues(type="rules")   # Contract violations only

# Raw data access (power users)
result.dq()            # DataFrame: one row per column per DQ metric
result.feature_drift() # DataFrame: one row per column per drift metric
result.score_drift()   # DataFrame: drift metrics for score column only
result.metrics         # DataFrame: all metrics (DQ, DRIFT, RULE, GATE, PERF)
```

`result.show()` renders differently depending on which job produced it, but always follows the same three-layer structure:

```
1. Header     — status at a glance
2. Issues     — only what's wrong, in plain language
3. Detail     — feature profiles, bin charts, heatmaps
```

---

## Display Layer 1: Header

A compact status card. Same layout for all three jobs, different fields populated.

### Monitor / Compare header

```
mandos monitor  Zuul2 / RTL_SUBPRIME  snapshot: 2026-03

┌──────────┬──────────────┬──────────────┬──────────────┬───────────┬─────────────────────┐
│ STATUS   │ FEATURES     │ DQ ISSUES    │ DRIFT ISSUES │ SCORE PSI │ ROW COUNT            │
│ CRITICAL │ 24 monitored │ 5            │ 9 drifted    │ 0.037 ✓   │ 2.95M → 224K (-92%) │
└──────────┴──────────────┴──────────────┴──────────────┴───────────┴─────────────────────┘

Schema: No changes ✓   Gate failures: 0 ✓   NULL injection: MEAN_VANTAGE_V4_SCORE ⚠
Baseline ID: 444835ac-0f7a-4e3a-9968-27cd5277091a
```

### Profile header (simpler)

```
mandos profile  224,257 rows · 24 columns

┌──────────┬──────────────┬──────────────┐
│ STATUS   │ ROWS         │ DQ ISSUES    │
│ WARN     │ 224,257      │ 4 warnings   │
└──────────┴──────────────┴──────────────┘
```

**Design rules for the header:**
- Overall STATUS badge is the first thing the eye goes to. Color-coded: red=CRITICAL, orange=WARN, green=OK.
- Row count change always shown for compare/monitor jobs — it's the first thing practitioners check.
- NULL injection flagged inline because it indicates a JOIN failure, not a data quality issue per se.
- Schema status always shown — schema breaks are immediately actionable.

---

## Display Layer 2: Issues — Plain Language Only

The default issues display uses plain English, not metric notation.

### Current (bad)
```
CRITICAL | ISSAMEADDRESS | constant_feature_flag | 1.0 | constant_feature_flag: 100.0% of rows violate the rule
WARN     | P13_IQF9416   | zero_rate             | 0.922 | zero_rate is 92.2% — no baseline available for comparison
```

### Proposed (good)
```
CRITICAL  ISSAMEADDRESS              Constant feature — all 224K rows are 0. Dead in production.
                                     Possible broken upstream join or encoding error.

CRITICAL  P13_AUA8320                Severe distribution shift (CSI 4.78). Population has moved
                                     almost entirely into the top bin. Investigate data pipeline.

WARN      MEAN_VANTAGE_V4_SCORE      8.2% missing — significantly higher than reference (0%).
                                     Possible failed JOIN on bureau data.

WARN      AP_VEHICLE_PAYMENT...      Extreme skewness (67.1). Max value is 46× the 99th percentile.
                                     Check whether capping is applied in the production pipeline.
```

**Design rules for issues display:**
- Status badge + feature name + one or two plain-language sentences.
- The reason explains *what to do*, not just *what the number is*.
- No raw metric names in the default display. Metric names accessible via `result.issues()` DataFrame for power users.
- Issues grouped by type: DQ issues first, then drift issues, then contract violations.

### Filtered issue access

```python
result.issues()              # All issues
result.issues(type="dq")     # Data quality only
result.issues(type="drift")  # Drift only
result.issues(type="rules")  # Contract violations only — see Contracts section
```

---

## Display Layer 3: Feature Detail

### PSI/CSI Bin Charts — The Core Visualization

The PSI/CSI bin charts are the most valuable output in the current system. They answer two questions simultaneously: *how much drift* (the CSI number) and *where* the drift is coming from (which bins diverged). They are kept and made more prominent.

**Current problem:** Users must call `result.plot.csi(column="LTV")` explicitly. Charts are opt-in.

**Proposed:** Charts render automatically for all drifted features inside `result.show()`. No explicit plot call needed.

#### Structure: Overview bar → Feature cards with bin charts

**Step 1 — Overview bar (always shown for compare/monitor jobs):**

```
DRIFT OVERVIEW — 9 features drifted · sorted by CSI

P13_AUA8320                  ████████████████████████████████  4.779  CRITICAL
P13_IQA9427                  ██████████████░                   2.395  CRITICAL
AUTO_PAYMENT_TO_DEBT_LINE3   █████░                            1.076  CRITICAL
P13_ALL4520                  ██░                               0.585  CRITICAL
P13_RTR0300                  ██░                               0.488  CRITICAL
...

│ ← WARN threshold (0.25)
```

The bar is a navigation aid — the user sees all drifted features ranked at once and decides where to drill.

**Step 2 — Feature cards with bin charts (auto-expanded for top 2, collapsed for rest):**

```
▼ P13_AUA8320   CRITICAL   CSI 4.779     ● Baseline  ● Current

  Population has collapsed into the top bin (≥161). 4.8% in training → 28.8%
  in production. This is a fundamental population shift, not noise.

  [Grouped bar chart: blue=Baseline, orange=Current, one group per bin]
  Bins on x-axis, % of rows on y-axis

► P13_IQA9427   CRITICAL   CSI 2.395     [click to expand]
► AUTO_PAYMENT_TO_DEBT_LINE3   CRITICAL   CSI 1.076   [click to expand]
```

**Dominant bin callout:**
Each expanded card includes a one-sentence plain-language interpretation computed automatically from the highest-CSI-contributing bin:

```
Primary driver: 28.8% of production rows are in the top bin (≥161) vs 4.8% in training.
```

This is computed as: find the bin with the highest `psi_contrib` value, write a sentence about it.

#### Score PSI — Special Treatment

Score PSI gets its own section before feature drift detail:

```
SCORE HEALTH — ZUUL2_SCORE

PSI 0.037   [OK — stable]

[Bin chart showing baseline vs current score distribution]

Score distribution is stable. The [38, 801) and [971, 999) bins show slight
overrepresentation in production, but overall PSI is well below threshold.
Note: score is integer-truncated at 999 in production — known pipeline limitation.
```

When PSI is elevated, diverging bins are highlighted and a note explains which score range is shifting.

---

## Column Display Type — Adapts to Data

The current system renders every numeric column identically: stats table + histogram. This is wrong for several common column types.

Mandos already computes `distinct_values`, `zero_rate`, `skewness`, and `dtype` for every column. Use these to route display:

### Routing logic

| Condition | Display type |
|-----------|-------------|
| `distinct_values ≤ 2` OR `zero_rate > 0.95` | Binary / flag display |
| `zero_rate > 0.5` AND `skewness > 10` | Zero-inflated split display |
| `distinct_values ≤ 25` AND `dtype == int` | Ordinal frequency table |
| `skewness > 20` | Continuous histogram with log scale option + percentile callout |
| Otherwise | Standard continuous histogram |

### Binary / flag display

```
ISSAMEADDRESS   [CRITICAL — CONSTANT]

████████████████████████████████  100.0%  = 0   (224,257 rows)
                                    0.0%  = 1

This feature has no variation in production. It contributes nothing to the
model and likely indicates a broken upstream join or constant encoding.
```

No histogram. Two-bar frequency display. Plain-language interpretation auto-generated when `constant_feature_flag` fires.

### Zero-inflated split display

```
P13_IQF9416   [WARN — HIGH ZERO RATE]

  92.2% zeros   ████████████████████████████░░░
   7.8% non-zero

  Non-zero distribution (7.8% of rows):
  [histogram of non-zero values only, rescaled axis]
  mean=0.73  p50=1.0  p95=1.0  p99=4.0  max=4.0
```

Zero rate gets a callout. Non-zero tail gets its own histogram with a rescaled axis. The user can see what's happening on both sides.

### Ordinal / low-cardinality integer display

```
P13_ALL4520   [OK]

Value   Count     %
84      33,820   15.1%  ████████████████
70      28,420   12.7%  █████████████
65      19,340    8.6%  █████████
...
(top 10 of 86 distinct values shown)
```

Value frequency table, sorted by count. Much more readable than a histogram for bureau attributes and flag variables.

### Continuous with extreme skew

```
AP_VEHICLE_PAYMENT_PROXY_LINE3   [WARN — EXTREME SKEW]

  [histogram with log y-axis]

  p1=139   p25=359   p50=483   p75=652   p99=1,218   max=55,903

  Skewness = 67.1. The maximum value (55,903) is 46× the 99th percentile.
  Check whether capping/flooring is applied correctly in the production pipeline.
```

---

## FeatureRule Contracts — Dedicated Display

### Current problem

FeatureRule violations currently appear in three places:
1. `result.issues()` DataFrame mixed with DQ and drift rows
2. DQ heatmap (capping_rate, flooring_rate columns)
3. Log output during run

None of these surfaces clearly answer "did my production pipeline respect the feature engineering contracts?" — which is a governance requirement, not just a debugging tool.

### Proposed: dedicated Contracts section

Every column with a defined `FeatureRule` gets a row in the Contracts display, whether it passed or failed:

```
CONTRACTS — configs/zuul2_rtl_subprime.yaml
Every column with a defined rule is evaluated here.

CRITICAL VIOLATIONS
  MEAN_VANTAGE_V4_SCORE    nullable=False       8.2% null     CRITICAL
  LOG_PAY_TO_INCOME_...    nullable=False       0.1% null     CRITICAL
  P13_ALL0448              nullable=False       2.7% null     CRITICAL
  P13_AUA8320              nullable=False       2.7% null     CRITICAL

WARNINGS
  ZUUL2_SCORE              dtype: continuous    Truncated at 999 (integer)  WARN
  IS_SUBVENTION            dtype: numeric rate  Binary proxy (0/1)          WARN

PASSING
  LTV                      cap=0.95             3.2% capped                 OK
  DOWN_RATIO               floor=0.0            0.0% floored                OK
```

### API access

```python
result.issues(type="rules")   # Only contract violations (WARN+)
result.contracts()            # All contracts: passing + failing
```

### Rule discovery workflow

For first-time model onboarding, `p.suggest_rules()` auto-generates a starter YAML:

```python
profile = mandos.profile(training_data, model="auto_approve/3.1")
profile.suggest_rules()
# Writes: configs/auto_approve_suggested.yaml
# User reviews, edits, renames to configs/auto_approve.yaml
```

Then in monitor jobs:

```python
result = mandos.monitor(data, model="auto_approve/3.1", rules="configs/auto_approve.yaml")
```

---

## FeatureRule Simplification

The current Pattern 2 (percentile-based rules) requires a four-step resolve-then-rebuild flow:

```python
# Current — too complex
monitor = Monitor(config)
baseline = monitor.build_baseline(df_baseline)
rules = {col: rule.resolve(column=col, baseline_metrics=baseline.get_column_metrics(col))
         for col, rule in config.feature_rules.items()}
resolved_config = MonitorConfig(model_name=config.model_name, feature_rules=rules)
monitor = Monitor.from_pandas(df_monitor, ..., feature_rules=rules)
result = monitor.run(baseline=baseline)
```

Proposed: collapse this into a single call. The library handles rule resolution internally when a baseline is available.

```python
# Proposed — one call
result = mandos.monitor(
    data,
    model="auto_approve/3.1",
    rules="configs/auto_approve.yaml",  # percentile refs resolved automatically
)
```

---

## Trend Charts — Monitor-Level

For cross-run trend analysis, the `monitor.plot` accessor (or equivalent in the new API) provides:

| Chart | What it shows | When to use |
|-------|--------------|-------------|
| `score_drift(limit=12)` | PSI over time as line chart with threshold bands | Every monthly review |
| `alert_timeline(limit=12)` | WARN/CRITICAL counts per snapshot as stacked bar | Identifying deteriorating models |
| `drift_heatmap(top_n=15, limit=12)` | Feature × snapshot CSI heatmap | Spotting which features drift together |
| `dq_heatmap(metric="zero_rate", limit=12)` | DQ rate × snapshot heatmap | Tracking pipeline stability |
| `feature_trend(column, limit=12)` | Single feature metric over time | Deep dive on one feature |

All trend charts read from persisted Snowflake data. No raw data access required.

---

## Persistence — Simplified

```python
# Auto-persist on run (default for monitor jobs)
result = mandos.monitor(data, model="auto_approve/3.1", persist=True)

# Load a previous run
old_result = mandos.load_run(model="auto_approve/3.1", snapshot="2026-01")
old_result = mandos.load_run(model="auto_approve/3.1", run_id="auto_approve/3.1/2026-01")

# Load most recent run
latest = mandos.load_latest_run(model="auto_approve/3.1")

# List runs
runs = mandos.list_runs(model="auto_approve/3.1", limit=12)

# Metric history for trend analysis
history = mandos.metric_history(model="auto_approve/3.1", metric_types=["DQ","DRIFT"], limit=12)
```

---

## What This Eliminates (User-Facing)

These concepts no longer need to appear in user-facing documentation or the primary workflow:

- `Monitor` class instantiation
- `Baseline` object management
- `RunResult` class name
- `Monitor.from_snowflake()` vs `Monitor.from_pandas()` distinction
- Manual `model.save_baseline()` / `model.load_baseline()` calls
- FeatureRule resolve-then-rebuild four-step pattern
- Explicit `result.plot.top_csi_bar()` calls to see CSI charts
- Raw metric names in the default display (`csi_numeric`, `skewness_flag`, `zero_rate`)

These remain available as power-user internals but are not part of the primary API.

---

## What This Preserves

- All underlying Snowflake computation — the engine is unchanged
- Full DataFrames via `result.feature_drift()`, `result.dq()`, etc.
- The full `result.plot.*` API for custom visualization
- YAML config for model onboarding and FeatureRule definition
- `p.suggest_rules()` for rule discovery
- PSI/CSI bin charts — now automatic, not opt-in
- The DQ heatmap — now rendered inside `result.show()` in the Data Quality tab
- PDF and HTML export via `result.export()`

---

## Summary — The One Paragraph Version

Mandos exposes three functions: `profile`, `compare`, and `monitor`. Each takes data and returns a `Result`. The result explains itself in plain language via `result.show()`, which renders a status header, plain-language issues, and feature-level detail including automatic PSI/CSI bin charts for all drifted features. Column display adapts to data type — binary features get frequency bars, zero-inflated features get split displays, ordinal features get value tables, and continuous features get histograms. FeatureRule contracts get a dedicated Contracts section that shows every rule — passing and failing — making them governance-ready without extra work. Baselines are managed automatically by model ID. The user never needs to know about `Monitor`, `Baseline`, or `RunResult` unless they want to go deeper.

---

## Visual Design Reference

A working HTML mockup is available alongside this document (`mandos_mockup.html`).
Open it in any browser — no build step required.

**Design language:**
- Dark background (`#080a0c`) — appropriate for a terminal/data tool
- IBM Plex Mono for all metrics, labels, and code
- DM Sans for prose and descriptions
- Status colors: `#f04f4f` CRITICAL · `#e8962a` WARN · `#3dba7e` OK · `#5b9cf6` INFO
- Baseline bars: `#4b8ef0` (blue) · Current bars: `#f07340` (orange)
- Tabbed layout: Drift Analysis · Score Health · Data Quality · Contracts
