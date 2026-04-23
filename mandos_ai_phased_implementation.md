# Mandos-AI Phased Implementation Plan

## Purpose

This document outlines a phased implementation plan for **Mandos-AI**: a custom GitHub Copilot agent and supporting tool layer that enables natural language exploration, reasoning, reporting, and workflow generation on top of the Mandos library.

This roadmap is intentionally **stepwise and demo-driven**. Each phase should produce something that can be shown to users, stakeholders, or contributors, even if the full vision is not yet complete.

This document assumes:
- **GPT-4.1** will perform most, if not all, of the development work.
- The implementation will be iterative.
- The details of Mandos internals will be learned by the model from the codebase, tests, documentation, and usage examples rather than being exhaustively specified here.
- Mandos already exists as the deterministic engine of truth.
- Mandos-AI should enhance Mandos, not replace it.

---

## North Star

Mandos-AI should allow a user inside **GitHub Copilot Chat in VS Code** to:

1. work in natural language rather than memorizing the Mandos API,
2. load data from Snowflake or local Pandas workflows,
3. run Mandos operations through a guided conversational flow,
4. receive concise, intelligent reasoning over Mandos outputs,
5. reduce noise and triage findings more intelligently,
6. generate reproducible scripts or notebooks from successful explorations,
7. generate standard or custom reports from Mandos results.

---

## Guiding Principles

- **Mandos computes truth; Mandos-AI interprets and guides.**
- **Natural language first, code export second.**
- **Strong demos at every milestone.**
- **Use best-in-class Python libraries before writing custom infrastructure.**
- **Prefer narrow, reliable tool surfaces over broad autonomous behavior.**
- **Never dump raw stack traces or opaque logs to end users.**
- **Error handling must be conversational, actionable, and calm.**
- **Keep the MVP inside VS Code + GitHub Copilot Chat.**

---

## Out of Scope for Early Phases

The following are explicitly out of scope for early implementation unless they become necessary:
- full autonomous multi-agent orchestration,
- a standalone web application,
- broad cloud-hosted orchestration,
- a general-purpose SQL assistant,
- deep customization of every possible Mandos internal behavior,
- support for every possible storage backend from day one.

---

## Assumptions

Reasonable working assumptions for implementation:

- Mandos already provides stable, well-structured outputs for profiling, comparison, monitoring, inspection, issue extraction, and reporting.
- Mandos outputs are sufficiently structured to support downstream reasoning.
- Users primarily work in one of two modes:
  - **Snowflake-backed analysis**, using credentials or environment configuration,
  - **local Pandas-based analysis**, using DataFrames or local files.
- Users will interact through **Copilot Chat in VS Code**, not a separate front-end initially.
- Some users will want interactive exploration only; others will want exportable code, notebooks, and PDF reports.
- Most early users will accept a guided workflow as long as it is helpful, fast, and reproducible.

---

## Recommended Primary Deliverable

The core implementation target should be:

- a custom Copilot agent file at:

```text
.github/agents/mandos-analyst.agent.md
```

paired with:

- a Mandos-AI Python package,
- a small Mandos-AI tool layer,
- and eventually an MCP server or equivalent structured tool interface.

---

# Phase Plan

## Phase 1 — Foundation, Repo Setup, and Mandos Discovery

### Goal
Create the implementation repository, install Mandos, and let GPT-4.1 learn what Mandos offers by reading the codebase, docs, tests, notebooks, and examples.

### Primary outcomes
- Repo scaffold exists.
- Development environment works.
- Mandos is installable and callable.
- GPT-4.1 has enough understanding of Mandos to propose a clean integration strategy.
- Early inventory of Mandos capabilities is documented.

### Suggested work
- Create the Mandos-AI repository structure.
- Configure Python environment, formatting, linting, and test setup.
- Install Mandos into the environment.
- Add minimal docs on how to run local development.
- Point GPT-4.1 at the Mandos codebase and ask it to:
  - inventory public APIs,
  - identify likely entry points,
  - identify report-generation hooks,
  - identify how errors are currently surfaced,
  - identify where outputs are already structured well for reasoning.
- Produce a short discovery document summarizing how Mandos is best integrated.

### Demo milestone
**Demo 1: “Mandos-AI Repo + Mandos Capability Discovery”**
- Show that the repo is configured.
- Show that Mandos installs successfully.
- Show a short generated summary of what Mandos already offers.
- Show example calls that Mandos-AI is likely to wrap first.

