<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useFullscreen } from '@vueuse/core'
import { formatTime } from '#hero/utils'
import HeroVideoScrubber from './HeroVideoScrubber.vue'

interface VideoControlsProps {
  playing: Ref<boolean>
  waiting: Ref<boolean>
  currentTime: Ref<number>
  volume: Ref<number>
  muted: Ref<boolean>
  duration: Ref<number>
  /** Raw buffered time ranges from useMediaControls: [start, end][] */
  buffered?: Ref<[number, number][]>
  getContainerEl?: () => HTMLElement | null
  onSeek?: (time: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
}

const props = defineProps<VideoControlsProps>()

const { isFullscreen } = useFullscreen()

function toggleFullscreen() {
  const el = props.getContainerEl?.()
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    el.requestFullscreen()
  }
}

const settingsOpen = ref(false)

const formattedTime = computed(
  () => `${formatTime(Number(props.currentTime.value))} / ${formatTime(Number(props.duration.value))}`,
)

function toggle() {
  props.playing.value = !props.playing.value
}

/** Center play button radial-progress percentage */
const progress = computed(() => {
  if (props.duration.value === 0) return 0
  return (props.currentTime.value / props.duration.value) * 100
})

/** End of the last buffered range in seconds — fed to the scrubber as `secondary`. */
const bufferedEnd = computed(() => {
  const ranges = props.buffered?.value
  if (!ranges?.length) return 0
  return ranges[ranges.length - 1]?.[1] ?? 0
})

// ─── Volume ───

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

// ─── Scrubber wiring ───

/** Seek on every scrubber value update (driven by native input events). */
function onScrubUpdate(time: number) {
  props.onSeek?.(time)
}

// ─── Playback speed ───

const playbackRate = ref(1)
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

function setPlaybackRate(rate: number) {
  playbackRate.value = rate
  const el = props.getContainerEl?.()
  if (el) {
    const video = el.querySelector('.swiper-slide-active video') as HTMLVideoElement | null
    if (video) video.playbackRate = rate
  }
  settingsOpen.value = false
}
</script>

<template>
  <!-- Center play button -->
  <div aria-live="polite" class="hero-play-center">
    <button type="button" class="hero-ctrl-btn hero-play-center-btn group" :disabled="waiting.value"
      :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="toggle">
      <span v-if="waiting.value" class="hero-spinner size-5 text-white" />
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
  <div class="hero-media-controls">
    <!-- Scrubber: full-width time track, native input-driven -->
    <HeroVideoScrubber :model-value="currentTime.value" :max="duration.value" :secondary="bufferedEnd"
      @update:model-value="onScrubUpdate" @scrubber-mousedown="onScrubStart?.()" @scrubber-mouseup="onScrubEnd?.()">
      <template #default="{ pendingValue, position }">
        <span class="hero-scrubber-tooltip" :style="{ left: position }">
          {{ formatTime(pendingValue) }}
        </span>
      </template>
    </HeroVideoScrubber>

    <!-- Controls row -->
    <div class="flex items-center justify-between w-full">
      <!-- Left: play, volume, time -->
      <div class="flex items-center gap-1">
        <button type="button" class="hero-ctrl-btn hero-ctrl-btn--filled size-8"
          :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="toggle">
          <span v-if="waiting.value" class="hero-spinner size-4 text-white" />
          <Transition v-else name="hero-vol-icon" mode="out-in">
            <Icon v-if="playing.value" key="pause" name="lucide:pause" class="size-4" />
            <Icon v-else key="play" name="lucide:play" class="size-4" />
          </Transition>
        </button>

        <div class="hero-volume-group">
          <button type="button" class="hero-ctrl-btn size-8 flex-none" aria-label="Toggle mute" @click="toggleMute">
            <Transition name="hero-vol-icon" mode="out-in">
              <Icon v-if="volumeIcon === 'high'" key="high" name="lucide:volume-2" class="size-4" />
              <Icon v-else-if="volumeIcon === 'low'" key="low" name="lucide:volume-1" class="size-4" />
              <Icon v-else key="muted" name="lucide:volume-x" class="size-4" />
            </Transition>
          </button>
          <div class="hero-volume-expand">
            <!-- Volume slider: same .hero-range-* pattern as the scrubber -->
            <div class="hero-range-track w-20! mx-2">
              <div class="hero-range-fill" :style="{ width: `${muted.value ? 0 : volumePercent}%` }" />
              <input type="range" min="0" max="100" :value="muted.value ? 0 : volumePercent" class="hero-range-input"
                aria-label="Volume" :aria-valuetext="`${muted.value ? 0 : volumePercent}%`" @input="onVolumeInput" />
            </div>
          </div>
        </div>

        <span class="hero-time-label">{{ formattedTime }}</span>
      </div>

      <!-- Right: settings, fullscreen -->
      <div class="flex items-center gap-1">
        <!-- Settings -->
        <div class="relative">
          <button type="button" class="hero-ctrl-btn hero-ctrl-btn--filled size-8" aria-label="Settings"
            @click="settingsOpen = !settingsOpen">
            <Icon name="lucide:settings" class="size-4 transition-transform duration-300"
              :class="{ 'rotate-90': settingsOpen }" />
          </button>
          <Transition name="hero-settings">
            <div v-if="settingsOpen" class="hero-settings-panel">
              <div class="hero-settings-header">Playback speed</div>
              <button v-for="rate in playbackRates" :key="rate" type="button" class="hero-settings-rate-btn"
                @click="setPlaybackRate(rate)">
                <span>{{ rate === 1 ? 'Normal' : `${rate}x` }}</span>
                <Icon v-if="playbackRate === rate" name="lucide:check" class="size-3 text-white/70" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Fullscreen -->
        <button type="button" class="hero-ctrl-btn hero-ctrl-btn--filled size-8"
          :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'" @click="toggleFullscreen">
          <Transition name="hero-vol-icon" mode="out-in">
            <Icon v-if="isFullscreen" key="minimize" name="lucide:minimize" class="size-4" />
            <Icon v-else key="maximize" name="lucide:maximize" class="size-4" />
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* Shared styles (`.hero-range-*`, `.hero-ctrl-btn`, `.hero-spinner`,
   `.hero-radial-progress`) live in runtime/assets/hero.css. */

