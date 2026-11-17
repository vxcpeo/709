import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { deployedMeta, deployedLinkTags } from "./src/config/meta.js";

// The Open Graph and Twitter card tags point at the deployed host. Injecting
// them here keeps one source of truth for the domain and avoids hard-coding
// absolute asset URLs in the local index.html.
const deployedMetaPlugin = () => ({
  name: "tranova-deployed-meta",
  transformIndexHtml() {
    return {
      tags: [
        ...deployedLinkTags.map((attrs) => ({
          tag: "link",
          attrs,
          injectTo: "head",
        })),
        ...deployedMeta.map((attrs) => ({
          tag: "meta",
          attrs,
          injectTo: "head",
        })),
      ],
    };
  },
});

export default defineConfig({
  plugins: [vue(), deployedMetaPlugin()],
  build: { chunkSizeWarningLimit: 650 },
});