### Exit criteria
- Repo is ready for iterative development.
- Mandos can be imported and used.
- A short “Mandos capability inventory” document exists.
- GPT-4.1 has enough context to continue implementation productively.

---

## Phase 2 — Small Copilot Agent MVP

### Goal
Create a minimal custom Copilot agent that lives in VS Code and can guide users through a basic Mandos workflow.

### Primary outcomes
- `.github/agents/mandos-analyst.agent.md` exists.
- The agent has strong instructions.
- The agent can operate in Copilot Chat.
- The agent understands the startup flow:
  - Snowflake credentials/config or
  - local Pandas workflow.

### Suggested work
- Create the custom Copilot agent file.
- Define the basic agent persona:
  - conversational analyst on top of Mandos,
  - grounded in Mandos outputs,
  - never dumps raw logs,
  - asks clarifying questions only when needed.
- Add explicit startup behavior:
  - look for Snowflake env vars or known config,
  - if not available, ask whether the user wants local Pandas analysis,
  - explain next steps in plain language.
- Initially allow the agent to leverage built-in Copilot tools where available:
  - file reading,
  - codebase search,
  - terminal/command execution.
- Keep the first version narrow and safe.

### Demo milestone
**Demo 2: “Hello, I am Mandos-AI”**
- User opens Copilot Chat.
- User selects or invokes Mandos-AI.
- Mandos-AI explains what it can do.
- Mandos-AI asks whether the user is working via Snowflake or locally.
- Mandos-AI can explain, in natural language, how Mandos is typically used for profile / compare / monitor workflows.

### Exit criteria
- Custom agent file exists and is usable.
- Startup handshake works conceptually in chat.
- The interaction feels different from raw Copilot.

---

## Phase 3 — Tool-Backed Execution for Basic Exploration

### Goal
Move from “helpful chat” to “chat that can actually run Mandos work.”

### Primary outcomes
- Mandos-AI can execute a narrow set of Mandos actions.
- Users can ask Mandos-AI to run analysis rather than merely generate code.
- Early session state is preserved across a short conversation.

### Suggested work
- Build a thin Mandos-AI tool layer around a very small number of actions, such as:
  - load local data,
  - connect to Snowflake if configured,
  - run `profile()`,
  - run `compare()`,
  - run `monitor()`.
- Return structured summaries to the agent instead of raw outputs.
- Track minimal session state:
  - current dataset,
  - optional comparison dataset,
  - last action,
  - last result summary.
- Ensure the agent reports findings naturally.

### Demo milestone
**Demo 3: “Run Profile from Copilot Chat”**
- User asks Mandos-AI to profile a table or dataframe.
- Mandos-AI runs the analysis.
- Mandos-AI summarizes the important findings directly in chat.
- User asks a follow-up question and Mandos-AI answers based on the prior result.

### Exit criteria
- Mandos-AI can run at least one Mandos workflow end-to-end from Copilot Chat.
- Results come back in useful natural language.
- Basic session continuity exists.

---

## Phase 4 — Guided EDA / DQ / Monitoring Workflow

### Goal
Create the first truly useful end-user experience: a guided analysis flow that helps the user decide what to do, not just execute commands.

### Primary outcomes
- Mandos-AI behaves like a session-based analyst.
- The user can “talk it out.”
- Mandos-AI can guide profile vs compare vs monitor decisions without feeling like a router.

### Suggested work
- Add a workflow layer that guides the user through common intents:
  - “I want to understand this dataset.”
  - “I want to compare this to another table.”
  - “I want to evaluate model health.”
  - “I am not sure what I want yet.”
- Add stronger conversational summaries over Mandos outputs.
- Teach Mandos-AI to ask thoughtful follow-up questions when needed.
- Avoid over-asking; prefer progress over interrogation.

### Demo milestone
**Demo 4: “Talk It Out”**
- User starts with a vague goal.
- Mandos-AI helps them converge on the right analysis path.
- Mandos-AI runs the analysis.
- Mandos-AI summarizes what matters and suggests next steps.

### Exit criteria
- User can begin from ambiguity.
- Mandos-AI feels like a workflow guide, not just a command wrapper.
- A full chat-based EDA / DQ / monitoring journey is demoable.

---

## Phase 5 — Strong Natural Language Error Handling

### Goal
Make Mandos-AI resilient and helpful when things go wrong.

### Primary outcomes
- Errors are translated into useful natural language.
- The user is not shown raw stack traces or unhelpful logs.
- Mandos-AI can suggest fixes, request clarification, or repair obvious issues itself.

