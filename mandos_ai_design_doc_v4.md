# Mandos-AI Design Document

## 1. Overview

**Mandos-AI** is a conversational analysis layer built on top of the Mandos library and surfaced through **GitHub Copilot Chat in VS Code**.

Its purpose is to let users work with Mandos in natural language while still relying on Mandos as the deterministic engine for:

- data profiling
- table-to-table comparison
- schema validation
- data quality analysis
- segmentation
- model monitoring
- reporting

Mandos-AI should feel like an **interactive analyst** rather than a command router.

The user experience should be:

1. Instantiate a Mandos-AI agent/bot in Copilot Chat.
2. Mandos-AI checks whether the user wants to work with **Snowflake** or **local Pandas data**.
3. Mandos-AI guides the user through a standard exploration and monitoring workflow.
4. Mandos-AI runs Mandos tools behind the scenes.
5. Mandos-AI summarizes what matters in plain English.
6. Mandos-AI answers follow-up questions naturally.
7. Mandos-AI can export the completed workflow as:
   - a Python script
   - a Jupyter notebook
   - a standard PDF report
   - a custom PDF report

---

## 2. Core Product Positioning

### What Mandos-AI is

Mandos-AI is:

- a **Copilot-native conversational assistant**
- a **tool-using analyst** with access to Mandos
- a **stateful session-based guide** for EDA, data quality, and model monitoring
- an **export layer** that can convert interactive work into code and reports

### What Mandos-AI is not

Mandos-AI is not:

- a replacement for Mandos core logic
- a free-form code generator that invents metrics
- a thin wrapper that only routes commands
- a system that dumps raw stack traces onto the user

### Design principle

**Mandos computes truth. Mandos-AI guides, explains, and exports.**

---

## 3. Goals

### Primary goals

1. Let users interact with Mandos in plain English inside GitHub Copilot Chat.
2. Reduce user confusion about how to do common tasks in Mandos.
3. Hide implementation complexity behind a conversational workflow.
4. Run real Mandos analyses from chat when possible.
5. Summarize results so users do not need to inspect all raw outputs.
6. Support follow-up questioning over the current session and prior results.
7. Let users export the successful analysis path into reproducible artifacts.
8. Provide strong natural-language error handling and recovery guidance.

### Secondary goals

1. Improve onboarding for new Mandos users.
2. Make best-practice workflows discoverable.
3. Encourage consistent use of Mandos APIs and reports.
4. Keep a clean boundary between deterministic metrics and AI reasoning.


## 3.1 Strategic Product Lifts

Mandos-AI is intended to lift Mandos in three major ways.

### A. Natural Language Discussions
Mandos-AI should let users discuss their data, goals, and findings in plain English instead of forcing them to know Mandos APIs in advance.

Desired lift:
- users do not need to be Mandos API experts
- users do not need to know upfront whether they want `profile()`, `compare()`, or `monitor()`
- users can talk through uncertainty and refine the workflow interactively
- users can ask natural-language questions about loaded data and completed Mandos results

Examples:
- “I loaded a scoring table. What should I check first?”
- “This result looks weird. What do you think matters most?”
- “Does this pattern look like a data issue or true drift?”
- “Turn what we just did into a notebook.”

### B. Reporting
Mandos currently provides a tightly standardized report experience, which is useful but intentionally constrained.

Mandos-AI should expand reporting in two directions:
1. make the current one-size-fits-all Mandos report easier to discover and generate
2. enable guided creation of custom reports grounded in Mandos results, visuals, and user goals

Desired lift:
- standard report generation becomes easier and more discoverable
- custom reports become possible without forcing users to hand-build everything
- reporting can adapt better to different audiences such as engineering, model validation, leadership, or business stakeholders

### C. Triage and Noise Reduction
Threshold-based tools are useful, but they often overwhelm users with low-value findings.

Mandos-AI should help reduce alert fatigue by:
- grouping related issues into higher-level narratives
- prioritizing likely root causes over raw issue counts
- suppressing or de-emphasizing weak, redundant, or low-confidence findings
- surfacing “what actually matters” first

Desired lift:
- fewer noisy outputs
- clearer prioritization
- better first-pass root-cause analysis
- a more actionable user experience than a flat threshold breach list


---

## 4. Non-Goals

1. Replacing Mandos metric logic with LLM reasoning.
2. Building a fully autonomous multi-agent system in v1.
3. Letting the model freestyle arbitrary data science without Mandos grounding.
4. Printing raw exception logs directly to the user.
5. Requiring users to write code before getting value.

---

## 5. User Experience

## 5.1 Entry point

