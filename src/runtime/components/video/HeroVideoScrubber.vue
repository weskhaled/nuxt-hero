<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue'
import { useEventListener, useMouseInElement, useElementHover, onClickOutside } from '@vueuse/core'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  secondary: { type: Number, default: 0 },
})

const emit = defineEmits(['scrubbing', 'scrubberMousedown', 'scrubberMouseup', 'click'])

const scrubber = useTemplateRef<HTMLElement>('scrubber')
const scrubbing = ref(false)
const pendingValue = ref(0)

const hovered = useElementHover(scrubber)
const active = computed(() => hovered.value || scrubbing.value)
defineExpose({ active })

useEventListener('mouseup', endScrub)
useEventListener('touchend', endScrub)
useEventListener('touchcancel', endScrub)

onClickOutside(scrubber, () => {
  if (scrubbing.value) endScrub()
})

function startScrub() {
  scrubbing.value = true
  emit('scrubberMousedown', true)
}

function endScrub() {
  if (!scrubbing.value) return
  scrubbing.value = false
  emit('scrubbing', false)
  emit('scrubberMouseup', true)
}

const value = defineModel<number>({ required: false, default: 0 })
const { elementX, elementWidth } = useMouseInElement(scrubber)

const progressPercent = computed(() => props.max > 0 ? (value.value / props.max) * 100 : 0)
const bufferedPercent = computed(() => props.max > 0 ? (props.secondary / props.max) * 100 : 0)
const pendingPercent = computed(() => props.max > 0 ? (pendingValue.value / props.max) * 100 : 0)

watch([scrubbing, elementX], () => {
  const progress = Math.max(0, Math.min(1, elementX.value / elementWidth.value))
  pendingValue.value = progress * props.max
  if (scrubbing.value) {
    value.value = pendingValue.value
    emit('scrubbing', true)
  }
})
</script>

<template>
  <!-- Outer: full-width hit area, never changes size -->
  <div ref="scrubber" role="slider" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="Math.round(value)"
    :aria-label="`Seek: ${Math.round(progressPercent)}%`" tabindex="0"
    class="group/scrubber hero-scrub-outer" @mousedown.stop.prevent="startScrub"
    @touchstart.stop.prevent="startScrub" @keydown.left.prevent="value = Math.max(min, value - max * 0.05)"
    @keydown.right.prevent="value = Math.min(max, value + max * 0.05)">

    <!-- Hit area extends above/below for easier targeting -->
    <div class="hero-scrub-hitarea" />

    <!-- Inner wrapper: handles visual inset + rounded on active -->
    <div class="hero-scrub-inner"
      :class="active ? 'mx-3 rounded-full h-2.5' : 'mx-0 h-full'">

      <!-- Track: clips buffered/progress bars -->
      <div class="hero-scrub-track" :class="active ? 'rounded-full' : ''">
        <!-- Buffered -->
        <div class="hero-scrub-buffered" :style="{ width: `${bufferedPercent}%` }" />
        <!-- Progress -->
        <div class="hero-scrub-fill" :style="{ width: `${progressPercent}%` }" />
      </div>

      <!-- Scrub head: outside track so not clipped by overflow-hidden -->
      <div class="hero-scrub-head"
        :class="active ? 'size-3.5 shadow-md' : 'size-0'" :style="{ left: `${progressPercent}%` }" />
    </div>

    <!-- Hover preview line -->
    <div v-if="active && !scrubbing" class="hero-scrub-hover-line"
      :style="{ left: `${pendingPercent}%` }" />

    <!-- Tooltip slot -->
    <div class="hero-scrub-tooltip-slot"
      style="bottom: calc(100% + 0.5rem);" :class="active ? 'opacity-100' : 'opacity-0'">
      <slot :pending-value="pendingValue" :position="`${Math.max(0, Math.min(elementX, elementWidth))}px`" />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.hero-scrub-outer {
  @apply cursor-pointer select-none overflow-visible relative;
}

.hero-scrub-hitarea {
  @apply absolute inset-x-0 -top-3 -bottom-1 z-1;
}

.hero-scrub-inner {
  @apply relative w-full transition-[margin,border-radius,height] duration-200 ease-out;
}

.hero-scrub-track {
  @apply h-full w-full relative overflow-hidden bg-white/15;
}

.hero-scrub-buffered {
  @apply absolute top-0 left-0 h-full bg-white/30;
}

.hero-scrub-fill {
  @apply absolute top-0 left-0 h-full bg-white;
}

.hero-scrub-head {
  @apply absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white z-2;
  @apply transition-[width,height,box-shadow] duration-150;
}

.hero-scrub-hover-line {
  @apply absolute top-0 h-full w-px bg-white/50 pointer-events-none z-1 -translate-x-1/2;
}

.hero-scrub-tooltip-slot {
  @apply absolute left-0 right-0 pointer-events-none z-3 transition-opacity duration-100;
}
</style>
