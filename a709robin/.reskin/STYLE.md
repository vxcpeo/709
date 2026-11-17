# Reskin art direction — Cosmos Orbit

> Selected automatically. Do not ask the user to confirm or choose another direction.

- **Style DNA:** `cosmos-orbit` (spatial-futurist)
- **Skeleton:** `orbital` (spatial)
- **Seed:** `54ba78081810cf75cbca43400a03beec9b94cee341b39fa3eb950ce9ccb00742`
- **Source DNA:** [https://cosmos.network](https://cosmos.network)
- **Live sampled:** yes — https://cosmos.network (2982 ms)
- **Original:** sidebar-workspace / light / accent #b9382b

## Why this direction

The selector sampled 9/10 blockchain references, scored every direction for perceptual distance from the original accent (#b9382b) and background (#ffffff), added a deterministic seed jitter, and chose Cosmos Orbit because it is 106 ΔE away from the original accent and pairs with Orbital, a spatial skeleton rather than the original sidebar-workspace.

## Live reference sampling

| Style | URL | Result | Accent sampled | Ground sampled |
|---|---|---|---|---|
| ethereum-paper | https://ethereum.org | ok (2586 ms) | #0c5681 | #ffffff |
| base-cobalt | https://www.base.org | ok (2883 ms) | #0000ff | #dde3e9 |
| solana-spectrum | https://solana.com | ok (3263 ms) | #9945ff | #000000 |
| polygon-agora | https://polygon.technology | ok (3321 ms) | #670de5 | #000000 |
| arbitrum-signal | https://arbitrum.io | failed: HTTP 403 | — | — |
| aave-abyss | https://aave.com | ok (2932 ms) | #ff0000 | #000000 |
| optimism-poster | https://www.optimism.io | ok (5027 ms) | #ff0421 | #fafaf9 |
| cosmos-orbit | https://cosmos.network | ok (2982 ms) | #40b3ff | #000000 |
| uniswap-bubblegum | https://uniswap.org | ok (6030 ms) | — | #ffffff |
| sui-tidal | https://sui.io | ok (5486 ms) | #298dff | #ffffff |

Live sampling is evidence, not a copy target. Never download or reuse a reference site's logo, imagery, copy, or code. Use only the abstract tokens below.

## Candidate ranking

| Candidate | Score | Accent ΔE from original | Layout | Live |
|---|---:|---:|---|---|
| Cosmos Orbit | 0.996 | 105.7 | orbital | yes |
| Spectrum Terminal | 0.9951 | 117.5 | gallery-scroll | yes |
| Agora Violet | 0.9544 | 116.5 | bento-canvas | yes |
| Signal Navy | 0.8539 | 99 | terminal-console | no |
| Paper Protocol | 0.807 | 87.6 | split-stage | yes |
| Tidal Sui | 0.7836 | 107.6 | split-stage | yes |
| Cobalt Blueprint | 0.7416 | 148.3 | bento-canvas | yes |
| Abyss Liquidity | 0.702 | 42.9 | command-rail | yes |
| Bubblegum Exchange | 0.6961 | 36.9 | bento-canvas | yes |
| Poster Optimism | 0.6411 | 32.2 | gallery-scroll | yes |

## Skeleton brief

**Orbital** — centered radial composition with concentric rings; route navigation arranged around the primary object; content revealed in a focused panel inside the orbit; very few straight edges; circular masks and arcs; large empty space around the core.

Navigation: Circular route ring around the core with accessible names; keyboard tab order follows the ring; mobile becomes a vertical arc.

Structure:
1. core object with the page's primary figure
1. orbit ring with routes
1. focused content panel
1. secondary arc of metrics
1. footer on the outer ring

Content mapping: The primary metric becomes the core. Secondary metrics sit on the inner ring. Tables become a focused panel with a record switcher. Forms become a side panel that opens from the ring.

Recipe: `.orbit{position:relative;min-height:100svh;display:grid;place-items:center}.ring{position:absolute;inset:8%;border:1px solid var(--line);border-radius:50%}.core{width:min(46vw,520px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,var(--surfaceAlt),var(--surface))}.route{position:absolute;left:50%;top:50%;transform:rotate(var(--a)) translateX(var(--r)) rotate(calc(-1 * var(--a)))}`

Risks: circular layouts can break reading order; DOM order must match visual order; must collapse to a linear layout on mobile

## Design tokens

```css
:root {
  --bg: #000000;
  --surface: #12121E;
  --surface-alt: #191927;
  --ink: #F5F4FA;
  --muted: #9A98AD;
  --accent: #40b3ff;
  --accent-safe: #40b3ff;
  --accent-2: #A78BFA;
  --line: #262536;
  --success: #5CE1A0;
  --danger: #FF8A8A;
  --warning: #F2C94C;

  --font-display: "Century Gothic", "Futura", "Segoe UI", sans-serif;
  --font-body: "Segoe UI", "Helvetica Neue", sans-serif;
  --font-mono: "Cascadia Mono", ui-monospace, monospace;
  --display-weight: 400;
  --display-tracking: 0.02em;
  --label-tracking: 0.24em;

  --radius-sm: 999px;
  --radius-md: 999px;
  --radius-lg: 28px;
  --border: 1px solid var(--line);
  --shadow: 0 0 60px rgba(110, 123, 255, 0.16);

  --motion-duration: 420ms;
  --motion-ease: cubic-bezier(.16,1,.3,1);
  --space-1: clamp(4px, .35vw, 6px);
  --space-2: clamp(8px, .7vw, 12px);
  --space-3: clamp(14px, 1.2vw, 20px);
  --space-4: clamp(22px, 2vw, 32px);
  --space-5: clamp(36px, 3.4vw, 56px);
  --space-6: clamp(56px, 5vw, 88px);
  --page-pad: clamp(18px, 4vw, 64px);
  --max-width: 1440px;
}
```

## Component grammar

- Surface: 1px solid var(--line); radius 999px; shadow 0 0 60px rgba(110, 123, 255, 0.16).
- Type: display **"Century Gothic", "Futura", "Segoe UI", sans-serif** at weight 400, tracking 0.02em; body **"Segoe UI", "Helvetica Neue", sans-serif**; numerals and micro-labels **"Cascadia Mono", ui-monospace, monospace**.
- Texture: orbital rings, star fields, thin constellation lines, radial glows.
- Motion: slow-orbit, 420ms, cubic-bezier(.16,1,.3,1). Always wrap non-essential motion in `@media (prefers-reduced-motion: no-preference)`.
- Density: airy. Keep body text >= 14px and body contrast >= 4.5:1.
- Use `--accent-safe` for text and icons on `--bg`; use `--accent` for fills and large shapes.

## Originality guard

The replacement must satisfy all of these:

1. The source inventory archetype is `sidebar-workspace`; the new skeleton is `orbital`. Do not fall back to the old shell during implementation.
2. Do not reuse any original class name, CSS selector, design token name, or original accent family.
3. Rewrite templates, not only CSS. Every route must visibly use the new skeleton.
4. Keep every token in `.reskin/content-contract.json`; move it, never rewrite it.
5. Run `node scripts/verify.mjs check` and do not stop until content, structure, accessibility and responsive checks pass.

## Commit statement

Use this sentence in the final report: "The UI was rebuilt around Cosmos Orbit / Orbital; the original sidebar-workspace shell and palette were removed while the content contract stayed byte-for-byte intact."
