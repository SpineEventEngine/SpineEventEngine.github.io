# GitHub Copilot Instructions

## Repository context

This repository is part of the Spine SDK organisation (~40 repos).

Universal agent instructions are in [`AGENTS.md`](../AGENTS.md) at the
repository root — read it first.

If `.agents/project.md` exists, read it before reviewing. It provides the
language, architecture, role, and code review checklist for this specific repo.

Additional guidelines are in `.agents/` — see `.agents/_TOC.md` for the index
(if present; Hugo repos do not include this file).

## Universal rules

**Do not suggest:**
- Any git history operation — `git commit`, `git push`, `git tag`,
  `git rebase`, `git merge`, `git cherry-pick`, `gh pr merge`, or any other
  command that writes to history — leave these to the developer.
- Auto-updating dependency versions outside a dedicated update task.
- Feature flags, backwards-compatibility shims, or fallbacks for scenarios
  that cannot occur in the current codebase.
- Analytics, telemetry, or tracking code.
- Reflection or unsafe code without explicit approval.
