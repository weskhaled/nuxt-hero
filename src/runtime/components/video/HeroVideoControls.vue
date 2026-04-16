<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue'
import type { Ref } from 'vue'
import { useFullscreen, useMouseInElement, useElementHover } from '@vueuse/core'
import { formatTime } from '#hero/utils'

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
const scrubbing = ref(false)

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

const bufferedPercent = computed(() => {
  if (!props.buffered || props.duration.value === 0) return 0
  const ranges = props.buffered.value
  if (!ranges.length) return 0
  // Use the end of the last buffered range
  const bufferedEnd = ranges[ranges.length - 1]?.[1] ?? 0
  return (bufferedEnd / props.duration.value) * 100
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

// ─── Scrubber ───

const scrubberTrackRef = useTemplateRef<HTMLElement>('scrubberTrackRef')
const scrubberHovered = useElementHover(scrubberTrackRef)
const { elementX, elementWidth } = useMouseInElement(scrubberTrackRef)

const showTooltip = computed(() => scrubberHovered.value || scrubbing.value)
const hoverProgress = computed(() => Math.max(0, Math.min(1, elementX.value / elementWidth.value)))
const hoverTime = computed(() => hoverProgress.value * props.duration.value)
const tooltipLeft = computed(() => `${Math.max(0, Math.min(elementX.value, elementWidth.value))}px`)

function onScrubInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  const time = (val / 100) * props.duration.value
  props.onSeek?.(time)
}

function onScrubDown() {
  scrubbing.value = true
  props.onScrubStart?.()
}

function onScrubUp() {
  scrubbing.value = false
  props.onScrubEnd?.()
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
  <div aria-live="polite" class="hero-video-center">
    <button type="button" class="hero-video-btn group"
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
    <!-- Scrubber bar: full width above buttons -->
    <div ref="scrubberTrackRef" class="hero-scrubber-track bottom-2">
      <!-- Buffered -->
      <div class="hero-scrubber-buffered" :style="{ width: `${bufferedPercent}%` }" />
      <!-- Progress -->
      <div class="hero-scrubber-progress" :style="{ width: `${progress}%` }" />
      <!-- Native range input on top -->
      <input type="range" min="0" max="100" step="0.1" :value="progress" class="hero-scrubber-input"
        :class="{ 'hero-scrubber-active': scrubbing }" aria-label="Seek video"
        :aria-valuetext="`${formatTime(currentTime.value)} of ${formatTime(duration.value)}`" @input="onScrubInput"
        @mousedown="onScrubDown" @touchstart="onScrubDown" @mouseup="onScrubUp" @touchend="onScrubUp"
        @touchcancel="onScrubUp" />
      <!-- Hover tooltip -->
      <div v-show="showTooltip" class="hero-scrub-tooltip" :style="{ left: tooltipLeft }">
        {{ formatTime(hoverTime) }}
      </div>
    </div>

    <!-- Controls row -->
    <div class="flex items-center justify-between w-full">
      <!-- Left: play, volume, time -->
      <div class="flex items-center gap-1">
        <button type="button" class="hero-ctrl-btn" :aria-label="playing.value ? 'Pause video' : 'Play video'"
          @click="toggle">
          <span v-if="waiting.value" class="hero-spinner hero-spinner-sm text-white" />
          <Transition v-else name="hero-vol-icon" mode="out-in">
            <Icon v-if="playing.value" key="pause" name="lucide:pause" class="size-4" />
            <Icon v-else key="play" name="lucide:play" class="size-4" />
          </Transition>
        </button>

        <div class="hero-volume-group">
          <button type="button" class="hero-volume-mute-btn"
            aria-label="Toggle mute" @click="toggleMute">
            <Transition name="hero-vol-icon" mode="out-in">
              <Icon v-if="volumeIcon === 'high'" key="high" name="lucide:volume-2" class="size-4" />
              <Icon v-else-if="volumeIcon === 'low'" key="low" name="lucide:volume-1" class="size-4" />
              <Icon v-else key="muted" name="lucide:volume-x" class="size-4" />
            </Transition>
          </button>
          <div class="hero-volume-expand">
            <input type="range" min="0" max="100" :value="muted.value ? 0 : volumePercent"
              class="hero-range mx-2"
              aria-label="Volume" :aria-valuetext="`${muted.value ? 0 : volumePercent}%`" @input="onVolumeInput" />
          </div>
        </div>

        <span class="hero-time-label">
          {{ formattedTime }}
        </span>
      </div>

      <!-- Right: settings, fullscreen -->
      <div class="flex items-center gap-1">
        <!-- Settings -->
        <div class="relative">
          <button type="button" class="hero-ctrl-btn" aria-label="Settings" @click="settingsOpen = !settingsOpen">
            <Icon name="lucide:settings" class="size-4 transition-transform duration-300"
              :class="{ 'rotate-90': settingsOpen }" />
          </button>
          <Transition name="hero-settings">
            <div v-if="settingsOpen" class="hero-settings-panel">
              <div class="hero-settings-header">Playback speed</div>
              <button v-for="rate in playbackRates" :key="rate" type="button"
                class="hero-settings-rate-btn"
                @click="setPlaybackRate(rate)">
                <span>{{ rate === 1 ? 'Normal' : `${rate}x` }}</span>
                <Icon v-if="playbackRate === rate" name="lucide:check" class="size-3 text-white/70" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Fullscreen -->
        <button type="button" class="hero-ctrl-btn" :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          @click="toggleFullscreen">
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

/* ─── Layout ─── */
.hero-video-center {
  @apply pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10;
  @apply flex items-center justify-center;
}

.media-controls {
  @apply pointer-events-auto absolute z-999 bottom-0 left-0 right-0 flex flex-col gap-1 px-3 pb-3;
}

/* ─── Center play button ─── */
.hero-video-btn {
  @apply inline-flex items-center justify-center size-12 rounded-full;
  @apply shadow-none border-none transition-all duration-200 relative;
  @apply text-white cursor-pointer bg-white/35 backdrop-blur-sm opacity-0 hover:scale-110;
  @apply dark:bg-black/35;
}

.hero-slider:hover .hero-video-btn {
  @apply opacity-100;
}

/* ─── Control bar buttons ─── */
.hero-ctrl-btn {
  @apply inline-flex items-center justify-center size-8 rounded-full;
  @apply shadow-none text-white bg-white/25 backdrop-blur-sm cursor-pointer;
  @apply hover:bg-white/35 transition-all duration-200;
}

/* ─── Volume control ─── */
.hero-volume-group {
  @apply flex items-center bg-white/25 rounded-full backdrop-blur-sm overflow-hidden;
  @apply transition-all duration-300 ease-out hover:bg-white/35;
}

.hero-volume-mute-btn {
  @apply inline-flex flex-none items-center justify-center size-8 rounded-full;
  @apply shadow-none text-white cursor-pointer transition-all duration-200;
}

.hero-volume-expand {
  @apply flex items-center overflow-x-clip transition-all duration-300 ease-out;
  max-width: 0;
}

.hero-volume-group:hover .hero-volume-expand {
  max-width: 7rem;
}

/* ─── Volume range ─── */
.hero-range {
  @apply appearance-none w-20 h-1 bg-white/35 rounded-full outline-none cursor-pointer;
  @apply opacity-0 transition-opacity duration-200;
}

.hero-volume-group:hover .hero-range {
  @apply opacity-100;
}

.hero-range::-webkit-slider-thumb {
  @apply appearance-none size-3 rounded-full bg-white cursor-pointer;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}

.hero-range::-webkit-slider-thumb:hover {
  @apply scale-120;
}

.hero-range::-moz-range-track {
  @apply w-full h-1 bg-white/35 rounded-full;
}

.hero-range::-moz-range-thumb {
  @apply size-3 rounded-full bg-white cursor-pointer border-none;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

/* ─── Time label ─── */
.hero-time-label {
  @apply text-xs text-white/80 px-2 tabular-nums whitespace-nowrap;
}

/* ─── Scrubber ─── */
.hero-scrubber-track {
  @apply relative w-full h-1 bg-white/20 rounded-full cursor-pointer overflow-visible;
  transition: height 0.15s ease;
}

.hero-scrubber-track:hover,
.hero-scrubber-track:has(.hero-scrubber-active) {
  @apply h-1.5;
}

.hero-scrubber-buffered {
  @apply absolute top-0 left-0 h-full bg-white/35 rounded-full pointer-events-none;
}

.hero-scrubber-progress {
  @apply absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none;
}

.hero-scrubber-input {
  @apply appearance-none absolute -top-1 left-0 w-full m-0 bg-transparent cursor-pointer outline-none;
  height: calc(100% + 8px);
}

.hero-scrubber-input::-webkit-slider-thumb {
  @apply appearance-none size-0 rounded-full bg-white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transition: width 0.15s ease, height 0.15s ease;
}

.hero-scrubber-track:hover .hero-scrubber-input::-webkit-slider-thumb,
.hero-scrubber-input.hero-scrubber-active::-webkit-slider-thumb {
  @apply size-3.5;
}

.hero-scrubber-input::-moz-range-track {
  @apply bg-transparent border-none;
}

.hero-scrubber-input::-moz-range-thumb {
  @apply size-0 rounded-full bg-white border-none;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  transition: width 0.15s ease, height 0.15s ease;
}

.hero-scrubber-track:hover .hero-scrubber-input::-moz-range-thumb,
.hero-scrubber-input.hero-scrubber-active::-moz-range-thumb {
  @apply size-3.5;
}

/* ─── Scrubber tooltip ─── */
.hero-scrub-tooltip {
  @apply absolute z-[99] -translate-x-1/2 px-2 py-1 text-xs leading-4 tabular-nums whitespace-nowrap text-black bg-white/95 backdrop-blur rounded pointer-events-none;
  bottom: calc(100% + 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.hero-scrub-tooltip::after {
  @apply absolute left-1/2 -bottom-1 -translate-x-1/2 rotate-45 size-2 bg-white/95;
  content: '';
}

/* ─── Spinner ─── */
@keyframes heroSpin {
  to { transform: rotate(360deg); }
}

.hero-spinner {
  @apply inline-block rounded-full;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-left-color: currentColor;
  animation: heroSpin 0.6s linear infinite;
}

.hero-spinner-sm { @apply size-4; }
.hero-spinner-md { @apply size-5; }

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

/* ─── Settings panel transition ─── */
.hero-settings-enter-active,
.hero-settings-leave-active {
  @apply transition-[opacity,transform] duration-200 ease-in-out;
}

.hero-settings-enter-from,
.hero-settings-leave-to {
  @apply opacity-0 translate-y-2 scale-95;
}

/* ─── Volume icon transition ─── */
.hero-vol-icon-enter-active,
.hero-vol-icon-leave-active {
  @apply transition-[opacity,transform] duration-150 ease-in-out;
}

.hero-vol-icon-enter-from,
.hero-vol-icon-leave-to {
  @apply opacity-0 scale-80;
}
</style>
