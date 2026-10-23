<script setup lang="ts">
/**
 * Shared layout for every demo page: optional full-bleed hero right under the
 * fixed nav, then a header (title, description, the features it exercises)
 * and the page's sections in a centered column.
 */
defineProps<{
  title: string
  description: string
  /** Options / props / slots this page demonstrates — shown as chips */
  features?: string[]
}>()
</script>

<template>
  <div class="pt-14">
    <slot name="hero" />
    <div class="mx-auto max-w-6xl space-y-14 px-4 pb-24 pt-10">
      <header class="max-w-3xl">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ title }}</h1>
        <p class="mt-3 text-black/60 dark:text-white/60">{{ description }}</p>
        <ul v-if="features?.length" class="mt-4 flex flex-wrap gap-1.5">
          <li v-for="f in features" :key="f" class="demo-chip">{{ f }}</li>
        </ul>
      </header>
      <slot />
    </div>
  </div>
</template>
