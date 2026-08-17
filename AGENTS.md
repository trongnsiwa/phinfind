# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Verification

- Run `rtk pnpm lint` and `rtk pnpm typecheck` before finishing any implementation tasks.

---

## Codebase Exploration & Discovery Protocol

- **Primary Action:** ALWAYS execute granular Graphify query tools (`query_graph`, `shortest_path`, or `get_node`) before invoking any other search tools.
- **Context Window Protection:** You are strictly PROHIBITED from reading `graphify-out/GRAPH_REPORT.md` or raw `graph.json` files during initial discovery. Massive file reads that flood the context window must be avoided.
- **Tool Fallback Cascade:**
  1. **Graphify Primitives:** Run focused semantic queries, path relations, or node explanations first.
  2. **CodeGraph Index:** If Graphify returns zero nodes or insufficient context, query the CodeGraph repository index next to resolve symbols and dependencies.
  3. **Native Search:** You may fall back to native search (`grep_search`) ONLY if both Graphify and CodeGraph return no matches, or to confirm isolated line numbers.
- **Penalty:** Skipping this specific execution chain or using raw text-grepping before checking structural indices is heavily penalized.
- **Static File Exception:** The graph-first execution chain applies strictly to codebase architecture, source code files, and symbol resolutions. Looking up localized text, translation arrays (`*.json`), or static configurations bypasses this chain directly to native search.
