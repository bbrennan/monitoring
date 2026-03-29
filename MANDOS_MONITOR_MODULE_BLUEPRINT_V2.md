# `mandos.monitor()` — Module Blueprint v2

> **Version:** 2.0  
> **Date:** 2026-03-29  
> **Status:** Draft  
> **Audience:** Mandos implementation/design  
> **Goal:** Define the production monitoring path so it clearly lives in the same family as `profile()` and `compare()` while owning baseline persistence, recurrent snapshot evaluation, Snowflake read/write workflows, and historical trend analysis.

---

## 1. Product Positioning

Mandos should feel like one coherent family:

- `profile()` = single-dataset feature integrity validation
- `compare()` = dataset-to-dataset compatibility and drift validation
- `monitor()` = production monitoring using a persisted baseline, recurrent production snapshots, and historical trends

### Family relationship

A useful mental model:

- `profile()` and `compare()` are **analysis tools** for ad hoc and development work
- `monitor()` is the **production orchestrator** that operationalizes the same ideas on a schedule

`monitor()` is not a separate product. It is the operational form of the same Mandos philosophy:

- use explicit `FeatureRules`
- apply built-in defect detectors
- compute drift and score/model health metrics
- persist evidence to Snowflake
- surface concise triage via `summary()`, `issues()`, and `inspect()`
- analyze how health changes over time

---

## 2. What `monitor()` Does

`monitor()` owns the full production monitoring lifecycle:

1. Build and persist a **baseline** when a model is first onboarded or refit
2. Evaluate recurrent **production snapshots** against that baseline
3. Read and write monitoring evidence to **Mandos-owned Snowflake tables**
4. Persist metrics, findings, statuses, and run metadata for audit and reuse
5. Support **historical trend analysis** across runs using persisted aggregates
6. Return a result object with the same user experience as `profile()` and `compare()`
7. Support downstream alerting / orchestration based on persisted severities and statuses

### Core question answered by `monitor()`

> Is production data and model behavior still healthy relative to the approved baseline, how is that health changing over time, and if something is wrong, where should we look first?

---

## 3. What `monitor()` Does Not Do

`monitor()` should **not**:

- replace ad hoc profiling of a one-off dataset (`profile()`)
- replace one-off train-vs-prod investigations (`compare()`)
- silently repair or transform production data
- become a dashboard product by itself
- become a generic workflow engine
- infer business KPIs that are not explicitly configured or persisted
- mutate source model tables or write back into application schemas

Its job is narrower:

- evaluate production snapshots against an approved baseline
- persist the evidence into Mandos-owned Snowflake structures
- surface triage for the current run
- surface trends across prior runs

---

## 4. Core Design Principle

### `monitor()` should reuse the same core engines as `profile()` and `compare()`

Implementation-wise:

- baseline build should reuse the same primitive/stat computation engine used by `profile()`
- snapshot evaluation should reuse the same delta/drift logic used by `compare()`
- result rendering should reuse the same display primitives and result API shape
- trend analysis should use persisted aggregates from prior monitoring runs rather than re-reading historical raw snapshots

So conceptually:

`monitor()` = persisted baseline management + repeated `compare(baseline, snapshot)` + evidence persistence + trend analysis

That is the cleanest design.

---

## 5. Snowflake Responsibilities

`monitor()` should be explicitly **Snowflake read/write native**.

### 5.1 Read responsibilities

`monitor()` must be able to read:

- baseline source tables or views
- production snapshot tables or views
- persisted baseline artifacts
- persisted prior monitoring runs
- persisted feature metrics and findings history
- optional labels / actuals tables for model performance when available

### 5.2 Write responsibilities

`monitor()` must be able to write:

- baseline metadata
- baseline feature metrics
- baseline reference distributions / bins
- run metadata
- run-level statuses
- run-level findings
- feature-level DQ and drift metrics
- score/model performance metrics
- trend-ready aggregate tables or views
- report artifacts or report pointers

### 5.3 Write scope guardrail

`monitor()` should write only to **Mandos-owned monitoring schemas/tables**, not to the source production tables.

---

## 6. Public API Shape

## 6.1 Entry Point

Use a top-level constructor-like entry point:

```python
m = mandos.monitor(
    session=session,
    model_id="zuul2_rtl_subprime_v17",
    score_column="ZUUL2_SCORE",
    feature_columns=FEATURE_COLS,
    feature_rules=feature_rules,
    profile_options=profile_options,
    monitor_options=monitor_options,
)
```

This returns a `Monitor` object.

### Why a `Monitor` object?

Because production monitoring has stateful concerns that `profile()` and `compare()` do not:

- model identity
- baseline identity
- persistence tables
- run metadata
- snapshot cadence
- history/trend retrieval

A `Monitor` object is the right abstraction.

---

## 6.2 Primary Methods

### A. `build_baseline()`

Used when the model is first onboarded or refit.

```python
baseline = m.build_baseline(
    source="DB.SCHEMA.TRAIN_FEATURES_V17",
    baseline_name="zuul2_rtl_subprime_v17",
    where="DEAL_SEG = 'RTL_SUBPRIME'",
)
```

