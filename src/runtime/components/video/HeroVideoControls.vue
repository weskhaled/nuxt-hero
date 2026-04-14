<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useFullscreen } from '@vueuse/core'
import { formatTime } from '#hero/utils'

interface VideoControlsProps {
  playing: Ref<boolean>
  waiting: Ref<boolean>
  currentTime: Ref<number>
  volume: Ref<number>
  muted: Ref<boolean>
  duration: Ref<number>
  containerEl?: ComputedRef<HTMLElement | null>
}

const props = defineProps<VideoControlsProps>()

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(props.containerEl)

const settingsOpen = ref(false)

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

const playbackRate = ref(1)
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

function setPlaybackRate(rate: number) {
  playbackRate.value = rate
  const el = props.containerEl?.value
  if (el) {
    const video = el.querySelector('.swiper-slide-active video') as HTMLVideoElement | null
    if (video) video.playbackRate = rate
  }
  settingsOpen.value = false
}
</script>

<template>
  <!-- Center play button -->
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

  <!-- Bottom bar -->
  <div class="media-controls">
    <!-- Left: play, volume, time -->
    <div class="flex items-center gap-1">
      <button type="button"
        class="hero-ctrl-btn"
        :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="toggle">
        <span v-if="waiting.value" class="hero-spinner hero-spinner-sm text-white" />
        <Transition v-else name="hero-vol-icon" mode="out-in">
          <Icon v-if="playing.value" key="pause" name="lucide:pause" class="size-4" />
          <Icon v-else key="play" name="lucide:play" class="size-4" />
        </Transition>
      </button>

      <div class="group/volume flex items-center bg-white/25 rounded-full backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out hover:bg-white/35">
        <button type="button"
          class="inline-flex flex-none items-center justify-center size-8 rounded-full shadow-none text-white hover:opacity-100 transition-all duration-200 cursor-pointer"
          aria-label="Toggle mute" @click="toggleMute">
          <Transition name="hero-vol-icon" mode="out-in">
            <Icon v-if="volumeIcon === 'high'" key="high" name="lucide:volume-2" class="size-4" />
            <Icon v-else-if="volumeIcon === 'low'" key="low" name="lucide:volume-1" class="size-4" />
            <Icon v-else key="muted" name="lucide:volume-x" class="size-4" />
          </Transition>
        </button>
        <div class="flex items-center max-w-0 group-hover/volume:max-w-28 transition-all duration-300 ease-out overflow-x-clip">
          <input type="range" min="0" max="100" :value="muted.value ? 0 : volumePercent"
            class="hero-range mx-2 cursor-pointer transition-opacity duration-200 opacity-0 group-hover/volume:opacity-100"
            aria-label="Volume" :aria-valuetext="`${muted.value ? 0 : volumePercent}%`" @input="onVolumeInput" />
        </div>
      </div>

      <span class="text-xs text-white/80 px-2 tabular-nums whitespace-nowrap">
        {{ formattedTime }}
      </span>
    </div>

    <!-- Right: settings, fullscreen -->
    <div class="flex items-center gap-1">
      <!-- Settings -->
      <div class="relative">
        <button type="button"
          class="hero-ctrl-btn"
          aria-label="Settings" @click="settingsOpen = !settingsOpen">
          <Icon name="lucide:settings" class="size-4 transition-transform duration-300" :class="{ 'rotate-90': settingsOpen }" />
        </button>
        <Transition name="hero-settings">
          <div v-if="settingsOpen"
            class="absolute bottom-full right-0 mb-2 rounded-lg bg-black/80 backdrop-blur-md text-white text-xs min-w-36 overflow-hidden shadow-lg">
            <div class="px-3 py-2 text-white/50 font-medium border-b border-white/10">Playback speed</div>
            <button v-for="rate in playbackRates" :key="rate" type="button"
              class="flex w-full items-center justify-between px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
              @click="setPlaybackRate(rate)">
              <span>{{ rate === 1 ? 'Normal' : `${rate}x` }}</span>
              <Icon v-if="playbackRate === rate" name="lucide:check" class="size-3 text-white/70" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Fullscreen -->
      <button type="button"
        class="hero-ctrl-btn"
        :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'" @click="toggleFullscreen">
        <Transition name="hero-vol-icon" mode="out-in">
          <Icon v-if="isFullscreen" key="minimize" name="lucide:minimize" class="size-4" />
          <Icon v-else key="maximize" name="lucide:maximize" class="size-4" />
        </Transition>
      </button>
    </div>
  </div>
</template>
