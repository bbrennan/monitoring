# MANDOS-DASHBOARD: Enterprise Model Monitoring Platform

## System Prompt / Project Context

You are a staff+ full-stack engineer building an enterprise-grade model monitoring dashboard for a Financial Services Risk Management data science team. The project is called `mandos-dashboard`. It consumes a Python library called `mandos` (installed via `pip install mandos`) which handles all model monitoring computation, Snowflake I/O, metric calculation, drift detection, and performance estimation.

**Your role is to build the UI platform. Mandos is the engine. You are the cockpit.**

-----

## Architecture

```
mandos-dashboard/
├── backend/                    # FastAPI (Python)
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, lifespan
│   │   ├── config.py           # Settings via pydantic-settings (env vars)
│   │   ├── dependencies.py     # Snowflake session, auth deps
│   │   ├── routers/
│   │   │   ├── models.py       # /api/models, /api/models/{id}
│   │   │   ├── features.py     # /api/models/{id}/features
│   │   │   ├── drift.py        # /api/models/{id}/drift
│   │   │   ├── quality.py      # /api/models/{id}/quality
│   │   │   ├── performance.py  # /api/models/{id}/performance
│   │   │   ├── snapshots.py    # /api/models/{id}/snapshots
│   │   │   ├── alerts.py       # /api/alerts
│   │   │   └── health.py       # /api/health
│   │   ├── services/
│   │   │   ├── model_service.py
│   │   │   ├── feature_service.py
│   │   │   ├── drift_service.py
│   │   │   ├── quality_service.py
│   │   │   ├── performance_service.py
│   │   │   └── alert_service.py
│   │   ├── schemas/            # Pydantic response models
│   │   │   ├── model.py
│   │   │   ├── feature.py
│   │   │   ├── drift.py
│   │   │   ├── quality.py
│   │   │   ├── performance.py
│   │   │   └── alert.py
│   │   └── queries/            # Raw SQL or Mandos SDK calls
│   │       └── snowflake.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api/                # API client (axios/fetch wrapper)
│   │   │   └── client.ts
│   │   ├── hooks/              # React Query hooks per domain
│   │   │   ├── useModels.ts
│   │   │   ├── useFeatures.ts
│   │   │   ├── useDrift.ts
│   │   │   ├── useQuality.ts
│   │   │   ├── usePerformance.ts
│   │   │   └── useAlerts.ts
│   │   ├── pages/
│   │   │   ├── Portfolio.tsx           # All models overview
│   │   │   ├── ModelDetail.tsx         # Single model deep-dive
│   │   │   └── FeatureDetail.tsx       # Single feature deep-dive
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── PageLayout.tsx
│   │   │   ├── portfolio/
│   │   │   │   ├── ModelCard.tsx
│   │   │   │   ├── ModelTable.tsx
│   │   │   │   └── HealthSummaryBar.tsx
│   │   │   ├── model/
│   │   │   │   ├── ModelHeader.tsx
│   │   │   │   ├── DriftTab.tsx
│   │   │   │   ├── QualityTab.tsx
│   │   │   │   ├── PerformanceTab.tsx
│   │   │   │   ├── CalibrationTab.tsx
│   │   │   │   └── SnapshotTimeline.tsx
│   │   │   ├── features/
│   │   │   │   ├── FeatureIntegrityScorecard.tsx
│   │   │   │   ├── FeatureRow.tsx
│   │   │   │   └── DistributionChart.tsx
│   │   │   ├── charts/
│   │   │   │   ├── TimeSeriesChart.tsx
│   │   │   │   ├── DriftChart.tsx
│   │   │   │   ├── CalibrationPlot.tsx
│   │   │   │   └── DistributionOverlay.tsx
│   │   │   ├── alerts/
│   │   │   │   ├── AlertBadge.tsx
│   │   │   │   └── AlertPanel.tsx
│   │   │   └── shared/
│   │   │       ├── StatusIndicator.tsx
│   │   │       ├── MetricPill.tsx
│   │   │       ├── ThresholdBar.tsx
│   │   │       └── LoadingSkeleton.tsx
│   │   ├── styles/
│   │   │   └── globals.css        # Tailwind + custom tokens
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   └── utils/
│   │       ├── formatters.ts      # Number, date, metric formatting
│   │       └── thresholds.ts      # Color logic for health status
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

-----

## Tech Stack (do not deviate)

### Frontend

- **React 18+** with **TypeScript** (strict mode)
- **Vite** for build tooling
- **React Router v6** for client-side routing
- **TanStack Query (React Query)** for server state management
- **Recharts** for all charting (timeseries, distributions, calibration)
- **Tailwind CSS** for styling — use a custom design token system (see Design System below)
- **Lucide React** for iconography
- **shadcn/ui** component primitives (Button, Card, Tabs, Table, Badge, Dialog, Tooltip, Select, Skeleton)

### Backend

- **FastAPI** with async endpoints
- **Pydantic v2** for request/response schemas
- **snowflake-connector-python** for Snowflake queries
- **mandos** (pip installed) as the computation/query SDK
- **uvicorn** for ASGI server

### Infrastructure

- **Docker Compose** for local development (frontend + backend + optional Snowflake proxy)
- Environment-based config via `.env` files

-----

## Domain Model: How Mandos Data Works

Understanding this is CRITICAL. Every UI decision flows from this data model.

### Baselines

- The “ground truth” reference for a model
- Stored as a single Snowflake row per model version
- Contains ARRAY-typed columns holding: bin edges, bin counts, statistical primitives (mean, min, max, std, p5, p25, p50, p75, p95), and calibration data
- Represents the expected state of features at model deployment time

### Snapshots

- A point-in-time capture of the model’s current feature distributions
- Same schema as baselines — one row per monitoring run
- Multiple snapshots exist over time, forming a timeseries of model health

### What gets computed FROM baselines + snapshots

1. **Data Quality Metrics** (per feature, per snapshot):
- `missing_rate` — % of null/missing values
- `capping_rate` — % of values hitting min/max caps
- `zero_rate` — % of zero values
- `out_of_range_rate` — % of values outside baseline range
- `unique_rate` — cardinality / count
- `constant_rate` — % of most frequent value
1. **Statistical Drift** (comparing snapshot bins to baseline bins):
- `PSI` (Population Stability Index) — overall distribution shift
- `CSI` (Characteristic Stability Index) — per-bin contribution to PSI
- `KS` (Kolmogorov-Smirnov) — max CDF difference
- `Wasserstein` — earth mover’s distance
- `Jensen-Shannon` divergence
1. **Performance Estimation** (using calibration data):
- `CBPE` (Confidence-Based Performance Estimation) — for classification
- `RBE` (Regression-Based Estimation) — custom implementation
- These estimate AUC, Gini, F1, etc. WITHOUT ground truth labels
1. **Calibration** (binned predicted probabilities vs observed rates):
- Reliability diagrams
- Expected Calibration Error (ECE)
- Brier score components

### Snowflake Views (auto-maintained by Snowflake Tasks)

- `MODEL_REGISTRY` — all models with metadata (name, version, owner, use case, last_run)
- `FEATURE_REGISTRY` — all features per model with types and importance
- `METRIC_RESULTS` — flattened metric values per feature per snapshot
- `DRIFT_RESULTS` — drift test results per feature per snapshot
- `PERFORMANCE_RESULTS` — estimated and realized performance per snapshot
- `ALERT_LOG` — threshold breaches and anomalies

-----

## Design System: “Clarity Over Cleverness”

This is a monitoring platform for risk management leaders and model owners. The design philosophy is:

### Principles

1. **Scannable** — A VP should understand portfolio health in 3 seconds
1. **Layered** — Portfolio → Model → Feature → Metric (progressive disclosure)
1. **Status-driven** — Every element communicates health via color
1. **Dense but not cluttered** — Financial services users expect information density
1. **Boring where it should be** — No animations on data. No gradients on status badges. Clarity.

### Color System (Health Status)

```
--color-healthy:    #10B981  (emerald-500)   — Within thresholds
--color-warning:    #F59E0B  (amber-500)     — Approaching thresholds
--color-critical:   #EF4444  (red-500)       — Breached thresholds
--color-inactive:   #6B7280  (gray-500)      — No recent data
--color-info:       #3B82F6  (blue-500)      — Informational/neutral

