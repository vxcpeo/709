# Reskin inventory — tranova-web

Generated: 2026-10-21T17:39:39.791Z

## Project

| Field | Value |
|---|---|
| Root | `E:/workspace/chuangye/ROBIN/709/website` |
| Vue | ^3.5.22 |
| Package manager | npm |
| Nuxt | no |
| CSS frameworks | none detected |
| Files scanned | 34 (25 SFCs) |

## Original skeleton

- Archetype: **orbital** (spatial)
- Traits: sidebar, cards, hero, table, grid, tabs, modal, charts, sticky, orbital, terminal
- Max template depth: 10
- Top-level tags: a, div, span, svg, section, div, dialog, div, div, div, div, div, div, a, div, span, svg, section, svg, div, dialog, div, div, div, div, div, div

The replacement skeleton must not be `orbital` and must not be in the same family (`spatial`).

## Routes

- `/`
- `/create`
- `/docs`
- `/documents/brand-kit.zip`
- `/documents/business-plan.pdf`
- `/documents/contracts.md`
- `/documents/MockUSD.sol`
- `/documents/TokenSchedulesV2.sol`
- `/legal`
- `/lock/:id` _(dynamic)_
- `/locks`

## Palette (most used first)

`#40b3ff` (21) · `#c9d4e1` (21) · `#526173` (20) · `#dce8f2` (16) · `#b9382b` (14) · `#ffffff` (14) · `#05060b` (13) · `#647184` (12) · `#dce1e9` (12) · `#101828` (11)

## Content lock

- Static visible text tokens: **891**
- Binding expressions: **528**
- Event handlers: **120**
- Contract hash: `34cf58d3b1177f8eb789d6f3a3fc738fb9b4e043a68891a35e8bbf050b86abf9`

Everything in `.reskin/content-contract.json` is immutable: visible copy, placeholders, labels, routes, link targets, asset sources, bindings, handlers, API endpoints and i18n values. A reskin may move these tokens to new markup but may not rewrite, remove or hide them.

## Next

```bash
node scripts/choose-style.mjs --project "E:/workspace/chuangye/ROBIN/709/website" --out .reskin
node scripts/verify.mjs baseline --project "E:/workspace/chuangye/ROBIN/709/website" --out .reskin
```

Then rewrite the UI and run `verify.mjs check`.
