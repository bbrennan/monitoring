# MANDOS-DASHBOARD: Copilot Prompt Playbook

> **How to use this document:**
> Each prompt is self-contained. Paste it into GitHub Copilot as-is.
> The model tag tells you which model to select in Copilot before pasting.
> Work through them in order. Each phase builds on the previous.
> The “Context Snippet” sections are excerpts from the full design doc —
> include them so the model has what it needs without the full 4,500 words.

-----

# ══════════════════════════════════════════════

# PHASE 1: PROJECT SCAFFOLD

# Model: Claude Opus 4.6

# Why Opus: Cross-file architectural reasoning across 15+ files,

# TypeScript type system design, build tooling config

# ══════════════════════════════════════════════

## Prompt 1A: Initialize Project Structure

```
You are a staff+ full-stack engineer scaffolding a new project called `mandos-dashboard` — an enterprise model monitoring dashboard for a Financial Services Risk Management team.

Create the full project structure with both a React frontend and FastAPI backend. Do not stub placeholder comments — write real, minimal, working code for every file.

## Tech Stack (do not deviate)

Frontend:
- React 18+ with TypeScript (strict mode)
- Vite for build tooling
- React Router v6
- TanStack Query (React Query) for server state
- Recharts for charting
- Tailwind CSS with custom design tokens
- Lucide React for icons
- shadcn/ui primitives (Button, Card, Tabs, Table, Badge, Dialog, Tooltip, Select, Skeleton)

Backend:
- FastAPI with async endpoints
- Pydantic v2 for schemas
- snowflake-connector-python
- uvicorn

Infrastructure:
- Docker Compose for local dev (frontend on :5173, backend on :8000)
- .env-based configuration

## Directory Structure

mandos-dashboard/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app, CORS, lifespan
│   │   ├── config.py           # pydantic-settings (SF credentials, etc.)
│   │   ├── dependencies.py     # Snowflake session factory, auth deps
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── models.py       # /api/models, /api/models/{id}
│   │   │   ├── features.py     # /api/models/{id}/features
│   │   │   ├── drift.py        # /api/models/{id}/drift
│   │   │   ├── quality.py      # /api/models/{id}/quality
│   │   │   ├── performance.py  # /api/models/{id}/performance
│   │   │   ├── snapshots.py    # /api/models/{id}/snapshots
│   │   │   ├── alerts.py       # /api/alerts
│   │   │   └── health.py       # /api/health
│   │   ├── services/           # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── model_service.py
│   │   │   ├── feature_service.py
│   │   │   ├── drift_service.py
│   │   │   ├── quality_service.py
│   │   │   ├── performance_service.py
│   │   │   └── alert_service.py
│   │   ├── schemas/            # Pydantic response models
│   │   │   ├── __init__.py
│   │   │   ├── model.py
│   │   │   ├── feature.py
│   │   │   ├── drift.py
│   │   │   ├── quality.py
│   │   │   ├── performance.py
│   │   │   └── alert.py
│   │   └── queries/
│   │       ├── __init__.py
│   │       └── snowflake.py    # Raw SQL / Mandos SDK calls
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api/
│   │   │   └── client.ts       # Axios instance, base URL config
│   │   ├── hooks/
│   │   │   ├── useModels.ts
│   │   │   ├── useFeatures.ts
│   │   │   ├── useDrift.ts
│   │   │   ├── useQuality.ts
│   │   │   ├── usePerformance.ts
│   │   │   └── useAlerts.ts
│   │   ├── pages/
│   │   │   ├── Portfolio.tsx
│   │   │   ├── ModelDetail.tsx
│   │   │   └── FeatureDetail.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── PageLayout.tsx
│   │   │   ├── shared/
│   │   │   │   ├── StatusIndicator.tsx
│   │   │   │   ├── MetricPill.tsx
│   │   │   │   └── LoadingSkeleton.tsx
│   │   │   └── charts/
│   │   │       └── TimeSeriesChart.tsx
│   │   ├── mocks/
│   │   │   ├── models.ts
│   │   │   ├── features.ts
│   │   │   └── timeseries.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── thresholds.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── .env.example
└── README.md

## Requirements for Each File

### backend/app/main.py
- FastAPI app with CORS allowing localhost:5173
- Include all routers with /api prefix
- Health check at /api/health

### backend/app/config.py
- pydantic-settings BaseSettings reading from .env
- Fields: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_ROLE

### backend/app/routers/*.py
- Each router should have its endpoints defined with correct path parameters
- Return mock data for now (import from a backend mock module if needed)
- Always include response_model on endpoints

### frontend: Tailwind Config
This is a financial services monitoring dashboard. The design system is:

Colors (as CSS custom properties AND Tailwind extensions):
  --color-healthy:  #10B981 (emerald-500)
  --color-warning:  #F59E0B (amber-500)
  --color-critical: #EF4444 (red-500)
  --color-inactive: #6B7280 (gray-500)
  --color-info:     #3B82F6 (blue-500)
  Background tints: emerald-50, amber-50, red-50

Typography:
  Headers: 'IBM Plex Sans', weight 600
  Body: 'IBM Plex Sans', weight 400
  Numeric/data values: 'IBM Plex Mono' (monospace for ALL numbers)

Spacing: 24px page padding, 16px card gaps

Import both IBM Plex fonts from Google Fonts in index.html.

### frontend: TypeScript Types (types/index.ts)
Define interfaces matching these API responses:

Model: { id, name, owner, use_case, status: "healthy"|"warning"|"critical"|"inactive", last_snapshot_at, baseline_date, feature_count, summary: { max_psi, quality_score, estimated_performance, primary_metric } }

Feature: { id, name, dtype, importance, quality: { missing_rate, capping_rate, zero_rate, oor_rate }, drift: { psi, ks, js }, status }

DriftTimeseries: { snapshots: Array<{ snapshot_id, timestamp, value, upper_band?, lower_band? }> }

PerformanceTimeseries: { primary_metric, snapshots: Array<{ snapshot_id, timestamp, estimated: Record<string,number>, realized: Record<string,number>|null, confidence_band: {lower,upper}, baseline_performance: Record<string,number> }> }

Alert: { id, model_id, model_name, feature_id, metric, value, threshold, severity: "warning"|"critical", triggered_at, acknowledged }

FeatureDetail: { feature: { id, name, baseline: { bins: number[], counts: number[], stats: Record<string,number> }, snapshot: { bins: number[], counts: number[], stats: Record<string,number> }, drift: { psi, csi_per_bin: number[], ks, js }, quality: Record<string,number> } }

### frontend: React Query Hooks
Each hook should:
- Call the API client
- BUT for now, return mock data with a simulated 300ms delay
- Use queryKey arrays that include relevant IDs for cache invalidation
- Set staleTime to 5 minutes (300_000ms)

### frontend: Mock Data (mocks/models.ts)
Include 6-8 models with realistic financial model names:
- PD Retail v3.2 (healthy)
- LGD Secured v2.1 (warning)
- EAD Revolving v1.8 (critical)
- CCF Cards v4.0 (healthy)
- PD Wholesale v2.0 (healthy)
- Prepayment v1.3 (warning)
- IFRS9 Staging v3.0 (healthy)
- OpRisk Scorecard v1.1 (inactive)

### frontend: Utils
formatters.ts: formatPercent, formatDecimal, formatRelativeTime, formatAbsoluteTime
thresholds.ts: getStatus(metric, value) → "healthy"|"warning"|"critical" using these defaults:
  PSI: warning > 0.10, critical > 0.25
  KS: warning > 0.05, critical > 0.10
  Missing Rate: warning > 0.02, critical > 0.05
  Capping Rate: warning > 0.03, critical > 0.10
  OOR Rate: warning > 0.01, critical > 0.05
  Zero Rate: warning > 0.10, critical > 0.25

### frontend: App.tsx
React Router with routes:
  / → Portfolio
  /models/:modelId → ModelDetail
  /models/:modelId/features/:featureId → FeatureDetail

Wrap in QueryClientProvider.

### Docker Compose
- backend: build from backend/, expose 8000, load .env
- frontend: build from frontend/, expose 5173, depends_on backend

## Deliverable
Generate every file listed above with real, working code. The app should start with `docker-compose up` and show a blank Portfolio page shell with the sidebar and header rendered.
```

