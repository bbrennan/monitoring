# Mandos Platform Design: Monitoring Control Tower for Financial Risk Models

## Document purpose

This document defines the proposed next phase of **Mandos** as a Snowflake-native monitoring platform for Financial Risk Management models at Toyota Financial Services.

It consolidates the current Mandos state, dashboard design, data model, automation strategy, onboarding workflow, operating model, and future-ready architecture for semantic analytics and AI.

This document is written to support:
- leadership alignment
- Data Engineering discussion
- dashboard/platform planning
- automation planning
- future Bedrock / semantic analytics proposals

---

# 1. Executive Summary

## 1.1 What Mandos is today

Mandos is currently a **Python library** that model teams install and run manually after their model process completes.

Its current strengths are:
- standardized baseline creation
- standardized monitoring snapshots
- persistence of monitoring outputs to Snowflake
- support for monitoring model inputs, scores, and drift
- common outputs across models through `MANDOS_BASELINES` and `MANDOS_RUNS`

Mandos already establishes the most important foundation:

> a standardized, persistent, reusable collection of **baselines, snapshots, primitives, metrics, bins, statuses, and trendable monitoring results** across models.

## 1.2 What Mandos should become

Mandos should evolve from a library into a **monitoring platform of record** for Data Science and Risk leadership.

That platform should provide:
- one executive homepage for model health across teams and domains
- drill-down for model owners into model, feature, and data-layer health
- automated ingestion of monitoring runs
- standardized onboarding of new models
- a governed data/semantic layer for future natural-language querying and AI assistance

## 1.3 Core philosophy

Mandos should be built around three layers:

1. **Deterministic monitoring core**
   - profiles
   - baselines
   - metrics
   - triage
   - persistence

2. **Semantic and dashboard layer**
   - curated Snowflake marts/views
   - semantic views
   - dashboard pages
   - standardized rollups

3. **Future intelligence layer**
   - natural-language Q&A
   - RCA copilot
   - document retrieval
   - guided workflow assistance

## 1.4 Platform vision

Mandos should become the **control tower for model health** across Financial Risk Management.

This means:
- model teams still own their models
- Mandos becomes the central place where health is monitored
- leadership gets one cross-team view
- model owners get one consistent RCA experience
- Data Engineering and Data Validation tools can contribute upstream evidence without replacing Mandos

---

# 2. Current State of Mandos

## 2.1 Current workflow

### Step 0: model output lands in Snowflake
When a Data Science model runs, it writes scored results into Snowflake MLHub workspaces.

Examples:
- `MLHUB_ORIGINATIONS`
- `MLHUB_VPP`
- `MLHUB_IFRS`
- other domain-specific MLHub schemas

These outputs typically contain account-, application-, contract-, vehicle-, or other entity-level features and scores.

### Step 1: model owner manually runs Mandos
Mandos is currently used as a Python library that teams install via pip and execute manually after their model process runs.

### Step 2: Mandos persists monitoring results
Mandos writes standardized outputs into Snowflake operational tables in `MLHUB_OPS`.

Current known tables:
- `MLHUB_OPS.MANDOS_BASELINES`
- `MLHUB_OPS.MANDOS_RUNS`

## 2.2 Current product strengths

Mandos already has several strong design elements:

- standardized monitoring across models
- support for baselines and snapshots
- support for trendable persisted results
- support for drift, DQ, and estimated-performance style outputs
- Snowflake persistence as a central source of truth
- a documented API (`Monitor`) that is conceptually clean

## 2.3 Current product gaps

Mandos is still missing the platform layer required for enterprise adoption.

Major gaps:
- manual execution
- no central dashboard
- no standardized onboarding workflow
- no model registry / ownership metadata layer
- limited cross-team visibility
- limited RCA workflow
- no semantic layer for business-friendly querying
- no Snowflake-native automation yet
- unclear integration boundary with raw-source data validation tooling

## 2.4 Most important current asset

The most important existing asset is **not** a chart or a report.

It is:

> the standardized and persistent collection of baseline and snapshot data across all models.

That foundation makes future dashboarding, automation, AI, and governance possible.

---

# 3. Strategic Positioning of Mandos

## 3.1 What Mandos should own

Mandos should own:
- transformed feature monitoring
- scored output monitoring
- actual/outcome monitoring when available
- baseline creation and management
- model-aware drift logic
- model-aware data quality logic
- feature contract enforcement
- monitoring persistence
- executive rollups
- trend history
- model detail and RCA tooling
- model onboarding into the monitoring platform

## 3.2 What Mandos should not own

Mandos should not try to own:
- every raw-table source validation check
- upstream ETL orchestration broadly
- full autonomous root cause diagnosis
- broad enterprise lineage for all systems on day one
- free-form broad SQL generation in an AI layer
- business remediation workflows beyond their monitoring trigger points in MVP

## 3.3 Relationship to Data Validation tool

The Data Validation team is building a separate data quality tool focused on **raw source table/view quality**.

Recommended boundary:

### Data Validation tool owns
- raw source freshness
- raw source completeness
- raw source schema checks
- raw source expectation-style validation
- table/view certification signals