Background tints for status rows/cards:
--bg-healthy:       #ECFDF5  (emerald-50)
--bg-warning:       #FFFBEB  (amber-50)
--bg-critical:      #FEF2F2  (red-50)
```

### Typography

- **Headers:** `font-family: 'IBM Plex Sans', sans-serif` — weight 600
- **Body/Data:** `font-family: 'IBM Plex Mono', monospace` for all numeric values
- **Navigation:** `font-family: 'IBM Plex Sans', sans-serif` — weight 400

### Layout

- Sidebar navigation (collapsible, 240px expanded, 64px collapsed)
- Content area with max-width 1440px, centered
- Card-based sections within pages
- Consistent 24px page padding, 16px card gaps

-----

## Page Specifications

### Page 1: Portfolio Overview (`/`)

**Purpose:** “How healthy is my model fleet?” — the first thing leadership sees.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ HEADER: "Model Portfolio" + last refresh timestamp  │
├─────────────────────────────────────────────────────┤
│ SUMMARY BAR:                                        │
│ [12 Models] [8 Healthy] [3 Warning] [1 Critical]   │
├─────────────────────────────────────────────────────┤
│ MODEL TABLE:                                        │
│ ┌──────────┬────────┬───────┬──────┬──────┬───────┐ │
│ │ Model    │ Status │ PSI   │ DQ   │ Perf │ Last  │ │
│ │ Name     │        │ (max) │ Score│ Est  │ Run   │ │
│ ├──────────┼────────┼───────┼──────┼──────┼───────┤ │
│ │ PD_v3.2  │ 🟢     │ 0.04  │ 98.2%│ 0.81 │ 2h ago│ │
│ │ LGD_v2.1 │ 🟡     │ 0.14  │ 95.1%│ 0.76 │ 6h ago│ │
│ │ EAD_v1.8 │ 🔴     │ 0.31  │ 87.3%│ 0.69 │ 1d ago│ │
│ └──────────┴────────┴───────┴──────┴──────┴───────┘ │
└─────────────────────────────────────────────────────┘
```

