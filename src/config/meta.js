import { brand } from "./brand";

// Deployment-time identity metadata. These tags describe the deployed host, so
// they are injected into <head> at build (and dev) time by the Vite plugin in
// vite.config.js instead of being hard-coded local file references.
const siteUrl = `https://${brand.domain}`;

export const deployedMeta = [
  { property: "og:type", content: "website" },
  { property: "og:title", content: `${brand.name} — ${brand.tagline}` },
  {
    property: "og:description",
    content:
      "A calm workspace for setting, funding and inspecting token release terms on Robinhood Chain Testnet.",
  },
  { property: "og:url", content: siteUrl },
  { property: "og:image", content: `${siteUrl}/brand/og-image.jpg` },
  { name: "twitter:title", content: `${brand.name} — ${brand.tagline}` },
  {
    name: "twitter:description",
    content:
      "Put your tokens on a timeline. Vesting, locks, streams and batch distributions on Robinhood Chain Testnet.",
  },
  { name: "twitter:image", content: `${siteUrl}/brand/og-image.jpg` },
  { name: "twitter:card", content: "summary_large_image" },
];

export const deployedLinkTags = [
  { rel: "icon", href: "/brand/logo.svg", type: "image/svg+xml" },
];
