<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, useTemplateRef, watch } from 'vue'
import { useMounted } from '@vueuse/core'
import { useColorMode, useRuntimeConfig } from '#imports'
import type { HeroLabels, MediaControlsOptions, VideoMediaControls } from '#hero/types'
import { isVideoUrl, getHeroConfig } from '#hero/utils'
// Type-only import (erased at build) just for the template-ref instance type.
import type HeroSlideVideoComponent from '../video/HeroSlideVideo.vue'

// Runtime component is loaded lazily so the video stack (useMediaControls + the
// HLS wrapper) only ships when a video slide actually renders — image-only
// sliders never pull it in.
const HeroSlideVideo = defineAsyncComponent(() => import('../video/HeroSlideVideo.vue'))

interface SlideProps {
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

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const isMounted = useMounted()

const heroConfig = getHeroConfig(useRuntimeConfig())
const hasNuxtImage = !!heroConfig.hasNuxtImage
const videoEnabled = !!heroConfig.features?.video

const activeBgSrc = computed(() =>
  isMounted.value && isDark.value && props.bgDarkSrc ? props.bgDarkSrc : props.bgSrc,
)

const isBgVideo = computed(() => videoEnabled && isVideoUrl(activeBgSrc.value))

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
  <div class="hero-slide relative flex size-full" :class="containerClass">
    <!-- Background layer (GSAP targets .hero-slide-bg) -->
    <div class="hero-slide-bg absolute inset-0 z-0 flex items-center justify-center overflow-hidden" :class="bgClass">
      <!-- Video background (lazy loaded) -->
      <HeroSlideVideo v-if="isBgVideo" ref="videoComponentRef" :src="activeBgSrc" :poster="poster" :is-active="isActive"
        :slide-index="slideIndex" :on-video-ready="onVideoReady" :on-video-removed="onVideoRemoved"
        :media-controls-options="mediaControlsOptions" :video-loop="videoLoop" :auto-play="autoPlay"
        :data-saver="dataSaver" />
      <!-- Image background. The first slide is the LCP candidate: load it eagerly
           with high fetch priority so the largest paint isn't queued behind lazy assets. -->
      <NuxtImg v-else-if="hasNuxtImage" :src="activeBgSrc" :preset="imagePreset || undefined"
        :sizes="imageSizes || undefined" :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'" alt="" class="size-full object-cover will-change-transform" />
      <img v-else :src="activeBgSrc" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : 'auto'" alt=""
        class="size-full object-cover will-change-transform" />
    </div>

    <!-- Inset shadow overlay -->
    <span class="pointer-events-none absolute inset-0 z-1 [box-shadow:0rem_-8rem_8rem_-6rem_#000000_inset]" />

    <!-- Overlay patterns (delegated from parent via slot) -->
    <slot name="overlay" />

    <!-- Content container (GSAP targets .hero-slide-content) -->
    <div class="hero-slide-content relative z-5 flex size-full flex-col">
      <div v-show="contentVisible" :class="contentAnimClass" class="size-full" @animationend="onAnimationEnd">
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
        hls: hlsSlotData,
      }">
        <HeroVideoControls :labels="labels" :playing="videoComponentRef!.mediaControls.playing"
          :waiting="videoComponentRef!.mediaControls.waiting"
          :current-time="videoComponentRef!.mediaControls.currentTime"
          :duration="videoComponentRef!.mediaControls.duration" :buffered="videoComponentRef!.mediaControls.buffered"
          :volume="videoComponentRef!.mediaControls.volume" :muted="videoComponentRef!.mediaControls.muted"
          :get-container-el="getContainerEl" :on-seek="onSeek" :on-scrub-start="onScrubStart"
          :on-scrub-end="onScrubEnd" />
      </slot>
    </template>
  </div>
</template>
