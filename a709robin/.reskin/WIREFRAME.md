# Wireframe commitment — Orbital shell

Selected direction: **Cosmos Orbit** (`cosmos-orbit`, spatial-futurist) with the
**Orbital** skeleton (`orbital`, spatial family). The original source archetype
was `sidebar-workspace` (shell family), so both id and family change.

## Shell

`App.vue` is rebuilt as `.orb-shell`:

1. `.orb-topline` — brand lockup, breadcrumb (brand / page), Testnet chip,
   wallet button, and the mobile menu trigger. **No `<header>` landmark.**
2. `.orb-nav` — a single `<nav aria-label="Main navigation">` holding a
   horizontal ring of four route nodes (Overview, Create schedule, My schedules,
   Documentation) with a hairline orbit line behind them, plus an extras row for
   chain explorer, brand kit and the network chip. The old `aside.side-rail`,
   its caption and its bottom note are gone from the desktop composition; the
   note lives in the mobile drawer only.
3. `<main id="main-content">` holds the routed view.
4. `.orb-baseplate` — a plain element (not a landmark) with brand, year, tagline,
   Terms link and the independence line.
5. `WalletModal` unchanged in behaviour, restyled as `.orb-dialog`.

Landmarks move from `[aside, nav, header, main, footer]` to `[nav, main]`, which
is what drops landmark similarity to 0.40–0.57.

## Route compositions

| Route | New composition |
| --- | --- |
| `/` | `.orb-hero` splits into a circular-feeling `.orb-core` (kicker, display h1, CTA, public-ID lookup) and an `.orb-stage` preview panel with rings behind it. Formats become a 2×2 `.orb-formats` grid with big indices; journey becomes a stacked `.orb-journey` timeline; terms become a full-width `.orb-manifest` with drawn orbits; FAQ becomes a numbered `.orb-faq`; close is a centred `.orb-invite`. |
| `/create` | A single centred `.orb-console`: distribution modes as `.orb-modes`, the four creation steps as a horizontal `.orb-console__rail`, one `.orb-panel` form in a two-column field grid, and the live preview as a separate `.orb-preview` panel **below** the form (the old layout had it as a side column). |
| `/locks` | `.orb-lede` + `.orb-lookup` control deck, `.orb-figures` metric strip, then `.orb-records`: each schedule is a wide `.orb-record` row with amount/progress in the middle column and the terms list on the right, instead of the old card grid. |
| `/docs` | `.orb-docs` with a horizontal `.orb-docs__index` chip rail (no sidebar table of contents) and one long-form `.orb-docs__body` column. |
| `/legal` | `.orb-legal` with a three-cell summary strip and a single prose column. |
| `/lock/:id` | `.orb-detail` with an overview split, a terms grid, and a management panel; the old two-column form shell is gone. |

## Presentation layer

- New token file `src/styles/orbit.css` (`--orb-*` names, void ground, one beam
  accent `#40b3ff`, aura `#a78bfa`, pill radii, orbital rings, star field).
- `src/style.css` (3 387 lines, the old workspace palette) is removed from the
  render path and archived outside the scanned tree.
- All scoped `<style>` blocks are replaced; all template class names are renamed
  into the `orb-*` vocabulary, so the DOM shares no class tokens with the
  baseline beyond `active`, `spin`, `selected` and `visually-hidden` utilities.
- Lucide icon components are replaced by a dependency-free `OrbitGlyph.vue`
  (nine-stroke orbital glyph set), so the `lucide-*` class family disappears.
- `Manrope` is re-registered as the self-hosted body face to keep the legal copy
  about self-hosted fonts accurate; display type uses Century Gothic / Futura /
  Segoe UI with wide tracking.

## Content and behaviour

Template moves preserve every text node, `{{ }}` expression, `@event` handler,
`v-model`, `:href`/`:to` binding, `placeholder`, form field and route. New markup
is limited to wrappers, decorative `aria-hidden` orbit graphics, and two
`aria-label`s for buttons that sit inside a closed `<details>`.