Purpose:
- compute and persist baseline statistics / bins / contracts / reference metadata
- establish the production ground truth

### B. `run()`

Used for recurrent production evaluation.

```python
run = m.run(
    snapshot="DB.SCHEMA.SCORED_APPS_DAILY",
    snapshot_name="2026-03-29_daily",
    where="DEAL_SEG = 'RTL_SUBPRIME'",
    snapshot_ts="2026-03-29",
)
```

Purpose:
- compare one production snapshot against the persisted baseline
- compute DQ + drift + score/model health
- persist findings and return a `MonitorRunResult`

### C. `latest()`

```python
latest = m.latest()
```

Purpose:
- retrieve the most recent persisted monitoring result for quick notebook review

### D. `history()`

```python
hist = m.history(limit=30)
```

Purpose:
- return prior monitoring runs and statuses as a dataframe
- provide raw historical context

### E. `trends()`

```python
tr = m.trends(
    features=["LTV", "BANKRUPTCY_CNT"],
    metrics=["missing_rate", "psi", "cap_rate"],
    limit=90,
)
```

Purpose:
- return time-series monitoring metrics and status summaries from persisted aggregates
- support notebook analysis, dashboard views, and operational review

`history()` is for raw run history. `trends()` is for historical monitoring intelligence.

---

## 6.3 Result Object API

The run result should intentionally mirror `profile()` and `compare()`.

```python
run.summary()
run.issues()
run.inspect("BANKRUPTCY_CNT")
run.metrics()
run.export_html("monitor_run.html")
run.export_pdf("monitor_run.pdf")
```

### Required methods

- `summary()`
- `issues()`
- `inspect(feature)`
- `metrics()`
- `export()` / `export_html()` / `export_pdf()`

### Strongly recommended additions

- `history()`
- `trends()`

Optional later:
- `score()`
- `segments()`
- `history_chart()`

The main user experience should remain the same across all three modules.

---

## 7. Baseline Design

## 7.1 What a Baseline Is

A baseline is the approved production reference for a specific model/version/subpopulation.

It should persist:

- model metadata (`model_id`, version, description)
- source table / query metadata
- feature list
- score column
- `FeatureRules`
- baseline-level descriptive metrics
- baseline bins / category reference summaries
- baseline score distribution stats
- optional segment reference stats
- run metadata (`created_at`, `created_by`, baseline name, notes)

### Important principle

A baseline is created **once per onboarding or refit event**, not on every run.

That is what makes `monitor()` different from one-off `compare()`.

---

## 7.2 `build_baseline()` Should Persist More Than a Raw Table Snapshot

Do **not** define baseline as only a copied reference table.

A baseline should persist curated monitoring artifacts:

- schema snapshot
- per-feature baseline stats
- bins / category reference distributions
- score reference distribution
- baseline defects / waivers if any

This keeps runtime efficient and monitoring reproducible.

---

## 8. What `run()` Compares

A production monitoring run should compare a new snapshot against the persisted baseline across four buckets.

## 8.1 Data Quality / Contract Health

- dtype mismatch
- nullability violations
- domain violations
- range violations
- sentinel value presence
- cap/floor mass
- whitespace padding / case inconsistency / alias inconsistency
- constant feature / binary collapse

## 8.2 Drift / Delta Health

- missing-rate delta
- distinct-count delta
- zero-rate delta
- cap-rate delta
- floor-rate delta
- category domain change
- PSI / CSI / score drift
- score band / cut-point distribution changes

## 8.3 Model Performance Health

When labels or business outcomes are available:

- AUC / KS / Gini / RMSE / MAE
- calibration summaries
- segment performance degradation
- proxy performance health when direct labels lag

## 8.4 Trend Health

Using persisted historical aggregates, `monitor()` should detect:

- worsening drift trend
- worsening missingness trend
- recurring sentinel spikes
- persistent cap/floor problems
- recurring domain violations
- repeated critical features
- recovered features that were previously failing

This is the key step that turns repeated runs into true monitoring.

---

## 9. Trend Analysis as a First-Class Responsibility

Trend analysis is not an optional add-on. It is a core responsibility of `monitor()`.

### 9.1 Why it matters

Without historical trend analysis, `monitor()` is only a repeated compare job.

With trend analysis, Mandos can answer:

- Is this issue new or persistent?
- Is drift getting worse or stabilizing?
- Has a feature recovered after an upstream fix?
- Are score shifts one-time noise or sustained deterioration?
- Which features are repeatedly responsible for production instability?

### 9.2 Source of truth for trends

Trend analysis should be built from **persisted aggregate metrics and findings**, not by repeatedly re-reading old raw production snapshots.

This keeps trend analysis:

- fast
- reproducible
- dashboard-ready
- Snowflake-friendly
- auditable

### 9.3 Trend-specific finding types

At minimum, `monitor()` should support finding types such as:

