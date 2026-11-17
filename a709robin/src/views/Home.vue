<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import OrbitGlyph from "../components/OrbitGlyph.vue";
import LiveStats from "../components/LiveStats.vue";
const activeMode = ref("vesting"),
  position = ref(60);
const router = useRouter();
const publicId = ref("");
const lookupError = ref("");
function openPublicSchedule() {
  const value = publicId.value.trim().replace(/^#/, "");
  if (!/^[1-9]\d*$/.test(value) || BigInt(value) >= 2n ** 256n) {
    lookupError.value = "Enter a positive schedule ID, such as 12.";
    return;
  }
  lookupError.value = "";
  router.push(`/lock/${value}`);
}
const products = [
  {
    id: "vesting",
    name: "Token vesting",
    short: "Vesting",
    glyph: "timer",
    tag: "TEAMS & CONTRIBUTORS",
    description:
      "Align a team around a shared timeline. Set a cliff and release tokens in measured steps.",
    label: "A shared horizon",
    color: "blue",
  },
  {
    id: "lock",
    name: "Token locks",
    short: "Lock",
    glyph: "lock",
    tag: "TREASURIES & RESERVES",
    description:
      "One amount. One date. Keep tokens in escrow until a precise moment in the future.",
    label: "A date you can count on",
    color: "orange",
  },
  {
    id: "stream",
    name: "Payment streams",
    short: "Stream",
    glyph: "waves",
    tag: "PAYROLL & GRANTS",
    description:
      "Let a funded balance unlock by the second. Recipients claim when they are ready.",
    label: "A continuous release",
    color: "violet",
  },
  {
    id: "airdrop",
    name: "Vested batches",
    short: "Batch",
    glyph: "layers",
    tag: "COMMUNITIES & ECOSYSTEMS",
    description:
      "Up to 100 recipients. Individual allocations. One shared schedule, funded in one batch.",
    label: "One timeline. Many people.",
    color: "mint",
  },
];
const active = computed(() => products.find((p) => p.id === activeMode.value));
function releaseAt(p) {
  return activeMode.value === "lock"
    ? p >= 80
      ? 100
      : 0
    : activeMode.value === "stream"
      ? p
      : p < 20
        ? 0
        : Math.min(100, 20 + Math.floor((p - 20) / 10) * 10);
}
const released = computed(() => releaseAt(Number(position.value)));
const chartPoints = computed(() =>
  Array.from(
    { length: 101 },
    (_, i) => `${32 + i * 4.1},${194 - releaseAt(i) * 1.45}`,
  ).join(" "),
);
function tabKey(e) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  const i = products.findIndex((p) => p.id === activeMode.value);
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? 3
        : (i + (e.key === "ArrowRight" ? 1 : -1) + 4) % 4;
  activeMode.value = products[next].id;
  document.getElementById(`demo-tab-${activeMode.value}`)?.focus();
}
const faqs = [
  [
    "What happens after I fund a schedule?",
    "The contract holds the tokens under the terms you approve. Recipients claim the unlocked balance. Streams accrue value; they do not automatically push payments to a wallet.",
  ],
  [
    "Can the terms change?",
    "Amounts and dates cannot be edited after funding. When cancellation is enabled, the creator can recover the unvested remainder. Vested tokens remain available to the recipient. Recipients may transfer their remaining claim rights.",
  ],
  [
    "What does it cost?",
    "There are no protocol fees on this testnet deployment. Approvals, funding and claims require testnet ETH for network gas. The demonstration token has no monetary value.",
  ],
  [
    "Can I use real funds?",
    "This is an unaudited testnet pilot. Use test tokens only. Production use requires independent security review and operational readiness.",
  ],
];
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
    <section class="orb-hero">
      <div class="orb-core">
        <div class="orb-core__head">
          <p class="orb-kicker">
            <span class="orb-spark" /> TOKEN RELEASE WORKSPACE / TESTNET
          </p>
          <h1>Tranova</h1>
          <p>Set up, fund and inspect token releases under terms you control.</p>
        </div>
        <RouterLink to="/create" class="orb-btn orb-btn--beam orb-core__cta">
          <OrbitGlyph name="plus" :size="16" /> New schedule
          <OrbitGlyph name="arrow" :size="16" />
        </RouterLink>
        <form class="orb-lookup" @submit.prevent="openPublicSchedule">
          <label for="home-public-id">Open a public schedule</label>
          <div class="orb-lookup__row">
            <input
              id="home-public-id"
              v-model="publicId"
              inputmode="numeric"
              placeholder="Schedule ID"
              :aria-describedby="lookupError ? 'home-lookup-error' : 'home-lookup-note'"
            />
            <button class="orb-btn orb-btn--rim" type="submit">
              Open <OrbitGlyph name="arrow" :size="14" />
            </button>
          </div>
          <p v-if="lookupError" id="home-lookup-error" class="orb-error" role="alert">
            {{ lookupError }}
          </p>
          <p v-else id="home-lookup-note">No wallet needed to inspect terms.</p>
        </form>
        <p class="orb-footnote">
          <OrbitGlyph name="shield" :size="14" /> Unaudited deployment. Use test
          tokens only.
        </p>
      </div>
      <div class="orb-stage">
        <div class="orb-stage__head">
          <span><span class="orb-pulse" /> RELEASE PREVIEW</span
          ><span class="orb-tag orb-tag--ghost">ILLUSTRATIVE / NOT LIVE DATA</span>
        </div>
        <div class="orb-stage__title">
          <div>
            <p>{{ active.label }}</p>
            <h2>10,000 <span>tokens</span></h2>
          </div>
          <div class="orb-stage__glyph">
            <OrbitGlyph :name="active.glyph" :size="24" />
          </div>
        </div>
        <div
          class="orb-tabs"
          role="tablist"
          aria-label="Explore schedule modes"
          @keydown="tabKey"
        >
          <button
            v-for="product in products"
            :key="product.id"
            :id="`demo-tab-${product.id}`"
            role="tab"
            :aria-selected="activeMode === product.id"
            :tabindex="activeMode === product.id ? 0 : -1"
            aria-controls="studio-panel"
            :class="{ active: activeMode === product.id }"
            @click="activeMode = product.id"
          >
            {{ product.short }}
          </button>
        </div>
        <div
          id="studio-panel"
          role="tabpanel"
          :aria-labelledby="`demo-tab-${activeMode}`"
        >
          <div class="orb-chart">
            <div class="orb-chart__top">
              <span>UNLOCKED BALANCE</span><strong>{{ released }}%</strong>
            </div>
            <svg
              viewBox="0 0 468 235"
              role="img"
              :aria-label="`${active.name} example: ${released}% unlocked at ${position}% of the timeline`"
            >
              <path
                v-for="y in [49, 97, 145, 194]"
                :key="y"
                :d="`M32 ${y}H442`"
                stroke="var(--orb-edge-soft)"
                stroke-dasharray="3 4"
              />
              <path
                :d="`M32 194 L${chartPoints.replaceAll(' ', ' L')} L442 194 Z`"
                fill="var(--orb-surface-2)"
              />
              <polyline
                :points="chartPoints"
                fill="none"
                stroke="var(--orb-beam)"
                stroke-width="3"
                stroke-linejoin="round"
              />
              <line
                :x1="32 + Number(position) * 4.1"
                :x2="32 + Number(position) * 4.1"
                y1="28"
                y2="194"
                stroke="var(--orb-aura)"
                stroke-dasharray="3 5"
              />
              <circle
                :cx="32 + Number(position) * 4.1"
                :cy="194 - released * 1.45"
                r="6"
                fill="var(--orb-beam)"
                stroke="#000000"
                stroke-width="3"
              />
              <g fill="var(--orb-faint)" font-size="10" font-family="monospace">
                <text x="32" y="220">START</text>
                <text x="218" y="220">TIMELINE</text>
                <text x="422" y="220">END</text>
              </g>
            </svg>
          </div>
          <label class="orb-slider-label" for="demo-time"
            ><span>Move through time <OrbitGlyph name="arrow-right" :size="13" /></span
            ><strong
              >{{ (released * 100).toLocaleString() }} tokens unlocked</strong
            ></label
          ><input
            id="demo-time"
            v-model="position"
            type="range"
            min="0"
            max="100"
            :aria-valuetext="`${position}% of timeline, ${released * 100} tokens unlocked`"
          />
          <div class="orb-stage__foot">
            <span>Illustrative terms · no wallet needed</span
            ><RouterLink :to="`/create?mode=${activeMode}`"
              >Use this mode <OrbitGlyph name="arrow" :size="15"
            /></RouterLink>
          </div>
        </div>
      </div>
    </section>
    <section id="products" class="orb-band">
      <div class="orb-band__head">
        <div>
          <p class="orb-kicker">01 / CHOOSE YOUR FORMAT</p>
          <h2>Four tools. Your timeline.</h2>
        </div>
        <span class="orb-band__note"
          >Built for different kinds of commitment.</span
        >
      </div>
      <div class="orb-formats">
        <RouterLink
          v-for="(product, i) in products"
          :key="product.id"
          :to="`/create?mode=${product.id}`"
          class="orb-format"
          :class="product.color"
          ><div class="orb-format__top">
            <span class="orb-format__icon"
              ><OrbitGlyph :name="product.glyph" :size="21" /></span
            ><span class="orb-format__index">0{{ i + 1 }}</span>
          </div>
          <h3>{{ product.name }} <OrbitGlyph name="arrow" :size="17" /></h3>
          <p>{{ product.description }}</p>
          <span class="orb-format__tag">{{ product.tag }}</span></RouterLink
        >
      </div>
    </section>
    <LiveStats />
    <section id="how-it-works" class="orb-band">
      <div class="orb-band__head">
        <div>
          <p class="orb-kicker">02 / FROM INTENT TO EXECUTION</p>
          <h2>Set it up. See it through.</h2>
        </div>
        <RouterLink class="orb-link" to="/docs#getting-started"
          >The complete guide <OrbitGlyph name="arrow" :size="16"
        /></RouterLink>
      </div>
      <div class="orb-journey">
        <article>
          <span class="orb-journey__index">01</span>
          <h3>Compose</h3>
          <p>
            Choose your token, recipients and release dates. Preview the exact
            schedule before you commit.
          </p>
        </article>
        <article>
          <span class="orb-journey__index">02</span>
          <h3>Fund</h3>
          <p>
            Connect your wallet, approve the required allowance, then fund your
            schedule with test tokens.
          </p>
        </article>
        <article>
          <span class="orb-journey__index">03</span>
          <h3>Follow</h3>
          <p>
            Track progress in your workspace. Share a public schedule link.
            Claim tokens as they unlock.
          </p>
        </article>
      </div>
    </section>
    <section class="orb-band">
      <div class="orb-manifest">
        <div class="orb-manifest__orbits" aria-hidden="true">
          <span /><span /><span /><i /><i /><i />
        </div>
        <div class="orb-manifest__copy">
          <p class="orb-kicker">THE TERMS STAY IN VIEW</p>
          <h2>A timeline you can inspect.</h2>
          <p>
            No administrator withdrawal. No upgrade switch. The deployed
            contract defines the rules, and every schedule can be read onchain.
          </p>
          <div class="orb-manifest__checks">
            <span
              ><OrbitGlyph name="check" :size="15" /> Exact token accounting</span
            ><span
              ><OrbitGlyph name="check" :size="15" /> Public schedule details</span
            >
          </div>
          <RouterLink to="/docs#security" class="orb-link"
            >Read the rules & limits <OrbitGlyph name="arrow" :size="16"
          /></RouterLink>
        </div>
      </div>
    </section>
    <section id="faq" class="orb-band orb-band--faq">
      <div>
        <p class="orb-kicker">03 / BEFORE YOU BEGIN</p>
        <h2>A few things<br />to know.</h2>
        <p>Clear expectations.<br />From the first transaction.</p>
      </div>
      <div class="orb-faq">
        <details v-for="([q, a], i) in faqs" :key="q">
          <summary>
            <span class="orb-faq__index">0{{ i + 1 }}</span
            >{{ q }}<OrbitGlyph name="plus" :size="18" />
          </summary>
          <p>{{ a }}</p>
        </details>
      </div>
    </section>
    <section class="orb-invite">
      <div>
        <span class="orb-kicker">YOUR NEXT MOVE</span>
        <h2>Put the plan in motion.</h2>
        <p>Testnet only. Use test tokens. Independent audit pending.</p>
      </div>
      <RouterLink to="/create" class="orb-btn orb-btn--beam"
        >Create a schedule <OrbitGlyph name="arrow" :size="18"
      /></RouterLink>
    </section>
  </div>
    </div>
</template>