/* ─── Layout ─── */
.hero-play-center {
  @apply pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10;
  @apply flex items-center justify-center;
}

.hero-media-controls {
  @apply pointer-events-auto absolute z-999 bottom-0 left-0 right-0 flex flex-col gap-1 px-3 pb-3;
}

/* ─── Center play button (reveals on slider hover) ─── */
.hero-play-center-btn {
  @apply size-12 bg-white/35 backdrop-blur-sm opacity-0 hover:scale-110;
  @apply dark:bg-black/35;
}

.hero-slider:hover .hero-play-center-btn {
  @apply opacity-100;
}

/* ─── Volume pill (expands on hover) ─── */
.hero-volume-group {
  @apply flex items-center bg-white/25 rounded-full backdrop-blur-sm overflow-hidden;
  @apply transition-all duration-300 ease-out hover:bg-white/35;
}

.hero-volume-expand {
  @apply flex items-center overflow-x-clip transition-all duration-300 ease-out;
  max-width: 0;
}

.hero-volume-group:hover .hero-volume-expand {
  max-width: 7rem;
}

/* ─── Time label ─── */
.hero-time-label {
  @apply text-xs text-white/80 px-2 tabular-nums whitespace-nowrap;
}

/* ─── Scrubber hover tooltip (slotted into HeroVideoScrubber) ───
   Absolutely positioned relative to the track. `bottom` offsets it above
   the track with a small gap; `left: position` is set inline per cursor. */
.hero-scrubber-tooltip {
  @apply absolute -translate-x-1/2 px-2 py-1 text-xs leading-4 tabular-nums whitespace-nowrap z-10;
  @apply text-black bg-white backdrop-blur rounded;
  bottom: calc(100% + 0.5rem);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
}

.hero-scrubber-tooltip::after {
  @apply absolute left-1/2 -bottom-1 -translate-x-1/2 rotate-45 size-2 bg-white;
  content: '';
}

/* ─── Settings panel ─── */
.hero-settings-panel {
  @apply absolute bottom-full right-0 mb-2 rounded-lg;
  @apply bg-black/80 backdrop-blur-md text-white text-xs min-w-36 overflow-hidden shadow-lg;
}

.hero-settings-header {
  @apply px-3 py-2 flex text-white/75 font-medium border-b border-white/10;
}

.hero-settings-rate-btn {
  @apply flex w-full items-center justify-between px-3 py-1.5;
  @apply hover:bg-white/10 transition-colors cursor-pointer;
}

/* ─── Transitions ─── */
.hero-settings-enter-active,
.hero-settings-leave-active {
  @apply transition duration-200 ease-in-out;
}

.hero-settings-enter-from,
.hero-settings-leave-to {
  @apply opacity-0 translate-y-2 scale-95;
}

.hero-vol-icon-enter-active,
.hero-vol-icon-leave-active {
  @apply transition duration-150 ease-in-out;
}

.hero-vol-icon-enter-from,
.hero-vol-icon-leave-to {
  @apply opacity-0 scale-80;
}
</style>