- `persistent_critical_issue`
- `worsening_drift_trend`
- `recurring_domain_violation`
- `recurring_sentinel_spike`
- `performance_declining_trend`
- `recovered_feature`

These findings are different from one-run defects. They capture historical behavior.

---

## 10. Persistence Model

At minimum, Mandos should persist the following Snowflake tables (or semantically equivalent structures).

### 10.1 Core persistence tables

- `MANDOS_BASELINES`
- `MANDOS_BASELINE_FEATURE_METRICS`
- `MANDOS_BASELINE_SCORE_METRICS`
- `MANDOS_MONITOR_RUNS`
- `MANDOS_MONITOR_FEATURE_METRICS`
- `MANDOS_MONITOR_SCORE_METRICS`
- `MANDOS_MONITOR_PERFORMANCE_METRICS`
- `MANDOS_MONITOR_FINDINGS`

### 10.2 Trend-ready views / rollups

Strongly recommended:

- `VW_MANDOS_RUN_STATUS_TREND`
- `VW_MANDOS_FEATURE_METRIC_TREND`
- `VW_MANDOS_FEATURE_FINDING_TREND`
- `VW_MANDOS_SCORE_TREND`
- `VW_MANDOS_PERFORMANCE_TREND`

These views make dashboards and notebook analysis much easier.

---

## 11. Severity Model

Use the same status language as the rest of the Mandos family:

- `CRITICAL`
- `WARN`
- `INFO`
- `GOOD`

### Interpretation in `monitor()`

#### `CRITICAL`
- hard contract breach in production
- severe drift in critical feature or score behavior
- strong evidence of broken production data
- sustained trend deterioration requiring action

#### `WARN`
- material but not clearly fatal shift
- suspicious trend change
- repeated issue that should be reviewed

#### `INFO`
- noteworthy but not immediately actionable change
- natural seasonality or expected movement

#### `GOOD`
- no meaningful issue detected

---

## 12. Display Philosophy

`monitor()` should feel like `profile()` and `compare()`.

### `run.summary()`

One-screen triage answering:

- Is production healthy now?
- What changed?
- What is trending worse?
- Which features need inspection first?

Suggested sections:

- header: `MANDOS [MONITOR]`
- baseline metadata + snapshot metadata
- verdict banner
- four compact cards
  - current run status
  - critical features
  - drifted features
  - performance status / trend status
- top issues table
- top worsening trends table

### `run.inspect(feature)`

Should show:

- current snapshot evidence
- baseline reference
- current-vs-baseline delta
- recent trend snippet for that feature

### `run.issues()`

Should return a dataframe of actionable findings only.

### `run.metrics()`

Should return raw run metrics and comparison metrics.

---

## 13. Alerting and Operational Use

`monitor()` itself does not need to own the scheduler, but its outputs should be scheduler-friendly.

### 13.1 What downstream systems should consume

Persisted outputs should allow downstream systems to:

- alert on new `CRITICAL` findings
- alert on persistent or worsening trends
- suppress duplicate notifications when the same issue persists unchanged
- report recoveries when issues disappear

### 13.2 Recommended operational pattern

- Scheduler triggers `monitor.run()` on a cadence
- Mandos writes results to Snowflake
- Optional downstream process reads persisted findings and sends notifications
- UI/dashboard reads trend-ready views from Snowflake

---

## 14. Implementation Checklist

### Phase 1: Baseline and current run engine
- [ ] `Monitor` object
- [ ] `build_baseline()`
- [ ] `run()`
- [ ] Snowflake read/write abstraction
- [ ] baseline persistence tables
- [ ] run persistence tables

### Phase 2: Result API and display
- [ ] `summary()`
- [ ] `issues()`
- [ ] `inspect()`
- [ ] `metrics()`
- [ ] HTML / PDF export
- [ ] notebook-friendly summary rendering

### Phase 3: Trend persistence and retrieval
- [ ] historical run retrieval
- [ ] `history()`
- [ ] `trends()`
- [ ] trend-ready Snowflake views
- [ ] feature metric trend rollups
- [ ] status trend rollups

### Phase 4: Trend-specific findings
- [ ] persistent issue detection
- [ ] worsening trend detection
- [ ] recovery detection
- [ ] recurring issue suppression / dedupe logic

### Phase 5: Operationalization
- [ ] scheduler integration pattern
- [ ] alert-consumer compatibility
- [ ] dashboard-facing views
- [ ] audit-ready report pointers or artifacts

---

## 15. Final Design Summary

`monitor()` should be the production parent in the Mandos family:

- `profile()` validates one dataset
- `compare()` validates one dataset against another
- `monitor()` validates recurring production snapshots against a persisted baseline and tracks how health changes over time

The defining capabilities of `monitor()` are:

- Snowflake-native read/write workflows
- persisted baseline artifacts
- repeated production evaluation
- persisted evidence and audit trail
- first-class historical trend analysis
- the same concise Mandos UX: `summary()`, `issues()`, `inspect()`, `metrics()`, `export()`

That keeps the family coherent while giving `monitor()` a clear production identity.
