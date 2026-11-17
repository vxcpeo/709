import { brand } from "./brand";

// Deployment-time identity metadata. These tags describe the deployed host, so
// they are injected into <head> at build (and dev) time by the Vite plugin in
// vite.config.js instead of being hard-coded local file references.
const siteUrl = brand.siteUrl;
const handle = `@${brand.handle}`;
const pageTitle = `${brand.name} — ${brand.tagline}`;

export const deployedMeta = [
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: brand.name },
  { property: "og:title", content: pageTitle },
  {
    property: "og:description",
    content:
      "A calm workspace for setting, funding and inspecting token release terms on Robinhood Chain Testnet.",
  },
  { property: "og:url", content: `${siteUrl}/` },
  { property: "og:image", content: `${siteUrl}/brand/og-image.jpg` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:site", content: handle },
  { name: "twitter:creator", content: handle },
  { name: "twitter:title", content: pageTitle },
  {
    name: "twitter:description",
    content:
      "Put your tokens on a timeline. Vesting, locks, streams and batch distributions on Robinhood Chain Testnet.",
  },
  { name: "twitter:image", content: `${siteUrl}/brand/og-image.jpg` },
  { name: "twitter:image:alt", content: `${brand.name} — ${brand.tagline}` },
];

export const deployedLinkTags = [
  { rel: "icon", href: "/brand/logo.svg", type: "image/svg+xml" },
  { rel: "canonical", href: `${siteUrl}/` },
  { rel: "me", href: brand.xUrl },
];

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: `${siteUrl}/`,
  logo: `${siteUrl}/brand/logo.svg`,
  description: `${brand.name} is a testnet workspace for token vesting, locks, streams and batch distributions on Robinhood Chain Testnet.`,
  sameAs: [brand.xUrl],
};