-----

## Prompt 1B: Verify Scaffold Builds

```
Run `docker-compose up --build` and fix any build errors. Then verify:
1. http://localhost:8000/api/health returns {"status": "ok"}
2. http://localhost:5173 renders the app shell (sidebar + header + empty content area)
3. No TypeScript errors in the frontend
4. No import errors in the backend

Fix all issues before proceeding.
```

-----

# ══════════════════════════════════════════════

# PHASE 2: PORTFOLIO PAGE

# Model: Claude Sonnet 4.6

# Why Sonnet: Component-level work with clear specs.

# One component at a time, well-defined inputs/outputs.

# ══════════════════════════════════════════════

## Prompt 2A: Layout Shell

```
Build the layout components for mandos-dashboard. These wrap every page.

## Sidebar.tsx
- 240px wide when expanded, 64px when collapsed
- Toggle button at the top (use Lucide ChevronLeft / ChevronRight)
- Navigation items with Lucide icons:
  - Portfolio (LayoutDashboard icon) → /
  - Alerts (Bell icon) → /alerts (placeholder for now)
- Active route gets a left blue accent border and bg-blue-50
- Logo area at top: text "MANDOS" in IBM Plex Sans, weight 700, tracking-wider
- When collapsed, show only icons with tooltips

## Header.tsx
- Breadcrumb on the left (use React Router useLocation + useParams)
  - Portfolio (always)
  - > Model Name (on model detail pages)
  - > Feature Name (on feature detail pages)
- "Last refreshed: {relative time}" on the right
- Thin bottom border (gray-200)
- Height: 56px

## PageLayout.tsx
- Flex container: Sidebar + main content area
- Content area: max-w-[1440px], mx-auto, p-6
- Pass children as content

Use Tailwind only. Use IBM Plex Sans for all text in layout. Sidebar background: slate-900 with white text. Header background: white.
```

