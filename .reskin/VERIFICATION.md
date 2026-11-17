# Reskin verification — FAIL

Generated: 2026-10-21T17:53:19.990Z

- Project: **tranova-web**
- URL: http://127.0.0.1:4317/
- Original skeleton: `sidebar-workspace` (shell)
- New skeleton: `orbital` (spatial)
- Accent: #b9382b -> #40b3ff (105.73 ΔE; min 30)
- Source contract: intact (`2812cb9ef55c`)

| Route | Result | DOM similarity | Landmark similarity | Axe serious | Screenshot |
|---|---|---:|---:|---:|---|
| `/` | PASS | 0.277 | 0.4 | 0 | [desktop](current/home-desktop.png) |
| `/create` | PASS | 0.28 | 0.571 | 0 | [desktop](current/create-desktop.png) |
| `/docs` | PASS | 0.191 | 0.571 | 0 | [desktop](current/docs-desktop.png) |
| `/documents/brand-kit.zip` | FAIL | 1 | 1 | 0 | — |
| `/documents/business-plan.pdf` | FAIL | 1 | 1 | 0 | [desktop](current/documents-business-plan-pdf-desktop.png) |
| `/documents/contracts.md` | FAIL | 1 | 1 | 0 | [desktop](current/documents-contracts-md-desktop.png) |
| `/documents/MockUSD.sol` | FAIL | 1 | 1 | 0 | [desktop](current/documents-MockUSD-sol-desktop.png) |
| `/documents/TokenSchedulesV2.sol` | FAIL | 1 | 1 | 0 | [desktop](current/documents-TokenSchedulesV2-sol-desktop.png) |
| `/legal` | PASS | 0.296 | 0.5 | 0 | [desktop](current/legal-desktop.png) |
| `/lock/:id` | PASS | — | — | — | — |
| `/locks` | PASS | 0.308 | 0.4 | 0 | [desktop](current/locks-desktop.png) |

## Blocking issues

- /documents/brand-kit.zip: skeleton too similar: DOM fingerprint 1 > 0.5
- /documents/brand-kit.zip: landmark layout too similar: 1 > 0.68
- /documents/brand-kit.zip: CSS class reuse too high: 1 > 0.1
- /documents/brand-kit.zip: load error: page.goto: Download is starting
Call log:
[2m  - navigating to "http://127.0.0.1:4317/documents/brand-kit.zip", waiting until "domcontentloaded"[22m

- /documents/brand-kit.zip: desktop capture missing
- /documents/brand-kit.zip: mobile capture missing
- /documents/business-plan.pdf: skeleton too similar: DOM fingerprint 1 > 0.5
- /documents/business-plan.pdf: landmark layout too similar: 1 > 0.68
- /documents/business-plan.pdf: CSS class reuse too high: 1 > 0.1
- /documents/business-plan.pdf: console/page error: Failed to load resource: the server responded with a status of 404 (Not Found)
- /documents/business-plan.pdf: mobile: route navigation is not reachable (no visible links or menu toggle)
- /documents/contracts.md: skeleton too similar: DOM fingerprint 1 > 0.5
- /documents/contracts.md: landmark layout too similar: 1 > 0.68
- /documents/contracts.md: CSS class reuse too high: 1 > 0.1
- /documents/contracts.md: mobile: route navigation is not reachable (no visible links or menu toggle)
- /documents/MockUSD.sol: skeleton too similar: DOM fingerprint 1 > 0.5
- /documents/MockUSD.sol: landmark layout too similar: 1 > 0.68
- /documents/MockUSD.sol: CSS class reuse too high: 1 > 0.1
- /documents/MockUSD.sol: mobile: route navigation is not reachable (no visible links or menu toggle)
- /documents/TokenSchedulesV2.sol: skeleton too similar: DOM fingerprint 1 > 0.5
- /documents/TokenSchedulesV2.sol: landmark layout too similar: 1 > 0.68
- /documents/TokenSchedulesV2.sol: CSS class reuse too high: 1 > 0.1
- /documents/TokenSchedulesV2.sol: mobile: route navigation is not reachable (no visible links or menu toggle)

## Warnings

- attributes: added "name=arrow"
- attributes: added "name=arrow-left"
- attributes: added "name=arrow-right"
- attributes: added "name=check"
- attributes: added "name=close"
- attributes: added "name=copy"
- attributes: added "name=download"
- attributes: added "name=external"
- attributes: added "name=layers"
- attributes: added "name=loader"
- attributes: added "name=logout"
- attributes: added "name=menu"
- attributes: added "name=plus"
- attributes: added "name=radio"
- attributes: added "name=refresh"
- attributes: added "name=shield"
- attributes: added "name=wallet"
- bindings: added "attr:active.glyph"
- bindings: added "attr:link.glyph"
- bindings: added "attr:product.glyph"
- bindings: added "attr:type.glyph"
- bindings: added "form:active.glyph"
- bindings: added "form:link.glyph"
- bindings: added "form:product.glyph"
- bindings: added "form:type.glyph"
- /create: aria attribute added: aria-label=Set cliff
- /create: aria attribute added: aria-label=Set end
- /create: mobile nav: 4 baseline target(s) no longer visible (/create, /locks, /docs)
- /documents/business-plan.pdf: desktop: empty document title
- /documents/business-plan.pdf: desktop: no h1
- /documents/business-plan.pdf: mobile: empty document title
- /documents/business-plan.pdf: mobile: no h1
- /documents/contracts.md: desktop: empty document title
- /documents/contracts.md: desktop: no h1
- /documents/contracts.md: mobile: empty document title
- /documents/contracts.md: mobile: no h1
- /documents/MockUSD.sol: desktop: empty document title
- /documents/MockUSD.sol: desktop: no h1
- /documents/MockUSD.sol: mobile: empty document title
- /documents/MockUSD.sol: mobile: no h1

## Thresholds

- DOM fingerprint similarity <= 0.5
- Landmark sequence similarity <= 0.68
- CSS class overlap <= 0.1
- Accent distance >= 30 ΔE
- Contrast failures <= 0
- Axe serious/critical <= 0

All content is compared as a multiset of visible words plus rendered attribute values. Reordering is allowed, rewriting/removing/adding visible copy is not. Dynamic numeric values are reported as warnings, never silently accepted.
