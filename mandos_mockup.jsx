import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const C = {
  bg: "#080a0c",
  surface: "#0f1214",
  surfaceHigh: "#151a1e",
  border: "#1e2428",
  borderStrong: "#2a3138",
  critical: "#f04f4f",
  criticalBg: "rgba(240,79,79,0.07)",
  criticalBorder: "rgba(240,79,79,0.2)",
  warn: "#e8962a",
  warnBg: "rgba(232,150,42,0.07)",
  warnBorder: "rgba(232,150,42,0.2)",
  ok: "#3dba7e",
  okBg: "rgba(61,186,126,0.07)",
  okBorder: "rgba(61,186,126,0.2)",
  info: "#5b9cf6",
  infoBg: "rgba(91,156,246,0.07)",
  text: "#dde3e8",
  textSub: "#7a8897",
  textMuted: "#3d4a55",
  baseline: "#4b8ef0",
  current: "#f07340",
  mono: "'IBM Plex Mono', monospace",
  sans: "'DM Sans', sans-serif",
};

const statusColor = (s) => s === "CRITICAL" ? C.critical : s === "WARN" ? C.warn : C.ok;
const statusBg = (s) => s === "CRITICAL" ? C.criticalBg : s === "WARN" ? C.warnBg : C.okBg;
const statusBorder = (s) => s === "CRITICAL" ? C.criticalBorder : s === "WARN" ? C.warnBorder : C.okBorder;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const RUN = {
  model: "Zuul2", submodel: "RTL_SUBPRIME", snapshot: "2026-03",
  status: "CRITICAL", featuresMonitored: 24, featuresDrifted: 9,
  dqIssues: 5, driftIssues: 10, gateFailures: 0,
  scorePsi: 0.0368, rowsRef: 2947426, rowsCur: 224257, schemaChanges: 0,
};