The user opens **GitHub Copilot Chat in VS Code** and selects or instantiates the **Mandos-AI** custom agent.

Example:

> Start Mandos-AI

Mandos-AI responds with a startup handshake.

## 5.2 Startup handshake

Mandos-AI should first determine the execution mode.

### Snowflake mode
Mandos-AI looks for Snowflake connection details in environment variables or configured connection settings.

At minimum, it should check for:

- `SNOWFLAKE_USER`
- `SNOWFLAKE_PASSWORD`

In practice, it will likely also need additional settings such as account, warehouse, database, and schema, but the initial conversational flow should begin by checking whether the user intends to work in Snowflake.

### Pandas mode
If Snowflake credentials are not present, or if the user prefers local analysis, Mandos-AI should ask whether the user wants to work locally with:

- Pandas DataFrames
- CSV/Parquet files
- notebook variables already loaded in memory

### Required startup behavior
Mandos-AI should:

- check for Snowflake env vars without echoing secrets back to the user
- explain what is missing in plain English
- offer the local Pandas path if Snowflake is unavailable
- guide the user instead of failing abruptly

Example:

> I can work with Snowflake or local Pandas data. I found a Snowflake user setting but not a password, so I can’t connect to Snowflake yet. Would you like to provide the missing connection settings, or should we work locally with Pandas instead?

---

## 6. Product Modes

Mandos-AI should support three first-class modes within the same conversational agent.

## 6.1 Explore mode

This is the default mode.

Purpose:

- load data
- guide the user through analysis
- run Mandos tools
- summarize results
- answer follow-up questions

Typical prompts:

- “Load this Snowflake table.”
- “Profile this dataset.”
- “Compare this to last month’s table.”
- “What stands out?”
- “Which segment is driving the issue?”

## 6.2 Export code mode

Once the user is satisfied with the exploration, Mandos-AI can convert that workflow into reproducible code.

Artifacts:

- Python script
- Jupyter notebook

Typical prompts:

- “Create a notebook that does exactly what we just did.”
- “Turn this analysis into a Python script.”
- “Generate a reusable example for my team.”

## 6.3 Export report mode

Mandos-AI can generate a report once the user decides what needs to be communicated.

Report paths:

### Standard report
Use Mandos’ built-in reporting path such as:

- `monitor().report()`
- or future equivalent standardized reporting APIs

This is the preferred default because it is consistent and supportable.

### Custom report
Generate a custom report pipeline using:

- Mandos analysis results
- Mandos visualization outputs
- ReportLab
- Matplotlib / Seaborn where appropriate

This path is more flexible and should be treated as an advanced option.

Typical prompts:

- “Create the standard Mandos PDF report.”
- “Generate a custom PDF report for leadership.”
- “Make a lighter summary report with only the critical findings.”

---

## 7. High-Level Workflow

Mandos-AI should guide users through a standard flow.

### Step 1: Initialize session
- Instantiate Mandos-AI inside Copilot Chat.
- Detect Snowflake vs Pandas/local mode.
- Confirm available data sources.

### Step 2: Load data
- Load a Snowflake table, a local file, or an existing DataFrame.
- Store that object or dataset reference in session state.

### Step 3: Clarify goal
Mandos-AI asks what the user wants to do.

Examples:
- profile this data
- compare to another table
- validate schema
- inspect model monitoring results
- generate a report

### Step 4: Run Mandos analysis
Mandos-AI uses Mandos under the hood to perform the requested work.

Examples:
- `profile()`
- `compare()`
- `monitor()`
- `.inspect()`
- `.issues()`
- `.report()`

### Step 5: Summarize what matters
Mandos-AI does **not** dump every metric by default.
It highlights the most important findings first.

Example output style:

> Three things stand out: row count is down 11%, missingness increased sharply in two required columns, and the biggest drift is concentrated in the Dealer channel.

### Step 6: Support follow-up reasoning
The user can continue asking natural language questions such as:

- “Why is Dealer driving the issue?”
- “Does this look like pipeline breakage or real drift?”
- “Which columns should I check first?”
- “Can you compare this result to the previous run?”

### Step 7: Export work
Once the exploration is complete, the user can ask Mandos-AI to create:

- a script
- a notebook
- a standard report
- a custom report

---

## 8. System Architecture

## 8.1 Primary implementation target

Mandos-AI should be implemented first as a **custom GitHub Copilot agent for VS Code** defined at:

- `.github/agents/mandos-analyst.agent.md`

This file is the primary implementation artifact for the conversational layer. It should contain strong system-style instructions that define:

- Mandos-AI’s role as a conversational analyst on top of Mandos
- the startup handshake for Snowflake versus Pandas/local workflows
- the requirement to summarize results in plain English
- the requirement to avoid raw logs, stack traces, and secret exposure
- the requirement to ground claims in Mandos outputs
- the requirement to guide users through common Mandos workflows instead of forcing them to remember API details

The custom agent should be allowed to use:

- built-in Copilot tools such as codebase search, file reading, and terminal/command execution where available
- Mandos-specific MCP tools or an equivalent curated tool layer for profile, compare, monitor, inspect, issues, report, and export flows

The tool surface should be intentionally controlled. Mandos-AI should be able to safely:

- inspect the codebase and local workspace
- run Mandos analyses
- summarize findings
- generate scripts and notebooks
- generate standard or custom reports

Users should be able to instantiate or select this agent directly in Copilot Chat and interact with it as the Mandos-AI analyst experience.

---

## 8.2 Main components

### A. GitHub Copilot custom agent
Mandos-AI should be implemented as a **custom agent in GitHub Copilot for VS Code**.

This gives the user a familiar chat interface and allows Mandos-AI to participate directly in the coding workflow.

### B. Mandos core library
Mandos remains the deterministic engine responsible for:

- computation
- validation
- metrics
- thresholds
- reports

Mandos-AI must not duplicate this logic.

### C. Mandos-AI MCP server or equivalent tool layer
Mandos-AI should expose a curated tool interface so Copilot can run real analyses instead of only generating code.

This tool layer should call Mandos programmatically and return structured outputs to the agent.

### D. Session context/state manager
Mandos-AI should maintain session context, including:

- execution mode: Snowflake or Pandas
- loaded dataset(s)
- baseline or comparison table
- model metadata if available
- latest Mandos outputs
- prior findings surfaced to the user
- exported artifacts created during the session

### E. Artifact generators
Mandos-AI should support code and report generation based on the current session.

---



## 8.3 Reasonable Data and Output Assumptions

Mandos-AI should make a few explicit assumptions so the product remains simple and supportable.

### Data assumptions
- Mandos-AI works with either Snowflake-backed data or local Pandas-accessible data.
- Users generally operate on one primary dataset at a time, with an optional comparison or baseline dataset.
- A dataset has a stable table-like shape with named columns and row-based observations.
- For model monitoring, the user can identify or help identify fields such as:
  - entity key when relevant
  - prediction or score column
  - optional target column
  - optional segment columns
  - optional timestamp/run column
- Segmentation is expressed as one or more categorical fields or business slices.
- Custom reporting can assume that summary results are small enough to materialize locally even if full source data lives in Snowflake.

### Mandos output assumptions
- Mandos outputs are already known, structured, and trustworthy.
- Mandos returns well-formed summaries, issue lists, report artifacts, and other deterministic outputs that Mandos-AI can reason over.
- Mandos-AI should prefer structured Mandos outputs over direct free-form inspection of raw data whenever possible.
- Mandos-AI should treat Mandos outputs as the source of truth for metrics, thresholds, and statuses.

---

## 9. Recommended Tool Surface

Mandos-AI should expose a small, high-value, opinionated tool set.

### Session and data tools
- `detect_execution_mode`
- `load_snowflake_table`
- `load_local_file`
- `load_pandas_dataframe`
- `set_baseline_dataset`
- `set_model_context`

### Mandos analysis tools
- `run_profile`
- `run_compare`
- `run_monitor`
- `inspect_last_result`
- `issues_last_result`
- `report_last_result`
- `segment_last_result`

### Export tools
- `generate_python_script`
- `generate_notebook`
- `generate_standard_pdf_report`
- `generate_custom_pdf_report`

### Utility tools
- `summarize_current_session`
- `list_loaded_datasets`
- `clear_session`

---



## 9.1 Recommended Python Library Stack

Mandos-AI should prefer mature, widely used libraries and keep custom code focused on orchestration, natural-language reasoning, and product glue.

### Core orchestration and agent layer
- GitHub Copilot custom agent file in `.github/agents/mandos-analyst.agent.md`
- MCP server or equivalent tool wrapper layer for exposing Mandos capabilities to Copilot Chat
- Pydantic for typed request/response models, session state, and tool payload validation

### Data validation and schema contracts
- Pandera for dataframe schema validation and contract checking
- Pydantic for config and payload validation outside of dataframe objects

### Comparison and reconciliation
- DataComPy for table-to-table comparison, especially where a user wants a human-readable difference report

### Profiling and exploratory summaries
- ydata-profiling for profile-style exploratory summaries where it adds value
- Pandas / NumPy / SciPy for deterministic summary statistics and tests
- Mandos native primitives and summaries should remain the preferred first source when available