-----

## Prompt 2B: Portfolio Page — Model Table

```
Build the Portfolio page at src/pages/Portfolio.tsx.

## Data Source
Import the useModels() hook which returns { data: Model[], isLoading }.
The hook currently returns mock data (6-8 financial models).

## Layout
1. Page title: "Model Portfolio" (text-2xl, font-semibold)
2. Health Summary Bar below the title
3. Model Table below that

## HealthSummaryBar Component
Four pill-shaped badges in a row:
- "{N} Models" (gray background)
- "{N} Healthy" (emerald-50 bg, emerald-700 text)
- "{N} Warning" (amber-50 bg, amber-700 text)
- "{N} Critical" (red-50 bg, red-700 text)
Counts derived from model statuses.

## ModelTable Component
Use shadcn/ui Table. Columns:

| Column | Content | Notes |
|--------|---------|-------|
| Model | name (bold) + use_case below (text-sm text-gray-500) | Clickable → /models/{id} |
| Owner | owner name | text-sm |
| Status | StatusIndicator dot + label | colored dot: 8px circle |
| PSI (max) | summary.max_psi | Monospace. Color by threshold. |
| DQ Score | summary.quality_score as "98.2%" | Monospace. Color by threshold (>95 green, >90 amber, else red) |
| Est. Perf | summary.estimated_performance | Monospace. Show primary_metric label in subscript. |
| Last Run | last_snapshot_at | Relative time format ("2h ago") |

## Interactions
- Click any row → navigate to /models/{model.id}
- Column headers are clickable for sorting (default: Status desc, then PSI desc)
- Status filter: row of small buttons above table (All | Healthy | Warning | Critical)

## Loading State
When isLoading is true, render 6 rows of Skeleton placeholders matching the table layout.

## Important
- ALL numeric values use font-mono (IBM Plex Mono)
- Sort worst-first by default
- Use the getStatus() util from utils/thresholds.ts for coloring PSI and DQ cells
- Use the formatRelativeTime() util for the Last Run column
```

-----

## Prompt 2C: Sparkline Column

```
Add a Trend column to the ModelTable as the last column.

Create a SparklineChart component using Recharts:
- Tiny line chart, 80px wide × 32px tall
- No axes, no grid, no labels, no tooltip
- Line color matches model status (emerald for healthy, amber for warning, red for critical)
- Data: array of last 10 performance values

For mock data, generate 10 plausible values per model. For healthy models, values should be stable around their estimated_performance. For warning models, slight downward trend. For critical models, clear decline.
```

-----

# ══════════════════════════════════════════════

# PHASE 3: MODEL DETAIL PAGE

# Model: Claude Sonnet 4.6

# Approach: One tab at a time. Test each before moving on.

# ══════════════════════════════════════════════

## Prompt 3A: Model Detail Shell + Header

