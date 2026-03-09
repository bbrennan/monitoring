# Mandos + Snowflake Data Engineering Design Proposal
## Clear Current State, Problem Statement, and Proposed Solution
### Audience: Data Engineering Leadership
### Purpose: Align on architecture direction for discussion and approval

---

# 1. Executive Summary

Mandos is a model monitoring library built by Data Science for standardized monitoring of model health across Credit Risk and related domains.

Today, Mandos is already producing real value:
- it standardizes the collection of baselines and monitoring run results
- it persists those results to Snowflake
- it gives Data Science a consistent framework for monitoring transformed feature data and model score behavior

However, the current operating model is still manual:
- each model team must install and run Mandos as Python code
- automation is limited
- leadership does not yet have a dashboard or platform view
- Data Engineering support is needed to make the Snowflake-native version scalable and durable

This proposal does **not** try to solve everything.

It is intended to make three things crystal clear:

1. **Current State** — what Mandos already does
2. **Problem Statement** — what is missing today
3. **Solution Design** — the cleanest Snowflake-native architecture for the next step

---

# 2. Current State

## 2.1 Operational workflow today

Current workflow:

0. A Data Science model runs and writes scored results into an `MLHUB_*` Snowflake workspace.
   - Examples:
     - `MLHUB_ORIGINATIONS`
     - `MLHUB_VPP`
     - `MLHUB_IFRS`
   - The output is typically scored data at the account / application / vehicle / contract level, including transformed features and model scores.

1. A user manually runs the Mandos Python library.
   - Mandos profiles the data
   - compares against a baseline where applicable
   - computes monitoring results
   - persists results into Snowflake

2. Mandos writes to:
   - `MLHUB_OPS.MANDOS_RUNS`
   - `MLHUB_OPS.MANDOS_BASELINES`

## 2.2 What Mandos is already doing well

Mandos already provides:
- standardized monitoring logic across models
- standardized persistence of monitoring outputs
- one place for baseline artifacts
- one place for snapshot / run outputs
- a foundation for trend analysis
- a future platform path for dashboarding and model governance

## 2.3 What Mandos is not yet

Mandos is **not yet**:
- fully automated
- a Snowflake-native scheduled monitoring platform
- a dashboard for leadership and model owners
- a no-code onboarding system
- a semantic analytics layer
- an enterprise control tower for model health

---

# 3. Problem Statement

## 3.1 The core business problem

Today, model monitoring is fragmented:
- model teams are isolated from one another
- each team owns its own model outputs
- there is no single leadership view of model health
- the monitoring process depends on manual execution
- monitoring is not yet strongly integrated into Snowflake-native automation

This creates several risks:
- monitoring may not run consistently
- issues may be discovered late
- leadership lacks a single source of truth
- onboarding new models remains manual and harder than necessary
- transformed feature issues and score drift may go undetected until they become business problems

## 3.2 Why Mandos matters

Mandos adds value because it covers the monitoring layer that generic source-table data quality tools typically do not fully cover:
- transformed feature integrity
- score drift
- baseline-aware monitoring
- model-specific metrics and rollups
- future estimated vs realized performance tracking
- leadership-level model health visibility

## 3.3 Why Data Engineering is important

Data Engineering support is critical because the next stage of Mandos depends on Snowflake-native capabilities:
- DMFs
- Streams
- Tasks
- Python stored procedures
- standard views
- semantic views
- clean object design and naming
- operational maintainability

---

# 4. Design Principles

The proposal is built around the following principles:

## 4.1 Snowflake-first
Where possible, monitoring should be automated and executed through Snowflake-native mechanisms.

## 4.2 DMF-first for primitives
Use Snowflake DMFs as aggressively as practical for primitive-style measurements and simple data-quality checks.

## 4.3 Mandos owns the derived monitoring layer
Mandos should continue to own:
- baseline-aware drift logic
- model-aware metrics
- score monitoring
- triage / rollups
- run persistence
- dashboard-facing monitoring facts

## 4.4 Views and semantic views are defined once
We should not recreate dashboard views every run.
Instead:
- tables are updated each run
- views read current table state
- semantic views expose business-friendly concepts on top

## 4.5 MVP that does not limit future enhancements
The goal is not to overbuild.
The goal is to build a clean foundation that supports:
- automation
- dashboarding
- future AI / semantic querying
- future React or more advanced UI if needed

---

# 5. Proposed Object Model

The architecture should be explained in three layers:

```text
MANDOS_*  ->  VW_*  ->  SV_*
tables        views      semantic views
```

## 5.1 What each layer means

### `MANDOS_*`
Physical persisted Snowflake tables.
These are the system of record.

### `VW_*`
Standard Snowflake SQL views.
These are the curated relational layer used by dashboards and downstream analytics.

### `SV_*`
Snowflake semantic views.
These expose governed business entities, metrics, and relationships for more advanced consumption later.

---

# 6. Core Tables

For this proposal, assume the following three tables exist.

## `MLHUB_OPS.MANDOS_MODEL_REGISTRY`
Purpose:
- control-plane table for onboarding and automation

