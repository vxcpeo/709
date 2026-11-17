<script setup>
import { brand } from "../config/brand";
defineProps({ iconOnly: Boolean });
</script>
<template>
  <span class="orb-lockup"
    ><svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-dasharray="60 34"
      />
      <circle cx="24" cy="24" r="5.4" fill="currentColor" />
      <circle cx="38" cy="14" r="2.6" fill="currentColor" /></svg
    ><span v-if="!iconOnly">{{ brand.name }}</span></span
  >
</template>
