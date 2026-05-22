# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This repo holds the [spine.io](https://spine.io) site. It is published to GitHub Pages via the
`gh-pages.yml` workflow on every push to `master` or `staging`.

The repo is "two-headed":
- A **Hugo** site rooted in `site/`.
- A thin **Gradle** wrapper at the root, which only exists to expose Hugo/Lychee commands as
  Gradle tasks (and to participate in the larger Spine composite build via `buildAll`).

There is no application code here other than Hugo templates and a small amount of JS/SCSS under
`site/assets/`.

## Common commands

Run these from the repo root unless noted.

| Task | Command |
|---|---|
| Run site locally (Hugo dev server on `:1313`) | `./gradlew :runSite` or `cd site && hugo server` |
| Build the site (no server) | `./gradlew :buildSite` or `cd site && hugo` |
| Check broken links (Lychee) | `./gradlew :checkLinks` — requires the dev server running on `:1313` |
| Install Node deps (PostCSS pipeline) | `cd site && npm install` |
| Update documentation module | `cd site && hugo mod get -u github.com/SpineEventEngine/documentation/docs` |
| Update site-commons theme | `cd site && hugo mod get -u github.com/SpineEventEngine/site-commons` |
| Update all Hugo modules | `cd site && hugo mod get -u ./...` |
| Clear Hugo module cache (on module errors) | `cd site && hugo mod clean --all` |

Prerequisites: JDK 8 (x86_64), Go 1.12+, Node 18+, Hugo Extended **v0.150.0 or higher**.

The `_script/hugo-serve`, `_script/hugo-build`, and `_script/proof-links` shell scripts are what
the Gradle tasks invoke. They `cd site` and source `~/.bash_profile`/`~/.bashrc` so Gradle's
non-interactive shell still sees the user's Hugo/Go install.

## Architecture

### Hugo modules: where the content actually lives

Most of the site's content is **not in this repo**. `site/config/_default/hugo.toml` imports two
Hugo modules (pinned in `site/go.mod`):

- `github.com/SpineEventEngine/documentation/docs` — all `/docs/...` pages. Edit there, not here.
- `github.com/SpineEventEngine/site-commons` — shared theme: partials, shortcodes
  (`cloakemail`, `note-block`, code blocks, anchor icons, snackbars), email data, repository data.

When something on the rendered site (especially under `/docs`) isn't where you expect, check
those two upstream repos before searching this one. The `AUTHORING.md` and the site-commons
`_reference/` directory document the available shortcodes.

The documentation side-navigation lives in the `documentation` repo at
`docs/data/docs/<version_id>/sidenav.yml` (or per-module). Prev/Next buttons are generated from it.

### Code samples

`_code/examples/` contains **git submodules** pointing to `spine-examples/*` repos (hello, airport,
blog, kanban, todo-list). The `embed-code` tool referenced in `README.md` / `_code/EMBEDDING.md`
is **not used in this repo** — it only runs in the `documentation` repo. Don't try to wire it up
here.

### Local content in this repo

`site/content/` holds the pages that are *not* documentation:
landing (`_index.md`, `hero.json`, `features.json`, `step-*.md`), `about`, `blog`,
`getting-help` (with `services.json` / `support-section.json`), `checkout` / `checkout-completed`,
`faq`, `oss-licenses`, `privacy`, `release-notes`.

`site/layouts/` overrides theme templates for these sections plus `_default`, `_partials`,
`_shortcodes`, and `index.html`. Main navigation data is in `site/data/navbar.yml`; the layout
template is `site/layouts/_partials/components/navbar/navigation.html`.

### Payments / checkout

The `getting-help` page sells products and uses a real (staging in dev) payment flow. Config in
`site/config/_default/hugo.toml` under `[params.payment]` points the dev environment at the
staging Paygate. Test cards: LHV sandbox (see `README.md`). Do not change `paygateURL` /
`consentURL` casually — they are environment-aware.

### Markdown is rendered with `unsafe = true`

Hugo's Goldmark is configured with `unsafe = true` and block attributes enabled
(`site/config/_default/hugo.toml`), so raw HTML inside Markdown is allowed and `{.class}`
attribute syntax works. This is intentional — many pages embed HTML directly.

## Authoring conventions (from AUTHORING.md)

These are enforced by reviewers and by the Lychee link check; follow them:

- **Internal links must not start with `/`.** Use `docs/introduction/`, not `/docs/introduction/`.
- **Internal links must end with `/`** to avoid redirect hops.
- For URLs that depend on the current docs version or external repos, use the variable forms:
  `{{% version %}}` and `{{% get-site-data "repositories.<key>" %}}` (key resolves against
  `site-commons/data/repositories.yml`).
- In layout partials (HTML), build URLs via Hugo: `{{ \`docs/...\` | relURL }}`.
- Image size hints: append `#medium` or `#small` to the image path.
- Use the `cloakemail` shortcode for any email/phone — never inline them.

Lychee excludes live in `lychee.toml`. The GitHub Actions check is `.github/workflows/proof-links.yml`.

## When updating Hugo modules

After `hugo mod get -u ...`, commit both `site/go.mod` and `site/go.sum`. The convention is to
**prune `go.sum` down to the two required entries per module** so the file doesn't accumulate
old versions.