Columns:
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- `SOURCE_OBJECT`
- `DATA_LAYER`
- `BASELINE_ID`
- `AUTOMATION_ENABLED`
- `BASELINE_POLICY`
- `SCHEDULE_TYPE`
- `STREAM_NAME`
- `TASK_NAME`

## `MLHUB_OPS.MANDOS_BASELINES`
Purpose:
- persisted reference baselines used by Mandos

Columns:
- `BASELINE_ID`
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `SOURCE_OBJECT`
- `DATA_LAYER`
- `CREATED_AT`
- `BASELINE_WINDOW_START_TS`
- `BASELINE_WINDOW_END_TS`
- `N_ROWS`
- `N_COLUMNS`
- `TAGS`
- `BASELINE_PAYLOAD`
- `BASELINE_STATUS`

## `MLHUB_OPS.MANDOS_RUNS`
Purpose:
- persisted monitoring snapshot / run results

Columns:
- `RUN_ID`
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `BASELINE_ID`
- `SOURCE_OBJECT`
- `DATA_LAYER`
- `SNAPSHOT_NAME`
- `SNAPSHOT_TS`
- `DATA_WINDOW_START_TS`
- `DATA_WINDOW_END_TS`
- `N_ROWS`
- `N_COLUMNS`
- `STATUS`
- `ISSUE_COUNT`
- `CRITICAL_COUNT`
- `WARN_COUNT`
- `TAGS`
- `ROW_HASH`
- `RUN_PAYLOAD`

---

# 7. Curated Views (`VW_*`)

These are standard Snowflake views.
They are not recreated every run.
They are created once and automatically reflect the latest state of the underlying `MANDOS_*` tables.

## Recommended initial views

### `VW_MANDOS_LATEST_RUN`
One row per model/version showing the latest run.
Use cases:
- executive summary cards
- latest health table
- stale-run detection

Typical fields:
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- `LATEST_RUN_ID`
- `LATEST_SNAPSHOT_TS`
- `LATEST_STATUS`
- `LATEST_ISSUE_COUNT`
- `LATEST_WARN_COUNT`
- `LATEST_CRITICAL_COUNT`

### `VW_MANDOS_RUN_HISTORY`
One row per model/version/snapshot.
Use cases:
- trend charts
- model detail history
- recurring issue analysis

Typical fields:
- `RUN_ID`
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `SNAPSHOT_NAME`
- `SNAPSHOT_TS`
- `STATUS`
- `ISSUE_COUNT`
- `WARN_COUNT`
- `CRITICAL_COUNT`

### `VW_MANDOS_BASELINE_INVENTORY`
One row per baseline.
Use cases:
- stale baseline checks
- baseline governance
- onboarding validation

Typical fields:
- `BASELINE_ID`
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `CREATED_AT`
- `BASELINE_WINDOW_START_TS`
- `BASELINE_WINDOW_END_TS`
- `BASELINE_STATUS`

### `VW_MANDOS_PORTFOLIO_HEALTH`
Use case:
- executive summary dashboard rollup

Typical fields:
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- `MODELS_MONITORED`
- `MODELS_OK`
- `MODELS_WARN`
- `MODELS_CRITICAL`
- `STALE_BASELINES`
- `STALE_RUNS`

---

# 8. Semantic Views (`SV_*`)

Semantic views are not just normal views with a new prefix.
They are a Snowflake semantic layer object meant to expose business-friendly entities, relationships, and metrics.

For the current proposal, semantic views are a **future-ready layer**, not the first implementation priority.

## Recommended initial semantic views

### `SV_MANDOS_PORTFOLIO_HEALTH`
Purpose:
- leadership-friendly business view of model health

### `SV_MANDOS_RUN_HISTORY`
Purpose:
- semantic access to model monitoring trends

### `SV_MANDOS_BASELINE_STATUS`
Purpose:
- semantic access to baseline freshness and validity

## Why semantic views matter later
They will make it easier to support:
- cleaner dashboard querying
- governed business metrics
- future natural-language analytics
- future Cortex Analyst / semantic consumption
- future AI-assisted “Ask Mandos” capabilities

---

# 9. DMF Strategy

## 9.1 Recommended position

The proposal should be:

**Use DMFs as much as possible where they fit.**

Mandos should move primitive-style measurement into Snowflake-native DMFs wherever practical.

## 9.2 What DMFs should handle

DMFs are a strong fit for primitive-style and object-level checks such as:
- row count
- null count / null percent
- blank count / blank percent
- freshness
- duplicates
- uniqueness
- min / max / average / standard deviation
- accepted-values style checks

## 9.3 What Mandos should still handle

Mandos should still handle the derived monitoring layer, including:
- baseline-aware drift
- PSI / CSI style comparisons
- score drift logic
- baseline-to-current comparisons
- model-level status rollups
- run persistence
- dashboard-facing model health facts

## 9.4 Final recommendation on DMFs

This proposal is **DMF-first**, but **not DMF-only**.

The correct framing is:

