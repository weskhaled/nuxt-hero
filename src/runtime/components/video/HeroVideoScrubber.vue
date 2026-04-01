<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useEventListener, useMouseInElement, onClickOutside } from '@vueuse/core'

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  secondary: { type: Number, default: 0 },
})

const emit = defineEmits(['scrubbing', 'scrubberMousedown', 'scrubberMouseup', 'click'])

const scrubber = useTemplateRef<HTMLElement>('scrubber')
const scrubbing = ref(false)
const pendingValue = ref(0)

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
  <div ref="scrubber" class="cursor-pointer select-none bg-white/15"
    @mousedown.stop="((scrubbing = true), emit('scrubberMousedown', true))">
    <div class="h-full w-full relative overflow-hidden">
      <div class="bg-white rounded-e-sm h-full w-full left-0 top-0 absolute"
        :style="{ transform: `translateX(${(secondary / max) * 100 - 100}%)` }" />
      <div class="bg-white h-full w-full relative rounded-e-sm"
        :style="{ transform: `translateX(${(value / max) * 100 - 100}%)` }" />
    </div>
    <div class="opacity-0 inset-0 absolute hover:opacity-100" :class="{ 'opacity-100': scrubbing }">
      <slot :pending-value="pendingValue" :position="`${Math.max(0, Math.min(elementX, elementWidth))}px`" />
    </div>
  </div>
</template>
