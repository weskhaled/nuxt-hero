<script setup lang="ts">
/** Code sample with a copy button. */
const props = defineProps<{ code: string }>()

const copied = ref(false)
async function copy() {
  await navigator.clipboard?.writeText(props.code.trim())
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <div class="relative">
    <pre class="demo-code-block">{{ code.trim() }}</pre>
    <button type="button" class="demo-btn demo-btn--tiny absolute right-2 top-2" @click="copy">
      {{ copied ? 'Copied' : 'Copy' }}
    </button>
  </div>
</template>
