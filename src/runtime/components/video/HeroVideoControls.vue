<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue'
import type { Ref } from 'vue'
import { onClickOutside, useFullscreen } from '@vueuse/core'
import type { HeroLabels } from '../../types'
import { formatTime } from '../../utils'
import HeroVideoScrubber from './HeroVideoScrubber.vue'
import HeroIcon from '../HeroIcon.vue'

interface VideoControlsProps {
  playing: Ref<boolean>
  waiting: Ref<boolean>
  currentTime: Ref<number>
  volume: Ref<number>
  muted: Ref<boolean>
  duration: Ref<number>
  /** Raw buffered time ranges from useMediaControls: [start, end][] */
  buffered?: Ref<[number, number][]>
  /** Playback rate from useMediaControls — drives the speed menu */
  rate?: Ref<number>
  getContainerEl?: () => HTMLElement | null
  onSeek?: (time: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
  /** Localizable aria-labels (any omitted key falls back to English) */
  labels?: HeroLabels
}

const props = defineProps<VideoControlsProps>()

const { isFullscreen } = useFullscreen()

/** Resolved aria-labels with English fallbacks. */
const L = computed(() => ({
  play: props.labels?.play ?? 'Play video',
  pause: props.labels?.pause ?? 'Pause video',
  mute: props.labels?.mute ?? 'Toggle mute',
  volume: props.labels?.volume ?? 'Volume',
  seek: props.labels?.seek ?? 'Seek',
  settings: props.labels?.settings ?? 'Settings',
  speed: props.labels?.speed ?? 'Playback speed',
  speedNormal: props.labels?.speedNormal ?? 'Normal',
  fullscreenEnter: props.labels?.fullscreenEnter ?? 'Enter fullscreen',
  fullscreenExit: props.labels?.fullscreenExit ?? 'Exit fullscreen',
}))

// Fullscreen is per-element and not universally available (iOS Safari only
// fullscreens <video> natively) — hide the button when the API is absent.
const fullscreenSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled

function toggleFullscreen() {
  const el = props.getContainerEl?.()
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    el.requestFullscreen?.()
  }
}

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

// ─── Playback speed menu ───
// Rate is driven through the media-controls `rate` ref (survives the keyed
// <video> element swaps — dark-mode source change, HLS ↔ progressive), never a
// DOM query. The menu follows the WAI-ARIA menu pattern: aria-haspopup +
// aria-expanded on the trigger, menuitemradio + aria-checked per option,
// Escape and click-outside close it.
const settingsOpen = ref(false)
const settingsWrapEl = useTemplateRef<HTMLElement>('settingsWrapEl')
onClickOutside(settingsWrapEl, () => { settingsOpen.value = false })

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]
const playbackRate = computed(() => props.rate?.value ?? 1)

function setPlaybackRate(r: number) {
  if (props.rate) props.rate.value = r
  settingsOpen.value = false
}
</script>