### Mandos owns
- transformed feature quality
- feature rule validation after transformation
- score monitoring
- drift monitoring
- estimated and realized performance monitoring
- cross-layer model RCA
- leadership-level model health rollups

### Integration strategy
Mandos should consume summarized evidence from the Data Validation tool when available, but should **not depend on it to define the Mandos monitoring model**.

---

# 4. Mandos as the Platform of Record

## 4.1 Definition

Mandos should become the **platform of record for model monitoring** within Credit Risk / Financial Risk Management.

That means:
- all monitored models publish or land results that Mandos can observe
- all standardized baselines and runs persist to Snowflake
- leadership relies on Mandos for model health status
- model owners use Mandos to investigate issues
- onboarding to Mandos becomes a standard operational step for new models

## 4.2 Platform-of-record responsibilities

A platform of record should provide:

- canonical health status
- canonical run history
- canonical baseline inventory
- canonical issue inventory
- canonical ownership metadata
- canonical dashboard views
- canonical auditability for monitoring runs

## 4.3 Why this matters

Without a platform of record:
- each team remains isolated
- leadership has no single health view
- monitoring standards vary by team
- trend analysis is fragmented
- repeated failures are harder to detect
- onboarding of new models stays manual and inconsistent

With Mandos as platform of record:
- monitoring becomes centralized and repeatable
- health status becomes visible across domains
- dashboarding becomes reliable
- future AI and semantic query capabilities become feasible

---

# 5. Business Domains, Teams, and Portfolio Rollups

## 5.1 Clarifying terminology

The word **portfolio** should not be interpreted narrowly as an investment portfolio.

For Mandos, the better structure is:

### Business Domain
What business capability the model supports.

Examples:
- IFRS_CECL
- ORIGINATIONS
- COLLECTIONS
- MARKET_VALUE_PRICING
- RESIDUAL_VALUE
- BANK_CREDIT_RISK

### Owning Team
Who owns the model operationally.

Examples:
- Originations DS
- Collections DS
- Loss Forecasting DS
- Vehicle Valuation DS

### Portfolio Rollup
A leadership reporting rollup above individual domains.

Examples:
- Consumer Credit Risk
- Vehicle Risk & Pricing
- Bank Risk

## 5.2 Recommendation

Mandos should explicitly store:
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- optional `PORTFOLIO_ROLLUP`

If leadership does not use the word “portfolio” internally, the UI should prefer:
- Business Domain
- Owning Team
- Leadership Summary / Enterprise Model Health

---

# 6. Dashboard Product Vision

## 6.1 Primary audiences

### Audience 1: Data Science and Risk leadership
Needs:
- fast understanding of model health across the org
- trends
- top issues
- which teams/domains are under stress
- stale baselines / missing runs / coverage issues

### Audience 2: model owners
Needs:
- drill-down into a model
- trend analysis
- feature-level issue localization
- segment-level issue localization
- baseline vs current evidence
- data-layer investigation support

### Audience 3: platform admins / Mandos owners
Needs:
- model registry
- onboarding management
- threshold/exception governance
- monitoring coverage tracking
- baseline management

## 6.2 Dashboard design goals

The dashboard should:
- be interpretable by leadership
- be actionable for model teams
- be scalable to many models
- be built on persisted Snowflake facts
- avoid vanity metrics
- emphasize trends and issue localization
- support future AI and semantic querying

## 6.3 Product principle

The dashboard is **not just a frontend for tables**.

It is:
- the visibility layer
- the governance layer
- the investigation entry point
- the operational front door to Mandos

---

# 7. Full Dashboard Design

## 7.1 Recommended information architecture

Mandos should be designed as five major workspaces:

1. Executive Summary
2. Portfolio / Model Explorer
3. Model Detail / RCA
4. Data Dependency Explorer
5. Onboarding / Administration

---

## 7.2 Executive Summary page

### Purpose
Provide a one-minute leadership readout of model health.

### Primary audience
- DS leadership
- Risk leadership
- senior platform owners
- validation / governance stakeholders

### Core layout

#### Section A: headline KPI cards
Recommended cards:
- Models Monitored
- Healthy Models
- WARN Models
- CRITICAL Models
- Stale Baselines
- Stale / Missing Recent Runs

Optional:
- Models Missing Owners
- Models Missing Actuals
- New Criticals This Week

#### Section B: portfolio status trend
Charts:
- stacked status trend over time (`OK`, `WARN`, `CRITICAL`)
- critical issue count trend
- total issue burden trend

#### Section C: model-by-snapshot heatmap
Rows:
- models

Columns:
- recent snapshots / periods

Color:
- worst status for the model in that snapshot

Purpose:
- quickly identify recurring offenders
- quickly identify sudden deterioration

#### Section D: top problem rankings
Tables / ranked bars:
- top unhealthy models
- top recurring drifted features
- top recurring DQ failures
- top domains/teams by open issues

#### Section E: governance / coverage summary
Panels:
- monitored vs expected models
- models with stale baselines
- models with no run in SLA
- models with missing owners/team/domain metadata
- models with repeated exceptions