```
Build the ModelDetail page at src/pages/ModelDetail.tsx.

## Data
- useParams() to get modelId
- useModel(modelId) hook → returns single Model with full detail
- useFeatures(modelId) hook → returns Feature[]

## ModelHeader Component
Full-width card at top of page:
- Left side: Model name (text-2xl bold), use_case subtitle, owner
- Center: Status badge (large, colored background), baseline date
- Right side: Snapshot selector dropdown (shadcn Select)
  - Options: list of snapshot timestamps
  - Default: latest snapshot
  - Selecting a snapshot updates all tabs below

## Tab Navigation
Use shadcn/ui Tabs component. Four tabs:
- Drift
- Data Quality
- Performance
- Calibration

Tabs should be URL-aware: /models/{id}?tab=drift (default), ?tab=quality, ?tab=performance, ?tab=calibration. Use useSearchParams.

Below the tabs, ALWAYS render the FeatureIntegrityScorecard (this is visible regardless of active tab). Build it as a placeholder for now — just a card with title "Feature Integrity Scorecard" and "Coming in Prompt 3F".

For each tab, render a placeholder card: "DriftTab — Coming in Prompt 3B", etc.
```

-----

## Prompt 3B: Drift Tab

```
Build DriftTab.tsx for the Model Detail page.

## Data
- useDrift(modelId) hook → returns drift timeseries (PSI over snapshots for the model-level max)
- useFeatures(modelId) hook → returns Feature[] with per-feature drift values

## Layout (top to bottom):

### 1. PSI Timeseries Chart
- Recharts AreaChart, 100% width, 300px height
- X axis: snapshot timestamps (formatted as MMM DD)
- Y axis: PSI value
- Area fill: light blue with 0.1 opacity
- Line: blue-500, strokeWidth 2
- Two horizontal ReferenceLine elements:
  - Warning threshold (0.10): dashed amber line with label
  - Critical threshold (0.25): dashed red line with label
- Custom tooltip showing: date, PSI value, status

### 2. Feature Drift Table
shadcn/ui Table below the chart:

| Feature | PSI | KS | JS | Status |
|---------|-----|----|----|--------|
| dti_ratio | 0.42 | 0.29 | 0.12 | 🔴 Critical |
| bureau_score | 0.18 | 0.11 | 0.04 | 🟡 Warning |
| income | 0.03 | 0.02 | 0.01 | 🟢 Healthy |

- Sorted by PSI descending (worst first)
- All numeric values in font-mono
- PSI, KS cells colored by their respective thresholds
- Click a feature row → expands inline to show:
  - DistributionOverlay: baseline bins (gray bars) + snapshot bins (blue bars) overlaid
  - CSI waterfall: horizontal bar chart of csi_per_bin values

Use mock data for the timeseries (20 snapshots with realistic PSI progression).
Feature drift values come from the useFeatures hook mock data.
```

-----

## Prompt 3C: Data Quality Tab

```
Build QualityTab.tsx for the Model Detail page.

## Data
- useFeatures(modelId) hook → returns Feature[] with per-feature quality metrics

## Layout (top to bottom):

### 1. Aggregate Quality Gauges
Row of 4 cards showing model-level aggregates:
- Avg Missing Rate
- Avg Capping Rate
- Avg OOR Rate
- Avg Zero Rate

Each card: metric name (text-sm, gray), value (text-2xl, font-mono, colored by threshold), small up/down arrow showing change from previous snapshot.

### 2. Feature Quality Matrix
This is the Informatica-inspired view. A dense table:

| Feature | Missing | Capping | Zero | OOR | Status |
|---------|---------|---------|------|-----|--------|
| (name)  | 0.1%   | 0.0%    | 0.2% | 0.0%| 🟢     |

Key requirements:
- Every cell background is tinted by status: green-50 / amber-50 / red-50
- The cell text is the formatted percentage in font-mono
- Hover on any cell → tooltip shows: "{metric}: {value} (threshold: warning > X, critical > Y)"
- Click any cell → shows a small timeseries popover (last 10 snapshots of that metric for that feature) using Recharts LineChart in a shadcn Popover
- Click feature name → navigates to /models/{modelId}/features/{featureId}
- Sortable by any column (default: worst overall status first)

This table IS the quality tab's centerpiece. Make it the primary visual element.
```

-----

## Prompt 3D: Performance Tab

