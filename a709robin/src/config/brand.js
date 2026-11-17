// Canonical public identity. Both the apex domain (tranova.site) and the
// www host serve the site; www is the canonical host, so absolute URLs and
// social metadata always use it. Keep the X handle and URL together here so no
// page can drift to a stale account.
export const brand = {
  name: "Tranova",
  handle: "TranovaSite",
  domain: "www.tranova.site",
  siteUrl: "https://www.tranova.site",
  xUrl: "https://x.com/TranovaSite",
  tagline: "Make timing accountable.",
  palette: {
    ink: "#03040a",
    accent: "#40b3ff",
    accentStrong: "#a78bfa",
    muted: "#a3a1b6",
    line: "#262536",
    canvas: "#000000",
    surface: "#12121e",
    soft: "#191927",
    signal: "#f2c94c",
  },
};