### Visualization and reporting
- Mandos visualization tools first
- Matplotlib as the dependable default plotting layer
- Seaborn selectively for higher-level statistical plots and styling
- ReportLab for PDF generation and layout
- Jinja2 for templated markdown, HTML, or intermediate report assembly when useful

### Optional monitoring and drift helpers
- Evidently can be used selectively where its presets or visual components accelerate drift/performance storytelling
- Mandos should still remain the source of truth for core monitored outputs and statuses

### Design rule
Third-party libraries should accelerate:
- validation
- comparison
- plotting
- PDF generation
- structured orchestration

They should not replace Mandos as the deterministic monitoring engine.

---

## 10. Conversational Design Principles

Mandos-AI should behave like a thoughtful analyst.

### It should
- speak directly to the user
- explain what it is doing in simple language
- summarize findings before diving into detail
- ask clarifying questions when needed
- recommend next steps when useful
- preserve context across the session
- tie all substantive claims back to Mandos outputs

### It should not
- dump raw exception traces into chat
- overwhelm the user with every metric unless asked
- invent unsupported findings
- expose secrets or credentials
- sound like a stack trace parser

---

## 11. Strong Error Handling Philosophy

This is a critical requirement.

Mandos-AI must provide **very strong natural-language error handling and reasoning**.

### Core rule
**Mandos-AI should never spit raw error logs at the user.**

Instead, it should:

1. interpret the failure
2. explain the likely cause in plain language
3. suggest the best next step
4. ask the user for clarification when needed
5. fix the issue automatically when safe and appropriate
6. retry where sensible

### User-facing tone
Mandos-AI should speak like this:

> I couldn’t finish the comparison because the baseline table name doesn’t appear to exist in the current connection context. I may be missing the database or schema prefix. If you want, I can help correct the table reference or switch to a local file instead.

Not like this:

> KeyError: 'BASELINE_TABLE'

---

## 12. Error Handling Categories

Mandos-AI should recognize and reason through several common failure types.

## 12.1 Setup and credential issues
Examples:
- missing `SNOWFLAKE_USER`
- missing `SNOWFLAKE_PASSWORD`
- incomplete Snowflake connection configuration
- expired credentials

Mandos-AI response style:
- explain that it cannot connect yet
- identify what is missing without exposing secrets
- offer the local Pandas path if possible
- tell the user how to proceed

## 12.2 Data loading issues
Examples:
- table does not exist
- file path is wrong
- DataFrame variable is not in scope
- user references the wrong dataset alias

Mandos-AI should:
- explain what could not be found
- suggest likely alternatives
- ask whether the user wants to correct the name
- fix aliases automatically when confidence is high

## 12.3 User input and parameter issues
Examples:
- missing required column names
- invalid comparison request
- invalid segmentation request
- unsupported model type

Mandos-AI should:
- explain which input is missing or inconsistent
- suggest the expected shape of the request
- offer examples
- preserve as much progress as possible

## 12.4 Schema and data contract issues
Examples:
- expected feature column is missing
- dtype differs from contract
- nullability rules violated
- extra unexpected columns appear

Mandos-AI should:
- explain the mismatch in business terms
- distinguish between “data problem” and “setup problem”
- suggest whether the user should fix the source, adjust config, or rerun with different assumptions

## 12.5 Runtime and library issues
Examples:
- Mandos execution failure
- pandas merge issue
- report generation issue
- plotting backend issue

Mandos-AI should:
- hide the raw traceback
- summarize the likely failure point
- explain whether the issue is temporary, configuration-related, or code-related
- offer recovery options

## 12.6 KeyError and ValueError style failures
These should be translated into helpful language.

### KeyError-style example
Instead of:

> KeyError: 'target_column'

Mandos-AI should say:

> I couldn’t find the target column you asked me to use. The dataset appears to contain `TARGET_FLAG` and `BAD_OUTCOME`, but not `target_column`. If you want, I can switch to one of the available columns or you can tell me which one is correct.

### ValueError-style example
Instead of:

> ValueError: columns must be same length as key

Mandos-AI should say:

> I ran into a shape mismatch while preparing the data. That usually means the operation expected one column layout but received another. I can inspect the intermediate data structure and help identify which transformation step caused the mismatch.

---

## 13. Error Recovery Behavior

Mandos-AI should support three levels of recovery.

### Level 1: Explain
Explain what likely happened and what is needed.

### Level 2: Ask
Ask the user for the smallest missing piece of information.

### Level 3: Fix when safe
If the fix is low-risk and obvious, Mandos-AI may take corrective action.