### Suggested work
- Build an error interpretation layer around common failure modes:
  - missing credentials,
  - missing table,
  - bad schema assumptions,
  - invalid column names,
  - key or index errors,
  - failed comparisons due to missing join keys,
  - report generation failures,
  - unsupported data types.
- Define user-facing error response templates that remain natural and calm.
- Teach Mandos-AI to distinguish:
  - user mistake,
  - environment/config issue,
  - Mandos limitation,
  - likely code bug.
- Let Mandos-AI propose corrective action before asking the user to manually inspect internals.

### Demo milestone
**Demo 5: “Useful Failure Handling”**
- Intentionally trigger a few common problems.
- Mandos-AI explains what likely happened.
- Mandos-AI suggests a fix or asks for a specific missing input.
- No raw logs are shown to the user.

### Exit criteria
- Error handling feels product-quality.
- Common failures are understandable without developer debugging.
- Mandos-AI speaks to the user directly.

---

## Phase 6 — Natural Language Q&A Over Results

### Goal
Allow users to ask follow-up questions about data and Mandos results naturally.

### Primary outcomes
- Mandos-AI can answer questions based on session history and prior outputs.
- Users do not need to manually read every table, chart, or metric.
- Results become more accessible to non-experts.

### Suggested work
- Expand session state to include:
  - prior result summaries,
  - structured issue objects,
  - recent report metadata,
  - selected segments or filters.
- Teach Mandos-AI to answer questions like:
  - “What are the top issues?”
  - “Why do you think this is happening?”
  - “Which segment is worst?”
  - “Is this likely data quality or model drift?”
  - “What changed most from baseline?”
- Ground answers in Mandos outputs.

### Demo milestone
**Demo 6: “Ask Follow-Up Questions Naturally”**
- Run profile / compare / monitor.
- Ask several natural-language follow-ups.
- Mandos-AI answers using prior structured results.

### Exit criteria
- Q&A over results is genuinely useful.
- Mandos-AI is reducing the need for direct API fluency.

---

## Phase 7 — Script and Notebook Export

### Goal
Let users convert a successful exploratory session into reproducible code artifacts.

### Primary outcomes
- Mandos-AI can generate a Python script.
- Mandos-AI can generate a notebook.
- The generated artifact reflects the workflow the user already explored in chat.

### Suggested work
- Build export functions for:
  - `generate_script_from_session()`
  - `generate_notebook_from_session()`
- Make outputs clean, reproducible, and easy to edit.
- Include comments where helpful, but do not over-annotate.
- Ensure generated code matches actual Mandos usage patterns.

### Demo milestone
**Demo 7: “Now Give Me the Notebook”**
- User explores in chat.
- User asks for a notebook or script.
- Mandos-AI creates a reproducible artifact in the workspace.

### Exit criteria
- Exported code is accurate and useful.
- Users can move from exploration to productionized usage smoothly.

---

## Phase 8 — Standard PDF Reporting

### Goal
Allow users to request a standard Mandos report directly from chat.

### Primary outcomes
- Mandos-AI can trigger a standard PDF report flow.
- Users can request a report without knowing the Mandos reporting API.
- Reporting works as a natural extension of analysis.

### Suggested work
- Integrate the standard Mandos reporting path.
- Provide clean report-generation prompts in chat.
- Return a friendly summary when the report completes.
- Support saving the report to a predictable workspace path.

### Demo milestone
**Demo 8: “Generate the Standard Report”**
- User asks Mandos-AI to create a report.
- Mandos-AI generates the standard report.
- Mandos-AI explains what was created and where it lives.

### Exit criteria
- Report generation is accessible in natural language.
- Standard report flow is stable.

---

## Phase 9 — Custom Reporting and Visualization

### Goal
Move beyond the one-size-fits-all report by allowing custom report and visualization generation.

### Primary outcomes
- Mandos-AI can reason about what custom report content would be useful.
- Users can ask for custom plots, sections, or reporting angles.
- Mandos-AI can combine Mandos outputs with approved visualization/reporting libraries.

### Suggested work
- Add support for custom reporting workflows using tools such as:
  - ReportLab,
  - Matplotlib,
  - Seaborn,
  - Mandos visualization utilities.
- Constrain the customization surface so reports remain reliable and interpretable.
- Prefer code-generated custom reports at first if direct execution is too broad.

### Demo milestone
**Demo 9: “Create a Custom Report for This Problem”**
- User asks for a more targeted report.
- Mandos-AI proposes a report shape.
- Mandos-AI generates the report or generates the code to produce it.

