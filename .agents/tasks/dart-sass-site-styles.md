---
slug: dart-sass-site-styles
branch: get-theme-updates-dart-sass
owner: claude
status: in-review
started: 2026-10-30
---

## Goal

The site builds on the Dart Sass `site-commons` theme, and its own styles use
the Sass module system, so `hugo --minify` prints no Sass warnings and the CSS
stays the same.

## Context

- SpineEventEngine/site-commons#38 — move the theme and its sites from LibSass
  to Dart Sass. Hugo deprecated LibSass in v0.153.0; Dart Sass 3.0 removes `@import`.
- The theme update brings in site-commons#39 (jQuery served as a file), #40
  (Dart Sass) and #41 (`@use`/`@forward`). `theme-main.scss` forwards the theme
  and Bootstrap, so `@use "theme-main" as *;` gives a partial what `@import` did.
- Hugo sets `silenceDependencyDeprecations`, which hides deprecations in every
  file except the entry one. The `sass` CLI with `--verbose` shows them all.
- Also folds in the Dependabot bumps of #558 (`source-map-js`) and #560
  (`postcss-selector-parser`, `@fullhuman/postcss-purgecss` 8). Nothing loads
  PurgeCSS; the CSS is byte-identical with and without them.

## Plan

- [x] `hugo mod get -u github.com/SpineEventEngine/site-commons` in `site/`.
- [x] Cherry-pick the bumps from #558 and #560.
- [x] `main.scss` and its partials: `@import` → `@use`, in the same order.
  - Partials that use theme or Bootstrap members: `@use "theme-main" as *;`.
  - Partials that use another partial's members `@use` it by a relative path:
    `base/colors` (variables), `base/common` (`%expandable-title`) and
    `modules/forms` (`$form-error-color`). `main.scss` loads each of them
    before its users, so no CSS moves.
- [x] `map-get()` → `map.get()`, `fade-out()` → `color.adjust($alpha: …)`.
- [x] Verify: Sass warnings, and the CSS rule by rule against the previous build.
- [x] Keep Check Links passing. With jQuery no longer inlined (site-commons#39),
  Lychee reads whole pages and finds 14 links that were already broken.
  - Point the Gitter link of the 1.0 blog post to where Gitter redirects.
  - `.lycheeignore` lists the 13 broken in the imported docs, as in
    SpineEventEngine/documentation#96.

## Log

- 2026-10-30 — theme update: the only Sass warnings left are the 28 `@import`s
  in `main.scss`. CSS differences are Dart Sass formatting and precision, folded
  `calc()`, the code-tab indicator's `border-radius: 1px`, no `@extend`ed
  `.h1`–`.h6`/`.small`/`.mark` selectors (no page uses them), and the medium
  Roboto Mono `.eot` now pointing to `fonts/robotomono/` (site-commons#41).
- 2026-10-30 — `@use` move: `hugo --minify` prints no Sass warnings. The `sass`
  CLI reports 52 fewer deprecations (382 → 330), all the site's own; the rest
  come from Bootstrap. The CSS has the same 12,764 declarations; one
  `@extend`ed selector list lists its two selectors in the other order.
- 2026-10-30 — the CSS now starts with the theme's license comment instead of
  Bootstrap's. `@use "theme-main"` emits that file's `/*!` header first, and
  the theme's PostCSS step keeps only the first comment. To fix in `site-commons`.