```
Build PerformanceTab.tsx for the Model Detail page.

## Data
- usePerformance(modelId) hook → returns PerformanceTimeseries

## Layout (top to bottom):

### 1. Headline Metrics Row
Three metric cards:
- "Baseline {metric}" → e.g. "Baseline AUC: 0.82" (gray text, font-mono value)
- "Current Estimated {metric}" → e.g. "Est. AUC: 0.76" (colored by delta threshold, font-mono)
- "Delta" → e.g. "-0.06 (-7.3%)" in red if negative, green if positive. Large font.

### 2. Performance Timeseries Chart
Recharts ComposedChart, 100% width, 350px height:
- X axis: snapshot dates
- Primary line: Estimated performance (blue-500, solid, strokeWidth 2)
- Confidence band: Area between confidence_band.lower and confidence_band.upper (blue, opacity 0.1)
- Secondary line: Realized performance (emerald-500, dashed) — only where data exists (realized !== null)
- Baseline reference line: horizontal dashed gray line at baseline value with label
- Warning threshold: horizontal dashed amber line at (baseline - 5%)
- Critical threshold: horizontal dashed red line at (baseline - 10%)
- Custom tooltip: "Date: X, Estimated: Y, Realized: Z (if available), Confidence: [L, U]"

### 3. All Metrics Table (for selected snapshot)
Simple table:

| Metric | Baseline | Estimated | Delta | Status |
|--------|----------|-----------|-------|--------|
| AUC    | 0.82     | 0.76      | -0.06 | 🟡     |
| Gini   | 0.64     | 0.52      | -0.12 | 🔴     |
| F1     | 0.78     | 0.71      | -0.07 | 🟡     |

Delta cells: red text if negative, green if positive. Font-mono for all values.

## Mock Data
Generate 20 snapshots of performance data. First 12 snapshots: stable around baseline. Snapshots 13-16: gradual decline. Snapshots 17-20: steeper decline. This tells the story of a degrading model — realistic for the demo.

Realized data available for only the first 8 snapshots (simulating delayed ground truth).
```

-----

## Prompt 3E: Calibration Tab

```
Build CalibrationTab.tsx for the Model Detail page.

## Data
- usePerformance(modelId) hook should be extended to include calibration data, OR create a useCalibration(modelId) hook

## Layout (top to bottom):

### 1. Headline Metrics
Two cards:
- ECE (Expected Calibration Error): value in font-mono, colored by threshold (< 0.05 green, < 0.10 amber, else red)
- Brier Score: value in font-mono

### 2. Reliability Diagram
Recharts ScatterChart + LineChart combination, 500px × 500px (square aspect ratio):
- X axis: "Mean Predicted Probability" (0 to 1)
- Y axis: "Observed Frequency" (0 to 1)
- Perfect calibration: diagonal dashed line (gray-400) from (0,0) to (1,1)
- Baseline calibration: line with circle markers, gray-400, connecting baseline bin points
- Current snapshot calibration: line with circle markers, blue-500, connecting snapshot bin points
- Each point sized proportional to bin count (min 6px, max 20px radius)
- Custom tooltip: "Bin: [X1, X2], Predicted: P, Observed: O, Count: N"

### 3. Calibration Bin Table

| Bin Range | Count | Predicted Avg | Observed Avg | Gap |
|-----------|-------|---------------|--------------|-----|
| 0.0-0.1   | 450  | 0.05          | 0.04         | 0.01|
| 0.1-0.2   | 380  | 0.15          | 0.13         | 0.02|

Gap column colored: green if |gap| < 0.02, amber < 0.05, red >= 0.05.
All values font-mono.

## Mock Data
Generate 10 calibration bins (deciles). Baseline should be well-calibrated (gaps < 0.02). Snapshot should show miscalibration in the 0.3-0.6 range (gaps of 0.04-0.08) to tell a realistic story.
```

-----

## Prompt 3F: Feature Integrity Scorecard

```
Build FeatureIntegrityScorecard.tsx — the persistent section below the tabs on Model Detail.

This is the most important single component in the dashboard. It must be immediately legible.

## Data
- useFeatures(modelId) hook → Feature[] with quality and drift data

## Design

Dense table, always visible below whichever tab is active. Card wrapper with title "Feature Integrity Scorecard" and a subtitle showing "{N} features monitored".

| Feature | Missing Rate | Capping Rate | Zero Rate | OOR Rate | PSI | KS | Trend |
|---------|-------------|-------------|-----------|---------|-----|-----|-------|

Requirements:
1. Every metric cell has a tinted background matching its status:
   - Healthy: bg-emerald-50, text-emerald-700
   - Warning: bg-amber-50, text-amber-700
   - Critical: bg-red-50, text-red-700
2. All values in font-mono, right-aligned
3. Feature name column: left-aligned, font-sans, clickable → /models/{modelId}/features/{featureId}
4. Trend column: SparklineChart (reuse from Portfolio) showing PSI over last 10 snapshots
5. Sorted by worst status first, then by PSI descending within each status group
6. Column headers have tooltips explaining each metric
7. Alternating row backgrounds (white / gray-50) UNDERNEATH the status tint
8. Sticky header row when scrolling (if many features)
9. Search/filter input above the table to filter features by name

This component should handle 50+ features without performance issues. Use React.memo on FeatureRow.

## Feature Names for Mock Data
Use realistic financial feature names:
bureau_score, dti_ratio, months_on_book, utilization_rate, delinquency_count,
loan_amount, income, employment_length, num_open_accounts, num_inquiries_6m,
total_balance, monthly_payment, loan_to_value, age_of_oldest_account,
pct_accounts_current, revolving_balance, installment_balance, mortgage_balance,
num_30dpd_12m, num_60dpd_12m, num_90dpd_12m, bankruptcy_flag, collections_12m

Generate 20-25 features. Most should be healthy, 3-5 warning, 1-2 critical.
```