<template>
  <!-- Center play button. `.is-paused` keeps it visible while paused — including
       on touch devices where there's no hover to reveal it (tap-to-play). -->
  <div aria-live="polite" class="hero-play-center">
    <button type="button" class="hero-ctrl-btn hero-play-center-btn" :class="{ 'is-paused': !playing.value }"
      :disabled="waiting.value" :aria-label="playing.value ? L.pause : L.play" @click="toggle">
      <span v-if="waiting.value" class="hero-spinner hero-spinner--lg" />
      <HeroIcon v-else-if="playing.value" name="pause" class="hero-play-center-icon" />
      <HeroIcon v-else name="play" class="hero-play-center-icon" />

      <div class="hero-play-center-ring">
        <div class="hero-radial-progress"
          :style="{ '--hero-progress-value': Math.round(progress), '--hero-progress-size': '100%', '--hero-progress-thickness': '0.25rem' }"
          role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100" />
      </div>
    </button>
  </div>

  <!-- Bottom bar -->
  <div class="hero-media-controls">
    <!-- Scrubber: full-width time track, native input-driven -->
    <HeroVideoScrubber :model-value="currentTime.value" :max="duration.value" :secondary="bufferedEnd"
      :label="L.seek" @update:model-value="onScrubUpdate" @scrubber-mousedown="onScrubStart?.()"
      @scrubber-mouseup="onScrubEnd?.()">
      <template #default="{ pendingValue, position }">
        <span class="hero-scrubber-tooltip" :style="{ left: position }">
          {{ formatTime(pendingValue) }}
        </span>
      </template>
    </HeroVideoScrubber>

    <!-- Controls row -->
    <div class="hero-controls-row">
      <!-- Start: play, volume, time -->
      <div class="hero-controls-group">
        <button type="button" class="hero-ctrl-btn hero-ctrl-btn--filled"
          :aria-label="playing.value ? L.pause : L.play" @click="toggle">
          <span v-if="waiting.value" class="hero-spinner" />
          <Transition v-else name="hero-vol-icon" mode="out-in">
            <HeroIcon v-if="playing.value" key="pause" name="pause" />
            <HeroIcon v-else key="play" name="play" />
          </Transition>
        </button>

        <div class="hero-volume-group">
          <button type="button" class="hero-ctrl-btn" :aria-label="L.mute" :aria-pressed="muted.value"
            @click="toggleMute">
            <Transition name="hero-vol-icon" mode="out-in">
              <HeroIcon v-if="volumeIcon === 'high'" key="high" name="volume-2" />
              <HeroIcon v-else-if="volumeIcon === 'low'" key="low" name="volume-1" />
              <HeroIcon v-else key="muted" name="volume-x" />
            </Transition>
          </button>
          <div class="hero-volume-expand">
            <!-- Volume slider: same .hero-range-* pattern as the scrubber -->
            <div class="hero-range-track hero-volume-slider">
              <div class="hero-range-fill" :style="{ width: `${muted.value ? 0 : volumePercent}%` }" />
              <input type="range" min="0" max="100" :value="muted.value ? 0 : volumePercent" class="hero-range-input"
                :aria-label="L.volume" :aria-valuetext="`${muted.value ? 0 : volumePercent}%`" @input="onVolumeInput" />
            </div>
          </div>
        </div>

        <span class="hero-time-label">{{ formattedTime }}</span>
      </div>

      <!-- End: settings, fullscreen -->
      <div class="hero-controls-group">
        <!-- Settings (playback speed) -->
        <div ref="settingsWrapEl" class="hero-settings-wrap" @keydown.escape="settingsOpen = false">
          <button type="button" class="hero-ctrl-btn hero-ctrl-btn--filled" :aria-label="L.settings"
            aria-haspopup="menu" :aria-expanded="settingsOpen" @click="settingsOpen = !settingsOpen">
            <HeroIcon name="settings" class="hero-settings-icon" :class="{ 'is-open': settingsOpen }" />
          </button>
          <Transition name="hero-settings">
            <div v-if="settingsOpen" class="hero-settings-panel" role="menu" :aria-label="L.speed">
              <div class="hero-settings-header" aria-hidden="true">{{ L.speed }}</div>
              <button v-for="r in playbackRates" :key="r" type="button" class="hero-settings-rate-btn"
                role="menuitemradio" :aria-checked="playbackRate === r" @click="setPlaybackRate(r)">
                <span>{{ r === 1 ? L.speedNormal : `${r}x` }}</span>
                <HeroIcon v-if="playbackRate === r" name="check" />
              </button>
            </div>
          </Transition>
        </div>

        <!-- Fullscreen -->
        <button v-if="fullscreenSupported" type="button" class="hero-ctrl-btn hero-ctrl-btn--filled"
          :aria-label="isFullscreen ? L.fullscreenExit : L.fullscreenEnter" @click="toggleFullscreen">
          <Transition name="hero-vol-icon" mode="out-in">
            <HeroIcon v-if="isFullscreen" key="minimize" name="minimize" />
            <HeroIcon v-else key="maximize" name="maximize" />
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>