### Key filters
- business domain
- owning team
- lifecycle stage
- severity
- date range
- model type

### Why this page matters
This becomes the leadership homepage and the single place leadership can understand model health without opening notebooks or raw tables.

---

## 7.3 Portfolio / Model Explorer page

### Purpose
Allow comparison and navigation across many models.

### Main features

#### Portfolio table
Columns:
- Model ID
- Model Name
- Version
- Business Domain
- Owning Team
- Owner
- Latest Status
- Last Run Timestamp
- Latest Score Drift
- Latest Issue Count
- Baseline Age
- Actual Availability Status

#### Comparison tools
Users should be able to select multiple models and compare:
- health trend
- issue counts
- score drift trend
- top feature issues

#### Burden analysis
Rollups by:
- domain
- team
- severity
- issue type

### Why this page matters
It bridges leadership-level visibility and model-owner drilldown.

---

## 7.4 Model Detail / RCA page

### Purpose
Provide the core operational view for model owners.

### Header section
Display:
- model name/version
- business domain
- owning team
- technical owner
- business owner
- current status
- baseline ID
- baseline created date
- last run date
- lifecycle stage
- criticality tier

### Latest run summary cards
Recommended cards:
- total issues
- critical issues
- score drift
- top drifted feature
- top DQ issue
- realized/estimated performance
- row volume delta

### Trend section
Charts:
- score drift over time
- issue count by severity over time
- estimated performance over time
- realized performance over time when available

### Feature health section
Components:
- ranked top drifted features
- DQ heatmap across recent snapshots
- feature table with current values and status
- first bad snapshot
- issue persistence count

### Segment analysis section
Users select a segment dimension:
- state
- channel
- product
- tier
- vintage
- dealer
- score band
- other domain-specific segment fields

Display:
- segment issue burden
- segment volume share
- segment drift contribution
- segment realized outcome differences when available

### Distribution evidence section
For selected feature:
- baseline vs current histogram/category overlay
- summary stats comparison
- segment-specific view
- history over time

### Issue table
Detailed table:
- metric type
- metric name
- feature / column
- status
- value
- baseline / threshold comparator
- reason
- first seen
- last seen

### Suggested next steps section
Deterministic rules in MVP:
- if missingness spikes, inspect transformed feature pipeline
- if schema gate fails, inspect upstream schema or feature contract
- if drift is segment-concentrated, inspect population shift or business process change
- if realized performance degrades with no major feature drift, inspect concept / target / policy shift

### Why this page matters
This becomes the working surface for model owners.

---

## 7.5 Data Dependency Explorer page

### Purpose
Connect model issues to the data layers the model depends on.

### Tabs / layers
- Raw
- Transformed
- Scored
- Actuals

### For each data layer show
- source object(s)
- last refresh / recency
- row counts / freshness
- schema health
- top DQ issues
- top drifted fields
- linkage to upstream validation signals when available
- linkage to pipeline version / run id when available

### Why this page matters
Many model failures are data issues. This page makes Mandos useful beyond the score itself.

---

## 7.6 Onboarding / Administration page

### Purpose
Turn model onboarding into a guided workflow rather than ad hoc code execution.

### Onboarding wizard steps

#### Step 1: model identity
Fields:
- Model ID
- Model Name
- Version
- Business Domain
- Owning Team
- Model Owner
- Business Owner
- Model Type
- Criticality Tier

#### Step 2: data sources
Fields:
- scored source object
- transformed source object
- raw source object (optional)
- actuals source object (optional)
- entity grain
- timestamp column(s)

#### Step 3: model fields
Fields:
- score column
- target column
- feature list
- key segment columns
- entity-link strategy

#### Step 4: baseline setup
Options:
- create new baseline from selected data window
- attach existing baseline
- define refresh policy

#### Step 5: rules and thresholds
Options:
- YAML upload
- form-based feature rules
- threshold overrides
- policy defaults

#### Step 6: preview
Actions:
- validate config
- preview source data access
- preview baseline/run output
- highlight missing metadata

#### Step 7: publish
Actions:
- save to model registry
- persist config
- create/enable automation
- create semantic/dashboard availability
- notify owner

### Admin capabilities
- manage registry
- manage exceptions
- manage stale models
- manage baseline inventory
- manage ownership metadata
- monitor automation health

---

# 8. Dashboard ROI and Value

## 8.1 Core ROI mechanisms

Mandos dashboard ROI should be framed through operational leverage, risk reduction, and governance efficiency rather than speculative revenue claims.

### ROI mechanism 1: reduced time to detect issues
A centralized dashboard reduces the time required to identify model-health issues.

### ROI mechanism 2: reduced time to localize issues
Feature-, segment-, and data-layer drilldown reduces debugging time for model teams.

### ROI mechanism 3: reduced monitoring fragmentation
Without Mandos, each team monitors differently or not at all. Mandos standardizes health visibility.

### ROI mechanism 4: reduced governance friction
Leadership and validation teams gain one place to review monitoring status, freshness, and baseline recency.