-----

# ══════════════════════════════════════════════

# PHASE 4: FEATURE DETAIL PAGE

# Model: Claude Sonnet 4.6

# ══════════════════════════════════════════════

## Prompt 4A: Feature Detail Page

```
Build FeatureDetail.tsx at src/pages/FeatureDetail.tsx.

## Data
- useParams() for modelId and featureId
- useFeatureDetail(modelId, featureId) → returns FeatureDetail type
  (includes baseline bins/counts/stats, snapshot bins/counts/stats, drift, quality)

## Layout

### Breadcrumb
Already handled by Header.tsx. Ensure it shows: Portfolio > {Model Name} > {Feature Name}

### Top Row: Two-column layout (60% / 40%)

Left Column — Distribution Overlay Chart:
- Recharts BarChart, two bar series overlaid
- Baseline bars: gray-300, opacity 0.6
- Snapshot bars: blue-500, opacity 0.8
- X axis: bin edges (formatted as numbers)
- Y axis: frequency (count or proportion — add toggle)
- Legend: "Baseline" (gray) / "Snapshot {date}" (blue)
- Chart height: 350px

Right Column — Current Metrics Panel:
- Card with two sections:
  - "Drift Metrics" header, then: PSI, KS, JS — each as a row with label, value (font-mono, colored), status dot
  - "Quality Metrics" header, then: Missing Rate, Capping Rate, Zero Rate, OOR Rate — same format

### CSI Waterfall Chart
- Recharts BarChart, horizontal
- One bar per bin showing CSI contribution (csi_per_bin values)
- Bars colored: green if < 0.01, amber 0.01-0.03, red > 0.03
- X axis labels: bin range (e.g., "600-620")
- Title: "Per-Bin Contribution to PSI (CSI)"
- Height: 250px

### Metric Timeseries
- Dropdown to select which metric to chart: PSI, KS, Missing Rate, Capping Rate, OOR Rate, Zero Rate
- Recharts LineChart showing selected metric across last 20 snapshots
- Warning and critical threshold lines
- Height: 250px

### Statistics Comparison Table
| Statistic | Baseline | Snapshot | Delta | % Change |
|-----------|----------|----------|-------|----------|
| Mean      | 712.3    | 698.1    | -14.2 | -2.0%    |
| Std Dev   | 45.6     | 52.3     | +6.7  | +14.7%   |
| Min       | 580      | 560      | -20   | -3.4%    |
| P5        | 640      | 622      | -18   | -2.8%    |
| P25       | 680      | 665      | -15   | -2.2%    |
| P50 (Median)| 715    | 701      | -14   | -2.0%    |
| P75       | 745      | 738      | -7    | -0.9%    |
| P95       | 785      | 779      | -6    | -0.8%    |
| Max       | 820      | 810      | -10   | -1.2%    |
| Count     | 3000     | 2960     | -40   | -1.3%    |

Delta column: red text if negative change is bad (depends on context — mean dropping may or may not be bad, but count dropping is always concerning). Use amber for >5% change, red for >10% change on absolute percentage.

All values font-mono.
```

-----

# ══════════════════════════════════════════════

# PHASE 5: BACKEND INTEGRATION

# Model: Claude Opus 4.6

# Why Opus: Mandos SDK integration, Snowflake array types,

# query optimization, error handling across the full API

# ══════════════════════════════════════════════

## Prompt 5A: Backend Service Layer

