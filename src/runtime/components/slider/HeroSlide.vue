<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, useTemplateRef, watch } from 'vue'
import { useMounted } from '@vueuse/core'
import type { HeroLabels, MediaControlsOptions, VideoMediaControls } from '../../types'
import { useHeroConfig } from '../../config'
import { useHeroDark } from '../../composables/_dark'
import { isVideoUrl } from '../../utils'
// Type-only import (erased at build) just for the template-ref instance type.
import type HeroSlideVideoComponent from '../video/HeroSlideVideo.vue'

// Runtime component is loaded lazily so the video stack (useMediaControls + the
// HLS wrapper) only ships when a video slide actually renders — image-only
// sliders never pull it in.
const HeroSlideVideo = defineAsyncComponent(() => import('../video/HeroSlideVideo.vue'))
// Lazy-imported (not resolved by global name) so an image-only slider never
// logs "Failed to resolve component"; the chunk still only loads for video
// slides.
const HeroVideoControls = defineAsyncComponent(() => import('../video/HeroVideoControls.vue'))

export interface SlideProps {
  bgSrc: string
  bgDarkSrc?: string
  poster?: string
  imagePreset?: string
  /** @nuxt/image `sizes` DSL for responsive srcset (e.g. '100vw'). Empty disables. */
  imageSizes?: string
  eager?: boolean
  isActive?: boolean
  animationClass?: string
  slideIndex?: number
  onVideoReady?: (index: number, controls: VideoMediaControls) => void
  onVideoRemoved?: (index: number) => void
  mediaControlsOptions?: MediaControlsOptions
  showVideoControls?: boolean
  videoLoop?: boolean
  /** Whether video should auto-play when slide becomes active */
  autoPlay?: boolean
  /** Lite mode — suppress video autoplay/preload to save data (poster shown) */
  dataSaver?: boolean
  containerClass?: string
  bgClass?: string
  getContainerEl?: () => HTMLElement | null
  onSeek?: (time: number) => void
  onScrubStart?: () => void
  onScrubEnd?: () => void
  /** Localizable aria-labels forwarded to the default video controls */
  labels?: HeroLabels
}

const props = withDefaults(defineProps<SlideProps>(), {
  imagePreset: '',
  imageSizes: '',
  eager: false,
  isActive: false,
  animationClass: '',
  slideIndex: 0,
  onVideoReady: undefined,
  onVideoRemoved: undefined,
  mediaControlsOptions: undefined,
  showVideoControls: false,
  videoLoop: false,
  autoPlay: true,
  dataSaver: false,
  containerClass: '',
  bgClass: '',
  onSeek: undefined,
  onScrubStart: undefined,
  onScrubEnd: undefined,
})

const heroConfig = useHeroConfig()
const videoEnabled = !!heroConfig.features?.video

// Dark-mode swap for `bgDarkSrc`: framework-agnostic `.dark`-class (or media
// query) detection — no color-mode module required. Mount-gated so SSR and the
// first client render agree (SSR always serves the light source).
const isDark = useHeroDark(heroConfig.darkMode)
const isMounted = useMounted()

const activeBgSrc = computed(() =>
  isMounted.value && isDark.value && props.bgDarkSrc ? props.bgDarkSrc : props.bgSrc,
)

const isBgVideo = computed(() => videoEnabled && isVideoUrl(activeBgSrc.value))

// Image rendering: the configured component (NuxtImg in Nuxt with @nuxt/image;
// anything the consumer provides in plain Vue) or a native <img>. Preset/sizes
// props are only forwarded to a real component — they'd land as junk DOM
// attributes on <img>.
const imageComponent = computed(() => heroConfig.imageComponent ?? null)
const imageExtraProps = computed(() =>
  imageComponent.value
    ? { preset: props.imagePreset || undefined, sizes: props.imageSizes || undefined }
    : {},
)

// Video component ref — exposes mediaControls and hlsState
const videoComponentRef = useTemplateRef<InstanceType<typeof HeroSlideVideoComponent>>('videoComponentRef')

// Leave animation: keep content visible while leave animation plays.
// When no animation class is set (e.g. multi-slide mode), always show content.
const contentVisible = ref(props.isActive || !props.animationClass)
const contentAnimClass = ref(props.animationClass)