const DRIFTED = [
  {
    name: "P13_AUA8320", csi: 4.779, status: "CRITICAL",
    note: "Population has collapsed into the top bin (≥161). 4.8% in training → 28.8% in production. Fundamental population shift.",
    bins: [
      { l: "< 5", r: 1.2, c: 0.0 }, { l: "[5,21.5)", r: 11.0, c: 10.2 },
      { l: "[21.5,38.5)", r: 11.8, c: 9.8 }, { l: "[38.5,52.5)", r: 10.5, c: 10.3 },
      { l: "[52.5,67.5)", r: 10.2, c: 11.2 }, { l: "[67.5,68.5)", r: 5.0, c: 4.5 },
      { l: "[68.5,73.5)", r: 12.1, c: 11.8 }, { l: "[73.5,92.5)", r: 11.2, c: 11.5 },
      { l: "[92.5,161)", r: 11.5, c: 11.9 }, { l: "≥ 161", r: 5.5, c: 28.8 },
    ],
  },
  {
    name: "P13_IQA9427", csi: 2.395, status: "CRITICAL",
    note: "Training was concentrated at [0, 0.5) with 60% of rows. In production that bin holds only 31%. Major redistribution toward higher values.",
    bins: [
      { l: "< 0", r: 0.0, c: 7.0 }, { l: "[0, 0.5)", r: 59.5, c: 30.8 },
      { l: "[0.5, 1.5)", r: 9.8, c: 31.0 }, { l: "[1.5, 12)", r: 30.0, c: 23.5 },
      { l: "≥ 12", r: 0.7, c: 7.7 },
    ],
  },
  {
    name: "AUTO_PAYMENT_TO_DEBT_LINE3", csi: 1.076, status: "CRITICAL",
    note: "Near-zero values absent from training now make up 8.9% of production. Single bin drives 94% of total CSI. Likely imputation or preprocessing difference.",
    bins: [
      { l: "< 0.008", r: 0.0, c: 8.9 }, { l: "[0.008,0.137)", r: 10.0, c: 9.4 },
      { l: "[0.137,0.190)", r: 10.0, c: 8.6 }, { l: "[0.190,0.238)", r: 10.0, c: 7.1 },
      { l: "[0.238,0.288)", r: 10.0, c: 6.6 }, { l: "[0.288,0.343)", r: 10.0, c: 7.6 },
      { l: "[0.343,0.406)", r: 10.0, c: 8.8 }, { l: "[0.406,0.485)", r: 10.0, c: 9.2 },
      { l: "[0.485,0.622)", r: 10.0, c: 15.2 }, { l: "[0.622,0.828)", r: 10.0, c: 8.2 },
      { l: "≥ 0.828", r: 10.0, c: 10.4 },
    ],
  },
  {
    name: "MEAN_VANTAGE_V4_SCORE", csi: 0.479, status: "CRITICAL",
    note: "Training min was 765 — production min is 370. New lower-score applicants. Also 8.2% missing, flagged as possible failed JOIN.",
    bins: [
      { l: "< 500", r: 0.0, c: 4.1 }, { l: "[500,560)", r: 6.2, c: 8.8 },
      { l: "[560,585)", r: 9.8, c: 10.1 }, { l: "[585,604)", r: 10.1, c: 10.8 },
      { l: "[604,619)", r: 10.2, c: 10.5 }, { l: "[619,636)", r: 10.3, c: 10.2 },
      { l: "[636,653)", r: 10.2, c: 9.8 }, { l: "[653,672)", r: 10.2, c: 9.4 },
      { l: "[672,700)", r: 10.3, c: 9.5 }, { l: "≥ 700", r: 22.7, c: 16.8 },
    ],
  },
  {
    name: "AP_PERCENT_ADVANCED_RATIO", csi: 0.328, status: "CRITICAL",
    note: "Both tails are new. Training had no values below 29 or above 148. Production has both (0.5% and 2.5%). Check preprocessing pipeline.",
    bins: [
      { l: "< 29", r: 0.0, c: 0.5 }, { l: "[29,80)", r: 9.1, c: 8.9 },
      { l: "[80,92)", r: 10.7, c: 8.4 }, { l: "[92,99)", r: 9.4, c: 6.7 },
      { l: "[99,104)", r: 10.4, c: 9.3 }, { l: "[104,109)", r: 10.3, c: 9.1 },
      { l: "[109,113)", r: 10.0, c: 9.2 }, { l: "[113,117)", r: 8.4, c: 7.8 },
      { l: "[117,122)", r: 11.6, c: 11.4 }, { l: "[122,130)", r: 9.7, c: 13.0 },
      { l: "[130,148)", r: 10.5, c: 13.3 }, { l: "≥ 148", r: 0.0, c: 2.5 },
    ],
  },
  {
    name: "AP_VEHICLE_PAYMENT_PROXY_LINE3", csi: 0.466, status: "CRITICAL",
    note: "Max went from 2,511 to 55,903. Mean jumped +37%. Outliers in production not present in training — check capping logic.",
    bins: [
      { l: "< 197", r: 10.0, c: 3.6 }, { l: "[197,241)", r: 10.0, c: 3.4 },
      { l: "[241,281)", r: 10.0, c: 4.3 }, { l: "[281,320)", r: 10.0, c: 5.9 },
      { l: "[320,360)", r: 10.0, c: 7.8 }, { l: "[360,400)", r: 10.0, c: 8.8 },
      { l: "[400,449)", r: 10.0, c: 9.8 }, { l: "[449,509)", r: 10.0, c: 10.8 },
      { l: "[509,606)", r: 10.0, c: 14.2 }, { l: "[606,2511)", r: 10.0, c: 31.2 },
      { l: "≥ 2511", r: 0.0, c: 0.2 },
    ],
  },
  {
    name: "P13_ALL4520", csi: 0.585, status: "CRITICAL",
    note: "Top bin (≥84) grew from 5.5% to 13.4%. Distribution has shifted toward higher credit bureau values.",
    bins: [
      { l: "< 2", r: 0.0, c: 2.1 }, { l: "[2,10.5)", r: 10.2, c: 10.3 },
      { l: "[10.5,19.5)", r: 10.8, c: 11.5 }, { l: "[19.5,27.5)", r: 9.7, c: 8.8 },
      { l: "[27.5,35.5)", r: 10.1, c: 9.2 }, { l: "[35.5,43.5)", r: 9.8, c: 9.4 },
      { l: "[43.5,53.5)", r: 11.9, c: 10.8 }, { l: "[53.5,63.5)", r: 9.6, c: 9.8 },
      { l: "[63.5,73.5)", r: 10.5, c: 8.1 }, { l: "[73.5,83.5)", r: 10.1, c: 9.8 },
      { l: "≥ 84", r: 7.3, c: 10.2 },
    ],
  },
  {
    name: "P13_ALL0448", csi: 0.444, status: "CRITICAL",
    note: "Similar pattern to P13_ALL4520. Credit bureau attribute distribution has shifted toward higher values.",
    bins: [
      { l: "< 10", r: 0.5, c: 2.8 }, { l: "[10,25)", r: 10.5, c: 9.8 },
      { l: "[25,40)", r: 10.8, c: 9.5 }, { l: "[40,55)", r: 11.2, c: 9.2 },
      { l: "[55,65)", r: 10.0, c: 9.8 }, { l: "[65,72)", r: 9.8, c: 10.5 },
      { l: "[72,78)", r: 9.5, c: 10.8 }, { l: "[78,84)", r: 11.5, c: 10.2 },
      { l: "≥ 84", r: 26.2, c: 27.4 },
    ],
  },
  {
    name: "P13_RTR0300", csi: 0.488, status: "CRITICAL",
    note: "Zero rate jumped significantly in production (37% vs ~15% in training). Non-zero distribution also shifted.",
    bins: [
      { l: "= 0", r: 15.2, c: 36.9 }, { l: "(0, 5)", r: 14.8, c: 9.2 },
      { l: "[5, 15)", r: 15.1, c: 10.5 }, { l: "[15, 30)", r: 14.9, c: 11.8 },
      { l: "[30, 50)", r: 15.0, c: 13.2 }, { l: "≥ 50", r: 25.0, c: 18.4 },
    ],
  },
];