**Columns:**

- Model Name (clickable → Model Detail)
- Owner
- Overall Status (worst of: drift status, quality status, performance status)
- PSI (max across features) — with threshold coloring
- Data Quality Score (composite: 100 - weighted sum of quality metric breach rates)
- Estimated Performance (CBPE/RBE primary metric: AUC, Gini, etc.)
- Last Snapshot timestamp (relative: “2h ago”, “1d ago”)
- Trend sparkline (last 10 snapshots of primary performance metric)

**Interactions:**

- Click row → navigates to `/models/{model_id}`
- Sort by any column
- Filter by status (Healthy / Warning / Critical)
- Filter by owner

-----

### Page 2: Model Detail (`/models/:modelId`)

**Purpose:** Deep-dive into a single model’s health across all dimensions.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ MODEL HEADER:                                       │
│ "PD_v3.2" | Owner: J. Smith | Use Case: Retail PD  │
│ Status: 🟡 Warning | Baseline: 2024-01-15          │
│ Active Snapshot: 2025-03-14 | [Compare Snapshots ▼] │
├─────────────────────────────────────────────────────┤
│ TABS: [Drift] [Data Quality] [Performance] [Calib.] │
├─────────────────────────────────────────────────────┤
│ TAB CONTENT (see below)                             │
├─────────────────────────────────────────────────────┤
│ FEATURE INTEGRITY SCORECARD (always visible below)  │
└─────────────────────────────────────────────────────┘
```

#### Tab: Drift

- **Timeseries chart:** PSI over time (all snapshots), with warning/critical threshold lines
- **Feature drift table:** Each feature’s PSI, KS, JS values for the selected snapshot
- **Click a feature** → expands to show CSI waterfall (per-bin contribution) and distribution overlay (baseline bins in gray, snapshot bins in blue)
- **Sorting:** By PSI descending (worst first)

#### Tab: Data Quality

- **Summary metrics:** Overall missing rate, capping rate, OOR rate as aggregate gauges
- **Feature quality table:** Each feature × each quality metric
  - Cells are color-coded by threshold status
  - Click a feature → shows timeseries of that metric across snapshots
- Inspired by **Informatica’s feature integrity view**: one row per feature, every quality dimension as a column, color = health

#### Tab: Performance

- **Primary metric timeseries:** Estimated performance (CBPE/RBE) over snapshots
  - Show confidence band (sampling error)
  - Overlay realized performance when available (ground truth)
  - Warning and critical threshold lines
- **Secondary metrics table:** All estimated metrics for selected snapshot
- **Delta display:** Change from baseline performance prominently shown

#### Tab: Calibration

- **Reliability diagram:** Predicted probability bins (x) vs observed frequency (y)
  - Baseline calibration curve in gray
  - Current snapshot calibration curve in blue
  - Perfect calibration diagonal in dashed black
- **ECE and Brier score** displayed as headline metrics
- **Bin detail table:** Each calibration bin with count, predicted avg, observed avg

-----

#### Feature Integrity Scorecard (Persistent Section)

This is the **Informatica-inspired** centerpiece. Always visible at the bottom of the Model Detail page regardless of which tab is active.

```
┌──────────────┬────────┬────────┬────────┬────────┬────────┬───────┬──────┐
│ Feature      │ Missing│ Capping│ Zero   │ OOR    │ PSI    │ KS    │ Trend│
│              │ Rate   │ Rate   │ Rate   │ Rate   │        │       │      │
├──────────────┼────────┼────────┼────────┼────────┼────────┼───────┼──────┤
│ income       │ 0.1%   │ 0.0%   │ 0.2%   │ 0.0%   │ 0.03   │ 0.02  │ ──── │
│ age          │ 0.0%   │ 2.1%   │ 0.0%   │ 0.1%   │ 0.02   │ 0.01  │ ──── │
│ bureau_score │ 1.2%   │ 0.0%   │ 0.0%   │ 3.4%   │ 0.18   │ 0.11  │ ╱    │
│ dti_ratio    │ 0.0%   │ 5.6%   │ 12.3%  │ 0.0%   │ 0.42   │ 0.29  │ ╱╱   │
└──────────────┴────────┴────────┴────────┴────────┴────────┴───────┴──────┘
```

- Every cell is color-coded: green / amber / red based on configurable thresholds
- Click any cell → navigates to `/models/{modelId}/features/{featureId}` with that metric focused
- Click any feature name → navigates to Feature Detail page
- Sortable by any column (default: worst PSI first)
- Trend column: sparkline of PSI over last 10 snapshots

-----

### Page 3: Feature Detail (`/models/:modelId/features/:featureId`)

**Purpose:** “Why is this feature flagged?” — root cause investigation.

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Portfolio > PD_v3.2 > bureau_score      │
├──────────────────────┬──────────────────────────────┤
│ DISTRIBUTION PANEL   │ METRICS PANEL                │
│                      │                              │
│ Baseline (gray)      │ Current Snapshot:             │
│ overlaid with        │ ┌──────────┬────────┐        │
│ Snapshot (blue)      │ │ PSI      │ 0.18   │        │
│                      │ │ KS       │ 0.11   │        │
│ Histogram bars       │ │ Missing  │ 1.2%   │        │
│ with bin edges       │ │ Capping  │ 0.0%   │        │
│                      │ │ OOR      │ 3.4%   │        │
│                      │ └──────────┴────────┘        │
├──────────────────────┴──────────────────────────────┤
│ CSI WATERFALL: Per-bin contribution to PSI          │
├─────────────────────────────────────────────────────┤
│ TIMESERIES: Selected metric over all snapshots      │
├─────────────────────────────────────────────────────┤
│ STATISTICS TABLE:                                   │
│ ┌──────────┬──────────┬──────────┬────────┐         │
│ │ Stat     │ Baseline │ Snapshot │ Delta  │         │
│ ├──────────┼──────────┼──────────┼────────┤         │
│ │ Mean     │ 712.3    │ 698.1    │ -14.2  │         │
│ │ Std Dev  │ 45.6     │ 52.3     │ +6.7   │         │
│ │ P5       │ 640.0    │ 622.0    │ -18.0  │         │
│ │ P50      │ 715.0    │ 701.0    │ -14.0  │         │
│ │ P95      │ 785.0    │ 779.0    │ -6.0   │         │
│ └──────────┴──────────┴──────────┴────────┘         │
└─────────────────────────────────────────────────────┘
```