Examples of safe fixes:
- using the closest matching column name when confidence is high
- adding a missing schema prefix when the intended table is obvious
- switching from Snowflake mode to local mode when the user explicitly approves
- rerunning with the last known valid dataset

### Level 4: Retry
After a fix or clarification, retry the operation automatically when appropriate.

---

## 14. How Mandos-AI Should Reason About Results

Mandos-AI should reason **over Mandos outputs**, not raw tables whenever possible.

Preferred evidence sources:
- profile summaries
- issue lists
- compare deltas
- schema mismatches
- segmented findings
- model monitoring outputs
- Mandos reports

Mandos-AI may use these to answer questions such as:
- what matters most?
- what likely caused the issue?
- which segment is driving the result?
- is this likely a pipeline problem, drift problem, or model issue?

### Rule
**No metric, no claim.**

Mandos-AI may interpret and prioritize Mandos outputs, but should not invent unsupported conclusions.

---

## 15. Export Behavior

## 15.1 Exporting code
When the user asks for code, Mandos-AI should generate a clean, reproducible artifact that reflects the exact successful analysis path.

### Python script
Good for:
- team examples
- automation
- reusable workflows

### Notebook
Good for:
- exploration
- onboarding
- demonstrations
- iterative analysis

The generated artifact should:
- use Mandos APIs directly
- include the user’s chosen data source path or placeholder
- include comments where helpful
- avoid unnecessary complexity

## 15.2 Exporting reports
### Standard report
Use Mandos’ standard reporting interface.

### Custom report
Use:
- Mandos data
- Mandos visual outputs where available
- ReportLab for layout
- Matplotlib/Seaborn only when needed

Custom reports should still be grounded in Mandos outputs.

---

## 16. Example Conversation Flow

### Example A: Snowflake startup
User:
> Start Mandos-AI

Mandos-AI:
> I can work with Snowflake or local Pandas data. I found your Snowflake user setting, but I’m missing the password needed to connect. Would you like to provide the missing Snowflake settings, or should we work locally instead?

### Example B: Profile a table
User:
> Use Snowflake and load `DB.SCHEMA.CURRENT_SCORING`.

Mandos-AI:
> Loaded. What would you like to do with this data? I can profile it, compare it to another table, validate schema, or inspect monitoring results.

User:
> Profile it.

Mandos-AI:
> I profiled the table. Three things stand out: missingness is elevated in two required columns, one categorical feature has unseen values, and duplicate rate is low but above the warning threshold. Would you like the critical issues only, the full summary, or a notebook that reproduces this profile?

### Example C: Compare and reason
User:
> Compare it to last month.

Mandos-AI:
> The largest differences are row count down 9%, increased nulls in `INCOME`, and a noticeable shift in `CHANNEL`, especially for Dealer. Based on that pattern, this looks more like an upstream data change than pure population drift. Do you want a segment drill-down or a report?

### Example D: Error handling
User:
> Monitor the model using target column `BAD_FLAG`.

Mandos-AI:
> I couldn’t find `BAD_FLAG` in the current dataset. I do see `TARGET_FLAG` and `EVENT_IND`. If one of those is the correct target, I can continue with it.

### Example E: Export notebook
User:
> Great. Turn this into a notebook.

Mandos-AI:
> Done. I created a notebook that loads the same dataset, runs the same Mandos comparison workflow, and includes the key findings we surfaced in this session.

---

## 17. MVP Scope

### In scope for v1
- custom Copilot agent
- Snowflake/Pandas startup handshake
- session state
- tool-backed execution of common Mandos flows
- natural language explanation of results
- natural language error handling
- export to script and notebook
- standard PDF report generation

### Out of scope for v1
- complex multi-agent swarm behavior
- arbitrary autonomous debugging of all code paths
- unrestricted execution over unknown external systems
- fully custom report authoring without Mandos grounding

---

## 18. Future Enhancements

1. Better session memory across VS Code sessions.
2. Saved reusable workflows by team or model type.
3. Guided onboarding templates for common Mandos use cases.
4. Report customization templates for leadership, validation, and engineering audiences.
5. Deeper notebook awareness when users already have live DataFrames in memory.
6. RCA playbooks for frequent classes of monitoring issues.

---

## 19. Summary

Mandos-AI should be designed as a **Copilot-native conversational analyst** on top of Mandos.

It should:
- help users get started quickly
- detect whether to work in Snowflake or Pandas
- guide them through common Mandos workflows
- run Mandos behind the scenes when possible
- summarize results in natural language
- handle errors gracefully without dumping logs
- export successful work as scripts, notebooks, and reports

The central philosophy is simple:

**Mandos remains the source of truth. Mandos-AI makes Mandos easier to use, easier to understand, and easier to operationalize.**
