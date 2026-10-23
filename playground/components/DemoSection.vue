<script setup lang="ts">
/** A titled demo block with an optional, collapsible code sample. */
defineProps<{
  title: string
  hint?: string
  /** Source shown under "Show code" */
  code?: string
}>()
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="max-w-3xl">
        <h2 class="text-xl font-semibold tracking-tight">{{ title }}</h2>
        <p v-if="hint" class="mt-1 text-sm text-black/60 dark:text-white/60">{{ hint }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
    <details v-if="code" class="group">
      <summary class="demo-btn w-fit list-none">
        <span class="group-open:hidden">Show code</span>
        <span class="hidden group-open:inline">Hide code</span>
      </summary>
      <DemoCode :code="code" class="mt-3" />
    </details>
  </section>
</template>