-----

## API Contract (Backend must implement these exactly)

### GET /api/models

Returns all models from MODEL_REGISTRY view.

```json
{
  "models": [
    {
      "id": "pd_v3_2",
      "name": "PD_v3.2",
      "owner": "J. Smith",
      "use_case": "Retail PD",
      "status": "warning",
      "last_snapshot_at": "2025-03-14T08:00:00Z",
      "baseline_date": "2024-01-15",
      "feature_count": 42,
      "summary": {
        "max_psi": 0.14,
        "quality_score": 95.1,
        "estimated_performance": 0.76,
        "primary_metric": "auc"
      }
    }
  ]
}
```

### GET /api/models/{modelId}

Returns full model detail including metadata and latest snapshot summary.

### GET /api/models/{modelId}/features

Returns Feature Registry + latest quality/drift metrics per feature.

```json
{
  "features": [
    {
      "id": "bureau_score",
      "name": "bureau_score",
      "dtype": "float64",
      "importance": 0.15,
      "quality": {
        "missing_rate": 0.012,
        "capping_rate": 0.0,
        "zero_rate": 0.0,
        "oor_rate": 0.034
      },
      "drift": {
        "psi": 0.18,
        "ks": 0.11,
        "js": 0.04
      },
      "status": "warning"
    }
  ]
}
```

