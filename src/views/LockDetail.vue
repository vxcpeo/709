<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { brand } from "../config/brand";
import { formatUnits, ZeroAddress } from "ethers";
import OrbitGlyph from "../components/OrbitGlyph.vue";
import {
  scheduler,
  config,
  dateLabel,
  modeNames,
  validRecipient,
  waitForTransaction,
} from "../composables/schedules";
import {
  wallet,
  network,
  publicProvider,
  tokenInfo,
  ensureNetwork,
  readableError,
} from "../composables/wallet";
const route = useRoute(),
  record = ref(null),
  token = ref(null),
  claimable = ref(0n),
  error = ref(""),
  loading = ref(true),
  busy = ref(false),
  notice = ref(""),
  txHash = ref(""),
  confirmation = ref(""),
  newRecipient = ref(""),
  copied = ref(false),
  readAt = ref("");
let requestGeneration = 0,
  actionGeneration = 0;
const id = computed(() => String(route.params.id));
const entitled = computed(() =>
  record.value?.cancelled
    ? record.value.vestedAtCancel
    : (record.value?.amount ?? 0n),
);
const isRecipient = computed(
  () =>
    !!wallet.address &&
    record.value?.recipient.toLowerCase() === wallet.address.toLowerCase(),
);
const isCreator = computed(
  () =>
    !!wallet.address &&
    record.value?.sender.toLowerCase() === wallet.address.toLowerCase(),
);
const remaining = computed(() =>
  record.value ? entitled.value - record.value.claimed : 0n,
);
const refundEstimate = computed(() =>
  record.value
    ? record.value.amount - record.value.claimed - claimable.value
    : 0n,
);
const amount = (value) =>
  token.value?.decimals == null
    ? `${value?.toString() ?? "0"} base units`
    : `${formatUnits(value ?? 0n, token.value.decimals)} ${token.value.symbol}`;
