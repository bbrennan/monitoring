# Mandos Leadership Deck
## Proactive Model Monitoring Platform for Credit Risk and Related Domains
### Audience: Data Science and Risk Management Leadership
### Purpose: Align on goals, problem, solution, and approval path

---

# Slide 1 — Title

# Mandos
## From Manual Monitoring to a Platform of Record for Model Health

**Goal:** create one leadership view of model health across our critical Data Science models.

Examples of supported domains:
- IFRS / CECL
- Originations
- Collections
- Market Value Pricing
- Residual Value
- Bank-supporting models
- future Credit Risk model domains

---

# Slide 2 — Executive Summary

## What we are asking for

We are asking for leadership approval to evolve Mandos from:
- a useful but manual Python monitoring library

into:
- an automated Snowflake-native monitoring platform
- with a leadership dashboard
- with model-owner drilldown
- with a path to no-code onboarding and future semantic / AI access

## Why now

Today:
- models are monitored in isolated ways
- the process still depends on manual execution
- leadership does not yet have one place to view model health
- the business risk of late detection is real

## What success looks like

Mandos becomes the platform of record for:
- baseline tracking
- monitoring runs
- model health rollups
- proactive issue detection
- leadership visibility
- future model governance

---

# Slide 3 — Current State

## What exists today

Current workflow:

1. A model runs and writes scored outputs to Snowflake in an `MLHUB_*` workspace
2. A user manually runs the Mandos Python library
3. Mandos computes monitoring results
4. Mandos stores outputs in:
   - `MLHUB_OPS.MANDOS_RUNS`
   - `MLHUB_OPS.MANDOS_BASELINES`

## What Mandos already does well

Mandos already provides:
- standardized monitoring logic
- standardized persistence of run and baseline results
- one foundation for trend analysis
- one framework for transformed feature and score monitoring

## What is still missing

Mandos is not yet:
- automated
- dashboard-driven
- a platform used consistently across teams
- a leadership control tower
- a simple onboarding experience for new models

---

# Slide 4 — The Problem

## Why the current model is not enough

Today, our models are:
- owned by separate teams
- monitored in isolated ways
- dependent on manual execution
- difficult to roll up into one leadership view

## Resulting risks

This creates risk in four ways:

### 1. Monitoring inconsistency
Monitoring may not run as consistently as needed.

### 2. Late issue detection
Transformed feature problems and score drift may be discovered too late.

### 3. Leadership blind spots
There is no single place to understand health across critical models.

### 4. Harder scaling
As the number of models grows, manual monitoring becomes less sustainable.

---

# Slide 5 — Why Mandos Matters

## The core idea

The most important feature of Mandos is not a single alert.

It is the **standardized collection and persistence of monitoring facts**:
- baselines
- runs
- primitives
- metrics
- drift results
- model health rollups

## Why that matters

Once these facts are standardized and persisted:
- leadership can see model health in one place
- model owners can drill into their issues
- onboarding new models becomes easier
- automation becomes possible
- future dashboard and AI layers become realistic

## Key point

Mandos is the foundation that turns isolated monitoring into a platform.

---

# Slide 6 — Vision

## What we want Mandos to become

Mandos should become:

### 1. The platform of record for model monitoring
One place to understand health across our Data Science models.

### 2. A proactive monitoring system
Surface issues earlier, before they become business problems.

### 3. A model-owner workspace
Allow teams to drill into their model and the data it depends on.

### 4. A scalable onboarding platform
Make it much easier to bring new models into monitoring.

### 5. A future-ready foundation
Support semantic views, natural-language analytics, and future AI layers later.

---

# Slide 7 — What the Leadership Dashboard Must Do

## The homepage should answer three questions quickly

### 1. Which models are unhealthy?
Leadership should immediately see:
- OK
- WARN
- CRITICAL
- stale baselines
- stale or missing runs

### 2. Is the portfolio getting better or worse?
Leadership should see trend:
- issue counts over time
- healthy vs unhealthy model counts over time
- recurring problem areas

### 3. Where should we focus first?
Leadership should see:
- top unhealthy models
- top recurring feature drift
- top recurring data-quality issues
- business-domain and team rollups

---

# Slide 8 — Example Executive Homepage

## Recommended homepage components

### KPI row
- Models monitored
- Healthy models
- WARN models
- CRITICAL models
- Stale baselines
- Stale runs

### Trend row
- issue counts over time
- healthy vs unhealthy models over time

### Portfolio matrix
- models by snapshot/date
- color-coded health status

### Top problem lists
- top unhealthy models
- top recurring drifted features
- top recurring DQ issues
- top affected domains / teams

### Governance row
- monitored vs expected models
- models missing baselines
- models missing owners
- models without recent runs

---

# Slide 9 — Simple Visual Mockup

