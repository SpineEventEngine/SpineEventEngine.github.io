---
slug: hugo-0-169-upgrade
branch: hugo-0.169
owner: claude
status: in-review
started: 2026-10-30
---

## Goal

The site builds and deploys on Hugo v0.169.0 with the latest `site-commons`,
and CI checks links with the same Hugo version.

## Context

- SpineEventEngine/documentation#89 — upgrade Hugo to v0.169.0 (meta-issue;
  also `documentation` and `site-commons`).
- SpineEventEngine/documentation#92 — Hugo v0.162.0+ rejects `text/html` content
  files. The full-screen architecture diagram that `documentation/docs` brings in
  is one. Hugo ignores `security` set in an imported module, so the setting must
  be in this site's own config.
- The latest `site-commons` (`b79100d8a139`) declares
  `module.hugoVersion.min = '0.169.0'` and needs Go 1.27.3, so it cannot land
  without the Hugo bump.
- `.github/workflows/check-links.yml` comes from `config`, which still pins
  `HUGO_VERSION: 0.161.1`. Bumping it here is needed for CI; SpineEventEngine/config#823
  makes the same bump there, or the next `./config/pull` reverts it.
- The `documentation` side is SpineEventEngine/documentation#94, merged. It changes
  only `docs/_preview`, a separate Go module, so the `documentation/docs` content
  that this site imports is the same.

## Plan

- [x] Allow HTML content in `site/config/_default/hugo.toml` (documentation#92).
- [x] `hugo mod get -u github.com/SpineEventEngine/site-commons` in `site/`.
- [x] Bump `HUGO_VERSION` to `0.169.0` in `gh-pages.yml` and `check-links.yml`.
- [x] Update Hugo and Go prerequisites in `README.md` and `docs/project.md`.
- [x] Build with v0.169.0: `hugo --minify` and `hugo -e development`,
  no errors and no new warnings.
- [x] Check the full-screen diagram page: script and PDF.
- [x] Check that CI's older Go fetches Go 1.27.3 by itself.
- [x] Run the pre-PR checklist; open the PR.
- [x] Update `github.com/SpineEventEngine/documentation/docs` to `documentation` `master`.

## Log

- 2026-10-30 — drafted and started (run delegated by the `documentation` session).
- 2026-10-30 — both builds pass on v0.169.0; the only warning is the theme's
  LibSass deprecation. The full-screen diagram page renders with its script and
  the PDF. Its one console error, `Cannot read properties of null (reading '__k')`,
  is on live spine.io too.
- 2026-10-30 — compared with the old theme on v0.169.0: pages change only as
  site-commons#37 intends (code palettes bundled into `main.css`, no
  `/code-theme/*.css`, the theme falls back to the system preference), plus
  trimmed whitespace. The code-theme toggle switches the palettes.
- 2026-10-30 — `gh-pages.yml` sets up no Go. With Go 1.26.4 and an empty module
  cache, `go` downloads Go 1.27.3 by itself (`GOTOOLCHAIN=auto`) and the build passes.
- 2026-10-30 — pre-PR: `review-docs` approves; its nit on the `allowContent`
  comment is applied. Link check: the Lychee run passes, but, as in `documentation`,
  it extracts only the `<head>` URLs because of the inline jQuery block in every
  page's `<head>`. CI has the same blind spot. With that block stripped, 10 URLs
  are broken, the same on `master`: 9 in `validation/docs` and a Gitter link that
  now redirects. None comes from this branch.
- 2026-10-30 — `documentation/docs` moved to `3045fa4` (after documentation#94).
  Only the pinned version changes: the extracted module is identical, and so is the
  built site, apart from the random IDs of cloaked e-mail addresses.
  `validation/docs` stays where it was.