### ROI mechanism 5: better reuse of monitoring components
Once the data model is standardized, new models are cheaper to onboard.

### ROI mechanism 6: future AI leverage
A strong semantic and dashboard layer enables no-code and AI-assisted analytics later.

## 8.2 Qualitative business outcomes

Expected benefits:
- earlier detection of data and model issues
- lower manual effort per monitoring run
- faster triage and RCA
- clearer cross-team visibility
- improved onboarding of new models
- improved leadership confidence in monitoring coverage
- stronger foundation for future model governance tooling

## 8.3 What not to overclaim
The proposal should not claim:
- automatic prevention of all model failures
- fully autonomous root-cause discovery in MVP
- immediate financial quantification without usage data
- full enterprise data lineage on day one

---

# 9. Snowflake Architecture Overview

## 9.1 Current state

Known persisted operational tables:
- `MLHUB_OPS.MANDOS_BASELINES`
- `MLHUB_OPS.MANDOS_RUNS`

These are currently the Snowflake system-of-record tables for Mandos.

## 9.2 Recommended architecture layers

### Layer A: operational system-of-record tables
These are the persisted truth tables written by Mandos automation.

Examples:
- `MANDOS_BASELINES`
- `MANDOS_RUNS`
- optional new detailed tables such as:
  - `MANDOS_MODEL_REGISTRY`
  - `MANDOS_ALERTS`
  - `MANDOS_FEATURE_METRICS`
  - `MANDOS_SEGMENT_METRICS`
  - `MANDOS_AUTOMATION_LOG`

### Layer B: curated relational views / marts (`VW_*`)
These are dashboard-oriented curated views or dynamic tables.

Examples:
- `VW_MANDOS_MODEL_REGISTRY`
- `VW_MANDOS_LATEST_RUN`
- `VW_MANDOS_RUN_HISTORY`
- `VW_MANDOS_BASELINE_INVENTORY`
- `VW_MANDOS_FEATURE_HEALTH`
- `VW_MANDOS_ALERTS`
- `VW_MANDOS_EXEC_SUMMARY`

### Layer C: semantic views (`SV_*`)
These expose business-friendly entities, dimensions, and metrics for:
- dashboard
- future AI
- future natural-language analytics
- custom apps

Examples:
- `SV_MANDOS_PORTFOLIO_HEALTH`
- `SV_MANDOS_RUN_HISTORY`
- `SV_MANDOS_FEATURE_HEALTH`

## 9.3 Why not recreate everything every run

### `MANDOS_*`
Should update or append each run.

### `VW_*`
Should generally be created once and reflect new data automatically.

### `SV_*`
Should also generally be created once and only change when the business model changes.

This keeps the system stable and avoids needless object recreation.

---

# 10. Recommended Snowflake Table Design

## 10.1 Core operational tables

### `MLHUB_OPS.MANDOS_MODEL_REGISTRY`
Purpose:
- control plane for monitored models

Recommended columns:
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- `PORTFOLIO_ROLLUP` (optional)
- `MODEL_OWNER`
- `BUSINESS_OWNER`
- `MODEL_TYPE`
- `MODEL_CRITICALITY`
- `ENTITY_GRAIN`
- `SOURCE_OBJECT`
- `RAW_SOURCE_OBJECT` (optional)
- `TRANSFORMED_SOURCE_OBJECT` (optional)
- `SCORED_SOURCE_OBJECT`
- `ACTUAL_SOURCE_OBJECT` (optional)
- `SCORE_COLUMN`
- `TARGET_COLUMN`
- `FEATURE_LIST_JSON`
- `SEGMENT_COLUMNS_JSON`
- `BASELINE_ID`
- `BASELINE_POLICY`
- `AUTOMATION_ENABLED`
- `AUTOMATION_TYPE`
- `STREAM_NAME`
- `TASK_NAME`
- `CREATED_AT`
- `UPDATED_AT`
- `STATUS`

### `MLHUB_OPS.MANDOS_BASELINES`
Purpose:
- baseline system of record

Recommended columns (additions may be needed if not already present):
- `BASELINE_ID`
- `MODEL_ID`
- `MODEL_VERSION`
- `SOURCE_OBJECT`
- `ENTITY_GRAIN`
- `DATA_LAYER`
- `BASELINE_CREATED_AT`
- `DATA_WINDOW_START_TS`
- `DATA_WINDOW_END_TS`
- `PIPELINE_RUN_ID`
- `FEATURESET_VERSION`
- `BASELINE_PAYLOAD`
- `BASELINE_METADATA_JSON`
- `TAGS`
- `ROW_COUNT`
- `STATUS`

### `MLHUB_OPS.MANDOS_RUNS`
Purpose:
- snapshot/run system of record

