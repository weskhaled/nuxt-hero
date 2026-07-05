<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useElementHover, useMouseInElement } from '@vueuse/core'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  /** Secondary progress (e.g. buffered time for a video) in the same unit as value. */
  secondary: { type: Number, default: 0 },
  /** Accessible label for the underlying range input. */
  label: { type: String, default: 'Seek' },
})

const emit = defineEmits<{
  scrubbing: [active: boolean]
  scrubberMousedown: [down: boolean]
  scrubberMouseup: [up: boolean]
}>()

const value = defineModel<number>({ required: false, default: 0 })

const root = useTemplateRef<HTMLElement>('root')
const scrubbing = ref(false)
const hovered = useElementHover(root)
const { elementX, elementWidth } = useMouseInElement(root)

const active = computed(() => hovered.value || scrubbing.value)
defineExpose({ active })

/** Total span of the range; guards against max <= min. */
const span = computed(() => Math.max(0, props.max - props.min))

const progressPercent = computed(() =>
  span.value > 0 ? ((value.value - props.min) / span.value) * 100 : 0,
)
const bufferedPercent = computed(() =>
  span.value > 0 ? ((props.secondary - props.min) / span.value) * 100 : 0,
)

/** Value under the cursor — used by the slot for preview tooltips. */
const pendingValue = computed(() => {
  const ratio = Math.max(0, Math.min(1, elementX.value / elementWidth.value))
  return props.min + ratio * span.value
})
const pendingPercent = computed(() =>
  span.value > 0 ? ((pendingValue.value - props.min) / span.value) * 100 : 0,
)
const tooltipPosition = computed(
  () => `${Math.max(0, Math.min(elementX.value, elementWidth.value))}px`,
)

function onInput(event: Event) {
  const pct = Number((event.target as HTMLInputElement).value)
  value.value = props.min + (pct / 100) * span.value
  emit('scrubbing', true)
}

function onScrubStart() {
  scrubbing.value = true
  emit('scrubberMousedown', true)
}

function onScrubEnd() {
  if (!scrubbing.value) return
  scrubbing.value = false
  emit('scrubbing', false)
  emit('scrubberMouseup', true)
}
</script>

<template>
  <div ref="root" class="hero-range-track hero-range--reveal" :class="{ 'is-active': scrubbing }">
    <!-- Buffered -->
    <div class="hero-range-buffered" :style="{ width: `${bufferedPercent}%` }" />
    <!-- Progress -->
    <div class="hero-range-fill" :style="{ width: `${progressPercent}%` }" />

    <!-- Native range input drives interaction + a11y -->
    <input type="range" min="0" max="100" step="0.1" :value="progressPercent" class="hero-range-input"
      :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="Math.round(value)" :aria-label="label"
      @input="onInput" @pointerdown="onScrubStart" @pointerup="onScrubEnd" @pointercancel="onScrubEnd" />

    <!-- Hover preview line -->
    <div v-if="active && !scrubbing" class="hero-range-hover-line" :style="{ left: `${pendingPercent}%` }" />

    <!-- Tooltip slot (scoped with pendingValue + position) -->
    <div class="hero-range-tooltip-slot" :class="{ 'is-visible': active }">
      <slot :pending-value="pendingValue" :position="tooltipPosition" />
    </div>
  </div>
</template>