```
You are building the FastAPI backend for mandos-dashboard. The backend serves data from Snowflake where a Python library called `mandos` (pip installed) manages model monitoring data.

## Snowflake Data Architecture

Mandos stores data in Snowflake using this pattern:
- Baselines and Snapshots are stored as individual rows with ARRAY-typed columns
- Snowflake Tasks auto-maintain these denormalized views:
  - MODEL_REGISTRY — all models with metadata
  - FEATURE_REGISTRY — all features per model with types and importance
  - METRIC_RESULTS — flattened metric values per feature per snapshot
  - DRIFT_RESULTS — drift values per feature per snapshot
  - PERFORMANCE_RESULTS — estimated and realized performance per snapshot
  - ALERT_LOG — threshold breaches

## Task
Implement the full service layer (backend/app/services/*.py) that:

1. Uses snowflake-connector-python to query these views
2. Transforms Snowflake results into the Pydantic schemas already defined in backend/app/schemas/
3. Handles Snowflake ARRAY columns properly (they come back as JSON strings — parse them)
4. Implements connection pooling (create_engine with snowflake.sqlalchemy if available, or manual connection caching)
5. Has proper error handling (Snowflake timeouts, empty results, malformed arrays)

## Service Methods Required

model_service.py:
- get_all_models() → List[ModelSummary]
- get_model(model_id: str) → ModelDetail

feature_service.py:
- get_features(model_id: str) → List[Feature]
- get_feature_detail(model_id: str, feature_id: str) → FeatureDetail
  (This one must parse ARRAY columns for bins, counts, and stats from both baseline and latest snapshot)

drift_service.py:
- get_drift_timeseries(model_id: str, feature_id: str | None, last_n: int = 20) → DriftTimeseries
- get_feature_drift(model_id: str, snapshot_id: str | None) → List[FeatureDrift]

quality_service.py:
- get_quality_timeseries(model_id: str, feature_id: str, metric: str, last_n: int = 20) → QualityTimeseries
- get_feature_quality(model_id: str, snapshot_id: str | None) → List[FeatureQuality]

performance_service.py:
- get_performance_timeseries(model_id: str, last_n: int = 20) → PerformanceTimeseries
- get_calibration(model_id: str, snapshot_id: str | None) → CalibrationData

alert_service.py:
- get_alerts(model_id: str | None, severity: str | None, acknowledged: bool | None) → List[Alert]

## Query Pattern
Use parameterized queries. Example pattern:

```python
async def get_all_models(self) -> List[ModelSummary]:
    query = """
        SELECT
            model_id, model_name, owner, use_case,
            last_snapshot_at, baseline_date, feature_count,
            max_psi, quality_score, estimated_performance, primary_metric
        FROM {schema}.MODEL_REGISTRY
        ORDER BY
            CASE status WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
            max_psi DESC
    """
    # Execute and transform
```

For the FeatureDetail query that reads ARRAY columns:

```python
async def get_feature_detail(self, model_id: str, feature_id: str) -> FeatureDetail:
    query = """
        SELECT
            b.bin_edges,    -- ARRAY type
            b.bin_counts,   -- ARRAY type
            b.stats,        -- VARIANT/OBJECT type
            s.bin_edges AS snap_bin_edges,
            s.bin_counts AS snap_bin_counts,
            s.stats AS snap_stats
        FROM {schema}.BASELINES b
        JOIN {schema}.SNAPSHOTS s ON b.model_id = s.model_id AND b.feature_id = s.feature_id
        WHERE b.model_id = %(model_id)s
          AND b.feature_id = %(feature_id)s
          AND s.snapshot_id = (SELECT MAX(snapshot_id) FROM {schema}.SNAPSHOTS WHERE model_id = %(model_id)s)
    """
    # Parse ARRAY columns: json.loads() if they come as strings, or handle native list
```

## Critical Notes

- Snowflake ARRAY columns may return as Python lists or as JSON strings depending on the connector version. Handle both.
- VARIANT columns return as Python dicts or JSON strings. Handle both.
- All datetime columns from Snowflake should be converted to ISO 8601 strings for the API response.
- Use the schema from config.py (settings.SNOWFLAKE_SCHEMA) — never hardcode schema names.
- Add a fallback: if mandos is not installed or Snowflake is unreachable, the API should return mock data with a header X-Data-Source: mock. This keeps frontend development unblocked.

Then wire these services into the routers (backend/app/routers/*.py) replacing the existing mock returns.

```
---

# ══════════════════════════════════════════════
# PHASE 6: POLISH
# Model: Claude Sonnet 4.6
# ══════════════════════════════════════════════

