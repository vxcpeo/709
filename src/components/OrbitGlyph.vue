<script setup>
import { computed } from "vue";

// A small, dependency-free glyph set. Presentation only: no text, no
// behaviour. Stroke geometry echoes the orbital rings of the shell.
const props = defineProps({
  name: { type: String, default: "dot" },
  size: { type: [Number, String], default: 16 },
});

const paths = {
  arrow: "M8 16 16 8M9.5 8H16v6.5",
  "arrow-right": "M4 12h14M12 6l6 6-6 6",
  "arrow-left": "M20 12H6M12 6l-6 6 6 6M4 12h2",
  plus: "M12 5v14M5 12h14",
  check: "M4.5 12.5 9.5 17.5 19.5 6.5",
  close: "M6 6l12 12M18 6 6 18",
  menu: "M4 8h16M4 16h16",
  wallet: "M4 8.5A2.5 2.5 0 0 1 6.5 6H18v12H6.5A2.5 2.5 0 0 1 4 15.5v-7ZM4 9h13M15.5 13h2",
  radio: "M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 15.5a5 5 0 0 0 0-7M5.5 5.5a9 9 0 0 0 0 13M18.5 18.5a9 9 0 0 0 0-13",
  external: "M14 5h5v5M19 5l-7.5 7.5M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5",
  layers: "M12 4 3.5 8.5 12 13l8.5-4.5L12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13v-9ZM12 14.5v2.5",
  timer: "M12 8v4.5l3 1.8M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z",
  waves: "M3 9c2.5-3 5-3 7.5 0S15.5 12 21 9M3 15c2.5-3 5-3 7.5 0s5 3 10.5 0",
  shield: "M12 3.5 19 6v6c0 4.2-2.9 7.3-7 8.5-4.1-1.2-7-4.3-7-8.5V6l7-2.5ZM9 11.8l2.1 2.2 4-4.2",
  refresh: "M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5",
  rotate: "M20 12a8 8 0 1 1-8-8c2.2 0 4.2.9 5.7 2.4",
  loader: "M12 3.5a8.5 8.5 0 1 0 8.5 8.5",
  download: "M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15",
  dashboard: "M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z",
  book: "M5 4.5h5.5a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H5V4.5ZM19 4.5h-5.5a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H19V4.5Z",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20",
  copy: "M9.5 9.5h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM15 6.5v-.5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5",
  logout: "M15 5h4v14h-4M11.5 8.5 8 12l3.5 3.5M3.5 12H12",
  time: "M12 7v5l3 2M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z",
  spark: "M12 3v6M12 15v6M3 12h6M15 12h6",
  dot: "M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
};

const d = computed(() => paths[props.name] || paths.dot);
</script>

<template>
  <svg
    class="orb-glyph"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>