Recommended columns (logical target state):
- `RUN_ID`
- `MODEL_ID`
- `MODEL_NAME`
- `MODEL_VERSION`
- `SNAPSHOT_NAME`
- `SNAPSHOT_TS`
- `BUSINESS_DOMAIN`
- `OWNING_TEAM`
- `BASELINE_ID`
- `SOURCE_OBJECT`
- `DATA_LAYER`
- `ENTITY_GRAIN`
- `PIPELINE_RUN_ID`
- `DATA_WINDOW_START_TS`
- `DATA_WINDOW_END_TS`
- `ROW_COUNT`
- `METRIC_PAYLOAD`
- `SUMMARY_STATUS`
- `ISSUE_COUNT`
- `CRITICAL_COUNT`
- `WARN_COUNT`
- `ERROR_COUNT`
- `SCORE_PSI`
- `ESTIMATED_PERFORMANCE_JSON`
- `REALIZED_PERFORMANCE_JSON`
- `TAGS`
- `CREATED_AT`

### `MLHUB_OPS.MANDOS_ALERTS`
Purpose:
- normalized issue inventory

Recommended columns:
- `RUN_ID`
- `MODEL_ID`
- `MODEL_VERSION`
- `SNAPSHOT_TS`
- `METRIC_TYPE`
- `METRIC_NAME`
- `COLUMN_NAME`
- `SEGMENT_NAME`
- `SEGMENT_VALUE`
- `STATUS`
- `METRIC_VALUE`
- `THRESHOLD_VALUE`
- `REASON`
- `FIRST_SEEN_TS`
- `LAST_SEEN_TS`

### `MLHUB_OPS.MANDOS_FEATURE_METRICS`
Purpose:
- normalized feature-level metrics over time

Recommended columns:
- `RUN_ID`
- `MODEL_ID`
- `MODEL_VERSION`
- `SNAPSHOT_TS`
- `FEATURE_NAME`
- `METRIC_TYPE`
- `METRIC_NAME`
- `METRIC_VALUE`
- `STATUS`
- `BASELINE_VALUE`
- `DELTA_VALUE`
- `REASON`

### `MLHUB_OPS.MANDOS_SEGMENT_METRICS`
Purpose:
- segment-level localization

Recommended columns:
- `RUN_ID`
- `MODEL_ID`
- `MODEL_VERSION`
- `SNAPSHOT_TS`
- `SEGMENT_NAME`
- `SEGMENT_VALUE`
- `METRIC_TYPE`
- `METRIC_NAME`
- `METRIC_VALUE`
- `STATUS`
- `ROW_COUNT`

### `MLHUB_OPS.MANDOS_AUTOMATION_LOG`
Purpose:
- track task/procedure execution and failures

Recommended columns:
- `AUTOMATION_RUN_ID`
- `MODEL_ID`
- `TASK_NAME`
- `PROCEDURE_NAME`
- `START_TS`
- `END_TS`
- `STATUS`
- `ERROR_MESSAGE`
- `ROWS_PROCESSED`
- `RUN_ID_CREATED`

---

# 11. Recommended Curated Views / Dashboard Marts (`VW_*`)

## 11.1 `VW_MANDOS_MODEL_REGISTRY`
Purpose:
- dashboard consumption of registry metadata

## 11.2 `VW_MANDOS_LATEST_RUN`
Purpose:
- one row per model/version for the latest run

Fields:
- latest status
- latest issue counts
- latest snapshot timestamp
- latest score drift
- latest baseline age
- stale run flag

## 11.3 `VW_MANDOS_RUN_HISTORY`
Purpose:
- one row per model/version/snapshot for trend charts

## 11.4 `VW_MANDOS_BASELINE_INVENTORY`
Purpose:
- baseline tracking and stale-baseline analysis

## 11.5 `VW_MANDOS_FEATURE_HEALTH`
Purpose:
- feature-level history for model drilldown

## 11.6 `VW_MANDOS_ALERTS`
Purpose:
- open / recurring / historical issue analysis

## 11.7 `VW_MANDOS_EXEC_SUMMARY`
Purpose:
- executive homepage aggregate metrics

Potential fields:
- models_monitored
- models_ok
- models_warn
- models_critical
- stale_runs
- stale_baselines
- missing_owners
- open_issue_count

---

# 12. Recommended Semantic Views (`SV_*`)

## 12.1 Why semantic views matter

Semantic views provide a governed business layer over Snowflake data.

They enable:
- consistent metric definitions
- cleaner dashboard queries
- cleaner future API queries
- future natural-language analytics
- future AI grounding on governed definitions

## 12.2 `SV_MANDOS_PORTFOLIO_HEALTH`
Purpose:
- executive summary semantic object

Logical content:
- models
- latest run
- baseline freshness
- issue summaries

Metrics:
- models monitored
- models by severity
- stale baselines
- stale runs
- open issue counts

Dimensions:
- business domain
- team
- model type
- lifecycle stage

## 12.3 `SV_MANDOS_RUN_HISTORY`
Purpose:
- trend semantic object

Metrics:
- issue count
- critical issue count
- score drift
- estimated performance
- row volume

Dimensions:
- snapshot date
- model
- domain
- team

## 12.4 `SV_MANDOS_FEATURE_HEALTH`
Purpose:
- model-owner feature health semantic object

Metrics:
- drift metrics
- DQ metrics
- issue counts

Dimensions:
- model
- feature
- snapshot
- status
- metric type

