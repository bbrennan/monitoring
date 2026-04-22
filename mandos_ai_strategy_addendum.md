# Mandos-AI Strategy Addendum

## 1. Purpose

This addendum sharpens the product intent behind Mandos-AI.

Mandos-AI is not only a conversational wrapper around Mandos. It is intended to lift Mandos in three important ways:

1. **Natural language discussions**
2. **Reporting**
3. **Triage and noise reduction**

The goal is to make Mandos more approachable, more useful, and more actionable without weakening Mandos’ deterministic core.

---

## 2. Product Thesis

Mandos already computes the facts.

Mandos-AI should make those facts easier to:
- discover
- discuss
- interpret
- prioritize
- export
- communicate

A good summary is:

**Mandos computes truth. Mandos-AI improves access, interpretation, and action.**

---

## 3. Lift #1 — Natural Language Discussions

## Why this matters

Many users are not blocked by a lack of metrics. They are blocked by:
- not knowing what Mandos can do
- not knowing which API to call
- not knowing what question to ask first
- not knowing how to interpret the output

Mandos-AI should address that gap directly.

## Desired user experience

A user should be able to say:
- “I loaded this table. What should I do first?”
- “Does this look like a profiling problem or a comparison problem?”
- “What stands out most?”
- “Why are you focusing on this segment?”
- “Show me only the critical issues.”
- “Turn what we just did into a notebook.”

The user should not need to know:
- which Mandos object to instantiate
- which method to call first
- which parameters are required in every case
- how to manually combine results into a narrative

## Product implication

Mandos-AI should behave like a conversational analyst that:
- helps users refine their goals
- guides them through a standard workflow
- reasons over structured Mandos outputs
- answers follow-up questions in natural language
- converts successful exploration into reusable artifacts

---

## 4. Lift #2 — Reporting

## Why this matters

Mandos currently provides a strict reporting path. That is valuable for consistency, but it assumes:
- all users want the same report
- all audiences want the same level of detail
- all model types and use cases can fit one reporting pattern

Mandos-AI should make reporting more flexible without making it chaotic.

## Reporting vision

Mandos-AI should support two report paths.

### A. Standard Mandos report
This is the default and most supportable path.

Use cases:
- “Generate the standard monitoring report”
- “Create the normal PDF for this run”
- “Give me the default report for validation”

Benefits:
- consistent
- easy to support
- easy to explain
- aligned with existing Mandos outputs

### B. Custom guided report
This is an advanced path.

Use cases:
- “Make a leadership summary with only the top three issues”
- “Create a lighter report for engineering triage”
- “Build a comparison report with extra visuals”
- “Generate a customized PDF for this model review”

Benefits:
- adapts to audience
- can emphasize story over raw metric volume
- can combine standard Mandos findings with selected visuals and commentary

## Reporting design rule

Custom reports should still be grounded in Mandos outputs.

Mandos-AI may decide:
- what to highlight
- what to hide
- how to phrase the findings
- what visuals to include

But it should not invent unsupported findings.

---

## 5. Lift #3 — Triage and Noise Reduction

## Why this matters

Threshold-driven systems are useful, but they create alert fatigue.

Common problems:
- too many breaches at once
- duplicate or highly related issues
- low-priority breaches mixed with critical failures
- users do not know where to start
- flat issue lists do not tell a coherent story

This is not unique to Mandos. It is a common pain point in data quality and monitoring tools.

## Mandos-AI opportunity

Mandos-AI should add a triage layer that reasons over structured Mandos outputs and helps answer:

- Which findings actually matter?
- Which findings are likely symptoms of the same root cause?
- Which issues should be ignored for now?
- Which segment or feature is the most useful next place to investigate?
- Does this look like noise, a setup issue, a pipeline issue, drift, or real model degradation?

## Triage principles

### A. Group related findings
Examples:
- row count drop + missingness spike + unseen category levels may point to one upstream data issue
- multiple feature-level threshold breaches in the same segment may be one segment-specific failure story