const SCORE_BINS = [
  { l: "< 38", r: 0.0, c: 0.0 }, { l: "[38,801)", r: 10.0, c: 14.4 },
  { l: "[801,846)", r: 9.8, c: 10.8 }, { l: "[846,874)", r: 10.0, c: 9.9 },
  { l: "[874,895)", r: 10.0, c: 9.1 }, { l: "[895,912)", r: 9.8, c: 8.3 },
  { l: "[912,928)", r: 10.3, c: 8.3 }, { l: "[928,942)", r: 9.7, c: 8.1 },
  { l: "[942,956)", r: 9.9, c: 8.7 }, { l: "[956,971)", r: 10.0, c: 9.0 },
  { l: "[971,999)", r: 10.5, c: 13.4 }, { l: "≥ 999", r: 0.0, c: 0.0 },
];

const DQ_ISSUES = [
  { feature: "ISSAMEADDRESS", flag: "constant_feature", status: "CRITICAL", note: "100% of rows are 0. Feature is dead in production — possible broken upstream join." },
  { feature: "P13_IQF9416", flag: "zero_rate", status: "WARN", note: "92.2% zeros. Near-constant with sparse signal. No baseline for comparison." },
  { feature: "MEAN_VANTAGE_V4_SCORE", flag: "null_injection", status: "WARN", note: "8.2% missing. Significantly higher than reference. Possible failed JOIN." },
  { feature: "AP_VEHICLE_PAYMENT_PROXY_LINE3", flag: "skewness_flag", status: "WARN", note: "Skewness = 67. Check whether capping is applied correctly in production pipeline." },
  { feature: "LOG_PAY_TO_INCOME_PROXY_SUM_LINE3", flag: "skewness_flag", status: "WARN", note: "Skewness = 26.5. Extreme right tail present." },
];

