<script setup>
import { userData } from '../config/userData'
</script>

<template>
  <a :href="userData.instagram" class="instagram-link" target="_blank" rel="noopener noreferrer">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
    <span>Instagram</span>
  </a>
</template>

<style scoped>
.instagram-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
}

.instagram-link svg {
  flex-shrink: 0;
}

.instagram-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
  border-radius: 2px;
}
</style>
