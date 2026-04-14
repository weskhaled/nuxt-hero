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

/** Active when hovered OR scrubbing — keeps bar expanded during drag */
const active = computed(() => hovered.value || scrubbing.value)
defineExpose({ active })

useEventListener('mouseup', () => {
  if (!scrubbing.value) return
  scrubbing.value = false
  emit('scrubbing', false)
  emit('scrubberMouseup', true)
})
onClickOutside(scrubber, () => {
  if (!scrubbing.value) return
  scrubbing.value = false
  emit('scrubbing', false)
  emit('scrubberMouseup', true)
})
const value = defineModel<number>({ required: false, default: 0 })
const { elementX, elementWidth } = useMouseInElement(scrubber)

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
  <div ref="scrubber" class="cursor-pointer select-none bg-white/15 transition-all duration-200 ease-out"
    :class="{ 'hero-scrubber-active': active }"
    @mousedown.stop="((scrubbing = true), emit('scrubberMousedown', true))">
    <div class="h-full w-full relative overflow-hidden">
      <div class="bg-white/40 h-full w-full left-0 top-0 absolute transition-transform duration-150"
        :style="{ transform: `translateX(${(secondary / max) * 100 - 100}%)` }" />
      <div class="bg-white h-full w-full relative transition-transform duration-150"
        :style="{ transform: `translateX(${(value / max) * 100 - 100}%)` }" />
    </div>
    <div class="opacity-0 inset-0 absolute transition-opacity duration-150"
      :class="{ 'opacity-100': active }">
      <slot :pending-value="pendingValue" :position="`${Math.max(0, Math.min(elementX, elementWidth))}px`" />
    </div>
  </div>
</template>
