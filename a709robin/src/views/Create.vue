<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { Contract, formatUnits, parseUnits } from "ethers";
import OrbitGlyph from "../components/OrbitGlyph.vue";
import FlowChart from "../components/FlowChart.vue";
import SchedulePreview from "../components/SchedulePreview.vue";
import {
  wallet,
  network,
  tokenInfo,
  tokenAbi,
  ensureNetwork,
  readableError,
  onNetwork,
} from "../composables/wallet";
import {
  config,
  fundSchedule,
  exactAmount,
  validRecipient,
  dateLabel,
  waitForTransaction,
} from "../composables/schedules";
const route = useRoute();
const activeSection = ref("assets");
const steps = [
  { id: "assets", label: "Assets", detail: "Choose a token" },
  { id: "recipients", label: "Recipients", detail: "Set allocations" },
  { id: "timing", label: "Timing", detail: "Plan the release" },
  { id: "review", label: "Review", detail: "Check & fund" },
];
function goToSection(section) {
  activeSection.value = section;
  const target = document.getElementById(`create-${section}`);
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: "start" });
}
async function editSchedule() {
  reviewed.value = null;
  accepted.value = false;
  await nextTick();
  goToSection("assets");
}
const types = [
  {
    id: "vesting",
    title: "Token vesting",
    sub: "Release tokens in scheduled steps.",
    glyph: "timer",
  },
  {
    id: "lock",
    title: "Token lock",
    sub: "Unlock the full amount on one date.",
    glyph: "lock",
  },
  {
    id: "stream",
    title: "Payment stream",
    sub: "Accrue a claimable balance each second.",
    glyph: "waves",
  },
  {
    id: "airdrop",
    title: "Vested airdrop",
    sub: "Up to 100 allocations, one timeline.",
    glyph: "layers",
  },
];
const mode = ref(
  types.some((t) => t.id === route.query.mode) ? route.query.mode : "vesting",
);
const localDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
const now = Date.now();
const recipient = ref(""),
  amount = ref("1000"),
  batch = ref(""),
  start = ref(localDate(new Date(now + 15 * 60000))),
  end = ref(localDate(new Date(now + 30 * 86400000))),
  cliff = ref(localDate(new Date(now + 7 * 86400000))),
  hasCliff = ref(true),
  cadence = ref("86400"),
  startsNow = ref(true),
  cliffAmount = ref("0"),
  cancelable = ref(false);
const durationValue = ref(30),
  durationUnit = ref(86400),
  cliffDelayValue = ref(7),
  cliffDelayUnit = ref(86400);
const timeUnits = [
  { label: "minutes", seconds: 60 },
  { label: "hours", seconds: 3600 },
  { label: "days", seconds: 86400 },
  { label: "weeks", seconds: 604800 },
  { label: "months (30 days)", seconds: 2592000 },
  { label: "years (365 days)", seconds: 31536000 },
];
function applyDuration() {
  const base =
    hasCliff.value && ["vesting", "airdrop"].includes(mode.value)
      ? Date.parse(cliff.value)
      : startsNow.value
        ? Date.now()
        : Date.parse(start.value);
  const seconds = Number(durationValue.value) * Number(durationUnit.value);
  if (
    !Number.isFinite(base) ||
    !Number.isSafeInteger(seconds) ||
    seconds <= 0 ||
    seconds > 100 * 365 * 86400
  ) {
    error.value = "Choose a positive duration of at most 100 years.";
    return;
  }
  end.value = localDate(new Date(base + seconds * 1000));
  error.value = "";
}
function applyCliffDelay() {
  const base = startsNow.value ? Date.now() : Date.parse(start.value),
    seconds = Number(cliffDelayValue.value) * Number(cliffDelayUnit.value);
  if (
    !Number.isFinite(base) ||
    !Number.isSafeInteger(seconds) ||
    seconds < 0 ||
    seconds > 100 * 365 * 86400
  ) {
    error.value = "Choose a cliff delay between zero and 100 years.";
    return;
  }
  cliff.value = localDate(new Date(base + seconds * 1000));
  error.value = "";
}
const splitAllocation = (line) => line.trim().split(/\s*,\s*|\s+/);
const useCustom = ref(false),
  customAddress = ref(""),
  token = ref({
    address: config.testTokenAddress,
    symbol: config.tokenSymbol,
    decimals: config.tokenDecimals,
  }),
  tokenLoading = ref(false);