### GET /api/models/{modelId}/features/{featureId}

Returns full feature detail: baseline stats, snapshot stats, bin data.

```json
{
  "feature": {
    "id": "bureau_score",
    "baseline": {
      "bins": [600, 620, 640, 660, 680, 700, 720, 740, 760, 780, 800],
      "counts": [50, 120, 280, 450, 620, 580, 420, 290, 130, 60],
      "stats": { "mean": 712.3, "std": 45.6, "min": 580, "max": 820, "p5": 640, "p25": 680, "p50": 715, "p75": 745, "p95": 785, "count": 3000 }
    },
    "snapshot": {
      "bins": [600, 620, 640, 660, 680, 700, 720, 740, 760, 780, 800],
      "counts": [80, 160, 310, 470, 590, 540, 380, 260, 120, 50],
      "stats": { "mean": 698.1, "std": 52.3, "min": 560, "max": 810, "p5": 622, "p25": 665, "p50": 701, "p75": 738, "p95": 779, "count": 2960 }
    },
    "drift": {
      "psi": 0.18,
      "csi_per_bin": [0.01, 0.02, 0.01, 0.00, 0.01, 0.01, 0.02, 0.01, 0.00, 0.01],
      "ks": 0.11,
      "js": 0.04
    },
    "quality": {
      "missing_rate": 0.012,
      "capping_rate": 0.0,
      "zero_rate": 0.0,
      "oor_rate": 0.034
    }
  }
}
```

### GET /api/models/{modelId}/drift?feature={featureId}&snapshots=last_20

Returns drift timeseries for charting.

### GET /api/models/{modelId}/quality?feature={featureId}&snapshots=last_20

Returns quality metric timeseries for charting.

### GET /api/models/{modelId}/performance

Returns estimated and realized performance timeseries.

```json
{
  "primary_metric": "auc",
  "snapshots": [
    {
      "snapshot_id": "snap_20250314",
      "timestamp": "2025-03-14T08:00:00Z",
      "estimated": { "auc": 0.76, "gini": 0.52, "f1": 0.71 },
      "realized": null,
      "confidence_band": { "lower": 0.74, "upper": 0.78 },
      "baseline_performance": { "auc": 0.82 }
    }
  ]
}
```

