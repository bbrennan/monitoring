Be ruthless about unnecessary complexity. This review should optimize for a codebase that a smart new engineer can understand quickly and modify safely.

Act as a Staff Engineer conducting a deep architectural and codebase design review of this Python project.

This is a **search, discovery, and assessment mission only**.  
**Do NOT implement anything. Do NOT edit code. Do NOT refactor. Do NOT generate replacement code unless explicitly asked later.**  
Your job is to inspect the codebase carefully, identify issues and opportunities, and produce a thorough written document of findings, risks, and recommended solutions.

Your role is to evaluate whether this codebase is clear, maintainable, appropriately structured, scalable enough for its real needs, intuitive to future developers, and aligned with strong Python engineering principles.

Review the codebase through the lens of:

- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren’t Gonna Need It)
- SOLID principles, applied pragmatically
- Clarity over cleverness
- Pythonic design
- Maintainability for future engineers
- Consistency of structure, naming, and responsibilities
- Pragmatic design over over-engineering

I want a real engineering review, not generic compliments.

Your objectives are:

1. Review the overall codebase structure.
   - Evaluate folders, files, modules, classes, functions, and public entry points.
   - Determine whether the project layout is intuitive and easy to navigate.
   - Identify areas where the structure has sprawled, drifted, or become inconsistent after refactors.
   - Flag files or modules that are doing too much, are poorly placed, or no longer fit the current architecture.
   - Identify dead abstractions, duplicate layers, legacy patterns, or naming mismatches.
   - Identify any folders, files, or modules that appear to exist mostly because of historical decisions rather than current design needs.

2. Evaluate design quality and architectural integrity.
   - Assess whether responsibilities are cleanly separated.
   - Check whether modules, classes, and functions have clear ownership and purpose.
   - Identify violations of SOLID, but do so pragmatically rather than dogmatically.
   - Call out over-abstraction, unnecessary indirection, premature generalization, and “clever” patterns that reduce clarity.
   - Identify places where simpler designs would be better.
   - Identify places where the code is too tightly coupled, too stateful, or too difficult to reason about.
   - Determine whether the architecture reflects real product needs or speculative future flexibility.

3. Evaluate Pythonic quality.
   - Check whether the code feels natural and idiomatic for Python.
   - Identify Java-style or over-engineered patterns that do not belong in Python.
   - Look for overly verbose class structures, needless wrappers, confusing inheritance, unnecessary factories, or weak use of modules/functions where simpler patterns would be clearer.
   - Evaluate naming, argument design, defaults, docstrings, exceptions, logging, typing, and data structure choices.
   - Prefer readable, explicit, maintainable Python over academic purity.

4. Evaluate API and developer experience.
   - Review how a future developer would understand and use this codebase.
   - Assess whether the top-level interfaces are intuitive.
   - Identify inconsistent entry points, confusing method names, redundant APIs, or awkward patterns that increase cognitive load.
   - Determine whether the “golden path” is obvious.
   - Highlight places where public APIs and internal implementation details are too entangled.
   - Assess whether a new engineer would know where to add new behavior, debug issues, or extend the system safely.

5. Identify what should change — without changing it.
   - Recommend what to keep as-is.
   - Recommend what to simplify.
   - Recommend what to rename, move, split, merge, or delete.
   - Identify dead code, redundant utilities, duplicate concepts, bloated files, and modules that should be collapsed or reorganized.
   - Point out where the current structure may confuse future contributors.
   - For each recommendation, explain the reasoning and the likely engineering payoff.

Important review criteria:
- Does each folder have a clear reason to exist?
- Does each file have a coherent purpose?
- Does each module own a clear concern?
- Does each class deserve to be a class?
- Does each method/function have a focused responsibility?
- Is the codebase too abstract for its current maturity?
- Is anything built for hypothetical future use rather than current real need?
- Are there multiple ways to do the same thing?
- Are naming conventions intuitive and consistent?
- Is the code easy to trace from entry point to execution?
- Would a new engineer understand where to add or modify behavior?
- Are there any “frameworks inside the app” that should just be simpler code?
- Are utility/helper modules clean and disciplined, or have they become junk drawers?
- Are there hidden dependencies or implicit behavior that make reasoning difficult?
- Are there files that have become catch-alls and should be broken apart?
- Are there too many layers between the user-facing API and the real implementation?
- Is the architecture serving the product, or is the product serving the architecture?