---

# 13. Snapshot Metadata: Recommended Minimum Additions

## 13.1 Important caveat
Each snapshot is currently persisted as **one single aggregated row**.

Therefore, several row-level concepts must be represented as **snapshot metadata** rather than literal entity-level values.

## 13.2 Minimum snapshot-level metadata definitions

### `ENTITY_GRAIN`
The real-world business object summarized by the snapshot.

Examples:
- `APPLICATION`
- `ACCOUNT`
- `CONTRACT`
- `VIN`
- `LOAN`

### `ENTITY_LINK_NAMESPACE`
The controlled domain describing the type of entity-linking scheme used under the snapshot.

Examples:
- `originations.application`
- `collections.account`
- `residual_value.vin`

### `ENTITY_LINK_KEY_FIELD` (recommended rename)
Because a single aggregated snapshot row does not represent one entity, a better snapshot-level field is the **name of the stable entity-link key used in the underlying data**.

Examples:
- `APPLICATION_KEY_HASH`
- `ACCOUNT_KEY_HASH`
- `VIN_KEY_HASH`

### `DATA_LAYER`
The data lifecycle stage represented by the snapshot.

Examples:
- `RAW`
- `TRANSFORMED`
- `SCORED`
- `ACTUAL`

### `SOURCE_OBJECT`
The primary Snowflake object from which the snapshot was created.

### `PIPELINE_RUN_ID`
The pipeline/job execution identifier that produced the dataset summarized by the snapshot.

### `DATA_WINDOW_START_TS`
Inclusive start of the source data window summarized by the snapshot.

### `DATA_WINDOW_END_TS`
End of the source data window summarized by the snapshot.

### `PREDICTION_ID_FIELD` (recommended rename)
The field used in the underlying scored dataset to uniquely identify a scoring event.

### `OUTCOME_LINK_KEY_FIELD` (recommended rename)
The field used in the underlying data to connect scored entities to eventual actuals.

### `OUTCOME_AVAILABLE_TS`
The timestamp at which actual outcomes were considered available for the cohort summarized by the snapshot.

## 13.3 Why this matters
These fields are necessary to support:
- linking raw → transformed → scored → actuals
- distinguishing data layers
- supporting future RCA
- supporting future realized-performance analysis
- supporting future AI interpretation with clear dataset context

---

# 14. Entity Linking and RCA Strategy

## 14.1 Important design principle

Mandos should unify all models at the **monitoring summary layer**.

Mandos should only unify models at the **entity linkage layer** when there is a valid business need.

## 14.2 When row/entity linking is valuable

Entity linking is valuable when:
- the same business entity moves across layers
- actuals must be linked back to scored records
- RCA requires record/cohort reconstruction
- multiple related models operate on the same lifecycle entity

Examples:
- application-level originations/fraud/pricing interactions
- account/contract-level collections/loss forecasting interactions
- VIN-level residual value / market value interactions

## 14.3 When cross-model row linking is not valuable
Mandos should not force row-level mergeability across unrelated domains just because the models are in the same platform.

Example:
- Loss Forecasting and Residual Value do not inherently need row-level mergeability in most cases.

## 14.4 Recommended future-state design
If deep RCA becomes mission critical, add:
- snapshot header table
- snapshot entity index table
- prediction-outcome bridge table

These are not required for MVP dashboarding, but they are the right long-term design if record-level RCA becomes a priority.

---

# 15. Automation Strategy

## 15.1 Current state
Mandos is manually run by model teams.

This is not scalable long term.

## 15.2 Constraint
Airflow is not currently available.

## 15.3 Recommendation
Use **Snowflake-native automation**.

## 15.4 Recommended automation pattern

### Step 1: model output lands in MLHub table/view
Example:
- scored results arrive in domain-specific MLHub schema

### Step 2: stream detects change
Create a Snowflake Stream on the monitored scored source object where feasible.

### Step 3: task executes automation
Create a triggered or scheduled Task to respond when new data is available.

### Step 4: task calls Python stored procedure
The procedure runs Mandos monitoring logic and writes:
- new row to `MANDOS_RUNS`
- baseline updates only when policy requires
- optional detailed rows to `MANDOS_ALERTS`, `MANDOS_FEATURE_METRICS`, etc.

### Step 5: curated views and semantic views reflect the new data
No recreation required; the dashboard updates automatically.

## 15.5 Why this is the right design
This provides:
- automation without Airflow
- Snowflake-native orchestration
- controlled, auditable runs
- minimal UI coupling
- future dashboard compatibility

## 15.6 Recommended automation control table
Use `MANDOS_MODEL_REGISTRY` as the control table for:
- source object
- automation enabled flag
- stream name
- task name
- baseline policy
- team/domain metadata
- score/target/features metadata

## 15.7 Baseline automation strategy
Baselines should generally **not** be rebuilt on every run.

Recommended policy options:
- `CREATE_IF_MISSING`
- `REUSE_EXISTING`
- `REFRESH_ON_RETRAIN`
- `MANUAL_APPROVAL_REQUIRED`

---

# 16. Role of Snowflake DMFs