const error = ref(""),
  busy = ref(false),
  minting = ref(false),
  reviewed = ref(null),
  accepted = ref(false),
  phase = ref(""),
  message = ref(""),
  txHash = ref(""),
  createdIds = ref([]),
  balanceMessage = ref("");
let tokenRequestId = 0;
watch(
  () => route.query.mode,
  (next) => {
    if (types.some((t) => t.id === next)) mode.value = next;
  },
);
watch(
  [
    mode,
    recipient,
    amount,
    batch,
    start,
    end,
    cliff,
    hasCliff,
    cadence,
    startsNow,
    cliffAmount,
    cancelable,
    customAddress,
    useCustom,
  ],
  () => {
    reviewed.value = null;
    accepted.value = false;
    if (!busy.value) {
      phase.value = "";
      createdIds.value = [];
      txHash.value = "";
    }
  },
);
watch(
  () => wallet.address,
  () => {
    reviewed.value = null;
    accepted.value = false;
    balanceMessage.value = "";
  },
);
watch(useCustom, (custom) => {
  tokenRequestId++;
  tokenLoading.value = false;
  token.value = custom
    ? null
    : {
        address: config.testTokenAddress,
        symbol: config.tokenSymbol,
        decimals: config.tokenDecimals,
      };
});
watch(customAddress, () => {
  tokenRequestId++;
  tokenLoading.value = false;
  if (useCustom.value) token.value = null;
});
const symbol = computed(() => token.value?.symbol || "tokens");
const recipientCount = computed(() =>
  mode.value === "airdrop"
    ? batch.value
        .trim()
        .split("\n")
        .filter((line) => line.trim()).length
    : 1,
);
const previewAmount = computed(() => {
  try {
    if (!token.value) return "—";
    if (mode.value !== "airdrop") return amount.value || "0";
    return formatUnits(
      batch.value
        .trim()
        .split("\n")
        .filter((line) => line.trim())
        .reduce(
          (sum, line) =>
            sum +
            exactAmount(splitAllocation(line)[1] || "", token.value.decimals),
          0n,
        ),
      token.value.decimals,
    );
  } catch {
    return "—";
  }
});
const selectedType = computed(() => types.find((t) => t.id === mode.value));
const previewDate = (value) => {
  const date = Date.parse(value);
  return Number.isFinite(date) ? dateLabel(date / 1000) : "Choose a date";
};
async function loadToken() {
  const requestId = ++tokenRequestId,
    requestedAddress = customAddress.value.trim();
  error.value = "";
  tokenLoading.value = true;
  try {
    const loaded = await tokenInfo(requestedAddress);
    if (
      requestId === tokenRequestId &&
      useCustom.value &&
      customAddress.value.trim() === requestedAddress
    )
      token.value = loaded;
  } catch (e) {
    if (requestId === tokenRequestId) {
      error.value = readableError(e);
      token.value = null;
    }
  } finally {
    if (requestId === tokenRequestId) tokenLoading.value = false;
  }
}
async function review() {
  error.value = "";
  reviewed.value = null;
  accepted.value = false;
  try {
    if (!token.value)
      throw new Error("Load and verify the token before continuing.");
    const tokenDecimals = token.value.decimals;
    let recipients, amounts, cliffAmounts;
    const cliffEnabled =
      hasCliff.value && (mode.value === "vesting" || mode.value === "airdrop");
    const defaultCliffAmount = cliffEnabled
      ? exactAmount(cliffAmount.value || "0", tokenDecimals, true)
      : 0n;
    if (mode.value === "airdrop") {
      const lines = batch.value
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      if (!lines.length || lines.length > 100)
        throw new Error(
          "Add between 1 and 100 recipients, one address,amount pair per line.",
        );
      const rows = lines.map((line, i) => {
        const columns = splitAllocation(line);
        if (![2, 3].includes(columns.length) || !validRecipient(columns[0]))
          throw new Error(
            `Line ${i + 1}: use address,amount or address,amount,cliffAmount.`,
          );
        return columns;
      });
      recipients = rows.map((row) => row[0]);
      amounts = rows.map((row) => exactAmount(row[1], tokenDecimals));
      cliffAmounts = rows.map((row) =>
        cliffEnabled
          ? row[2]
            ? exactAmount(row[2], tokenDecimals, true)
            : defaultCliffAmount
          : 0n,
      );
      if (
        new Set(recipients.map((a) => a.toLowerCase())).size !==
        recipients.length
      )
        throw new Error("Each recipient must appear only once in this batch.");
    } else {
      if (!validRecipient(recipient.value.trim()))
        throw new Error(
          "Enter a valid recipient wallet. The zero address and scheduler contract are not allowed.",
        );
      recipients = [recipient.value.trim()];
      amounts = [exactAmount(amount.value, tokenDecimals)];
      cliffAmounts = [defaultCliffAmount];
    }
    if (cliffAmounts.some((value, i) => value > amounts[i]))
      throw new Error(
        "The cliff amount cannot exceed its recipient’s total allocation.",
      );
    const ends = Math.floor(Date.parse(end.value) / 1000);
    const starts =
      mode.value === "lock"
        ? ends
        : startsNow.value
          ? 0
          : Math.floor(Date.parse(start.value) / 1000);
    const effectiveStart = starts || Math.floor(Date.now() / 1000);
    const cliffs =
      mode.value === "lock"
        ? ends
        : cliffEnabled
          ? Math.floor(Date.parse(cliff.value) / 1000)
          : starts;
    const effectiveCliff = cliffs || effectiveStart;
    if (![starts, cliffs, ends].every(Number.isFinite))
      throw new Error("Choose valid start, cliff and end dates.");
    if (mode.value !== "lock" && ends <= effectiveCliff)
      throw new Error("The end time must be after the start time.");
    if (effectiveCliff < effectiveStart || effectiveCliff > ends)
      throw new Error("The cliff must be between the start and end times.");
    if (ends - effectiveStart > 100 * 365 * 86400)
      throw new Error(
        "The complete schedule, including its cliff delay, cannot exceed 100 years.",
      );
    if (amounts.reduce((sum, value) => sum + value, 0n) >= 2n ** 256n)
      throw new Error("The combined batch amount is too large.");
    const interval =
      mode.value === "lock"
        ? 0
        : mode.value === "stream"
          ? 1
          : Number(cadence.value);
    if (
      mode.value !== "lock" &&
      (!Number.isSafeInteger(interval) || interval < 1)
    )
      throw new Error("Choose a valid release cadence.");
    const totalLabel = formatUnits(
      amounts.reduce((sum, n) => sum + n, 0n),
      tokenDecimals,
    );
    reviewed.value = {
      mode: mode.value,
      token: { ...token.value },
      recipients,
      amounts,
      cliffAmounts,
      start: starts,
      cliff: cliffs,
      end: ends,
      interval,
      kind: { vesting: 0, lock: 1, stream: 2, airdrop: 3 }[mode.value],
      cancelable: cancelable.value,
      totalLabel,
    };
    activeSection.value = "review";
    await nextTick();
    document
      .getElementById("create-confirmation")
      ?.focus({ preventScroll: true });
    document
      .getElementById("create-confirmation")
      ?.scrollIntoView({ block: "start" });
  } catch (e) {
    error.value = readableError(e);
    await nextTick();
    document.getElementById("create-error")?.focus();
  }
}
async function submit() {
  if (!reviewed.value || !accepted.value || busy.value) return;
  if (!wallet.address) {
    wallet.show = true;
    return;
  }
  error.value = "";
  busy.value = true;
  createdIds.value = [];
  const plan = {
    ...reviewed.value,
    token: { ...reviewed.value.token },
    amounts: [...reviewed.value.amounts],
    cliffAmounts: [...reviewed.value.cliffAmounts],
    recipients: [...reviewed.value.recipients],
  };
  try {
    createdIds.value = await fundSchedule(plan, (step, text, hash) => {
      phase.value = step;
      message.value = text;
      if (hash) txHash.value = hash;
    });
  } catch (e) {
    error.value = readableError(e);
    phase.value = "error";
    message.value =
      "The flow stopped. Review the message and retry. A confirmed approval may remain even if funding was not completed.";
  } finally {
    busy.value = false;
  }
}
async function mint() {
  if (!wallet.address) {
    wallet.show = true;
    return;
  }
  error.value = "";
  minting.value = true;
  balanceMessage.value = "";
  try {
    const signer = await ensureNetwork();
    const tx = await new Contract(
      config.testTokenAddress,
      tokenAbi,
      signer,
    ).mint(parseUnits("1000", 6), { chainId: network.id });
    await waitForTransaction(tx);
    balanceMessage.value = "1,000 tUSD minted to your wallet.";
  } catch (e) {
    error.value = readableError(e);
  } finally {
    minting.value = false;
  }
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
      <p class="orb-kicker">DISTRIBUTION STUDIO / NEW SCHEDULE</p>
      <h1>Build your release.</h1>
      <p>
        Choose a distribution model, define the allocations, then review every
        detail before funding.
      </p>
    </div>
    <div class="orb-networkline">
      <span class="orb-pulse" /> Robinhood Chain Testnet · Test tokens only ·
      No protocol fees
    </div>
    <div class="orb-console__head">
      <h2>Choose a distribution model</h2>
      <span>01 / Configure</span>
    </div>
    <div class="orb-modes" role="group" aria-label="Choose schedule type">
      <button
        v-for="type in types"
        :key="type.id"
        class="orb-mode"
        :class="{ active: mode === type.id }"
        :aria-pressed="mode === type.id"
        :disabled="busy"
        @click="mode = type.id"
      >
        <OrbitGlyph :name="type.glyph" :size="22" /><span
          ><strong>{{ type.title }}</strong
          ><small>{{ type.sub }}</small></span
        >
      </button>
    </div>
    <nav class="orb-console__rail" aria-label="Schedule creation steps">
      <button
        v-for="(step, index) in steps"
        :key="step.id"
        type="button"
        :class="{ active: activeSection === step.id }"
        :aria-current="activeSection === step.id ? 'step' : undefined"
        @click="goToSection(step.id)"
      >
        <span class="orb-console__index">0{{ index + 1 }}</span
        ><span
          ><strong>{{ step.label }}</strong
          ><small>{{ step.detail }}</small></span
        >
        <OrbitGlyph name="check" v-if="step.id === 'review' && reviewed" :size="16" />
      </button>
    </nav>
    <div class="orb-console">
      <form class="orb-panel" @submit.prevent="review">
        <fieldset
          id="create-assets"
          tabindex="-1"
          :disabled="busy"
          class="orb-panel__section"
          @focusin="activeSection = 'assets'"
        >
          <legend><span>01</span> Choose your asset</legend>
          <div class="orb-switch" role="group" aria-label="Token source">
            <button
              type="button"
              :class="{ active: !useCustom }"
              :aria-pressed="!useCustom"
              @click="useCustom = false"
            >
              tUSD · Test token</button
            ><button
              type="button"
              :class="{ active: useCustom }"
              :aria-pressed="useCustom"
              @click="useCustom = true"
            >
              Custom ERC-20
            </button>
          </div>
          <div v-if="useCustom" class="orb-field">
            <label for="custom-token"
              >Token contract on Robinhood testnet</label
            >
            <div class="orb-field--inline">
              <input
                id="custom-token"
                v-model="customAddress"
                placeholder="0x…"
                spellcheck="false"
                autocomplete="off"
              /><button
                type="button"
                class="orb-btn orb-btn--rim"
                :disabled="tokenLoading"
                @click="loadToken"
              >
                {{ tokenLoading ? "Loading…" : "Load token" }}
              </button>
            </div>
            <small v-if="token"
              >{{ token.symbol }} · {{ token.decimals }} decimals · Verify the
              contract independently.</small
            ><small
              >Standard fixed-balance ERC-20 tokens only. Rebasing and
              fee-on-transfer tokens are unsupported.</small
            >
          </div>
          <div v-else class="orb-token-row" role="status">
            <span>{{
              balanceMessage ||
              "Use a free test balance to explore the full flow."
            }}</span
            ><button type="button" :disabled="minting" @click="mint">
              {{ minting ? "Minting…" : "Mint 1,000 tUSD ↗" }}
            </button>
          </div>
        </fieldset>
        <fieldset
          id="create-recipients"
          tabindex="-1"
          :disabled="busy"
          class="orb-panel__section"
          @focusin="activeSection = 'recipients'"
        >
          <legend><span>02</span> Define the allocation</legend>
          <template v-if="mode !== 'airdrop'"
            ><div class="orb-field">
              <div class="orb-field__label">
                <label for="recipient">Recipient wallet</label
                ><button
                  type="button"
                  v-if="wallet.address"
                  class="orb-link--quiet"
                  @click="recipient = wallet.address"
                >
                  Use my wallet
                </button>
              </div>
              <input
                id="recipient"
                v-model="recipient"
                placeholder="0x… recipient address"
                spellcheck="false"
                autocomplete="off"
              /><small>The wallet that can claim unlocked tokens.</small>
            </div>
            <label class="orb-field"
              ><span>Amount ({{ symbol }})</span
              ><input
                v-model="amount"
                inputmode="decimal"
                placeholder="1000"
                autocomplete="off" /></label
          ></template>
          <label v-else class="orb-field"
            ><span>Recipients and amounts</span
            ><textarea
              v-model="batch"
              rows="5"
              placeholder="0xRecipientAddress,1000,100&#10;0xAnotherAddress,2500,250"
              spellcheck="false"
            /><small
              >One address,amount pair per line (spaces also work); an optional
              third column overrides that recipient’s cliff amount. Up to 100
              unique recipients. No CSV header, commas in amounts, or scientific
              notation. {{ recipientCount }} recipients entered.</small
            ></label
          >
        </fieldset>
        <fieldset
          id="create-timing"
          tabindex="-1"
          :disabled="busy"
          class="orb-panel__section"
          @focusin="activeSection = 'timing'"
        >
          <legend><span>03</span> Design the timeline</legend>
          <details class="orb-timeline-shortcuts" v-if="mode !== 'lock'">
            <summary>Set dates with durations</summary>
            <div
              v-if="hasCliff && (mode === 'vesting' || mode === 'airdrop')"
              class="orb-preset"
            >
              <label class="orb-field"
                ><span>Cliff after</span
                ><input
                  v-model="cliffDelayValue"
                  type="number"
                  min="0"
                  step="1" /></label
              ><label class="orb-field"
                ><span>Cliff delay unit</span
                ><select v-model="cliffDelayUnit">
                  <option
                    v-for="unit in timeUnits"
                    :key="unit.seconds"
                    :value="unit.seconds"
                  >
                    {{ unit.label }}
                  </option>
                </select></label
              ><button
                type="button"
                class="orb-btn orb-btn--rim"
                aria-label="Set cliff"
                @click="applyCliffDelay"
              >
                Set cliff
              </button>
            </div>
            <div class="orb-preset">
              <label class="orb-field"
                ><span>Release duration</span
                ><input
                  v-model="durationValue"
                  type="number"
                  min="1"
                  step="1" /></label
              ><label class="orb-field"
                ><span>Duration unit</span
                ><select v-model="durationUnit">
                  <option
                    v-for="unit in timeUnits"
                    :key="unit.seconds"
                    :value="unit.seconds"
                  >
                    {{ unit.label }}
                  </option>
                </select></label
              ><button
                type="button"
                class="orb-btn orb-btn--rim"
                aria-label="Set end"
                @click="applyDuration"
              >
                Set end
              </button>
            </div>
            <p class="orb-hint">
              Duration runs after the cliff when enabled, otherwise after the
              start. A month is 30 days; a year is 365 days. The exact dates
              below are the final terms.
            </p>
          </details>
          <label v-if="mode !== 'lock'" class="orb-field"
            ><span>When does it start?</span
            ><select v-model="startsNow">
              <option :value="true">Now · when funding confirms</option>
              <option :value="false">Custom date</option>
            </select></label
          >
          <div class="orb-field-row">
            <label class="orb-field" v-if="mode !== 'lock' && !startsNow"
              ><span>Starts at · your local time</span
              ><input type="datetime-local" v-model="start" required /></label
            ><label class="orb-field"
              ><span
                >{{ mode === "lock" ? "Unlocks at" : "Fully unlocked at" }} ·
                your local time</span
              ><input type="datetime-local" v-model="end" required
            /></label>
          </div>
          <template v-if="mode === 'vesting' || mode === 'airdrop'"
            ><label class="orb-check"
              ><input type="checkbox" v-model="hasCliff" /><span
                >Add a cliff<small
                  >Nothing unlocks before the cliff. Your chosen cliff amount
                  unlocks then; the remainder releases afterwards.</small
                ></span
              ></label
            >
            <div class="orb-field-row" style="margin-top: 20px">
              <label v-if="hasCliff" class="orb-field"
                ><span>Cliff ends · your local time</span
                ><input type="datetime-local" v-model="cliff" required /></label
              ><label class="orb-field"
                ><span>Release cadence</span
                ><select v-model="cadence">
                  <option value="1">Every second</option>
                  <option value="60">Every minute</option>
                  <option value="3600">Every hour</option>
                  <option value="86400">Every day (24 hours)</option>
                  <option value="604800">Every week (7 days)</option>
                  <option value="2592000">Every 30 days</option>
                </select></label
              >
            </div></template
          >
          <label
            v-if="hasCliff && (mode === 'vesting' || mode === 'airdrop')"
            class="orb-field"
            ><span
              >{{
                mode === "airdrop"
                  ? "Default cliff amount per recipient"
                  : "Cliff unlock amount"
              }}
              ({{ symbol }})</span
            ><input
              v-model="cliffAmount"
              inputmode="decimal"
              placeholder="0"
            /><small
              >This is part of the total allocation, not an additional deposit.
              Zero begins the remaining release after the cliff.</small
            ></label
          >
          <p v-if="mode === 'stream'" class="orb-hint">
            The full deposit is funded up front. The recipient’s claimable
            balance then grows every second between the start and end.
          </p>
          <p v-if="mode === 'lock'" class="orb-hint">
            The entire amount stays locked until the unlock time. For this type,
            the start and unlock times are the same.
          </p>
        </fieldset>
        <fieldset
          id="create-review"
          tabindex="-1"
          :disabled="busy"
          class="orb-panel__section"
          @focusin="activeSection = 'review'"
        >
          <legend><span>04</span> Review the final terms</legend>
          <label class="orb-check"
            ><input type="checkbox" v-model="cancelable" /><span
              >Allow the creator to cancel<small
                >The creator may end the schedule at any time. Tokens already
                unlocked remain claimable by the recipient; only the unvested
                remainder returns to the creator. Leave unchecked for an
                irrevocable commitment.</small
              ></span
            ></label
          >
        </fieldset>
        <p
          v-if="error"
          id="create-error"
          tabindex="-1"
          class="orb-notice orb-notice--bad"
          role="alert"
        >
          {{ error }}
        </p>
        <template v-if="phase !== 'complete'"
          ><button
            type="submit"
            class="orb-btn orb-btn--solid orb-wide"
            :disabled="busy || tokenLoading"
          >
            Review your schedule <OrbitGlyph name="arrow" :size="17" />
          </button>
          <p class="orb-hint">
            Reviewing is free and does not request a signature.
          </p></template
        >
        <div
          v-if="reviewed && phase !== 'complete'"
          id="create-confirmation"
          tabindex="-1"
          class="orb-review orb-review__confirm"
          aria-labelledby="review-title"
        >
          <div class="orb-review__head">
            <div>
              <p class="orb-kicker">04 / READY FOR YOUR CHECK</p>
              <h3 id="review-title">Review before funding</h3>
            </div>
            <button
              type="button"
              class="orb-btn orb-btn--rim"
              :disabled="busy"
              @click="editSchedule"
            >
              Back to editing
            </button>
          </div>
          <p class="orb-hint">
            The deposit is funded in full. Confirm these terms, then authorize
            each transaction in your wallet.
          </p>
          <dl>
            <div>
              <dt>Exact deposit</dt>
              <dd>{{ reviewed.totalLabel }} {{ reviewed.token.symbol }}</dd>
            </div>
            <div>
              <dt>Token contract</dt>
              <dd>
                <code>{{ reviewed.token.address }}</code>
              </dd>
            </div>
            <div>
              <dt>Recipients</dt>
              <dd>
                {{ reviewed.recipients.length }} wallet{{
                  reviewed.recipients.length === 1 ? "" : "s"
                }}
              </dd>
            </div>
            <div v-if="reviewed.recipients.length === 1">
              <dt>Recipient address</dt>
              <dd>
                <code>{{ reviewed.recipients[0] }}</code>
              </dd>
            </div>
            <div>
              <dt>Schedule starts</dt>
              <dd>
                {{
                  reviewed.start === 0
                    ? "When funding confirms"
                    : dateLabel(reviewed.start)
                }}
              </dd>
            </div>
            <div>
              <dt>Fully unlocked</dt>
              <dd>{{ dateLabel(reviewed.end) }}</dd>
            </div>
            <div v-if="reviewed.cliff > reviewed.start">
              <dt>Cliff</dt>
              <dd>{{ dateLabel(reviewed.cliff) }}</dd>
            </div>
            <div v-if="reviewed.cliffAmounts.some((value) => value > 0n)">
              <dt>Cliff unlock total</dt>
              <dd>
                {{
                  formatUnits(
                    reviewed.cliffAmounts.reduce(
                      (sum, value) => sum + value,
                      0n,
                    ),
                    reviewed.token.decimals,
                  )
                }}
                {{ reviewed.token.symbol }}
              </dd>
            </div>
            <div v-if="reviewed.interval">
              <dt>Release cadence</dt>
              <dd>Every {{ reviewed.interval.toLocaleString() }} seconds</dd>
            </div>
            <div>
              <dt>Cancellation</dt>
              <dd>
                {{
                  reviewed.cancelable
                    ? "Unvested funds refundable; vested funds protected"
                    : "Never"
                }}
              </dd>
            </div>
          </dl>
          <details
            v-if="reviewed.recipients.length > 1"
            class="orb-review__list"
          >
            <summary>
              Review all {{ reviewed.recipients.length }} allocations
            </summary>
            <ol>
              <li
                v-for="(address, index) in reviewed.recipients"
                :key="address"
              >
                <code>{{ address }}</code
                ><strong
                  >{{
                    formatUnits(
                      reviewed.amounts[index],
                      reviewed.token.decimals,
                    )
                  }}
                  {{ reviewed.token.symbol }}</strong
                >
                <small
                  >Cliff:
                  {{
                    formatUnits(
                      reviewed.cliffAmounts[index],
                      reviewed.token.decimals,
                    )
                  }}
                  {{ reviewed.token.symbol }}</small
                >
              </li>
            </ol>
          </details>
          <label class="orb-check"
            ><input type="checkbox" v-model="accepted" :disabled="busy" /><span
              >I checked the token, recipient{{
                reviewed.recipients.length === 1 ? "" : "s"
              }}
              and timeline. I understand this is an unaudited testnet
              release.</span
            ></label
          ><button
            type="button"
            class="orb-btn orb-btn--solid orb-wide"
            style="margin-top: 18px"
            :disabled="!accepted || busy"
            @click="submit"
          >
            <OrbitGlyph name="loader" v-if="busy" :size="16" class="spin" />{{
              busy
                ? "Waiting for your wallet…"
                : !wallet.address
                  ? "Connect wallet to continue"
                  : !onNetwork
                    ? "Switch network & fund"
                    : "Approve & fund schedule"
            }}<OrbitGlyph name="arrow" v-if="!busy" :size="16" />
          </button>
        </div>
        <div
          v-if="phase"
          class="orb-tx-status"
          role="status"
          aria-live="polite"
        >
          <h3>
            {{
              phase === "complete"
                ? "Schedule funded successfully"
                : phase === "error"
                  ? "Funding needs your attention"
                  : "Funding your schedule"
            }}
          </h3>
          <div class="orb-tx-steps">
            <span
              :class="{
                done:
                  phase === 'approval' ||
                  phase === 'funding' ||
                  phase === 'complete',
              }"
            /><span
              :class="{ done: phase === 'funding' || phase === 'complete' }"
            /><span :class="{ done: phase === 'complete' }" />
          </div>
          <div class="orb-tx-labels">
            <span>1. Check allowance</span><span>2. Fund schedule</span
            ><span>3. Confirmed</span>
          </div>
          <p>{{ message }}</p>
          <a
            v-if="txHash"
            :href="`${network.explorer}/tx/${txHash}`"
            target="_blank"
            rel="noopener noreferrer"
            >View latest transaction ↗</a
          >
          <p v-if="createdIds.length">
            Schedule ID{{ createdIds.length === 1 ? "" : "s" }}:
            <RouterLink
              v-for="id in createdIds"
              :key="id"
              :to="`/lock/${id}`"
              style="margin-right: 8px"
              >#{{ id }} ↗</RouterLink
            >
          </p>
          <RouterLink
            v-if="phase === 'complete'"
            to="/locks?role=sent"
            class="orb-btn orb-btn--solid orb-wide"
            style="margin-top: 18px"
            >Go to your workspace <OrbitGlyph name="arrow" :size="16" /></RouterLink>
        </div>
      </form>
      <aside class="orb-preview">
        <div class="orb-preview__head">
          <p class="orb-kicker">LIVE SCHEDULE PREVIEW</p>
          <span class="orb-tag">{{ reviewed ? "Reviewed" : "Draft" }}</span>
        </div>
        <h2>{{ selectedType.title }}</h2>
        <p>
          {{ recipientCount }} recipient{{ recipientCount === 1 ? "" : "s" }}.
          Shared release terms.
        </p>
        <div class="orb-preview__total">
          {{ previewAmount }}<span>{{ symbol }}</span>
        </div>
        <SchedulePreview v-if="reviewed" :plan="reviewed" />
        <FlowChart v-else :mode="mode" />
        <dl>
          <div>
            <dt>{{ mode === "lock" ? "Unlock date" : "Start" }}</dt>
            <dd>
              {{
                mode !== "lock" && startsNow
                  ? "When funding confirms"
                  : previewDate(mode === "lock" ? end : start)
              }}
            </dd>
          </div>
          <div v-if="mode !== 'lock'">
            <dt>End</dt>
            <dd>{{ previewDate(end) }}</dd>
          </div>
          <div v-if="hasCliff && (mode === 'vesting' || mode === 'airdrop')">
            <dt>Cliff</dt>
            <dd>{{ previewDate(cliff) }}</dd>
          </div>
          <div>
            <dt>Protocol fee</dt>
            <dd>0 ETH</dd>
          </div>
          <div>
            <dt>Cancellation</dt>
            <dd>{{ cancelable ? "Vested funds protected" : "Not allowed" }}</dd>
          </div>
        </dl>
        <p v-if="!reviewed" class="orb-footnote">
          Review your schedule to explore an exact timeline. All confirmation
          times are shown in UTC. Past start dates may make tokens immediately
          claimable.
        </p>
        <p class="orb-notice">
          Tokens stay in the contract. Only the recipient can claim. Network gas
          is paid in testnet ETH.
        </p>
        <a
          :href="network.faucet"
          target="_blank"
          rel="noopener noreferrer"
          class="orb-link"
          >Get testnet ETH <OrbitGlyph name="arrow" :size="14" /></a>
      </aside>
    </div>
  </div>
    </div>
</template>

