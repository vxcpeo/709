<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import BrandMark from "./components/BrandMark.vue";
import OrbitGlyph from "./components/OrbitGlyph.vue";
import WalletModal from "./components/WalletModal.vue";
import { brand } from "./config/brand";
import {
  wallet,
  shortAddress,
  discoverWallets,
  network,
} from "./composables/wallet";
const route = useRoute(),
  menu = ref(false);
const pageName = computed(() =>
  route.path === "/"
    ? "Overview"
    : route.path === "/create"
      ? "New schedule"
      : route.path.startsWith("/lock/")
        ? "Schedule details"
        : route.path === "/locks"
          ? "My schedules"
          : route.path === "/docs"
            ? "Documentation"
            : "Terms & privacy",
);
const links = [
  { path: "/", label: "Overview", glyph: "dashboard" },
  { path: "/create", label: "Create schedule", glyph: "plus" },
  { path: "/locks", label: "My schedules", glyph: "layers" },
  { path: "/docs", label: "Documentation", glyph: "book" },
];
onMounted(discoverWallets);
watch(
  () => route.fullPath,
  () => {
    menu.value = false;
  },
);
</script>
<template>
  <a class="orb-skip" href="#main-content">Skip to content</a>
  <div class="orb-shell" @keydown.esc="menu = false">
    <button
      v-if="menu"
      class="orb-scrim"
      aria-label="Close navigation"
      @click="menu = false"
    />
    <div class="orb-topline">
      <RouterLink to="/" class="orb-brand" :aria-label="`${brand.name} home`"
        ><BrandMark
      /></RouterLink>
      <div class="orb-topline__where">
        <span class="orb-topline__brand">{{ brand.name }}</span
        ><span class="orb-topline__slash">/</span><span>{{ pageName }}</span>
      </div>
      <button
        class="orb-icon-btn orb-icon-btn--menu"
        :aria-expanded="menu"
        aria-controls="main-navigation"
        :aria-label="menu ? 'Close menu' : 'Open menu'"
        @click="menu = !menu"
      >
        <OrbitGlyph v-if="menu" name="close" :size="20" /><OrbitGlyph
          v-else
          name="menu"
          :size="20"
        />
      </button>
      <div class="orb-topline__actions">
        <span class="orb-chip"><span class="orb-pulse" /> Testnet</span
        ><button
          class="orb-btn orb-btn--wallet orb-btn--rim"
          @click="wallet.error = ''; wallet.show = true;"
        >
          <OrbitGlyph name="wallet" :size="16" /><span>{{
            wallet.address ? shortAddress(wallet.address) : "Connect wallet"
          }}</span>
        </button>
      </div>
    </div>
    <nav
      class="orb-nav"
      :class="{ 'is-open': menu }"
      id="main-navigation"
      aria-label="Main navigation"
    >
      <div class="orb-nav__caption">RELEASE CONTROL</div>
      <div class="orb-nav__ring">
        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          :class="{
            selected:
              link.path === '/'
                ? route.path === '/'
                : route.path.startsWith(link.path),
          }"
          ><OrbitGlyph :name="link.glyph" :size="18" /><span>{{
            link.label
          }}</span
          ><span v-if="link.path === '/create'" class="orb-nav__add">+</span></RouterLink
        >
      </div>
      <div class="orb-nav__note">
        <span class="orb-nav__index">01 — GET STARTED</span>
        <p>A clear path from<br />funding to the final claim.</p>
        <RouterLink class="orb-nav__link" to="/docs#getting-started"
          >Read the quick start <OrbitGlyph name="arrow" :size="15"
        /></RouterLink>
      </div>
      <div class="orb-nav__extras">
        <a
          :href="network.explorer"
          target="_blank"
          rel="noopener noreferrer"
          class="orb-nav__link"
          >Chain explorer <OrbitGlyph name="external" :size="14"
        /></a>
        <a href="/documents/brand-kit.zip" download class="orb-nav__link"
          >Brand assets <OrbitGlyph name="arrow" :size="14"
        /></a>
        <div class="orb-nav__chip">
          <span class="orb-pulse" /><span
            >Robinhood Chain<small>TESTNET · 46630</small></span
          ><OrbitGlyph name="radio" :size="16" />
        </div>
      </div>
    </nav>
    <div class="orb-body">
      <main id="main-content" tabindex="-1"><RouterView /></main>
      <div class="orb-baseplate">
        <div>
          <BrandMark icon-only /><span
            >{{ brand.name }} © {{ new Date().getFullYear() }}</span
          ><span class="orb-baseplate__slash">/</span
          ><span>{{ brand.tagline }}</span>
        </div>
        <div>
          <RouterLink to="/legal"
            >Terms & privacy <OrbitGlyph name="arrow" :size="12" /></RouterLink
          ><span>Independent of Robinhood.</span>
        </div>
      </div>
    </div>
    <WalletModal />
  </div>
</template>
