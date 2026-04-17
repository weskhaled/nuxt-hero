<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useMediaControls } from '@vueuse/core'
import { useRuntimeConfig } from '#imports'
import type { MediaControlsOptions, VideoMediaControls } from '#hero/types'
import { isHlsUrl, getHeroConfig } from '#hero/utils'
import { useHls } from '#hero/composables/_hls'

interface SlideVideoProps {
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
})

const heroConfig = getHeroConfig(useRuntimeConfig())
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

// HLS setup: always create when hls feature is enabled, useHls handles src reactivity
const hlsSrc = computed(() => hlsEnabled && isBgHls.value ? props.src : '')
const hlsState = hlsEnabled
  ? useHls(videoRef, hlsSrc)
  : null

// Set default volume from module config
mediaControls.volume.value = defaultVolume

// Track ended state (not provided by useMediaControls)
const ended = ref(false)

onMounted(() => {
  const el = videoRef.value
  if (!el) return
  el.addEventListener('ended', () => { ended.value = true })
})

// Reset ended when video starts playing again
watch(() => mediaControls.playing.value, (playing) => {
  if (playing) ended.value = false
})

// Register/unregister with parent slider
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

// Track whether the media is ready to play
const mediaReady = ref(false)

onMounted(() => {
  const el = videoRef.value
  if (!el) return

  const onCanPlay = () => {
    mediaReady.value = true
    if (props.autoPlay && props.isActive) {
      mediaControls.playing.value = true
    }
  }

  if (el.readyState >= 3) {
    mediaReady.value = true
    // Video already loaded (cached) — auto-play if active
    if (props.autoPlay && props.isActive) {
      mediaControls.playing.value = true
    }
  } else {
    el.addEventListener('canplay', onCanPlay, { once: true })
  }
})

// Play/pause based on active state (only auto-play/pause when autoPlay is true)
watch(
  () => props.isActive,
  (active) => {
    if (!props.autoPlay) return
    if (active && mediaReady.value) {
      mediaControls.playing.value = true
    } else if (!active) {
      mediaControls.playing.value = false
    }
  },
  { immediate: true },
)

// Auto-play when media becomes ready while slide is already active
watch(mediaReady, (ready) => {
  if (ready && props.autoPlay && props.isActive) {
    mediaControls.playing.value = true
  }
})

// Re-check readiness when src changes (color mode switch)
watch(() => props.src, () => {
  mediaReady.value = false
  const el = videoRef.value
  if (!el) return
  const onCanPlay = () => {
    mediaReady.value = true
    if (props.autoPlay && props.isActive) {
      mediaControls.playing.value = true
    }
  }
  el.addEventListener('canplay', onCanPlay, { once: true })
})

// Expose media controls so parent can render UI outside the parallax layer
defineExpose({
  mediaControls,
  hlsState,
})
</script>

<template>
  <video ref="videoRef" muted :loop="videoLoop" playsinline :poster="poster"
    class="size-full bg-black object-cover will-change-transform" />
</template>