const addressUrl = (address) => `${network.explorer}/address/${address}`;
async function refresh(silent = false) {
  const generation = ++requestGeneration;
  if (!silent) loading.value = true;
  error.value = "";
  try {
    if (!/^[1-9]\d*$/.test(id.value) || BigInt(id.value) >= 2n ** 256n)
      throw new Error("Enter a valid positive schedule ID.");
    const currentId = id.value;
    const blockTag = await publicProvider.getBlockNumber();
    const found = await scheduler.schedules(currentId, { blockTag });
    if (found.sender === ZeroAddress)
      throw new Error(
        `This schedule does not exist on the current ${brand.name} deployment.`,
      );
    const [available, metadata] = await Promise.all([
      scheduler.claimable(currentId, { blockTag }),
      tokenInfo(found.token).catch(() => ({
        address: found.token,
        symbol: "TOKEN",
        decimals: null,
      })),
    ]);
    if (generation !== requestGeneration) return;
    record.value = found;
    claimable.value = available;
    token.value = metadata;
    readAt.value = new Date().toLocaleTimeString("en-GB");
  } catch (e) {
    if (generation === requestGeneration) {
      error.value = readableError(e);
      if (!silent) record.value = null;
    }
  } finally {
    if (generation === requestGeneration) loading.value = false;
  }
}
watch(
  id,
  () => {
    actionGeneration++;
    busy.value = false;
    copied.value = false;
    newRecipient.value = "";
    record.value = null;
    confirmation.value = "";
    notice.value = "";
    txHash.value = "";
    refresh();
  },
  { immediate: true },
);
watch(
  () => wallet.address,
  () => {
    actionGeneration++;
    busy.value = false;
    confirmation.value = "";
    notice.value = "";
    txHash.value = "";
  },
);
watch(newRecipient, () => {
  if (confirmation.value === "transfer") confirmation.value = "";
});
const timer = setInterval(() => {
  if (!loading.value && !busy.value) refresh(true);
}, 20000);
onUnmounted(() => {
  clearInterval(timer);
  requestGeneration++;
  actionGeneration++;
});
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
  } catch {
    notice.value =
      "Copy this page’s address from your browser to share the schedule.";
  }
}
async function act(kind) {
  if (busy.value || !record.value) return;
  if (!wallet.address) {
    wallet.show = true;
    return;
  }
  busy.value = true;
  error.value = "";
  notice.value = "Confirm the request in your wallet…";
  txHash.value = "";
  const currentId = id.value,
    account = wallet.address,
    target = newRecipient.value.trim(),
    operation = ++actionGeneration;
  const isCurrent = () =>
    operation === actionGeneration &&
    currentId === id.value &&
    account.toLowerCase() === wallet.address.toLowerCase();
  const assertCurrent = () => {
    if (!isCurrent())
      throw new Error(
        "The schedule or account changed. Review the current page again.",
      );
  };
  try {
    const signer = await ensureNetwork();
    assertCurrent();
    if ((await signer.getAddress()).toLowerCase() !== account.toLowerCase())
      throw new Error(
        "Your wallet account changed. Review this schedule again.",
      );
    const contract = scheduler.connect(signer);
    const args = kind === "transfer" ? [currentId, target] : [currentId];
    if (
      kind === "transfer" &&
      (!validRecipient(args[1]) ||
        args[1].toLowerCase() === account.toLowerCase())
    )
      throw new Error("Enter a different valid recipient address.");
    const method =
      kind === "claim"
        ? contract.claim
        : kind === "cancel"
          ? contract.cancel
          : contract.transferRecipient;
    await method.staticCall(...args);
    assertCurrent();
    const tx = await method(...args, { chainId: network.id });
    if (isCurrent()) {
      txHash.value = tx.hash;
      notice.value = "Submitted. Waiting for onchain confirmation…";
    }
    const receipt = await waitForTransaction(tx);
    if (!isCurrent()) return;
    txHash.value = receipt.hash;
    notice.value =
      kind === "claim"
        ? "Unlocked tokens claimed to the recipient wallet."
        : kind === "cancel"
          ? "The schedule has ended. Unvested tokens were refunded; vested tokens remain claimable."
          : "Remaining claim rights transferred to the new recipient.";
    confirmation.value = "";
    await refresh(true);
  } catch (e) {
    if (isCurrent()) {
      error.value = readableError(e);
      notice.value =
        "The action did not complete. Check the message and try again.";
    }
  } finally {
    if (isCurrent()) busy.value = false;
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
    <header class="orb-lede">
      <RouterLink to="/locks" class="orb-link"
        ><OrbitGlyph name="arrow-left" :size="15" /> Back to workspace</RouterLink
      >
      <p class="orb-kicker">PUBLIC SCHEDULE / ONCHAIN RECORD</p>
      <h1>Schedule #{{ id }}</h1>
      <p>
        Inspect the allocation, follow its release, and manage the rights held
        by your wallet.
      </p>
    </header>
    <div class="orb-toolbar">
      <span class="orb-networkline"
        ><span class="orb-pulse" /> Robinhood Chain Testnet ·
        {{ record?.cancelled ? "Cancelled" : "Public record" }}</span
      >
      <div class="orb-toolbar__actions">
        <button class="orb-btn orb-btn--rim" @click="copyLink">
          <OrbitGlyph name="copy" :size="15" />{{
            copied ? "Link copied" : "Share schedule"
          }}</button
        ><button
          class="orb-icon-btn"
          :disabled="loading"
          aria-label="Refresh schedule"
          @click="refresh()"
        >
          <OrbitGlyph name="refresh" :size="17" :class="{ spin: loading }" />
        </button>
      </div>
    </div>
    <p v-if="error" class="orb-notice orb-notice--bad" role="alert">
      {{ error }}
      <button class="orb-link--quiet" :disabled="loading" @click="refresh()">
        Retry
      </button>
    </p>
    <p v-if="notice" class="orb-notice" role="status" aria-live="polite">
      {{ notice }}
      <a
        v-if="txHash"
        :href="`${network.explorer}/tx/${txHash}`"
        target="_blank"
        rel="noopener noreferrer"
        >View transaction ↗</a
      >
    </p>
    <div v-if="loading" class="orb-loading" role="status">
      <OrbitGlyph name="loader" :size="20" class="spin" /> Reading schedule terms and
      available balance…
    </div>
    <div v-else-if="!record" class="orb-empty">
      <h2>Schedule unavailable</h2>
      <p>
        Check the ID and network, or return to your workspace. Older V1 records
        use the earlier deployment listed in the contract guide.
      </p>
      <RouterLink to="/locks" class="orb-btn orb-btn--solid"
        >Open workspace <OrbitGlyph name="arrow" :size="16" /></RouterLink>
    </div>
    <template v-else>
      <div class="orb-detail__overview" role="group" aria-label="Allocation overview">
        <div>
          <span>Original allocation</span
          ><strong>{{ amount(record.amount) }}</strong>
        </div>
        <div>
          <span>Claimed by recipients</span
          ><strong>{{ amount(record.claimed) }}</strong>
        </div>
        <div>
          <span>Remaining entitlement</span
          ><strong>{{ amount(remaining) }}</strong>
        </div>
      </div>
      <div class="orb-console">
        <section class="orb-panel orb-detail">
          <div class="orb-detail__head">
            <span class="orb-detail__number">01</span>
            <div>
              <p class="orb-kicker">{{ modeNames[Number(record.kind)] }}</p>
              <h2>Release terms</h2>
            </div>
            <span class="orb-tag">{{
              record.cancelled
                ? "Cancelled"
                : record.cancelable
                  ? "Cancelable"
                  : "Irrevocable"
            }}</span>
          </div>
          <dl class="orb-detail__terms">
            <div>
              <dt>
                {{
                  Number(record.kind) === 1 ? "Unlock date" : "Baseline start"
                }}
              </dt>
              <dd>{{ dateLabel(record.start) }}</dd>
            </div>
            <div v-if="Number(record.kind) !== 1">
              <dt>Cliff / release start</dt>
              <dd>{{ dateLabel(record.cliff) }}</dd>
            </div>
            <div v-if="Number(record.kind) !== 1">
              <dt>Cliff allocation</dt>
              <dd>{{ amount(record.cliffAmount) }}</dd>
            </div>
            <div v-if="Number(record.kind) !== 1">
              <dt>Fully unlocked</dt>
              <dd>{{ dateLabel(record.end) }}</dd>
            </div>
            <div>
              <dt>Release cadence</dt>
              <dd>
                {{
                  Number(record.kind) === 1
                    ? "One complete unlock"
                    : `Every ${record.interval.toString()} seconds`
                }}
              </dd>
            </div>
            <div>
              <dt>Cancellation setting</dt>
              <dd>
                {{
                  record.cancelable
                    ? "Creator may stop future vesting"
                    : "Cancellation not permitted"
                }}
              </dd>
            </div>
            <template v-if="record.cancelled"
              ><div>
                <dt>Cancelled at</dt>
                <dd>{{ dateLabel(record.cancelledAt) }}</dd>
              </div>
              <div>
                <dt>Returned to creator</dt>
                <dd>{{ amount(record.refunded) }}</dd>
              </div>
              <div>
                <dt>Final vested entitlement</dt>
                <dd>{{ amount(record.vestedAtCancel) }}</dd>
              </div></template
            >
          </dl>
          <div class="orb-detail__head orb-detail__address">
            <span class="orb-detail__number">02</span>
            <div>
              <p class="orb-kicker">WALLETS & ASSET</p>
              <h2>Participants</h2>
            </div>
          </div>
          <dl class="orb-detail__terms orb-detail__address-terms">
            <div>
              <dt>Creator</dt>
              <dd>
                <a
                  :href="addressUrl(record.sender)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ record.sender }} ↗</a
                >
              </dd>
            </div>
            <div>
              <dt>Current recipient</dt>
              <dd>
                <a
                  :href="addressUrl(record.recipient)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ record.recipient }} ↗</a
                >
              </dd>
            </div>
            <div>
              <dt>Token contract</dt>
              <dd>
                <a
                  :href="addressUrl(record.token)"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ record.token }} ↗</a
                >
              </dd>
            </div>
          </dl>
          <p class="orb-hint">
            Read at {{ readAt }} · Auto-refresh every 20 seconds · Exact token
            decimals · All dates in UTC
          </p>
          <a
            :href="`${addressUrl(config.schedulerAddress)}?tab=contract`"
            target="_blank"
            rel="noopener noreferrer"
            class="orb-link"
            >Verify contract rules <OrbitGlyph name="arrow" :size="15" /></a>
        </section>
        <aside class="orb-preview orb-detail__manage">
          <p class="orb-kicker">AVAILABLE TO CLAIM</p>
          <h2 class="orb-detail__claimable">{{ amount(claimable) }}</h2>
          <p>
            {{
              record.cancelled
                ? "This vested balance remains claimable after cancellation."
                : "The recipient can claim unlocked tokens. The contract calculates the exact balance when the transaction executes."
            }}
          </p>
          <button
            v-if="!wallet.address"
            class="orb-btn orb-btn--solid orb-wide"
            @click="wallet.show = true"
          >
            Connect wallet to manage <OrbitGlyph name="arrow" :size="16" />
          </button>
          <button
            v-if="isRecipient"
            class="orb-btn orb-btn--solid orb-wide"
            :disabled="busy || claimable === 0n"
            @click="act('claim')"
          >
            <OrbitGlyph name="loader" v-if="busy" :size="16" class="spin" />{{
              busy
                ? "Waiting for confirmation…"
                : claimable > 0n
                  ? "Claim unlocked tokens"
                  : "Nothing to claim yet"
            }}
          </button>
          <p v-if="wallet.address" class="orb-detail__role">
            Your access:
            <strong>{{
              isRecipient && isCreator
                ? "Recipient & creator"
                : isRecipient
                  ? "Recipient"
                  : isCreator
                    ? "Creator"
                    : "Observer"
            }}</strong>
          </p>
          <p
            v-if="wallet.address && !isRecipient && !isCreator"
            class="orb-footnote"
          >
            Only the current recipient can claim or transfer rights. Only the
            creator can cancel when cancellation was enabled.
          </p>
          <div
            v-if="isCreator && record.cancelable && !record.cancelled"
            class="orb-detail__action"
          >
            <h3>Stop future vesting</h3>
            <p>
              Unvested tokens return to the creator. Vested tokens remain
              claimable by the recipient.
            </p>
            <button
              v-if="confirmation !== 'cancel'"
              class="orb-btn orb-btn--rim orb-wide"
              :disabled="busy"
              @click="confirmation = 'cancel'"
            >
              Review cancellation
            </button>
            <div
              v-else
              class="orb-detail__confirm"
              role="region"
              aria-label="Cancellation confirmation"
            >
              <p>
                Estimated refund: <strong>{{ amount(refundEstimate) }}</strong
                >. The recipient retains approximately
                <strong>{{ amount(claimable) }}</strong> unclaimed, plus tokens
                already claimed. Exact settlement uses the transaction block.
              </p>
              <button
                class="orb-btn orb-btn--solid orb-wide"
                :disabled="busy"
                @click="act('cancel')"
              >
                Confirm cancellation</button
              ><button
                class="orb-btn orb-btn--rim orb-wide"
                :disabled="busy"
                @click="confirmation = ''"
              >
                Keep schedule
              </button>
            </div>
          </div>
          <div v-if="isRecipient && remaining > 0n" class="orb-detail__action">
            <h3>Transfer claim rights</h3>
            <p>Assign the entire remaining entitlement to another wallet.</p>
            <label class="orb-field"
              ><span>New recipient wallet</span
              ><input
                v-model="newRecipient"
                placeholder="0x…"
                spellcheck="false"
                autocomplete="off"
                :disabled="busy"
            /></label>
            <button
              v-if="confirmation !== 'transfer'"
              class="orb-btn orb-btn--rim orb-wide"
              :disabled="
                busy ||
                !validRecipient(newRecipient) ||
                newRecipient.toLowerCase() === wallet.address.toLowerCase()
              "
              @click="confirmation = 'transfer'"
            >
              Review recipient transfer
            </button>
            <div
              v-else
              class="orb-detail__confirm"
              role="region"
              aria-label="Recipient transfer confirmation"
            >
              <p class="orb-detail__address--break">
                Transfer all remaining rights to
                <strong>{{ newRecipient }}</strong
                >? Your wallet cannot reverse this action.
              </p>
              <button
                class="orb-btn orb-btn--solid orb-wide"
                :disabled="busy"
                @click="act('transfer')"
              >
                Confirm transfer</button
              ><button
                class="orb-btn orb-btn--rim orb-wide"
                :disabled="busy"
                @click="confirmation = ''"
              >
                Back to editing
              </button>
            </div>
          </div>
          <p class="orb-footnote">
            Test tokens only. Network gas is paid in testnet ETH. Connection
            alone does not authorize a transaction.
          </p>
        </aside>
      </div>
    </template>
    </div>
  </div>
</template>
