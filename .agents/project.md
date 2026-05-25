# Project: spine.io

## Overview

This repository is the source of the public [spine.io](https://spine.io) website —
the umbrella surface for the Spine SDK organisation. It serves a dual role:
a **documentation portal** (pulling the canonical content from the
[`documentation`][documentation] repository as a Hugo Module) and a
**marketing site** with landing pages, examples, and a `getting-help` page that
sells products through a Paygate-backed checkout. The site is built with
[Hugo Extended][hugo] and hosted on GitHub Pages.

## Architecture

**Role in the org:** application (a static website). Not a library, tool, or
Gradle plugin. The Gradle build present in the repo is a **convenience
wrapper only** — no JVM compilation happens here.

**Composition**

- `site/` — the Hugo project (config, layouts, assets, content shell).
- `_code/` — code samples consumed by the [`embed-code`][embed-code] Go tool
  and injected into pages at build time. See
  [`_code/EMBEDDING.md`](../_code/EMBEDDING.md).
- `_code/examples/{hello,airport,blog,kanban,todo-list}` — git submodules,
  one per `spine-examples/*` repo.
- `config/` — git submodule pointing at [`SpineEventEngine/config`][config].
- `build.gradle.kts` — exposes shell-backed tasks:
  `:runSite`, `:buildSite`, `:checkLinks`, and a composite `:buildAll`.

**External pieces (consumed, not vendored)**

- [`documentation`][documentation] — pulled in as a Hugo Module; provides the
  documentation content.
- [`site-commons`][site-commons] — Hugo theme module shared across Spine
  public sites (anchor icons, snackbars, etc.).
- [`embed-code`][embed-code] (Go variant) — embeds snippets from `_code/`
  into Markdown pages.

**CI / deployment** (`.github/workflows/`)

- `gh-pages.yml` — builds the Hugo site and deploys to GitHub Pages on push
  to the default branch. This is the deploy path; treat changes that affect
  it with care.
- `check-links.yml` — validates rendered-site links (mirrors the local
  `checkLinks` task and the `check-links` skill).
- `gradle-wrapper-validation.yml` — guards the Gradle wrapper checksum on
  PRs that touch the wrapper.

## Constraints & guardrails

- **Hugo Extended version is pinned.** Use `v0.161.1` or higher of the
  *Extended* build. A mismatched/non-extended Hugo will break the theme
  pipeline and SCSS.
- **Submodules are pinned to specific commits.** Do not bump
  `_code/examples/*` or `config/` outside a dedicated update task — drive-by
  pointer changes silently alter embedded snippets and rendered pages.
- **Documentation content lives in the [`documentation`][documentation]
  repo, not here.** Edits to documentation pages must be made there (or in
  the relevant doc module). This repo only owns the site shell, landing
  pages, and Spine-SDK-wide marketing surfaces.

## Local development

Two equivalent ways to run the site locally:

1. Via Gradle (preferred — handles working directory and Hugo flags):
   ```shell
   ./gradlew :runSite     # build + serve on http://localhost:1313
   ./gradlew :buildSite   # build only, output under site/public
   ./gradlew :checkLinks  # validate links against the built site
   ```
2. Directly with Hugo, from inside `site/`:
   ```shell
   hugo server
   ```

If Hugo Module fetches misbehave (stale cache, theme not updating), clear
the module cache and retry:

```shell
hugo mod clean --all
```

The `getting-help` page integrates with **Paygate**. In dev it points at the
staging Paygate server; test the checkout flow with
[LHV sandbox cards](https://merchant.lhv.ee/help/en/articles/12807566-test-cards).
Changes touching that page have a real third-party integration surface —
verify the flow end-to-end, not just the rendered markup.

## Authoring

- Content authoring conventions: [`AUTHORING.md`](../AUTHORING.md).
- Embedding code samples into pages: [`_code/EMBEDDING.md`](../_code/EMBEDDING.md).

[hugo]: https://gohugo.io/getting-started/quick-start/#step-1-install-hugo
[documentation]: https://github.com/SpineEventEngine/documentation
[site-commons]: https://github.com/SpineEventEngine/site-commons
[embed-code]: https://github.com/SpineEventEngine/embed-code/tree/embed-code-go
[config]: https://github.com/SpineEventEngine/config