### GET /api/models/{modelId}/snapshots

Returns snapshot metadata timeline for the snapshot selector.

### GET /api/alerts

Returns active alerts with filtering.

```json
{
  "alerts": [
    {
      "id": "alert_001",
      "model_id": "pd_v3_2",
      "model_name": "PD_v3.2",
      "feature_id": "dti_ratio",
      "metric": "psi",
      "value": 0.42,
      "threshold": 0.25,
      "severity": "critical",
      "triggered_at": "2025-03-14T08:15:00Z",
      "acknowledged": false
    }
  ]
}
```

-----

## Threshold Configuration

Use these defaults (make configurable per model via backend):

|Metric                          |Warning|Critical|
|--------------------------------|-------|--------|
|PSI                             |> 0.10 |> 0.25  |
|KS                              |> 0.05 |> 0.10  |
|Missing Rate                    |> 0.02 |> 0.05  |
|Capping Rate                    |> 0.03 |> 0.10  |
|OOR Rate                        |> 0.01 |> 0.05  |
|Zero Rate                       |> 0.10 |> 0.25  |
|Performance Drop (from baseline)|> 5%   |> 10%   |

Status logic:

- **Healthy:** All metrics below warning thresholds
- **Warning:** Any metric in warning range, none critical
- **Critical:** Any metric above critical threshold

Model-level status = worst status across all features and performance.

-----

## Implementation Order (follow this sequence)

### Phase 1: Scaffold (use Opus 4.6 for this phase)

1. Initialize `mandos-dashboard/` repo with the full directory structure above
1. Set up Vite + React + TypeScript + Tailwind + shadcn/ui
1. Set up FastAPI backend with health check endpoint
1. Set up Docker Compose with both services
1. Create the design token system in Tailwind config (colors, fonts, spacing)
1. Create TypeScript interfaces matching all API response schemas
1. Create API client with React Query hooks (mock data initially)

### Phase 2: Portfolio Page (Sonnet 4.6 is fine from here)

1. Build PageLayout, Sidebar, Header components
1. Build Portfolio page with ModelTable
1. Build HealthSummaryBar with status counts
1. Implement sorting and filtering
1. Add sparkline trend column

### Phase 3: Model Detail Page

1. Build ModelHeader with metadata and snapshot selector
1. Build tab navigation (Drift | Quality | Performance | Calibration)
1. Build DriftTab with PSI timeseries chart and feature drift table
1. Build QualityTab with aggregate gauges and quality matrix
1. Build PerformanceTab with estimated vs realized timeseries
1. Build CalibrationTab with reliability diagram
1. Build FeatureIntegrityScorecard (always visible, color-coded)

### Phase 4: Feature Detail Page

1. Build distribution overlay chart (baseline gray + snapshot blue)
1. Build CSI waterfall chart
1. Build statistics comparison table (baseline | snapshot | delta)
1. Build metric timeseries chart (switchable metric)

### Phase 5: Backend Integration

1. Implement Snowflake connection management
1. Build service layer calling Mandos SDK / Snowflake views
1. Wire up all API endpoints with real data
1. Add error handling, pagination, caching headers

### Phase 6: Polish

1. Loading skeletons for all data-dependent components
1. Empty states (“No snapshots yet”, “No alerts”)
1. URL-based state (selected snapshot, active tab, sort order)
1. Responsive behavior (collapse sidebar on narrow screens)
1. Keyboard navigation for tables

-----

## Critical Implementation Rules

