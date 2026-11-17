<script setup>
import { computed, ref, watch } from "vue";
import { formatUnits } from "ethers";
import { vestedAt, scheduleForPreview } from "../composables/scheduleMath";
import { dateLabel } from "../composables/schedules";
const props = defineProps({ plan: { type: Object, required: true } });
const position = ref(50),
  snapshotTime = ref(Math.floor(Date.now() / 1000));
watch(
  () => props.plan,
  () => {
    snapshotTime.value = Math.floor(Date.now() / 1000);
    position.value = 50;
  },
);
const schedule = computed(() =>
  scheduleForPreview(props.plan, snapshotTime.value),
);
const rangeStart = computed(() =>
  schedule.value.kind === 1
    ? snapshotTime.value
    : Math.min(schedule.value.start, schedule.value.cliff),
);
const rangeEnd = computed(() =>
  Math.max(rangeStart.value + 1, schedule.value.end),
);
const at = computed(() =>
  Math.floor(
    rangeStart.value +
      ((rangeEnd.value - rangeStart.value) * Number(position.value)) / 100,
  ),
);
const unlocked = computed(() => vestedAt(schedule.value, at.value));
const points = computed(() =>
  Array.from({ length: 101 }, (_, index) => {
    const timestamp = Math.floor(
      rangeStart.value + ((rangeEnd.value - rangeStart.value) * index) / 100,
    );
    const ratio =
      Number(
        (vestedAt(schedule.value, timestamp) * 10000n) / schedule.value.amount,
      ) / 10000;
    return `${20 + index * 4},${160 - ratio * 135}`;
  }).join(" "),
);
const markerY = computed(
  () =>
    160 -
    (Number((unlocked.value * 10000n) / schedule.value.amount) / 10000) * 135,
);
</script>
<template>
  <div class="orb-exact">
    <svg
      class="orb-glyph-chart"
      viewBox="0 0 440 190"
      role="img"
      aria-label="Release chart based on your reviewed schedule"
    >
      <path
        v-for="y in [25, 70, 115, 160]"
        :key="y"
        :d="`M20 ${y}H420`"
        stroke="currentColor"
        opacity=".1"
        stroke-dasharray="3 5"
      />
      <polyline
        :points="points"
        fill="none"
        stroke="var(--orb-beam)"
        stroke-width="3"
      />
      <line
        :x1="20 + Number(position) * 4"
        :x2="20 + Number(position) * 4"
        y1="15"
        y2="165"
        stroke="currentColor"
        opacity=".35"
        stroke-dasharray="3 4"
      />
      <circle
        :cx="20 + Number(position) * 4"
        :cy="markerY"
        r="5"
        fill="var(--orb-aura)"
      />
      <text x="20" y="185" fill="currentColor" font-size="10">START</text>
      <text x="395" y="185" fill="currentColor" font-size="10">END</text>
    </svg>
    <label class="orb-range__label" for="preview-time"
      >Move through the release · {{ position }}%</label
    >
    <input
      id="preview-time"
      class="orb-range"
      v-model="position"
      type="range"
      min="0"
      max="100"
      :aria-valuetext="`${formatUnits(unlocked, plan.token.decimals)} ${plan.token.symbol} unlocked at ${dateLabel(at)}`"
    />
    <p class="orb-calc">
      <strong
        >{{ formatUnits(unlocked, plan.token.decimals) }}
        {{ plan.token.symbol }}</strong
      ><span>unlocked at {{ dateLabel(at) }}</span>
    </p>
    <div class="timeline-presets" role="group" aria-label="Preview points">
      <button
        type="button"
        :aria-pressed="Number(position) === 0"
        @click="position = 0"
      >
        Start</button
      ><button
        type="button"
        :aria-pressed="Number(position) === 50"
        @click="position = 50"
      >
        Midpoint</button
      ><button
        type="button"
        :aria-pressed="Number(position) === 100"
        @click="position = 100"
      >
        Fully unlocked
      </button>
    </div>
    <p class="orb-footnote">
      Exact base-unit math at the selected time. “Start now” uses the eventual
      transaction block; this preview uses the review time.
    </p>
  </div>
</template>

