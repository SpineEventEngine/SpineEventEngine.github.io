---
slug: align-checkout-shared-controls
branch: update-checkout
owner: codex
status: completed
started: 2026-08-13
---

## Goal

Use the current `site-commons` country selector and international phone input
on the Spine checkout while preserving the Spine-specific checkout and payment
result behavior.

## Plan

- [x] Vendor the exact shared Select2 and `intl-tel-input` runtime assets without
  changing the public `site-commons` module pin.
- [x] Adapt the checkout template and controller to the shared component APIs.
- [x] Preserve optional phone behavior and Paygate payload normalization.
- [x] Add or update focused JavaScript tests.
- [x] Build with CI-pinned Hugo and inspect desktop/mobile behavior.

## Log

- 2026-08-13 — confirmed the pinned May 2026 module predates the shared Select2
  and `intl-tel-input` assets; current `site-commons` master contains both.
- 2026-08-13 — retained the public module pin because the current TeamDev module
  path is private, and copied only the controls' runtime files and flag sprites.
- 2026-08-13 — `npm test` passed 32 tests; JavaScript syntax checks and
  `git diff --check` passed.
- 2026-08-13 — CI-pinned Hugo 0.161.1 development and production builds passed;
  production still renders `spine-standard-support`, while development uses the
  staging product ID.
- 2026-08-13 — verified both dropdowns in the local browser at desktop and
  390-by-844 mobile sizes with no horizontal overflow.
- 2026-08-13 — collapsed the hidden native country select's inherited minimum
  height so the visible Select2 control sits directly below its label.
- 2026-08-13 — restored the shared form action spacing and intrinsic desktop
  button width for `Continue to payment`; narrow screens retain full width.
- 2026-08-13 — removed the Business details divider and matched the Company
  name-to-VAT ID spacing to the form's standard 24-pixel row gap.
- 2026-08-13 — restored the completed-payment page's pre-redesign content-height
  layout, removing the checkout form's inherited full-viewport minimum height.
- 2026-08-13 — positioned VAT validation feedback inside the existing action
  gap so error-state changes do not reflow the VAT field or payment button.
- 2026-08-13 — clear a previous VAT API error on each input edit; only the
  latest non-stale server validation response can render a new VAT error.
- 2026-08-13 — focus the active Select2 search field whenever the country
  dropdown opens so typing can begin without a second click.
- 2026-08-13 — added primary checkout and secondary home actions to failed
  payments, and rendered result-page sales addresses as `mailto:` links.
- 2026-08-13 — separated payment-result contact copy into its own paragraph
  with a consistent 24-pixel gap above it.
- 2026-08-13 — persist the billing country in the checkout history entry and
  restore its Select2, VAT, phone, and charge state after browser Back.
- 2026-08-13 — preserve the independently selected phone country and VAT ID in
  the same history entry and restore them after the billing-country widget.
- 2026-08-13 — verified browser Back restores Estonia billing, Poland phone
  country, and `EE123456789`; all 36 JavaScript tests and both Hugo builds pass.
- 2026-08-13 — limit custom checkout restoration to Back/Forward navigation;
  explicit reload clears billing country, phone country, VAT ID, and saved state.
- 2026-08-13 — with optional cookies declined, verified reload resets Estonia,
  Poland (+48), and VAT ID while browser Back restores all three.
- 2026-08-13 — removed the custom `history.state` payload; native form controls
  now retain billing/VAT, with a native phone-country mirror for widget sync.
- 2026-08-13 — verified the native path restores Estonia, Poland (+48), VAT ID,
  and other inputs after Back, resets on reload, and passes 35 tests/builds.