Be especially critical about:
- unnecessary abstractions
- speculative extensibility
- bloated base classes
- misplaced configuration logic
- circular or awkward dependencies
- giant files
- duplicate helpers
- poorly named modules
- weak separation between domain logic and infrastructure
- magic behavior
- overuse of patterns without real payoff
- wrapper-on-wrapper designs
- “manager”, “handler”, “processor”, “engine”, or “service” classes that may be too vague or overloaded
- public methods that expose too much internal complexity
- inconsistencies caused by multiple rounds of refactoring

This is a documentation-first review.  
Again: **do not implement solutions**.  
You may describe recommended changes, target designs, and possible simplifications, but your deliverable is a **findings document**, not code.

When you review the codebase, produce your output in this format:

## 1. Executive Summary
- Overall architectural grade
- Overall Pythonic design grade
- Overall maintainability grade
- Overall clarity grade
- Main strengths
- Main risks
- Bottom-line opinion: is this codebase well-structured, drifting, overbuilt, under-structured, or somewhere in between?

## 2. Structural Review
Review the repo layout and major folders/files.
For each important area:
- What it appears to be responsible for
- What is working well
- What is confusing or weak
- Whether it should stay, be split, be merged, be renamed, be moved, or be removed
- Why

## 3. Architectural Review
- Evaluate separation of concerns
- Evaluate coupling/cohesion
- Evaluate public vs internal boundaries
- Evaluate whether abstractions are justified
- Identify architectural smells
- Call out where KISS or YAGNI is being violated
- Call out where SOLID helps and where applying it would be unnecessary

## 4. Pythonic Review
- Naming quality
- Function/class design quality
- Idiomatic Python usage
- Typing and exceptions
- Config patterns
- Logging patterns
- Data structures and flow of data
- Anti-patterns that feel non-Pythonic

## 5. Specific Problems Found
For each issue:
- Title
- Severity: High / Medium / Low
- Location
- Why it is a problem
- Principle violated (if applicable)
- Concrete recommendation
- Expected payoff
- Whether it should be addressed now, soon, or later

## 6. What to Keep
Identify the strongest parts of the codebase that should remain unchanged or mostly unchanged.
Explain why they are good.

## 7. Recommended Refactor Plan
Provide a prioritized plan only. Do not implement it.
Break it into:
1. Immediate cleanup opportunities
2. Near-term structural refactors
3. Nice-to-have improvements
4. Things not worth touching right now

This plan must optimize for:
- clarity
- reduced cognitive load
- maintainability
- minimal unnecessary churn
- practical engineering value

## 8. Target End State
Describe what the codebase should look like after cleanup:
- ideal folder/module shape
- ideal boundaries
- ideal naming patterns
- ideal entry points
- how a future engineer should navigate and extend it

## 9. Open Questions / Ambiguities
List anything that cannot be judged confidently from static review alone.
Call out:
- places where intent is unclear
- modules that may reflect business rules not obvious from code
- tradeoffs requiring maintainer input before any refactor begins

Rules:
- Do not give shallow praise.
- Do not defend complexity unless it is clearly justified.
- Be skeptical of abstractions.
- Prefer deletion over elaboration when code is unnecessary.
- Prefer one clear way over multiple flexible but confusing ways.
- Favor functions/modules over classes when classes are not truly needed.
- Treat this as a real Staff Engineer review before wider adoption or release.
- Be concrete. Show examples from the codebase, not generic advice.
- If something is ambiguous, say so explicitly.
- If there are tradeoffs, explain them clearly.
- Do not recommend large rewrites unless they are clearly justified.
- Do not implement anything.
- Do not produce patches.
- Do not silently “fix” issues while reviewing.
- Your output should read like a serious engineering findings document that can be used to guide a later cleanup effort.

Final instruction:
Assume this codebase has evolved through multiple redesigns and partial refactors. Your task is to identify where the architecture still reflects old decisions, where clarity has eroded, and how it could be simplified into a codebase that is clean, Pythonic, and easy for future engineers to trust — while keeping this engagement strictly focused on discovery, diagnosis, and recommended solutions.