### Exit criteria
- Users can go beyond the strict default report template.
- Reporting becomes a clear product differentiator.

---

## Phase 10 — Triage, Prioritization, and Noise Reduction

### Goal
Lift Mandos beyond threshold-only alerting by helping users focus on what truly matters.

### Primary outcomes
- Mandos-AI can summarize, rank, and group findings.
- Users are less overwhelmed by raw issue counts.
- Alert fatigue is reduced through reasoning over structured findings.

### Suggested work
- Create a triage layer that reasons over known Mandos outputs.
- Add prioritization concepts such as:
  - severity,
  - breadth of impact,
  - concentration in critical segments,
  - persistence across checks,
  - evidence of likely root cause,
  - business importance if known.
- Group related issues into a smaller number of themes.
- Prefer explanations like:
  - “These 8 flags appear to be one upstream schema issue.”
  - “This is a low-priority distribution shift with no matching performance degradation.”

### Demo milestone
**Demo 10: “Tell Me What Actually Matters”**
- Mandos produces many flagged results.
- Mandos-AI groups, ranks, and explains them.
- User sees a smaller set of prioritized themes instead of raw alert spam.

### Exit criteria
- Triage is materially helpful.
- Noise reduction feels like a meaningful product leap.

---

## Phase 11 — Hardening, Testing, and Beta Readiness

### Goal
Stabilize Mandos-AI for broader internal use.

### Primary outcomes
- Key workflows are tested.
- Failure handling is robust.
- Prompt/instruction quality is improved.
- The product is ready for a broader beta.

### Suggested work
- Add tests around:
  - session state,
  - structured tool outputs,
  - export generation,
  - error interpretation,
  - report flows.
- Curate example conversations.
- Improve agent instructions based on real user questions.
- Reduce brittleness.
- Validate performance and developer ergonomics.

### Demo milestone
**Demo 11: “Beta Walkthrough”**
- Run end-to-end scenarios with realistic users.
- Show exploration, Q&A, export, reporting, and triage.

### Exit criteria
- Mandos-AI is stable enough for wider pilot adoption.
- Documentation exists for first users.
- Common workflows feel trustworthy.

---

# Cross-Cutting Workstreams

These should run throughout multiple phases rather than being deferred entirely.

## A. Prompt and instruction quality
Mandos-AI will live or die by instruction quality. The custom agent instructions should be iterated carefully and tested against real questions.

## B. Natural-language UX
The agent should always sound calm, direct, and helpful. It should avoid jargon where possible and avoid ever sounding like a stack trace.

## C. Structured outputs
Mandos-AI will be strongest when Mandos outputs are converted into stable, structured objects that support reasoning and conversation.

## D. Safety and boundaries
Mandos-AI should know when to:
- ask for clarification,
- propose a fix,
- generate code instead of running it,
- or refuse to guess.

## E. Demo quality
Every phase should have a showable story. This is not just an engineering roadmap; it is a product roadmap.

---

# Suggested Library Strategy

Prefer existing, trusted Python libraries wherever practical:

- **Pydantic** for structured state, configuration, and tool contracts
- **Pandas** for local workflows
- **Snowflake connector / existing Mandos integrations** for Snowflake workflows
- **ReportLab** for formal PDF output
- **Matplotlib / Seaborn** for custom charts when needed
- **Jupyter / notebook generation utilities** for notebook export
- **GitHub Copilot custom agents** for the conversational interface
- **MCP or equivalent structured tool surface** for direct execution

Mandos-AI should minimize custom orchestration code unless it clearly adds value.

---

# Recommended MVP Boundary

If prioritization becomes necessary, the smallest valuable version is:

- Phase 1
- Phase 2
- Phase 3
- Phase 4
- Phase 5
- Phase 7

That would yield:
- repo and environment setup,
- a custom Copilot agent,
- basic tool-backed Mandos execution,
- guided analysis,
- strong natural-language error handling,
- and code/notebook export.

That is already a compelling product.

---

# Final Note

This roadmap intentionally avoids over-specifying Mandos internals.

The expectation is that GPT-4.1 will inspect the Mandos codebase, tests, docs, and examples to learn:
- what Mandos already does well,
- which entry points are most stable,
- which outputs are best suited for reasoning,
- and where Mandos-AI should wrap rather than reinvent.

The core philosophy is simple:

**Start small. Demo often. Keep Mandos as truth. Let Mandos-AI make Mandos easier, smarter, and more useful.**