### B. Rank by impact, not count
Mandos-AI should emphasize:
- severity
- breadth of impact
- concentration in critical segments
- relevance to model behavior
- confidence in the diagnosis

### C. Reduce duplicate noise
Mandos-AI should avoid repeating the same issue in multiple phrasings when one summary can cover it.

### D. Explain uncertainty honestly
Sometimes the correct answer is:
- “I see evidence of a problem, but I cannot yet distinguish between schema drift and upstream missing-value corruption.”
- “The signal is weak and may be noise unless it persists across future runs.”

That is better than overconfident explanations.

## Triage output style

Mandos-AI should ideally summarize findings in a format like:

### What matters most
1. High-confidence likely root cause
2. High-severity consequence
3. Best next check

### What can wait
- lower-confidence warnings
- small-sample anomalies
- weak segment effects
- cosmetic/reporting issues

That is much more useful than dumping twenty threshold breaches.

---

## 6. Reasonable Assumptions

Mandos-AI should explicitly assume the following unless the user overrides them.

### Data assumptions
- Data is table-like and column-oriented.
- Users typically work with one primary dataset and optionally one comparison dataset.
- Model monitoring datasets may include prediction, target, timestamp, and segment columns, but not all are required for every workflow.
- Snowflake is the main remote execution path.
- Pandas is the main local execution path.
- Full raw data may remain remote, while summaries and report-ready outputs are materialized locally.

### Output assumptions
- Mandos outputs are known and structured.
- Mandos can return summaries, issues, reports, and other deterministic artifacts in a form the AI layer can consume.
- The AI layer is not responsible for inventing core metrics or statuses.
- The AI layer should reason primarily over structured Mandos outputs, not unbounded raw data inspection.

---

## 7. Recommended Python Library Stack

Mandos-AI should minimize custom code by leaning on strong existing libraries.

### Configuration, schemas, and structured payloads
- **Pydantic**
  - config validation
  - tool payload validation
  - session state models
  - typed result envelopes

### Dataframe schema validation
- **Pandera**
  - dataframe contracts
  - dtype/nullability checks
  - dataframe-level validation
  - useful when validating Pandas-first flows or contract logic

### Table comparison
- **DataComPy**
  - human-readable table differences
  - especially useful for baseline vs current or old vs new table workflows

### Profiling and statistical helpers
- **ydata-profiling**
  - profile-style exploratory summaries when helpful
- **NumPy / SciPy**
  - robust statistics and tests
- **Pandas**
  - local execution and lightweight result shaping

### Visualization
- **Mandos visualization layer first**
- **Matplotlib** as dependable base plotting library
- **Seaborn** selectively where it genuinely improves the chart and does not overcomplicate the output

### Reporting
- **ReportLab**
  - PDF layout and deterministic report generation
- **Jinja2**
  - optional templating for markdown, HTML, or report fragments

### Optional helper ecosystem
- **Evidently**
  - useful selectively for additional monitoring or visualization patterns
  - should remain secondary to Mandos where Mandos already has the deterministic truth

## Design rule

Use third-party libraries to reduce boilerplate, not to surrender the product identity.

Mandos should remain the source of truth.
Mandos-AI should remain the orchestration, reasoning, and communication layer.

---

## 8. Suggested Product Language

If you need a concise way to explain the value of Mandos-AI internally, use something like:

> Mandos-AI turns Mandos from a powerful API into a conversational analyst experience. It helps users talk through uncertainty, generates better reports for different audiences, and reduces noise by prioritizing what actually matters.

A shorter version:

> Mandos computes the facts. Mandos-AI helps users ask better questions, understand the results, and act on them.

---

## 9. Summary

The three highest-value lifts are:

1. **Natural language discussions**
   - lower the barrier to entry
   - let users explore without API expertise

2. **Reporting**
   - make standard reports easier
   - enable better custom reports

3. **Triage and noise reduction**
   - reduce alert fatigue
   - surface what matters first

These should be treated as core product goals, not nice-to-have features.