watch(
  () => props.isActive,
  (active) => {
    if (active) {
      contentVisible.value = true
      contentAnimClass.value = props.animationClass
    }
  },
)

watch(
  () => props.animationClass,
  (cls) => {
    contentAnimClass.value = cls
    if (!props.isActive && cls) contentVisible.value = true
    else if (!props.isActive && !cls) contentVisible.value = false
  },
)

function onAnimationEnd() {
  if (!props.isActive) contentVisible.value = false
}

/** Whether video controls should render (video active + controls enabled + media ready) */
const shouldShowVideoControls = computed(() =>
  isBgVideo.value && props.showVideoControls && !!videoComponentRef.value?.mediaControls,
)

/** HLS state data for the video-controls slot, or null if no HLS */
const hlsSlotData = computed(() => {
  const hls = videoComponentRef.value?.hlsState
  if (!hls) return null
  return {
    loading: hls.loading,
    error: hls.error,
    qualities: hls.qualities,
    setQuality: hls.setQuality,
  }
})
</script>

<template>
  <div class="hero-slide" :class="containerClass">
    <!-- Background layer (parallax targets .hero-slide-bg) -->
    <div class="hero-slide-bg" :class="bgClass">
      <!-- Video background (lazy loaded) -->
      <HeroSlideVideo v-if="isBgVideo" ref="videoComponentRef" :src="activeBgSrc" :poster="poster" :is-active="isActive"
        :slide-index="slideIndex" :on-video-ready="onVideoReady" :on-video-removed="onVideoRemoved"
        :media-controls-options="mediaControlsOptions" :video-loop="videoLoop" :auto-play="autoPlay"
        :data-saver="dataSaver" />
      <!-- Image background. The first slide is the LCP candidate: load it eagerly
           with high fetch priority so the largest paint isn't queued behind lazy assets. -->
      <component :is="imageComponent ?? 'img'" v-else :src="activeBgSrc" v-bind="imageExtraProps"
        :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" alt=""
        class="hero-slide-img" />
    </div>

    <!-- Inset scrim overlay (disable via `--hero-scrim: none`) -->
    <span class="hero-slide-scrim" />

    <!-- Overlay patterns (delegated from parent via slot) -->
    <slot name="overlay" />

    <!-- Content container (parallax targets .hero-slide-content) -->
    <div class="hero-slide-content">
      <div v-show="contentVisible" :class="contentAnimClass" class="hero-slide-content-inner"
        @animationend="onAnimationEnd">
        <slot />
      </div>
    </div>

    <!-- Video controls: rendered outside bg/content layers so parallax doesn't affect them -->
    <template v-if="shouldShowVideoControls">
      <slot name="video-controls" v-bind="{
        playing: videoComponentRef!.mediaControls.playing,
        togglePlay: () => { videoComponentRef!.mediaControls.playing.value = !videoComponentRef!.mediaControls.playing.value },
        currentTime: videoComponentRef!.mediaControls.currentTime,
        duration: videoComponentRef!.mediaControls.duration,
        buffered: videoComponentRef!.mediaControls.buffered,
        volume: videoComponentRef!.mediaControls.volume,
        muted: videoComponentRef!.mediaControls.muted,
        waiting: videoComponentRef!.mediaControls.waiting,
        rate: videoComponentRef!.mediaControls.rate,
        hls: hlsSlotData,
      }">
        <HeroVideoControls :labels="labels" :playing="videoComponentRef!.mediaControls.playing"
          :waiting="videoComponentRef!.mediaControls.waiting"
          :current-time="videoComponentRef!.mediaControls.currentTime"
          :duration="videoComponentRef!.mediaControls.duration" :buffered="videoComponentRef!.mediaControls.buffered"
          :volume="videoComponentRef!.mediaControls.volume" :muted="videoComponentRef!.mediaControls.muted"
          :rate="videoComponentRef!.mediaControls.rate" :get-container-el="getContainerEl" :on-seek="onSeek"
          :on-scrub-start="onScrubStart" :on-scrub-end="onScrubEnd" />
      </slot>
    </template>
  </div>
</template>
