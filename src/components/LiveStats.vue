<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import OrbitGlyph from "./OrbitGlyph.vue";
import { formatUnits } from "ethers";
import { config, scheduler } from "../composables/schedules";
import { network, publicProvider } from "../composables/wallet";
const count = ref(null),
  escrow = ref(null),
  block = ref(null),
  error = ref(false),
  loading = ref(false);
let active = true,
  timer;
async function refresh() {
  if (loading.value) return;
  loading.value = true;
  error.value = false;
  try {
    const [next, held, latest] = await Promise.all([
      scheduler.nextId(),
      scheduler.totalEscrow(config.testTokenAddress),
      publicProvider.getBlockNumber(),
    ]);
    if (!active) return;
    count.value = (next - 1n).toString();
    escrow.value = formatUnits(held, config.tokenDecimals);
    block.value = latest;
  } catch {
    if (active) error.value = true;
  } finally {
    if (active) loading.value = false;
  }
}
onMounted(() => {
  refresh();
  timer = setInterval(refresh, 60000);
});
onUnmounted(() => {
  active = false;
  clearInterval(timer);
});
</script>
<template>
  <section
    class="orb-metrics"
    aria-label="Live testnet protocol activity"
  >
    <div class="orb-frame">
      <div class="orb-metrics__head">
        <span class="orb-kicker"><span class="orb-pulse" /> READ IT ONCHAIN</span
        ><span v-if="error" role="status" class="orb-metrics__note"
          >Live data unavailable.
          <button class="orb-link--quiet" @click="refresh">Retry</button></span
        ><span v-else class="orb-metrics__note"
          >{{
            block
              ? `Testnet block ${block.toLocaleString()}`
              : "Reading the testnet…"
          }}
          <button
            class="orb-icon-btn"
            aria-label="Refresh protocol activity"
            @click="refresh"
            :disabled="loading"
          >
            <OrbitGlyph name="refresh" :size="13" :class="{ spin: loading }" /></button
        ></span>
      </div>
      <div class="orb-metrics__grid">
        <div>
          <strong>{{ error ? "—" : (count ?? "—") }}</strong
          ><span>Schedules created</span>
        </div>
        <div>
          <strong
            >{{ error ? "—" : (escrow ?? "—") }}<small> tUSD</small></strong
          ><span>Currently in escrow · test token only</span>
        </div>
        <div>
          <strong>0 <small>ETH</small></strong
          ><span>Protocol fee · network gas applies</span>
        </div>
        <a
          :href="`${network.explorer}/address/${config.schedulerAddress}?tab=contract`"
          target="_blank"
          rel="noopener noreferrer"
          ><span>Check the deployed rules</span
          ><span class="orb-metrics__source"
            >Source on the explorer <OrbitGlyph name="arrow" :size="15" /></span
        ></a>
      </div>
      <p class="orb-metrics__note">
        Actual testnet activity, including development tests. These figures are
        not customers, revenue or asset value. tUSD has no monetary value.
      </p>
    </div>
  </section>
</template>