const CONTRACTS = [
  { feature: "MEAN_VANTAGE_V4_SCORE", rule: "nullable=False", observed: "8.2% null", status: "CRITICAL" },
  { feature: "LOG_PAY_TO_INCOME_PROXY_SUM_LINE3", rule: "nullable=False", observed: "0.1% null", status: "CRITICAL" },
  { feature: "P13_ALL0448", rule: "nullable=False", observed: "2.7% null", status: "CRITICAL" },
  { feature: "P13_ALL4520", rule: "nullable=False", observed: "2.7% null", status: "CRITICAL" },
  { feature: "P13_AUA8320", rule: "nullable=False", observed: "2.7% null", status: "CRITICAL" },
  { feature: "P13_IQA9427", rule: "nullable=False", observed: "2.7% null", status: "CRITICAL" },
  { feature: "P13_RTR0300", rule: "nullable=False", observed: "2.7% null", status: "CRITICAL" },
  { feature: "ZUUL2_SCORE", rule: "dtype: continuous score", observed: "Truncated at 999 (integer)", status: "WARN" },
  { feature: "IS_SUBVENTION", rule: "dtype: numeric rate", observed: "Binary proxy (0/1)", status: "WARN" },
  { feature: "LTV", rule: "cap=0.95", observed: "3.2% capped", status: "OK" },
  { feature: "DOWN_RATIO", rule: "floor=0.0", observed: "0.0% floored", status: "OK" },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function Badge({ status, size = "sm" }) {
  const pad = size === "sm" ? "2px 7px" : "3px 10px";
  const fs = size === "sm" ? 10 : 12;
  return (
    <span style={{
      fontFamily: C.mono, fontSize: fs, fontWeight: 600,
      letterSpacing: "0.08em", padding: pad, borderRadius: 3,
      color: statusColor(status), background: statusBg(status),
      border: `1px solid ${statusBorder(status)}`,
    }}>
      {status}
    </span>
  );
}

function Mono({ children, color, size = 13 }) {
  return <span style={{ fontFamily: C.mono, fontSize: size, color: color || C.text }}>{children}</span>;
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em",
      color: C.textMuted, textTransform: "uppercase", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "20px 0" }} />;
}

// ─── BIN CHART ────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.surfaceHigh, border: `1px solid ${C.borderStrong}`,
      borderRadius: 4, padding: "8px 12px", fontFamily: C.mono, fontSize: 11,
    }}>
      <div style={{ color: C.textSub, marginBottom: 4 }}>{label}</div>
      <div style={{ color: C.baseline }}>Baseline: {payload[0]?.value?.toFixed(1)}%</div>
      <div style={{ color: C.current }}>Current: {payload[1]?.value?.toFixed(1)}%</div>
    </div>
  );
};

function BinChart({ bins }) {
  const data = bins.map(b => ({ name: b.l, Baseline: b.r, Current: b.c }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barGap={1} barCategoryGap="20%">
        <XAxis dataKey="name" tick={{ fontFamily: C.mono, fontSize: 9, fill: C.textSub }}
          tickLine={false} axisLine={{ stroke: C.border }} interval={0} />
        <YAxis tick={{ fontFamily: C.mono, fontSize: 9, fill: C.textSub }}
          tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={32} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
        <Bar dataKey="Baseline" fill={C.baseline} radius={[2, 2, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Current" fill={C.current} radius={[2, 2, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── DRIFT FEATURE CARD ───────────────────────────────────────────────────────

function DriftCard({ feature, autoExpand }) {
  const [open, setOpen] = useState(autoExpand);
  const col = statusColor(feature.status);
  const bg = statusBg(feature.status);
  const bdr = statusBorder(feature.status);

  return (
    <div style={{
      border: `1px solid ${open ? bdr : C.border}`,
      borderRadius: 6, marginBottom: 8, overflow: "hidden",
      background: open ? bg : "transparent",
      transition: "all 0.15s ease",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", cursor: "pointer",
          borderBottom: open ? `1px solid ${bdr}` : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: col, marginRight: 2 }}>
            {open ? "▼" : "►"}
          </span>
          <Mono size={12} color={C.text}>{feature.name}</Mono>
          <Badge status={feature.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: col, fontWeight: 600 }}>
            CSI {feature.csi.toFixed(3)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.baseline, display: "inline-block" }} />
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textSub }}>Baseline</span>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.current, display: "inline-block", marginLeft: 4 }} />
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textSub }}>Current</span>
          </div>
        </div>
      </div>

      {open && (
        <div style={{ padding: "12px 14px" }}>
          <div style={{
            fontFamily: C.sans, fontSize: 12, color: C.textSub, lineHeight: 1.6,
            marginBottom: 12, borderLeft: `2px solid ${col}`, paddingLeft: 10,
          }}>
            {feature.note}
          </div>
          <BinChart bins={feature.bins} />
        </div>
      )}
    </div>
  );
}

// ─── OVERVIEW BAR ─────────────────────────────────────────────────────────────