## 16.1 Recommendation
DMFs should be treated as a valuable **supplement**, not the full Mandos engine.

## 16.2 Good DMF use cases
Use DMFs for simple scheduled object-level checks such as:
- row count
- freshness
- nullness
- simple duplicates
- source/transformed/scored object health checks

## 16.3 What DMFs should not replace
DMFs should not replace:
- baseline management
- Mandos drift logic
- model-aware triage
- semantic rollups
- executive dashboard logic
- model-owner RCA

## 16.4 Recommended DMF strategy for meeting with Data Engineering
Discuss using DMFs for:
- raw object primitives
- transformed/scored object primitives
- scheduled freshness/volume anomalies
- standardized object-level quality signals that Mandos can consume

Then let Mandos:
- persist model-aware runs
- create model-aware rollups
- power dashboard views

---

# 17. User Onboarding Design

## 17.1 Goal
Onboarding must become simple, governed, and repeatable.

## 17.2 Supported onboarding modes

### Mode A: config upload
User uploads YAML config.

### Mode B: guided form
User fills out no-code onboarding form.

Recommended MVP:
- support both
- generate a canonical YAML from form submission

## 17.3 Onboarding requirements
Users must provide:
- model identity
- team/domain metadata
- source object(s)
- score and target columns
- feature list
- baseline strategy
- automation preference
- ownership metadata

## 17.4 Validation steps
The onboarding workflow should validate:
- Snowflake object exists
- required columns exist
- score/target columns are valid
- feature list is resolvable
- baseline can be created
- user has access to required objects
- monitoring preview succeeds

## 17.5 Publish actions
On successful publish:
- write to model registry
- persist config
- create baseline or attach baseline
- create stream/task automation if enabled
- activate dashboard visibility

---

# 18. MVP Implementation Recommendation

## 18.1 Recommended MVP stack
A very strong MVP that preserves future flexibility is:

- Snowflake operational tables (`MANDOS_*`)
- curated relational views / marts (`VW_*`)
- semantic views (`SV_*`)
- Python API/service layer on EKS
- Streamlit frontend as the first client

## 18.2 Why this is strong
This gets:
- fast time to value
- strong dashboard experience
- clear backend separation
- future React compatibility
- future AI compatibility
- avoid business logic trapped in the UI

## 18.3 Why not Streamlit-only
A Streamlit-only architecture would create long-term coupling between:
- UI
- business logic
- Snowflake query logic
- auth/authorization logic

That is not recommended.

## 18.4 Why not React-first
React-first is viable later, but not the fastest route to platform value if a strong frontend team is not already available.

## 18.5 Final MVP recommendation
Use:
- **Streamlit first as the dashboard client**
- but keep:
  - business logic in Snowflake + service layer
  - not in the Streamlit app

---

# 19. Future AI / Semantic Analytics Layer

## 19.1 Recommended future architecture
The future direction should be:

**Mandos core → semantic layer → LLM/RAG/MCP assistant**

## 19.2 What the semantic layer enables
A semantic layer makes future no-code/AI use cases far more realistic:
- “Which models are unhealthy this week?”
- “What changed for model X since last month?”
- “Which features are responsible for current warnings?”
- “Which business domain is most unstable?”

## 19.3 Recommended future AI uses
- executive health summaries
- RCA copilot
- retrieval of model cards / runbooks / validation notes
- guided troubleshooting
- natural-language analytics over governed semantic objects

## 19.4 What AI should not do in MVP
- freely query raw tables
- invent monitoring metrics
- autonomously write production actions
- claim causal certainty for root cause without evidence

---

# 20. Operating Model and Ownership

## 20.1 Mandos platform team responsibilities
- maintain monitoring framework
- maintain registry and dashboard
- maintain automation templates
- maintain semantic model
- maintain standard thresholds and defaults
- support onboarding

## 20.2 Model team responsibilities
- define model-specific metadata
- validate features and feature rules
- approve baseline choices
- investigate and remediate issues
- maintain model-specific configs

## 20.3 Data Engineering responsibilities
- support Snowflake-native automation patterns
- help enable streams/tasks/procedures/DMFs
- support source-object stability
- support shared platform patterns

## 20.4 Data Validation responsibilities
- maintain raw/source-level validation tool
- publish summarized validation outputs where feasible
- coordinate with Mandos on overlapping definitions

---

# 21. Suggested Delivery Phases

## Phase 1: operational monitoring foundation
Deliver:
- model registry
- automated population of `MANDOS_RUNS`
- baseline policy framework
- curated views
- Executive Summary page
- Model Explorer page

## Phase 2: owner drilldown and onboarding
Deliver:
- Model Detail / RCA page
- Onboarding wizard
- feature-level and alert-level normalized tables
- baseline inventory
- stale-run/stale-baseline tracking

## Phase 3: deeper data-layer visibility
Deliver:
- Data Dependency Explorer
- integration with Data Validation signals
- transformed/scored/actual layer monitoring improvements
- segment-level metrics

## Phase 4: semantic and intelligence expansion
Deliver:
- semantic views
- governed natural-language analytics
- future AI assistant
- guided RCA and runbook retrieval

