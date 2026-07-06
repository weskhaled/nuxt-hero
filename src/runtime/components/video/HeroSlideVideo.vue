<script lang="ts" setup>
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useEventListener, useMediaControls } from '@vueuse/core'
import type { MediaControlsOptions, VideoMediaControls } from '../../types'
import { useHeroConfig } from '../../config'
import { isHlsUrl } from '../../utils'
import { useHls } from '../../composables/_hls'

export interface SlideVideoProps {
  /** Video source URL */
  src: string
  /** Poster frame */
  poster?: string
  /** Whether this slide is currently active */
  isActive?: boolean
  /** Slide index for video registry */
  slideIndex?: number
  /** Callback when video is ready */
  onVideoReady?: (index: number, controls: VideoMediaControls) => void
  /** Callback when video is removed */
  onVideoRemoved?: (index: number) => void
  /** VueUse useMediaControls options */
  mediaControlsOptions?: MediaControlsOptions
  /** Whether to show video controls. Default: true */
  showVideoControls?: boolean
  /** Whether the video should loop. Default: false */
  videoLoop?: boolean
  /** Whether the video should auto-play when active. Default: true */
  autoPlay?: boolean
  /** Lite mode — don't autoplay or preload; show the poster, tap to play. Default: false */
  dataSaver?: boolean
}

const props = withDefaults(defineProps<SlideVideoProps>(), {
  poster: undefined,
  isActive: false,
  slideIndex: 0,
  onVideoReady: undefined,
  onVideoRemoved: undefined,
  mediaControlsOptions: undefined,
  showVideoControls: false,
  videoLoop: false,
  autoPlay: true,
  dataSaver: false,
})

// Lite mode suppresses autoplay (saves cellular data — the poster shows until
// the user taps play) and drops `preload` to `none` so no bytes download until
// then. `metadata` otherwise: enough for duration/poster without the full body.
const effectiveAutoPlay = computed(() => props.autoPlay && !props.dataSaver)
const preload = computed(() => props.dataSaver ? 'none' : 'metadata')

const heroConfig = useHeroConfig()
const defaultVolume = heroConfig.defaultVolume ?? 0
const hlsEnabled = heroConfig.features?.hls ?? false

const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')
const isBgHls = computed(() => isHlsUrl(props.src))

// Reactive src for useMediaControls — only set when NOT HLS (HLS manages src itself)
const mediaSrc = computed(() => isBgHls.value ? undefined : props.src)

const mediaControls = useMediaControls(videoRef, {
  ...props.mediaControlsOptions,
  src: mediaSrc as any,
})

// HLS setup: always create when hls feature is enabled, useHls handles src
// reactivity. hls.js itself arrives via the injected config loader — never
// imported from runtime code (optional dep must stay out of the build graph).
const hlsSrc = computed(() => hlsEnabled && isBgHls.value ? props.src : '')
const hlsState = hlsEnabled
  ? useHls(videoRef, hlsSrc, { loader: heroConfig.hlsLoader ?? null })
  : null

// Set default volume from module config
mediaControls.volume.value = defaultVolume

// Track ended state (not provided by useMediaControls) + readiness.
const ended = ref(false)
const mediaReady = ref(false)

function tryAutoplay() {
  if (effectiveAutoPlay.value && props.isActive && mediaReady.value) {
    mediaControls.playing.value = true
  }
}

// ─── Element-level setup (re-runs per <video> element) ───
// The <video> is keyed by `src` (see template), so switching between an HLS and
// a progressive source — e.g. a dark-mode video swap — mounts a FRESH element
// instead of reusing one that still holds the previous src / MediaSource /
// buffered data. That stale state, plus useMediaControls and useHls both
// driving `el.src`, is what broke "video won't load after theme switch".
// `useEventListener` on the ref auto-rebinds its listeners to each new element.
useEventListener(videoRef, 'ended', () => { ended.value = true })
useEventListener(videoRef, 'canplay', () => { mediaReady.value = true })

watch(videoRef, (el) => {
  if (!el) return
  // iOS inline-autoplay needs `muted` as a *property*, not just the attribute.
  el.muted = true
  // Fresh element starts unready; a cached/instant source may already be playable.
  mediaReady.value = el.readyState >= 3
}, { immediate: true, flush: 'post' })

// Reset ended when playback (re)starts.
watch(() => mediaControls.playing.value, (playing) => {
  if (playing) ended.value = false
})

// Register / unregister with the parent slider on active change.
watch(
  () => props.isActive,
  (active) => {
    if (props.slideIndex === undefined || props.slideIndex === null) return
    if (active) {
      props.onVideoReady?.(props.slideIndex, { ...mediaControls, ended } as unknown as VideoMediaControls)
    } else {
      props.onVideoRemoved?.(props.slideIndex)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (props.slideIndex !== undefined && props.slideIndex !== null) {
    props.onVideoRemoved?.(props.slideIndex)
  }
})

// Drive autoplay off readiness + active state; pause when the slide goes inactive.
watch([mediaReady, () => props.isActive], () => {
  if (props.isActive) tryAutoplay()
  else if (effectiveAutoPlay.value) mediaControls.playing.value = false
}, { immediate: true })

// Expose media controls so parent can render UI outside the parallax layer
defineExpose({
  mediaControls,
  hlsState,
})
</script>

<template>
  <!-- Keyed by `src`: each distinct source (incl. the dark-mode swap, HLS or
       progressive) gets a fresh element with no residual MediaSource/buffer. -->
  <video :key="src" ref="videoRef" muted :loop="videoLoop" :preload="preload" playsinline webkit-playsinline
    disablepictureinpicture disableremoteplayback x-webkit-airplay="deny" :poster="poster"
    class="hero-slide-video" />
</template>