function CsiOverviewBar() {
  const sorted = [...DRIFTED].sort((a, b) => b.csi - a.csi);
  const max = sorted[0].csi;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, width: 200 }}>FEATURE</span>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, flex: 1 }}>CSI VALUE</span>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, width: 50, textAlign: "right" }}>CSI</span>
      </div>
      {sorted.map(f => {
        const col = statusColor(f.status);
        const pct = (f.csi / max) * 100;
        return (
          <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <Mono size={10} color={C.textSub}>{f.name}</Mono>
            <div style={{ flex: 1, height: 16, background: C.surface, borderRadius: 2, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${pct}%`, background: col, opacity: 0.8, borderRadius: 2,
                transition: "width 0.5s ease",
              }} />
              {/* WARN threshold line at 0.25/max */}
              <div style={{
                position: "absolute", left: `${(0.25 / max) * 100}%`,
                top: 0, bottom: 0, width: 1, background: C.warn, opacity: 0.5,
              }} />
            </div>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: col, width: 44, textAlign: "right", fontWeight: 600 }}>
              {f.csi.toFixed(3)}
            </span>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <div style={{ width: 1, height: 12, background: C.warn, opacity: 0.6 }} />
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted }}>WARN threshold (0.25)</span>
      </div>
    </div>
  );
}

// ─── SCORE HEALTH ─────────────────────────────────────────────────────────────

function ScoreHealth() {
  const data = SCORE_BINS.map(b => ({ name: b.l, Baseline: b.r, Current: b.c }));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <Mono size={22} color={C.ok}>0.037</Mono>
        <span style={{ fontFamily: C.sans, fontSize: 12, color: C.textSub }}>PSI — score distribution is stable</span>
        <Badge status="OK" />
      </div>
      <div style={{ fontFamily: C.sans, fontSize: 12, color: C.textSub, marginBottom: 12, lineHeight: 1.6 }}>
        ZUUL2_SCORE is holding well despite significant feature drift. The [38, 801) and [971, 999) bins show slight overrepresentation in production,
        but overall PSI is well below threshold. Note: score is integer-truncated at 999 in Dynatrace — a known pipeline limitation.
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barGap={1} barCategoryGap="20%">
          <XAxis dataKey="name" tick={{ fontFamily: C.mono, fontSize: 8, fill: C.textSub }}
            tickLine={false} axisLine={{ stroke: C.border }} interval={0} />
          <YAxis tick={{ fontFamily: C.mono, fontSize: 9, fill: C.textSub }}
            tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} width={32} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="Baseline" fill={C.baseline} radius={[2, 2, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Current" fill={C.current} radius={[2, 2, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── DQ TAB ───────────────────────────────────────────────────────────────────

function DQTab() {
  return (
    <div>
      <SectionLabel>Data Quality Issues — {DQ_ISSUES.length} flagged</SectionLabel>
      {DQ_ISSUES.map(d => (
        <div key={d.feature} style={{
          padding: "12px 14px", marginBottom: 8, borderRadius: 6,
          border: `1px solid ${statusBorder(d.status)}`,
          background: statusBg(d.status),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Badge status={d.status} />
            <Mono size={12} color={C.text}>{d.feature}</Mono>
            <span style={{
              fontFamily: C.mono, fontSize: 10, color: C.textSub,
              background: C.surface, padding: "1px 6px", borderRadius: 3,
              border: `1px solid ${C.border}`,
            }}>{d.flag}</span>
          </div>
          <p style={{ fontFamily: C.sans, fontSize: 12, color: C.textSub, margin: 0, lineHeight: 1.6 }}>
            {d.note}
          </p>
        </div>
      ))}

      <Divider />
      <SectionLabel>DQ Heatmap — capping · flooring · missing · zero rates</SectionLabel>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: C.mono, fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.borderStrong}` }}>
              {["Feature", "Capping %", "Flooring %", "Missing %", "Zero %"].map(h => (
                <th key={h} style={{ padding: "6px 10px", color: C.textSub, fontWeight: 500, textAlign: "left", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { f: "MEAN_VANTAGE_V4_SCORE", cap: 0.03, floor: 0.0, miss: 8.17, zero: 0.0 },
              { f: "P13_ALL0448", cap: 3.33, floor: 27.07, miss: 2.74, zero: 27.07 },
              { f: "P13_RTR0300", cap: 3.33, floor: 36.86, miss: 2.74, zero: 36.86 },
              { f: "P13_IQF9416", cap: 0.0, floor: 92.20, miss: 2.74, zero: 92.20 },
              { f: "P13_IQA9427", cap: 0.10, floor: 6.64, miss: 2.74, zero: 6.64 },
              { f: "P13_AUA8320", cap: 3.33, floor: 0.12, miss: 2.74, zero: 0.0 },
              { f: "VEHICLE_TYPE_N", cap: 55.03, floor: 44.97, miss: 0.0, zero: 44.97 },
              { f: "VANTAGE_V4_SCORE_MISSING", cap: 16.17, floor: 83.83, miss: 0.0, zero: 83.83 },
              { f: "P13_BCX5420_99", cap: 15.07, floor: 84.93, miss: 0.0, zero: 84.93 },
              { f: "MTF0300_GT0", cap: 25.93, floor: 74.07, miss: 0.0, zero: 74.07 },
            ].map(row => {
              const cellColor = (v) => {
                if (v >= 50) return C.critical;
                if (v >= 15) return C.warn;
                if (v >= 5) return "#e8e066";
                return C.textSub;
              };
              const cellBg = (v) => {
                if (v >= 50) return "rgba(240,79,79,0.12)";
                if (v >= 15) return "rgba(232,150,42,0.10)";
                if (v >= 5) return "rgba(232,224,102,0.06)";
                return "transparent";
              };
              return (
                <tr key={row.f} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "6px 10px", color: C.text }}>{row.f}</td>
                  {[row.cap, row.floor, row.miss, row.zero].map((v, i) => (
                    <td key={i} style={{
                      padding: "6px 10px", textAlign: "left",
                      color: cellColor(v), background: cellBg(v), fontWeight: v > 15 ? 600 : 400,
                    }}>
                      {v > 0 ? `${v.toFixed(2)}%` : "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CONTRACTS TAB ────────────────────────────────────────────────────────────

function ContractsTab() {
  const critical = CONTRACTS.filter(c => c.status === "CRITICAL");
  const warn = CONTRACTS.filter(c => c.status === "WARN");
  const ok = CONTRACTS.filter(c => c.status === "OK");

  const Section = ({ items, label }) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>{label}</SectionLabel>
        {items.map(c => (
          <div key={c.feature} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto",
            alignItems: "center", gap: 12,
            padding: "10px 14px", marginBottom: 4, borderRadius: 4,
            border: `1px solid ${statusBorder(c.status)}`,
            background: statusBg(c.status),
          }}>
            <Mono size={11} color={C.text}>{c.feature}</Mono>
            <Mono size={10} color={C.textSub}>{c.rule}</Mono>
            <Mono size={10} color={statusColor(c.status)}>{c.observed}</Mono>
            <Badge status={c.status} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{
        padding: "10px 14px", marginBottom: 20, borderRadius: 6,
        border: `1px solid ${C.border}`, background: C.surfaceHigh,
        fontFamily: C.sans, fontSize: 12, color: C.textSub, lineHeight: 1.7,
      }}>
        Feature contracts are defined in <Mono size={11} color={C.info}>configs/zuul2_rtl_subprime.yaml</Mono>.
        Every column with a rule is evaluated here — passing and failing. Violations indicate the production
        pipeline is not respecting the feature engineering contract established at training time.
      </div>
      <Section items={critical} label={`Critical violations — ${critical.length}`} />
      <Section items={warn} label={`Warnings — ${warn.length}`} />
      <Section items={ok} label={`Passing — ${ok.length}`} />
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header() {
  const psiColor = RUN.scorePsi < 0.1 ? C.ok : RUN.scorePsi < 0.25 ? C.warn : C.critical;
  const rowDelta = ((RUN.rowsCur - RUN.rowsRef) / RUN.rowsRef * 100).toFixed(1);
  const fmt = n => n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n;

  const Stat = ({ label, value, color, sub }) => (
    <div style={{ padding: "12px 16px", borderRight: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 18, fontWeight: 700, color: color || C.text }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textSub, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textMuted }}>mandos monitor</span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textSub }}>
          {RUN.model} / {RUN.submodel}
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.textMuted }}>snapshot: {RUN.snapshot}</span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr",
        border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden",
        background: C.surface,
      }}>
        <div style={{
          padding: "12px 20px", background: statusBg(RUN.status),
          borderRight: `1px solid ${statusBorder(RUN.status)}`,
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start",
        }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted, letterSpacing: "0.1em", marginBottom: 6 }}>STATUS</div>
          <div style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 700, color: statusColor(RUN.status) }}>
            {RUN.status}
          </div>
        </div>
        <Stat label="FEATURES" value={RUN.featuresMonitored} sub={`${RUN.featuresDrifted} drifted`} />
        <Stat label="DQ ISSUES" value={RUN.dqIssues} color={RUN.dqIssues > 0 ? C.warn : C.ok} />
        <Stat label="DRIFT ISSUES" value={RUN.driftIssues} color={RUN.driftIssues > 0 ? C.critical : C.ok} />
        <Stat label="SCORE PSI" value={RUN.scorePsi.toFixed(3)} color={psiColor} sub="stable" />
        <Stat
          label="ROW COUNT"
          value={`${fmt(RUN.rowsRef)} → ${fmt(RUN.rowsCur)}`}
          color={C.warn}
          sub={`${rowDelta}% — check JOIN fanout`}
        />
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        {[
          { label: "Schema", value: "No changes", ok: true },
          { label: "Gate failures", value: "0", ok: true },
          { label: "NULL injection", value: "MEAN_VANTAGE_V4_SCORE", ok: false },
          { label: "Baseline ID", value: "444835ac-0f7a-4e3a-9968-27cd5277091a", ok: null },
        ].map(t => (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textMuted }}>{t.label}:</span>
            <span style={{
              fontFamily: C.mono, fontSize: 10,
              color: t.ok === true ? C.ok : t.ok === false ? C.warn : C.textSub,
            }}>
              {t.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = ["Drift Analysis", "Score Health", "Data Quality", "Contracts"];

function Tab({ label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", cursor: "pointer", border: "none", outline: "none",
        background: active ? C.surfaceHigh : "transparent",
        borderBottom: active ? `2px solid ${C.info}` : "2px solid transparent",
        fontFamily: C.mono, fontSize: 11,
        color: active ? C.text : C.textSub,
        fontWeight: active ? 600 : 400,
        display: "flex", alignItems: "center", gap: 6, transition: "all 0.1s",
      }}
    >
      {label}
      {badge && (
        <span style={{
          background: badge === "CRITICAL" ? C.criticalBg : C.warnBg,
          color: badge === "CRITICAL" ? C.critical : C.warn,
          border: `1px solid ${badge === "CRITICAL" ? C.criticalBorder : C.warnBorder}`,
          fontSize: 9, padding: "0 5px", borderRadius: 10, fontWeight: 700,
        }}>{badge}</span>
      )}
    </button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function MandosResult() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3138; border-radius: 2px; }
      `}</style>

      <div style={{
        background: C.bg, minHeight: "100vh", padding: "24px",
        fontFamily: C.sans, color: C.text,
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{
              fontFamily: C.mono, fontSize: 14, fontWeight: 600, letterSpacing: "0.05em",
              color: C.text, borderLeft: `3px solid ${C.info}`, paddingLeft: 8,
            }}>
              mandos
            </span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textMuted }}>1.0.0</span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.textMuted, marginLeft: "auto" }}>
              2026-03-28 14:09:52
            </span>
          </div>

          <Header />

          {/* Tab Bar */}
          <div style={{
            display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 20,
          }}>
            {TABS.map((t, i) => (
              <Tab key={t} label={t} active={activeTab === i} onClick={() => setActiveTab(i)}
                badge={i === 0 ? "CRITICAL" : i === 2 ? "WARN" : i === 3 ? "CRITICAL" : null}
              />
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div>
              <SectionLabel>Drift Overview — 9 features drifted · sorted by CSI</SectionLabel>
              <CsiOverviewBar />
              <Divider />
              <SectionLabel>Feature Detail — top 2 expanded · click to expand others</SectionLabel>
              {DRIFTED.map((f, i) => (
                <DriftCard key={f.name} feature={f} autoExpand={i < 2} />
              ))}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <SectionLabel>Score Distribution — ZUUL2_SCORE</SectionLabel>
              <ScoreHealth />
            </div>
          )}

          {activeTab === 2 && <DQTab />}
          {activeTab === 3 && <ContractsTab />}

          {/* Footer */}
          <div style={{
            marginTop: 32, paddingTop: 16, borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              {["Export PDF", "Export HTML", "result.issues()"].map(a => (
                <button key={a} style={{
                  fontFamily: C.mono, fontSize: 10, color: C.textSub,
                  background: C.surface, border: `1px solid ${C.border}`,
                  padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                }}>
                  {a}
                </button>
              ))}
            </div>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.textMuted }}>
              507 metrics · 224,257 rows · 16.0s
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
