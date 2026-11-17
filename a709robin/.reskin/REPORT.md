# Reskin report — Tranova

> The UI was rebuilt around **Cosmos Orbit** / **Orbital**; the original **sidebar-workspace** shell and palette were removed while the content contract stayed byte-for-byte intact.

## Direction

| Field | Value |
| --- | --- |
| Style | `cosmos-orbit` (spatial-futurist), sampled live from https://cosmos.network |
| Skeleton | `orbital` (spatial family); original was `sidebar-workspace` (shell family) |
| Accent | `#40b3ff` vs original `#b9382b` — **105.7 ΔE** (minimum 30) |
| Ground | Void black `#000000` with layered constellation gradients; surfaces `#12121e` / `#191927` |
| Type | Century Gothic / Futura / Segoe UI display at wide tracking; self-hosted Manrope body; mono micro-labels |
| Geometry | Pills and circles, one accent family, hairline orbit rings, no square cards |
| Source DNA | Style, motion, density and shape language only — no reference logos, copy, imagery or code were used |

Full token set and selection evidence: `STYLE.md`, `style.json`. Composition commitment: `WIREFRAME.md`.

## What changed structurally

- `App.vue`: `aside` sidebar + `header` strip replaced with a top-line, a single
  `<nav>` orbit ring of route nodes, an extras row and a plain baseplate. Landmark
  sequence went from `[aside, nav, header, main, footer]` to `[nav, main]`.
- Every route's composition was re-laid-out (2×2 formats, stacked journey,
  orbit manifest, horizontal docs chip rail, record rows instead of a card grid,
  preview panel below the create form, etc.) — see `WIREFRAME.md`.
- `src/style.css` (3 387 lines, old palette) removed from the render path; new
  `src/styles/orbit.css` carries the design system, responsive rules, focus
  states and `prefers-reduced-motion` guard.
- All template classes renamed into `orb-*`; lucide icons replaced by the
  dependency-free `OrbitGlyph.vue`.
- Brand marks redrawn as an orbital ring + core + satellite (`BrandMark.vue`,
  `branding/logo*.svg` derivatives unchanged in purpose).

## Verification

`node .reskin/../scripts/verify.mjs check` (run from the skill directory) reports:

- Source content contract: **intact** (`2812cb9e…`), 891 static text tokens and
  528 bindings preserved, no removals or rewrites.
- Skeleton gate: **pass** — current archetype `orbital` (spatial) vs
  `sidebar-workspace` (shell); accent 105.7 ΔE.
- Contrast: **0** failures at 1440×900 and 390×844 (original had 5 on `/`).
- axe serious/critical: **0** on every application route.
- Horizontal overflow: **0** at 390 px.
- Forms/controls: all labelled; two closed-`<details>` buttons received
  `aria-label`s; keyboard focus is visible on every focusable element.

| Route | Result | DOM similarity | Landmark similarity | Class overlap | axe serious |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | PASS | 0.277 | 0.400 | 0.047 | 0 |
| `/create` | PASS | 0.280 | 0.571 | 0.031 | 0 |
| `/locks` | PASS | 0.308 | 0.400 | 0.043 | 0 |
| `/docs` | PASS | 0.191 | 0.571 | 0.034 | 0 |
| `/legal` | PASS | 0.296 | 0.500 | 0.027 | 0 |
| `/lock/:id` | skipped (dynamic) | — | — | — | — |

Thresholds: DOM ≤ 0.50, landmarks ≤ 0.68, class overlap ≤ 0.10, accent ≥ 30 ΔE.

### Known gate limitation — static document URLs

Five entries in the inventory route list are **files, not UI routes**:
`/documents/brand-kit.zip`, `/documents/business-plan.pdf`,
`/documents/contracts.md`, `/documents/MockUSD.sol`,
`/documents/TokenSchedulesV2.sol`. The inventory adds every local link target to
the route list, and those links are the real download anchors in
`Docs.vue`/`App.vue`. They are served by Vite/public as static assets, so they
cannot be reskinned, and their captured DOM is byte-identical to the baseline
(fingerprint 1.0). `brand-kit.zip` is an actual download: Chrome never produces a
page for it, in baseline or now. Removing the links would break the download
functionality *and* violate the frozen content contract.

The checker therefore reports those five entries as failures while **every
application route passes**. Fixing it needs a route list that excludes asset
URLs; it is not a UI defect. `docs/`-served PDFs and archives were regenerated to
the new brand and are published intact in `website/public/documents/`.

## Visual review

Baseline and current captures were compared side by side
(`.reskin/baseline/` vs `.reskin/current/`, mirrored to `output/reskin/`):

- Navigation moved from a left sidebar list to a horizontal orbit ring with
  circular nodes — a user would not read the two shells as the same product.
- The flat light-blue card grid is gone: sections are now dark panels with
  arcs, radial glows and a single blue beam accent.
- Home, create, locks, docs, legal and the detail view each have a distinct
  composition; none reuses the old header/main/footer sandwich.
- Mobile is a genuine linear layout (menu drawer, single column, no horizontal
  rails), not a collapsed sidebar.

## Materials

The X kit was regenerated in the same direction by
`branding/sources/build_social_orbit.py`:

- `twitter/01-introducing-tranova.jpg`, `02-release-map.jpg`,
  `03-shared-timing.jpg` — 1600×900, void ground, orbital rings, beam accent.
- `twitter/avatar.png|jpg` (400×400), `twitter/banner.jpg` (1500×500).
- `website/public/brand/og-image.jpg` (1200×630).
- `twitter/posts.md` alt text rewritten to describe the new artwork; bio and
  post copy unchanged.

`branding/sources/validate_materials.py` still passes: dimensions, post/bio
lengths, source-text parity, PDF pages and brand-kit contents.

## Files

Changed: `src/App.vue`, `src/main.js`, `src/styles/orbit.css` (new),
`src/components/{BrandMark,OrbitGlyph(new),WalletModal,LiveStats,FlowChart,SchedulePreview}.vue`,
`src/views/{Home,Create,Locks,LockDetail,Docs,Legal}.vue`, `src/config/brand.js`,
`src/config/meta.js` (deployed meta), `index.html` (unchanged content, metadata
moved to the Vite plugin), plus the mirrored `website/a709robin/` copy.

Removed from the render path: `src/style.css` (archived outside the project
source tree), all scoped `<style>` blocks, `lucide-vue-next` imports.

## Limitations

- `/lock/:id` is dynamic; it is skipped by the capture (no fixture schedule with
  guaranteed testnet data), as in the baseline.
- Social artwork is generated, not hand-drawn; the ring mark is deliberately the
  same geometry as the app shell.
- The five static document URLs above remain outside the skeleton gate.