> DMFs handle as much of the primitive/check layer as possible.  
> Mandos Python/Snowpark handles the derived metrics and orchestration layer that DMFs do not fully cover.

That is the most credible design.

---

# 10. Can existing Snowpark logic become DMFs?

Partially.

## Recommended guidance

If an existing Snowpark primitive/check can be expressed cleanly as SQL:
- convert it into a custom DMF

If it cannot be expressed cleanly as SQL:
- keep it in Mandos Python/Snowpark

So the migration strategy should be:
- move simple primitive logic into DMFs
- keep complex baseline-aware monitoring logic in Mandos

This reduces Python responsibility without forcing everything into the wrong abstraction.

---

# 11. Automation Strategy

## 11.1 Core position

Mandos automation should **not depend entirely on DMFs**.

DMFs are for measurement.  
Snowflake orchestration is still needed to create/update monitoring runs.

## 11.2 Recommended automation backbone

Use:
- **Streams**
- **Tasks**
- **Python stored procedures**

## 11.3 Proposed automation flow

```text
Model writes scored data to MLHUB_*
-> Stream detects new data
-> Task fires
-> Python stored procedure runs Mandos logic
-> MANDOS_RUNS is updated
-> MANDOS_BASELINES is updated only when policy requires
-> VW_* automatically reflects current state
-> SV_* remains available for future semantic consumption
```

## 11.4 What gets updated per run

### Updated each run
- `MANDOS_RUNS`

### Updated only when baseline policy requires
- `MANDOS_BASELINES`

### Defined once, not recreated every run
- `VW_*`
- `SV_*`

---

# 12. Baseline Policy

Baselines should not be rebuilt blindly every run.

## Recommended policies
Examples:
- `CREATE_IF_MISSING`
- `MANUAL_APPROVAL_REQUIRED`
- `REFRESH_ON_RETRAIN`
- `REFRESH_ON_SCHEMA_CHANGE`

This is one reason the `MANDOS_MODEL_REGISTRY` control-plane table matters.

---

# 13. Dashboard Vision (Brief, for Data Engineering context)

The full dashboard is not the focus of this deck, but Data Engineering should understand why the object model matters.

## Dashboard goals
- leadership homepage for all models
- model-owner drilldown
- onboarding workflow
- future semantic and AI-ready access

## What Data Engineering is enabling
By supporting this design, Data Engineering enables:
- a single platform of record for model monitoring
- standardized monitoring facts in Snowflake
- clean downstream views for dashboarding
- future semantic analytics

---

# 14. Why this is worth doing

## 14.1 For Data Science / Risk
- less manual monitoring
- more consistent execution
- earlier issue detection
- one place to monitor model health

## 14.2 For Data Engineering
- Snowflake-native automation instead of ad hoc scripts
- clear ownership boundaries
- clean object model
- reusable monitoring patterns across domains
- better long-term platform maintainability

## 14.3 For the organization
- reduced risk of unnoticed model failures
- stronger governance
- clearer ownership
- a path from isolated monitoring to enterprise monitoring

---

# 15. Scope Boundaries

This design proposal intentionally does **not** attempt to solve:
- every possible metric
- every possible AI use case
- every possible raw-to-actual lineage problem
- every UI requirement
- every governance workflow

The current goal is narrower:

> make the current state, problem, and next-step design crystal clear enough to support productive conversation and approval.

---

# 16. Recommended MVP Decision

## Recommended MVP architecture

### Measurement layer
- DMFs wherever practical for primitives/checks

### Orchestration layer
- Streams + Tasks + Python stored procedures

### Persisted truth
- `MANDOS_MODEL_REGISTRY`
- `MANDOS_BASELINES`
- `MANDOS_RUNS`

### Relational consumption layer
- `VW_*`

### Future semantic layer
- `SV_*`

This is the cleanest architecture for the next step.

---

# 17. Key Decisions Requested from Data Engineering

The purpose of the discussion is to align on these decisions:

1. Do we agree on a **DMF-first primitive strategy**?
2. Do we agree on **Streams + Tasks + Python stored procedures** as the automation backbone?
3. Do we agree on the three-layer object model:
   - `MANDOS_*`
   - `VW_*`
   - `SV_*`
4. Do we agree that views and semantic views are defined once, while tables update each run?
5. Do we agree that Mandos continues to own the derived monitoring layer, not just raw primitives?

---

# 18. Conclusion

Mandos already has a strong foundation:
- model outputs land in Snowflake
- Mandos persists standardized monitoring results
- the system is ready to evolve from a manual library into a Snowflake-native monitoring platform

The next step does not require solving everything.

It requires agreement on a clean architecture:

- move primitive-style measurement into Snowflake DMFs where practical
- automate runs with Streams, Tasks, and Python stored procedures
- persist standardized monitoring facts in `MANDOS_*`
- expose curated relational views through `VW_*`
- prepare for semantic consumption later through `SV_*`

This gives the organization a realistic path from:
- manual monitoring
to
- automated monitoring
to
- a dashboard-based platform of record for model health