## Prompt 6A: Loading States, Empty States, Error States
```

Add proper loading, empty, and error states to every page and component in mandos-dashboard.

## Loading States

- NEVER use spinning loaders. Use skeleton placeholders.
- Portfolio page: 6 skeleton rows matching ModelTable column widths (use Tailwind animate-pulse)
- Model Detail: skeleton blocks for the header card, tab content area, and scorecard
- Feature Detail: skeleton blocks matching the 2-column layout
- Charts: gray rectangle with animate-pulse at the chart’s exact dimensions

## Empty States

- Portfolio with no models: Centered icon (PackageOpen from Lucide) + “No models registered” + “Models will appear here once Mandos creates baselines in Snowflake”
- Model with no snapshots: “No monitoring data yet” + “Snapshots will appear after the first Mandos monitoring run”
- Feature with no drift data: “Insufficient data” + “At least 2 snapshots are needed to calculate drift trends”
- No alerts: CheckCircle icon (green) + “All clear — no active alerts”

## Error States

- API unreachable: AlertTriangle icon + “Unable to connect to monitoring API” + “Check that the backend is running on port 8000” + Retry button
- Specific query fails: Inline error within the affected component (don’t blow up the whole page) + retry button
- Use React Query’s isError and error states, wrap in ErrorBoundary at the page level

## Accessibility

- All status colors must also have a text label (don’t rely on color alone)
- All charts must have aria-labels describing the data
- Tables must use proper th/td semantics
- Focus visible outlines on all interactive elements

```
---

## Prompt 6B: URL State and Navigation Polish
```

Ensure the following URL behaviors work in mandos-dashboard:

1. Tab state is preserved in URL: /models/pd_v3_2?tab=quality
- Refreshing the page should land on the correct tab
- Browser back/forward should navigate between tabs
1. Sort state is preserved in URL: /?sort=psi&dir=desc&filter=critical
- Portfolio filters and sort survive page refresh
1. Snapshot selection is in URL: /models/pd_v3_2?tab=drift&snapshot=snap_20250314
- Sharing a URL shows the exact same view
1. Feature detail metric selection: /models/pd_v3_2/features/bureau_score?metric=psi
- The timeseries chart shows the selected metric on load
1. All navigation uses React Router Links (no window.location)
1. 404 page for invalid model/feature IDs: “Model not found” with link back to Portfolio

Use useSearchParams for query parameters. Update params without full page navigation.

```
---

## Prompt 6C: Final Integration Test
```

Review the complete mandos-dashboard application and fix any issues.

Run through these test scenarios manually:

1. PORTFOLIO VIEW
- Page loads with mock data showing 6-8 models
- Health summary bar shows correct counts
- Table is sorted worst-first by default
- Clicking “Critical” filter shows only critical models
- Clicking a model row navigates to model detail
1. MODEL DETAIL
- Header shows correct model metadata
- All four tabs render content
- Drift tab: PSI timeseries chart renders with threshold lines
- Quality tab: Feature matrix cells are color-coded correctly
- Performance tab: Estimated line with confidence band renders
- Calibration tab: Reliability diagram shows diagonal reference line
- Feature Integrity Scorecard is visible below every tab
1. FEATURE DETAIL
- Distribution overlay shows both baseline and snapshot bars
- CSI waterfall shows per-bin contributions
- Statistics table shows deltas with correct coloring
- Metric timeseries dropdown switches the chart
1. CROSS-CUTTING
- Breadcrumbs update correctly on every page
- URLs are bookmarkable and shareable
- Loading skeletons appear before data loads
- No console errors or TypeScript warnings
- All fonts are correct (IBM Plex Sans for text, IBM Plex Mono for numbers)

Fix anything that fails these checks.

```
---

# ══════════════════════════════════════════════
# REFERENCE: When to Escalate to Opus
# ══════════════════════════════════════════════

Switch from Sonnet to Opus in these situations:

1. **Sonnet loops on the same error 3+ times** — Opus is better at stepping back,
   reasoning about the root cause, and trying a fundamentally different approach.

2. **Cross-file refactoring** — If you need to change a TypeScript interface and
   update every component that uses it, Opus handles the ripple effects better.

3. **Snowflake query debugging** — When ARRAY/VARIANT parsing produces unexpected
   results, Opus is better at reasoning about the data flow from Snowflake →
   connector → Python → Pydantic → JSON → TypeScript.

4. **Architecture decisions** — "Should I restructure how snapshot comparison
   works?" or "The current caching strategy isn't working" — these are Opus questions.

5. **Performance optimization** — If React Query cache invalidation isn't working
   correctly or components are re-rendering unnecessarily, Opus reasons about
   the dependency graph better.

For everything else — building components to spec, styling, adding columns to
tables, creating new mock data, fixing Tailwind classes — Sonnet is faster,
cheaper, and equally effective.
```