```text
+---------------------------------------------------------------+
| Models  Healthy  Warn  Critical  Stale Baselines  Stale Runs |
|  42       31      8       3             4             2       |
+---------------------------------------------------------------+

+----------------------+   +-------------------------------+
| Issues Over Time     |   | Model Status Over Time        |
| OK/WARN/CRIT trend   |   | stacked counts by snapshot    |
+----------------------+   +-------------------------------+

+---------------------------------------------------------------+
| Model Health Matrix                                           |
| Model A   G G Y Y R                                            |
| Model B   G G G G G                                            |
| Model C   G Y Y R R                                            |
+---------------------------------------------------------------+

+----------------------+   +-------------------------------+
| Top Unhealthy Models |   | Top Drifted Features          |
+----------------------+   +-------------------------------+
```

Legend:
- `G` = OK
- `Y` = WARN
- `R` = CRITICAL

---

# Slide 10 — What Model Owners Need

## Leadership view is only half the story

Model owners also need a drilldown experience.

## The model-owner workspace should provide

### Latest run summary
- current status
- issue counts
- score drift
- major failures

### Trend view
- issue trend over time
- score drift over time
- estimated / realized performance later

### Feature health
- top drifting features
- top DQ issues
- baseline vs current comparisons

### Segment drilldown
- where the issue is concentrated
- examples: state, channel, product, tier, dealer

### Root-cause guidance
- not perfect auto-discovery
- but strong localization:
  - which model
  - which feature
  - which segment
  - which snapshot
  - which data layer

---

# Slide 11 — Onboarding Matters

## If onboarding remains hard, the platform will not scale

Today, monitoring is still too manual.

## The future state should support

### Option 1 — config upload
Teams upload their Mandos config.

### Option 2 — guided no-code onboarding
Users define:
- model identity
- source object
- score column
- target column if available
- features
- baseline policy
- owner / team / business domain

## Why this matters
A platform only becomes broadly useful when new models can be onboarded quickly and consistently.

---

# Slide 12 — Proposed Solution

## The proposed design has three layers

```text
MANDOS_*  ->  VW_*  ->  Dashboard
tables        views      leadership + model-owner UI
```

With future support for:

```text
MANDOS_*  ->  VW_*  ->  SV_*  ->  future semantic / AI layer
tables        views      semantic views
```

## What this means

### `MANDOS_*`
Persisted monitoring facts:
- runs
- baselines
- model registry

### `VW_*`
Curated relational views for:
- latest health
- run history
- baseline inventory
- portfolio rollups

### Dashboard
Leadership and model-owner experience

---

# Slide 13 — Automation Strategy

## We do not want monitoring to depend on manual execution forever

## Proposed automation design

### DMFs where practical
Use Snowflake DMFs for primitive-style measurements and simple object-level checks where they fit.

### Snowflake-native orchestration
Use:
- Streams
- Tasks
- Python stored procedures

### Result
Monitoring becomes:
- repeatable
- scalable
- less dependent on manual notebooks/scripts
- more aligned with enterprise operations

## Key principle

Mandos should become automated, but not over-engineered.

---

# Slide 14 — What We Are and Are Not Proposing

## We are proposing
- automate Mandos monitoring runs
- create a leadership dashboard
- create model-owner drilldown
- standardize Snowflake monitoring objects
- support future onboarding scale

## We are not proposing
- solving every monitoring problem in v1
- replacing every raw data-quality tool
- building a perfect RCA engine on day one
- building a fully autonomous AI agent now

This is a practical platform step, not a moonshot.

---

# Slide 15 — ROI

## Why this investment is worth it

### 1. Reduced model failure risk
Earlier detection reduces the chance of issues going unnoticed.

### 2. Faster issue triage
Model owners spend less time figuring out where to look first.

### 3. Leadership visibility
One place to monitor health across critical models.

### 4. Better scaling
Adding more models becomes easier and more standardized.

### 5. Stronger governance foundation
Baselines, runs, and health history become visible and persistent.

---

# Slide 16 — ROI Visual

```text
Manual Monitoring
-----------------
Many teams
Manual execution
Isolated views
Late detection risk
Harder scaling

                ->
                Mandos Platform

Mandos Platform
---------------
Standardized runs
Automated monitoring
Leadership dashboard
Model-owner drilldown
Easier onboarding
Stronger governance
```

---

# Slide 17 — What Leadership Approval Enables

Approval allows us to move from:
- a valuable internal library

to:
- an internal monitoring platform

## Specifically, approval enables

- dashboard design and implementation
- Snowflake-native automation work
- collaboration with Data Engineering on DMFs, views, and semantic readiness
- stronger onboarding support for teams
- a leadership view across critical models

---

# Slide 18 — Recommended Next Steps

## Immediate next steps

### 1. Approve the direction
Align that Mandos should evolve into the monitoring platform of record.

### 2. Align with Data Engineering
Finalize:
- Snowflake object model
- DMF strategy
- automation design
- view design

### 3. Build MVP dashboard
Focus on:
- executive homepage
- model explorer
- model detail
- onboarding entry point

### 4. Automate monitoring runs
Move away from fully manual execution.

---

# Slide 19 — Closing Message

## Final message

Mandos already has the foundation.

What it needs now is:
- automation
- dashboard visibility
- onboarding scale
- leadership support

This is the right time to convert Mandos from:
- a good library
into
- a real internal platform for proactive model monitoring.

## Ask

Approve the Mandos platform direction and the next phase of dashboard + automation design.
