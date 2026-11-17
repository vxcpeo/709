<script setup>
import { ref, watch, nextTick } from "vue";
import OrbitGlyph from "./OrbitGlyph.vue";
import {
  wallet,
  connectWallet,
  disconnectWallet,
  shortAddress,
  network,
  ensureNetwork,
  readableError,
} from "../composables/wallet";
const dialog = ref(null),
  copied = ref(false),
  switching = ref(false);
let previousFocus;
watch(
  () => wallet.address,
  () => {
    copied.value = false;
  },
);
watch(
  () => wallet.show,
  async (open) => {
    if (open) {
      copied.value = false;
      previousFocus = document.activeElement;
      await nextTick();
      dialog.value?.showModal();
    } else {
      dialog.value?.close();
      previousFocus?.focus?.();
    }
  },
);
async function copy() {
  try {
    await navigator.clipboard.writeText(wallet.address);
    copied.value = true;
  } catch {
    wallet.error =
      "Copy is unavailable in this browser. Select the address below to copy it.";
  }
}
async function switchNetwork() {
  if (switching.value) return;
  switching.value = true;
  try {
    await ensureNetwork();
  } catch (e) {
    wallet.error = readableError(e);
  } finally {
    switching.value = false;
  }
}
</script>
<template>
  <dialog
    ref="dialog"
    class="orb-dialog"
    aria-labelledby="wallet-title"
    @close="wallet.show = false"
    @click="
      (e) => {
        if (e.target === dialog) wallet.show = false;
      }
    "
  >
    <div class="orb-dialog__top">
      <span class="orb-kicker">WALLET ACCESS</span
      ><button
        class="orb-icon-btn"
        aria-label="Close wallet dialog"
        @click="wallet.show = false"
      >
        <OrbitGlyph name="close" :size="20" />
      </button>
    </div>
    <OrbitGlyph name="wallet" class="orb-dialog__glyph" :size="32" />
    <h2 id="wallet-title">
      {{ wallet.address ? "Wallet connected" : "Connect your wallet" }}
    </h2>
    <p class="orb-dim">
      {{
        wallet.address
          ? "Your wallet is your account. You control every transaction."
          : "Choose your EVM wallet to fund schedules, claim tokens, or manage your allocations."
      }}
    </p>
    <template v-if="wallet.address">
      <div class="orb-address">
        <code>{{ wallet.address }}</code
        ><button
          class="orb-icon-btn"
          @click="copy"
          :aria-label="copied ? 'Address copied' : 'Copy wallet address'"
        >
          <OrbitGlyph name="check" v-if="copied" :size="18" /><OrbitGlyph name="copy" v-else :size="18" />
        </button>
      </div>
      <button
        v-if="wallet.chainId !== network.id"
        class="orb-btn orb-btn--solid orb-wide"
        :disabled="switching"
        @click="switchNetwork"
      >
        {{
          switching ? "Waiting for your wallet…" : "Switch to Robinhood testnet"
        }}
        <OrbitGlyph name="arrow" :size="17" />
      </button>
      <p v-else class="orb-connection">
        <span class="orb-pulse" /> Robinhood Chain Testnet
      </p>
      <button
        class="orb-btn orb-btn--rim orb-wide"
        @click="disconnectWallet"
      >
        <OrbitGlyph name="logout" :size="16" /> Disconnect
      </button>
    </template>
    <template v-else>
      <div class="orb-dialog__steps">
        <span><b>01</b> Choose wallet</span
        ><span><b>02</b> Approve connection</span>
      </div>
      <div class="orb-wallets" v-if="wallet.providers.length">
        <button
          v-for="provider in wallet.providers"
          :key="provider.id"
          class="orb-wallet"
          :disabled="wallet.connecting"
          @click="connectWallet(provider)"
        >
          <span>{{ provider.name }}</span
          ><span>{{ wallet.connecting ? "Connecting…" : "Connect ↗" }}</span>
        </button>
      </div>
      <div v-else class="orb-wallets-empty">
        <strong>No browser wallet detected</strong>
        <p>Install an EVM wallet extension, then reload this page.</p>
        <a
          class="orb-btn orb-btn--solid orb-wide"
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          >Get MetaMask <OrbitGlyph name="arrow" :size="17" /></a>
        <p class="orb-small orb-dim">
          On mobile, open this website inside your wallet’s browser.
        </p>
      </div>
    </template>
    <p v-if="wallet.error" role="alert" class="orb-notice orb-notice--bad">
      {{ wallet.error }}
    </p>
    <p class="orb-dialog__foot">Testnet only · Connecting does not move funds.</p>
  </dialog>
</template>

