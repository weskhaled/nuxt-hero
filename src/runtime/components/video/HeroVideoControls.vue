<script lang="ts" setup>
import { computed } from 'vue'
import type { Ref } from 'vue'
import { formatTime } from '#hero/utils'

interface VideoControlsProps {
  playing: Ref<boolean>
  waiting: Ref<boolean>
  currentTime: Ref<number>
  volume: Ref<number>
  muted: Ref<boolean>
  duration: Ref<number>
}

const props = defineProps<VideoControlsProps>()

const formattedTime = computed(
  () =>
    `${formatTime(Number(props.currentTime.value))} / ${formatTime(Number(props.duration.value))}`,
)

function toggle() {
  props.playing.value = !props.playing.value
}

const progress = computed(() => {
  if (props.duration.value === 0) return 0
  return (props.currentTime.value / props.duration.value) * 100
})

const volumePercent = computed(() => Math.round((props.volume.value ?? 0) * 100))

function onVolumeInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  props.volume.value = val / 100
  if (val > 0 && props.muted.value) {
    props.muted.value = false
  }
}

function toggleMute() {
  props.muted.value = !props.muted.value
}

const volumeIcon = computed(() => {
  if (props.muted.value || props.volume.value === 0) return 'muted'
  if (props.volume.value < 0.5) return 'low'
  return 'high'
})
</script>

<template>
  <div aria-live="polite"
    class="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
    <button type="button"
      class="inline-flex items-center justify-center size-12 rounded-full text-white cursor-pointer hero-video-btn group"
      :disabled="waiting.value" :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="toggle">
      <span v-if="waiting.value" class="hero-spinner hero-spinner-md text-white" />
      <Icon v-else-if="playing.value" name="lucide:pause"
        class="size-4 transition-transform duration-150 group-hover:scale-110" />
      <Icon v-else name="lucide:play" class="size-4 transition-transform duration-150 group-hover:scale-110" />

      <div class="absolute flex size-full items-center justify-center">
        <div class="hero-radial-progress size-full m-auto"
          :style="{ '--hero-progress-value': Math.round(progress), '--hero-progress-size': '3rem', '--hero-progress-thickness': '0.25rem' }"
          :aria-valuenow="Math.round(progress)" role="progressbar" />
      </div>
    </button>
  </div>
  <div>
    <div class="media-controls">
      <button type="button"
        class="inline-flex items-center justify-center size-8 rounded mr-1 shadow-none text-white hover:opacity-100 transition-opacity cursor-pointer"
        :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="toggle">
        <span v-if="waiting.value" class="hero-spinner hero-spinner-sm text-white" />
        <Icon v-else-if="playing.value" name="lucide:pause" class="size-4 transition-transform duration-150" />
        <Icon v-else name="lucide:play" class="size-4 transition-transform duration-150" />
      </button>
      <div class="group/volume flex items-center bg-white/25 rounded transition-opacity overflow-hidden">
        <button type="button"
          class="inline-flex flex-none items-center justify-center size-8 rounded shadow-none text-white hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Toggle mute" @click="toggleMute">
          <Icon v-if="volumeIcon === 'high'" name="lucide:volume-2" class="size-4" />
          <Icon v-else-if="volumeIcon === 'low'" name="lucide:volume-1" class="size-4" />
          <Icon v-else name="lucide:volume-x" class="size-4" />
        </button>
        <div
          class="overflow-hidden w-0 px-2 hidden group-hover/volume:flex group-hover/volume:w-full transition-all duration-300 ease-out">
          <input type="range" min="0" max="100" :value="muted.value ? 0 : volumePercent" class="text-white"
            aria-label="Volume" :aria-valuetext="`${muted.value ? 0 : volumePercent}%`" @input="onVolumeInput" />
        </div>
      </div>
    </div>
    <!-- Time Display -->
    <span
      class="text-xs p-2 mb-4 mr-2 text-center rounded backdrop-blur-sm bg-white/85 min-w-25 self-end bottom-1 right-0 absolute z-2 dark:bg-black/85">
      {{ formattedTime }}
    </span>
  </div>
</template>