---

# 22. Risks and Mitigations

## Risk 1: dashboard becomes a thin wrapper over messy tables
Mitigation:
- define curated `VW_*` layer before dashboard logic

## Risk 2: Streamlit MVP creates technical debt
Mitigation:
- keep business logic in Snowflake and backend service
- use Streamlit only as first client

## Risk 3: automation becomes inconsistent by team
Mitigation:
- central registry and standard automation pattern

## Risk 4: baseline handling becomes uncontrolled
Mitigation:
- explicit baseline policy fields
- baseline inventory page
- approval/refresh rules

## Risk 5: overlap with Data Validation tool creates confusion
Mitigation:
- explicitly define raw-source vs transformed/scored monitoring boundaries

## Risk 6: AI is pursued before semantic governance exists
Mitigation:
- build semantic and dashboard foundation first
- defer AI to later phase

---

# 23. Recommended Immediate Next Steps

## 23.1 Architecture decisions
1. confirm Mandos as platform-of-record for model monitoring
2. confirm boundary with Data Validation tool
3. confirm MVP stack:
   - Snowflake tables/views/semantic layer
   - backend service
   - Streamlit frontend

## 23.2 Data model decisions
1. define `MANDOS_MODEL_REGISTRY`
2. finalize required metadata fields
3. normalize feature-level and alert-level outputs as needed
4. define curated `VW_*` layer

## 23.3 Automation decisions
1. review Streams + Tasks + Python stored procedure feasibility
2. review DMFs as supplemental object-level monitoring
3. define baseline refresh policy options

## 23.4 Product decisions
1. align on MVP pages
2. align on onboarding workflow
3. align on leadership homepage metrics
4. align on model-owner RCA workflow

## 23.5 Future-state decisions
1. agree semantic views are a medium-term target
2. sequence AI only after semantic/dashboard foundation is stable

---

# 24. Final Recommendation

Mandos should evolve from a manually executed monitoring library into a **Snowflake-native monitoring platform of record** for Financial Risk models.

The correct path is:

1. preserve Mandos as the deterministic monitoring core  
2. automate population of `MANDOS_*` using Snowflake-native orchestration  
3. add curated `VW_*` dashboard marts  
4. add `SV_*` semantic views for business-friendly access  
5. launch an executive and model-owner dashboard  
6. add guided onboarding  
7. later add semantic analytics and AI on top

This design is strong because it:
- builds on current Mandos strengths
- does not block on Airflow
- does not overreach on AI too early
- supports leadership visibility
- supports model-owner RCA
- preserves future flexibility for React, semantic analytics, and Bedrock

---

# Appendix A: Recommended Object Naming

## Operational tables
- `MLHUB_OPS.MANDOS_MODEL_REGISTRY`
- `MLHUB_OPS.MANDOS_BASELINES`
- `MLHUB_OPS.MANDOS_RUNS`
- `MLHUB_OPS.MANDOS_ALERTS`
- `MLHUB_OPS.MANDOS_FEATURE_METRICS`
- `MLHUB_OPS.MANDOS_SEGMENT_METRICS`
- `MLHUB_OPS.MANDOS_AUTOMATION_LOG`

## Curated views / marts
- `MLHUB_OPS.VW_MANDOS_MODEL_REGISTRY`
- `MLHUB_OPS.VW_MANDOS_LATEST_RUN`
- `MLHUB_OPS.VW_MANDOS_RUN_HISTORY`
- `MLHUB_OPS.VW_MANDOS_BASELINE_INVENTORY`
- `MLHUB_OPS.VW_MANDOS_FEATURE_HEALTH`
- `MLHUB_OPS.VW_MANDOS_ALERTS`
- `MLHUB_OPS.VW_MANDOS_EXEC_SUMMARY`

## Semantic views
- `MLHUB_OPS.SV_MANDOS_PORTFOLIO_HEALTH`
- `MLHUB_OPS.SV_MANDOS_RUN_HISTORY`
- `MLHUB_OPS.SV_MANDOS_FEATURE_HEALTH`

---

# Appendix B: Recommended MVP Pages

1. Executive Summary  
2. Portfolio / Model Explorer  
3. Model Detail / RCA  
4. Onboarding Wizard  

Optional in MVP if capacity allows:
5. Baseline Inventory  
6. Data Dependency Explorer  
7. Admin / Exceptions  

---

# Appendix C: Concise one-paragraph summary for leadership

Mandos should evolve from a manually run Python monitoring library into a Snowflake-native platform of record for model health across Financial Risk Management. The platform will automate standardized baseline and snapshot collection, persist model-aware monitoring results in Snowflake, expose executive and model-owner dashboards, enable consistent onboarding of new models, and create a governed semantic foundation for future no-code analytics and AI-assisted investigation. This approach gives leadership one place to monitor model health, gives model teams a standardized RCA workflow, and positions Mandos as the long-term control tower for model monitoring across domains such as Originations, Collections, IFRS/CECL, Bank, Vehicle Pricing, and Residual Value.
