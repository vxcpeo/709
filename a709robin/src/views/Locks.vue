<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { brand } from "../config/brand";
import OrbitGlyph from "../components/OrbitGlyph.vue";
import { formatUnits } from "ethers";
import {
  wallet,
  network,
  shortAddress,
  readableError,
  ensureNetwork,
  publicProvider,
} from "../composables/wallet";
import {
  loadSchedules,
  scheduler,
  modeNames,
  dateLabel,
  validRecipient,
  waitForTransaction,
} from "../composables/schedules";
const router = useRouter();
const search = ref(""),
  statusFilter = ref("all"),
  lookupId = ref(""),
  lookupError = ref("");
function openSchedule() {
  const value = lookupId.value.trim().replace(/^#/, "");
  if (!/^[1-9]\d*$/.test(value) || BigInt(value) >= 2n ** 256n) {
    lookupError.value = "Enter a positive schedule ID, such as 12.";
    return;
  }
  lookupError.value = "";
  router.push(`/lock/${value}`);
}
const route = useRoute(),
  role = ref(route.query.role === "sent" ? "sent" : "received"),
  loading = ref(false),
  error = ref(""),
  records = ref([]),
  total = ref(0),
  page = ref(0),
  currentTime = ref(Math.floor(Date.now() / 1000)),
  lastRead = ref("");
const actionId = ref(""),
  actionType = ref(""),
  actionMessage = ref(""),
  actionHash = ref(""),
  transferAddresses = ref({}),
  cancelledConfirmation = ref(null),
  transferredConfirmation = ref(null);
let generation = 0;
let actionGeneration = 0;
let unmounted = false;
const pageSize = 12;
const visibleRecords = computed(() => {
  const query = search.value.trim().toLowerCase().replace(/^#/, "");
  return records.value.filter((record) => {
    const matchesText =
      !query ||
      [
        record.id,
        record.token.symbol,
        record.token.address,
        record.sender,
        record.recipient,
        modeNames[record.kind],
      ].some((value) => String(value).toLowerCase().includes(query));
    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "claimable" && record.claimable > 0n) ||
      (statusFilter.value === "cancelled" && record.cancelled) ||
      (statusFilter.value === "active" &&
        !record.cancelled &&
        record.claimed < record.amount);
    return matchesText && matchesStatus;
  });
});
const claimableCount = computed(
  () => records.value.filter((record) => record.claimable > 0n).length,
);
function clearFilters() {
  search.value = "";
  statusFilter.value = "all";
}
const pageCount = computed(() => Math.ceil(total.value / pageSize));
const amountLabel = (amount, token) =>
  token.decimals === null
    ? `${amount.toString()} base units`
    : Number(formatUnits(amount, token.decimals)).toLocaleString("en-US", {
        maximumFractionDigits: 6,
      });
const isRecipient = (record) =>
  record.recipient.toLowerCase() === wallet.address.toLowerCase();
const isSender = (record) =>
  record.sender.toLowerCase() === wallet.address.toLowerCase();
const canCancel = (record) =>
  isSender(record) &&
  record.cancelable &&
  !record.cancelled &&
  record.claimed < record.amount;
function status(record) {
  if (record.cancelled)
    return record.claimable > 0n
      ? "Cancelled · claim available"
      : "Cancelled · settled";
  if (record.claimed >= record.amount) return "Fully claimed";
  if (currentTime.value < record.start) return "Scheduled";
  if (currentTime.value >= record.end) return "Fully unlocked";
  if (currentTime.value < record.cliff) return "Before cliff";
  return "In motion";
}
const progress = (record) =>
  Number(((record.claimed + record.claimable) * 10000n) / record.amount) / 100;
async function refresh(silent = false) {
  const requestId = ++generation;
  if (!wallet.address) {
    records.value = [];
    total.value = 0;
    return;
  }
  if (!silent) loading.value = true;
  error.value = "";
  const address = wallet.address;
  try {
    const [result, block] = await Promise.all([
      loadSchedules(address, role.value, page.value * pageSize, pageSize),
      publicProvider.getBlock("latest"),
    ]);
    if (requestId !== generation || address !== wallet.address) return;
    records.value = result.records;
    total.value = result.total;
    currentTime.value = block.timestamp;
    lastRead.value = new Date().toLocaleTimeString("en-GB");
  } catch (e) {
    if (requestId === generation)
      error.value = `Could not read your schedules. ${readableError(e)}`;
  } finally {
    if (requestId === generation) loading.value = false;
  }
}
watch(
  [() => wallet.address, role],
  () => {
    page.value = 0;
    clearFilters();
    records.value = [];
    cancelledConfirmation.value = null;
    transferredConfirmation.value = null;
    refresh();
  },
  { immediate: true },
);
watch(page, () => refresh());
watch(
  () => wallet.address,
  () => {
    actionGeneration++;
    actionId.value = "";
    actionType.value = "";
    actionMessage.value = "";
    actionHash.value = "";
    cancelledConfirmation.value = null;
    transferredConfirmation.value = null;
  },
  { flush: "sync" },
);
watch(
  () => route.query.role,
  (value) => {
    if (value === "sent" || value === "received") role.value = value;
  },
);
const timer = setInterval(() => {
  if (wallet.address && !loading.value && !actionId.value) refresh(true);
}, 20000);
onUnmounted(() => {
  clearInterval(timer);
  generation++;
  actionGeneration++;
  unmounted = true;
});
async function act(record, type) {
  if (actionId.value || unmounted) return;
  if (!wallet.address) {
    wallet.show = true;
    return;
  }
  const originalAddress = wallet.address;
  const currentId = record.id;
  const currentRecipient = record.recipient;
  const target = transferAddresses.value[currentId]?.trim() || "";
  const operation = ++actionGeneration;
  const isCurrent = () =>
    !unmounted &&
    operation === actionGeneration &&
    originalAddress.toLowerCase() === wallet.address.toLowerCase();
  const assertCurrent = () => {
    if (!isCurrent())
      throw new Error("Your wallet changed. Refresh before continuing.");
  };
  error.value = "";
  actionId.value = currentId;
  actionType.value = type;
  actionHash.value = "";
  actionMessage.value = "Confirm the request in your wallet…";
  try {
    if (
      type === "transfer" &&
      (!validRecipient(target) ||
        target.toLowerCase() === currentRecipient.toLowerCase())
    )
      throw new Error("Enter a different valid recipient wallet address.");
    const signer = await ensureNetwork();
    assertCurrent();
    if (
      (await signer.getAddress()).toLowerCase() !==
      originalAddress.toLowerCase()
    )
      throw new Error("Your wallet changed. Refresh before continuing.");
    assertCurrent();
    const contract = scheduler.connect(signer);
    const method =
      type === "claim"
        ? contract.claim
        : type === "cancel"
          ? contract.cancel
          : contract.transferRecipient;
    const args = type === "transfer" ? [currentId, target] : [currentId];
    await method.staticCall(...args);
    assertCurrent();
    const tx = await method(...args, { chainId: network.id });
    if (isCurrent()) {
      actionHash.value = tx.hash;
      actionMessage.value = "Transaction submitted. Waiting for confirmation…";
    }
    const receipt = await waitForTransaction(tx);
    if (!isCurrent()) return;
    actionHash.value = receipt.hash;
    actionMessage.value =
      type === "claim"
        ? "Tokens claimed to your wallet."
        : type === "cancel"
          ? "Schedule cancelled. Unvested tokens returned to the creator; vested tokens remain claimable by the recipient."
          : "Claim rights transferred to the new wallet.";
    cancelledConfirmation.value = null;
    transferredConfirmation.value = null;
    await refresh(true);
  } catch (e) {
    if (isCurrent()) {
      error.value = readableError(e);
      actionMessage.value =
        "The action was not completed. Check the message and try again.";
    }
  } finally {
    if (isCurrent()) actionId.value = "";
  }
}
function exportCsv() {
  const rows = [
    [
      "id",
      "type",
      "token",
      "sender",
      "recipient",
      "amount_base_units",
      "claimed_base_units",
      "claimable_base_units",
      "start_utc",
      "cliff_utc",
      "end_utc",
      "cliff_amount_base_units",
      "refunded_base_units",
      "vested_at_cancel_base_units",
      "cancelled_at_utc",
      "cancelable",
      "status",
    ],
    ...records.value.map((r) => [
      r.id,
      modeNames[r.kind],
      r.token.address,
      r.sender,
      r.recipient,
      r.amount.toString(),
      r.claimed.toString(),
      r.claimable.toString(),
      new Date(r.start * 1000).toISOString(),
      new Date(r.cliff * 1000).toISOString(),
      new Date(r.end * 1000).toISOString(),
      r.cliffAmount.toString(),
      r.refunded.toString(),
      r.vestedAtCancel.toString(),
      r.cancelledAt ? new Date(r.cancelledAt * 1000).toISOString() : "",
      r.cancelable,
      status(r),
    ]),
  ];
  const blob = new Blob(
    [
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = `${brand.handle}-${role.value}-page-${page.value + 1}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
<template>
  <div class="orb-frame orb-view">
    <div class="orb-halo" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" focusable="false">
        <circle cx="320" cy="320" r="308" stroke="currentColor" stroke-dasharray="2 10" />
        <circle cx="320" cy="320" r="232" stroke="currentColor" stroke-dasharray="96 44" />
        <circle cx="320" cy="320" r="152" stroke="currentColor" />
        <circle cx="470" cy="168" r="7" fill="currentColor" stroke="none" />
        <circle cx="176" cy="438" r="5" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <div class="orb-scene">
    <div class="orb-lede">
      <p class="orb-kicker">DISTRIBUTION WORKSPACE</p>
      <h1>Your schedules.</h1>
      <p>
        Track funded allocations, collect available tokens, and manage each
        release from one workspace.
      </p>
    </div>
    <form class="orb-lookup" @submit.prevent="openSchedule">
      <div>
        <strong>Have a schedule ID?</strong
        ><span>Open any public schedule without connecting a wallet.</span>
      </div>
      <label class="orb-lookup__field"
        ><span class="visually-hidden">Schedule ID</span
        ><input
          v-model="lookupId"
          inputmode="numeric"
          placeholder="Schedule ID, e.g. 12"
          :aria-describedby="lookupError ? 'lookup-error' : undefined"
      /></label>
      <button type="submit" class="orb-btn orb-btn--rim">
        Open schedule <OrbitGlyph name="arrow" :size="15" />
      </button>
      <p v-if="lookupError" id="lookup-error" class="orb-error" role="alert">
        {{ lookupError }}
      </p>
    </form>
    <div
      v-if="wallet.address"
      class="orb-figures"
      aria-label="Workspace overview"
    >
      <div>
        <span>{{
          role === "sent" ? "Created schedules" : "Received schedules"
        }}</span
        ><strong>{{ total }}</strong>
      </div>
      <div>
        <span>On this page</span><strong>{{ records.length }}</strong>
      </div>
      <div>
        <span>With tokens to claim · this page</span
        ><strong>{{ claimableCount }}</strong>
      </div>
    </div>
    <div class="orb-toolbar">
      <div class="orb-switch-row" role="group" aria-label="Schedule direction">
        <button
          :class="{ active: role === 'received' }"
          :aria-pressed="role === 'received'"
          @click="role = 'received'"
        >
          Receiving</button
        ><button
          :class="{ active: role === 'sent' }"
          :aria-pressed="role === 'sent'"
          @click="role = 'sent'"
        >
          Created by me
        </button>
      </div>
      <div class="orb-toolbar__actions">
        <button
          v-if="records.length"
          class="orb-icon-btn"
          aria-label="Export current page as CSV"
          @click="exportCsv"
        >
          <OrbitGlyph name="download" :size="16" /></button
        ><button
          class="orb-icon-btn"
          aria-label="Refresh schedules"
          :disabled="loading || !wallet.address"
          @click="refresh()"
        >
          <OrbitGlyph name="refresh" :size="17" :class="{ spin: loading }" /></button
        ><RouterLink to="/create" class="orb-btn orb-btn--solid"
          ><OrbitGlyph name="plus" :size="15" /> New schedule</RouterLink
        >
      </div>
    </div>
    <p v-if="error" class="orb-notice orb-notice--bad" role="alert">
      {{ error }}
      <button class="orb-link--quiet" @click="refresh()">Retry loading</button>
    </p>
    <div v-if="actionMessage" class="orb-notice" role="status" aria-live="polite">
      {{ actionMessage }}
      <a
        v-if="actionHash"
        :href="`${network.explorer}/tx/${actionHash}`"
        target="_blank"
        rel="noopener noreferrer"
        >View transaction ↗</a
      >
    </div>
    <div v-if="!wallet.address" class="orb-empty">
      <OrbitGlyph name="wallet" :size="35" />
      <h2>Connect to see your schedules</h2>
      <p>
        Use the wallet that created or received an allocation. Your schedules
        and available claims are read directly from Robinhood Chain Testnet.
      </p>
      <div class="orb-empty__steps" role="group" aria-label="What you can do">
        <span><span>01</span> Track releases</span
        ><span><span>02</span> Claim tokens</span
        ><span><span>03</span> Manage rights</span>
      </div>
      <button class="orb-btn orb-btn--solid" @click="wallet.show = true">
        Connect your wallet <OrbitGlyph name="arrow" :size="16" />
      </button>
    </div>
    <div v-else-if="loading" class="orb-loading" role="status">
      <OrbitGlyph name="loader" :size="20" class="spin" /> Reading your commitments from the
      chain…
    </div>
    <div v-else-if="!records.length && !error" class="orb-empty">
      <OrbitGlyph name="layers" :size="35" />
      <h2>
        {{
          role === "received"
            ? "No received schedules yet"
            : "Create your first release"
        }}
      </h2>
      <p>
        {{
          role === "received"
            ? "Allocations sent to this wallet will appear here. You can also open a public schedule using its ID above."
            : "Choose a distribution model and fund an allocation. Every schedule you create will be tracked here."
        }}
      </p>
      <RouterLink to="/create" class="orb-btn orb-btn--solid"
        >Create your first schedule <OrbitGlyph name="arrow" :size="16" /></RouterLink>
    </div>
    <template v-else-if="records.length"
      ><p class="orb-networkline">
        <span class="orb-pulse" /> Read from Robinhood Chain Testnet · Updated
        {{ lastRead }} · Refreshes every 20 seconds
      </p>
      <div class="orb-filters">
        <label class="orb-filters__search"
          ><span class="visually-hidden">Search schedules on this page</span
          ><input
            v-model="search"
            type="search"
            placeholder="Search this page by ID, token or wallet" /></label
        ><label
          ><span class="visually-hidden">Filter schedules on this page</span
          ><select v-model="statusFilter">
            <option value="all">All statuses</option>
            <option value="claimable">Available to claim</option>
            <option value="active">Active schedules</option>
            <option value="cancelled">Cancelled</option>
          </select></label
        ><span
          >{{ visibleRecords.length }} of {{ records.length }} on this
          page</span
        >
      </div>
      <div v-if="!visibleRecords.length" class="orb-empty orb-empty--filter">
        <h2>No matching schedules</h2>
        <p>Search and filters apply to the current page.</p>
        <button class="orb-btn orb-btn--rim" @click="clearFilters">
          Clear filters
        </button>
      </div>
      <div class="orb-records">
        <article
          v-for="record in visibleRecords"
          :key="record.id"
          class="orb-record"
        >
          <div class="orb-record__top">
            <span class="orb-record__id"
              >SCHEDULE / {{ record.id.padStart(4, "0") }}</span
            ><span class="orb-tag">{{ status(record) }}</span>
          </div>
          <h3>
            <RouterLink :to="`/lock/${record.id}`">{{
              modeNames[record.kind]
            }}</RouterLink>
          </h3>
          <p class="orb-record__party">
            {{ role === "sent" ? "To" : "From" }}
            <a
              :href="`${network.explorer}/address/${role === 'sent' ? record.recipient : record.sender}`"
              target="_blank"
              rel="noopener noreferrer"
              >{{
                shortAddress(role === "sent" ? record.recipient : record.sender)
              }}
              ↗</a
            >
          </p>
          <div class="orb-record__amount">
            {{ amountLabel(record.amount, record.token) }}
            <span>{{ record.token.symbol }}</span>
          </div>
          <div
            class="orb-track"
            role="progressbar"
            :aria-valuenow="progress(record)"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Unlocked percentage"
          >
            <div
              class="orb-track__fill"
              :style="{ width: progress(record) + '%' }"
            />
          </div>
          <div class="orb-record__caption">
            <span>{{
              record.cancelled
                ? progress(record).toFixed(1) + "% vested at cancellation"
                : progress(record).toFixed(1) + "% unlocked"
            }}</span
            ><span
              >{{ amountLabel(record.claimed, record.token) }} claimed</span
            >
          </div>
          <dl>
            <div>
              <dt>{{ record.kind === 1 ? "Unlocks" : "Starts" }}</dt>
              <dd>{{ dateLabel(record.start) }}</dd>
            </div>
            <div v-if="record.kind !== 1">
              <dt>Fully unlocked</dt>
              <dd>{{ dateLabel(record.end) }}</dd>
            </div>
            <div v-if="record.cliff > record.start">
              <dt>Cliff</dt>
              <dd>{{ dateLabel(record.cliff) }}</dd>
            </div>
            <div v-if="record.cliffAmount > 0n">
              <dt>Cliff unlock</dt>
              <dd>
                {{ amountLabel(record.cliffAmount, record.token) }}
                {{ record.token.symbol }}
              </dd>
            </div>
            <div v-if="record.cancelled">
              <dt>Cancelled</dt>
              <dd>{{ dateLabel(record.cancelledAt) }}</dd>
            </div>
            <div v-if="record.cancelled">
              <dt>Refunded to creator</dt>
              <dd>
                {{ amountLabel(record.refunded, record.token) }}
                {{ record.token.symbol }}
              </dd>
            </div>
            <div v-if="record.cancelled">
              <dt>Total recipient entitlement</dt>
              <dd>
                {{ amountLabel(record.vestedAtCancel, record.token) }}
                {{ record.token.symbol }}
              </dd>
            </div>
            <div>
              <dt>Available to claim</dt>
              <dd>
                {{ amountLabel(record.claimable, record.token) }}
                {{ record.token.symbol }}
              </dd>
            </div>
            <div>
              <dt>Cancellation</dt>
              <dd>
                {{
                  record.cancelable ? "Vested tokens protected" : "Irrevocable"
                }}
              </dd>
            </div>
          </dl>
          <div class="orb-record__actions">
            <RouterLink class="orb-btn orb-btn--rim" :to="`/lock/${record.id}`"
              >View schedule <OrbitGlyph name="arrow" :size="13" /></RouterLink>
            <button
              v-if="isRecipient(record)"
              class="orb-btn orb-btn--solid"
              :disabled="record.claimable === 0n || !!actionId"
              @click="act(record, 'claim')"
            >
              <OrbitGlyph name="loader"
                v-if="actionId === record.id && actionType === 'claim'"
                :size="14"
                class="spin" />{{
                record.claimable > 0n
                  ? "Claim unlocked tokens"
                  : "Nothing to claim yet"
              }}<OrbitGlyph name="arrow" :size="14" /></button
            ><button
              v-if="canCancel(record)"
              class="orb-btn orb-btn--rim"
              :disabled="!!actionId"
              @click="
                cancelledConfirmation =
                  cancelledConfirmation === record.id ? null : record.id
              "
            >
              Cancel schedule</button
            ><a
              class="orb-btn orb-btn--rim"
              :href="`${network.explorer}/address/${record.token.address}`"
              target="_blank"
              rel="noopener noreferrer"
              >Token <OrbitGlyph name="arrow" :size="13" /></a>
          </div>
          <div v-if="cancelledConfirmation === record.id" class="orb-review">
            <p class="orb-small">
              End this schedule now? Approximately
              {{
                amountLabel(
                  record.amount - record.claimed - record.claimable,
                  record.token,
                )
              }}
              {{ record.token.symbol }} will return to the creator.
              Approximately {{ amountLabel(record.claimable, record.token) }}
              {{ record.token.symbol }} will remain claimable by the recipient.
              Exact settlement uses the transaction’s block time; previously
              claimed tokens stay with the recipient.
            </p>
            <button
              class="orb-btn orb-btn--solid orb-wide"
              :disabled="!!actionId"
              @click="act(record, 'cancel')"
            >
              Confirm cancellation</button
            ><button
              class="orb-btn orb-btn--rim orb-wide"
              :disabled="!!actionId"
              @click="cancelledConfirmation = null"
            >
              Keep schedule
            </button>
          </div>
          <details
            v-if="
              isRecipient(record) &&
              record.claimed <
                (record.cancelled ? record.vestedAtCancel : record.amount)
            "
          >
            <summary>Move claim rights to another wallet</summary>
            <div class="orb-transfer">
              <label class="orb-field"
                ><span>New recipient wallet</span
                ><input
                  v-model="transferAddresses[record.id]"
                  @input="transferredConfirmation = null"
                  placeholder="0x…"
                  autocomplete="off"
                  spellcheck="false"
                  :disabled="!!actionId"
                /><small
                  >This transfers all remaining claim rights. Your wallet will
                  no longer be able to claim this schedule.</small
                ></label
              ><button
                v-if="transferredConfirmation !== record.id"
                class="orb-btn orb-btn--rim"
                :disabled="
                  !!actionId ||
                  !validRecipient(transferAddresses[record.id] || '')
                "
                @click="transferredConfirmation = record.id"
              >
                Review recipient transfer
              </button>
              <div v-else class="orb-review">
                <p class="orb-small" style="overflow-wrap: anywhere">
                  Transfer all remaining rights to
                  {{ transferAddresses[record.id] }}? This cannot be undone by
                  your wallet.
                </p>
                <button
                  class="orb-btn orb-btn--solid"
                  :disabled="!!actionId"
                  @click="act(record, 'transfer')"
                >
                  Confirm transfer</button
                ><button
                  class="orb-btn orb-btn--rim"
                  :disabled="!!actionId"
                  @click="transferredConfirmation = null"
                >
                  Back to editing
                </button>
              </div>
            </div>
          </details>
        </article>
      </div>
      <div v-if="pageCount > 1" class="orb-pager">
        <button
          class="orb-btn orb-btn--rim"
          :disabled="page === 0"
          @click="page--"
        >
          Previous</button
        ><span>{{ page + 1 }} / {{ pageCount }}</span
        ><button
          class="orb-btn orb-btn--rim"
          :disabled="page + 1 >= pageCount"
          @click="page++"
        >
          Next
        </button>
      </div></template
    >
    <p class="orb-hint" style="margin-top: 24px">
      Schedule data is public. Displayed amounts are rounded to six decimals;
      CSV exports preserve exact base units. Claims always use the contract’s
      exact balance.
    </p>
  </div>
    </div>
</template>