1. **NEVER put Snowflake credentials in the frontend.** All data flows through FastAPI.
1. **Use React Query for ALL server state.** No `useEffect` + `useState` for API calls. Configure staleTime of 5 minutes for monitoring data (it doesn’t change every second).
1. **Monospace font for ALL numeric values.** This is non-negotiable for a financial services dashboard. Numbers must align in columns.
1. **Color means status, nothing else.** Green = healthy, amber = warning, red = critical. Do not use these colors decoratively.
1. **Every table must be sortable.** Default sort should surface the worst items first (highest PSI, lowest quality score, etc.).
1. **Breadcrumb navigation on every page.** Users must always know where they are: Portfolio > Model > Feature.
1. **Timestamp formatting:** Use relative time on Portfolio (“2h ago”), absolute time on Detail pages (“2025-03-14 08:00 UTC”).
1. **No loading spinners.** Use skeleton placeholders that match the layout of the content being loaded (shimmer effect via Tailwind animate-pulse).
1. **Chart interactions:** Hover shows tooltip with exact values. Click on a point in any timeseries should update the snapshot context (sidebar metrics update to reflect that snapshot).
1. **Snapshot comparison:** The Model Detail page should support comparing two snapshots side by side, not just baseline vs latest. This is a dropdown: “Compare: Baseline | Snapshot X | Snapshot Y”.

-----

## Notes for AI-Assisted Development

- When generating React components, always include TypeScript interfaces for props
- When generating chart components, use Recharts with custom tooltip components
- When generating table components, use shadcn/ui Table with sortable headers
- When generating API hooks, use TanStack Query with proper queryKey arrays for cache invalidation
- When generating FastAPI endpoints, always include response_model for type safety
- Start with MOCK DATA in the frontend hooks so pages are buildable before backend is complete
- Keep components small: if a component exceeds 150 lines, split it
- Use barrel exports (index.ts) in each component directory

-----

## Mock Data Guidance

Until the backend is connected, frontend hooks should return realistic mock data. Here is a representative mock for the portfolio:

```typescript
export const MOCK_MODELS: Model[] = [
  {
    id: "pd_retail_v3_2",
    name: "PD Retail v3.2",
    owner: "J. Smith",
    use_case: "Retail Probability of Default",
    status: "healthy",
    last_snapshot_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    baseline_date: "2024-01-15",
    feature_count: 42,
    summary: { max_psi: 0.04, quality_score: 98.2, estimated_performance: 0.81, primary_metric: "auc" }
  },
  {
    id: "lgd_secured_v2_1",
    name: "LGD Secured v2.1",
    owner: "A. Kumar",
    use_case: "Secured Loss Given Default",
    status: "warning",
    last_snapshot_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    baseline_date: "2024-03-01",
    feature_count: 38,
    summary: { max_psi: 0.14, quality_score: 95.1, estimated_performance: 0.76, primary_metric: "auc" }
  },
  {
    id: "ead_revolving_v1_8",
    name: "EAD Revolving v1.8",
    owner: "M. Chen",
    use_case: "Revolving Exposure at Default",
    status: "critical",
    last_snapshot_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    baseline_date: "2023-11-20",
    feature_count: 27,
    summary: { max_psi: 0.31, quality_score: 87.3, estimated_performance: 0.69, primary_metric: "rmse" }
  },
  {
    id: "ccf_cards_v4_0",
    name: "CCF Cards v4.0",
    owner: "J. Smith",
    use_case: "Credit Card Conversion Factor",
    status: "healthy",
    last_snapshot_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    baseline_date: "2024-06-01",
    feature_count: 31,
    summary: { max_psi: 0.02, quality_score: 99.1, estimated_performance: 0.84, primary_metric: "auc" }
  }
];
```

Generate similar realistic mocks for features (use real-sounding financial feature names: `bureau_score`, `dti_ratio`, `months_on_book`, `utilization_rate`, `delinquency_count`, `loan_amount`, `income`, `employment_length`, etc.) and for drift/quality/performance timeseries.

-----

## Definition of Done

The dashboard is complete when:

- [ ] A VP can open the Portfolio page and see red/amber/green health for every model in < 3 seconds
- [ ] A model owner can click into their model and identify which features are drifting and why
- [ ] The Feature Integrity Scorecard is immediately legible without explanation
- [ ] Performance estimation is presented with confidence bands so users understand uncertainty
- [ ] Every page has a working URL that can be bookmarked and shared
- [ ] The dashboard works with mock data end-to-end before any Snowflake connection is made
- [ ] Docker Compose brings up both services with one command
