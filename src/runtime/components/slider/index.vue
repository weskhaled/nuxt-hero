<script lang="ts" setup>
import { computed, ref, toValue, useTemplateRef, watchEffect } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { useRuntimeConfig } from '#imports'
import { swiperModules } from '#hero/swiper-modules'
import type { HeroSliderProps } from '#hero/types'
import { resolveParallaxConfig, formatTime, isVideoUrl, patternCSS, patternSize, getHeroConfig } from '#hero/utils'
import { useGSAP } from '#hero/composables/_gsap'

const props = withDefaults(defineProps<HeroSliderProps>(), {
  enterAnimation: '',
  leaveAnimation: '',
  overlayPatterns: () => [{ type: 'lines' as const, opacity: 0.1 }],
  parallax: true,
  imagePreset: '',
  as: 'div',
  ui: () => ({}),
})

const heroConfig = getHeroConfig(useRuntimeConfig())
const features = heroConfig.features ?? {}

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const videoScrubberRef = ref<{ active: boolean } | null>(null)

const {
  activeIndex,
  snapIndex,
  totalSnaps,
  isActiveSlideVideo,
  next,
  prev,
  goTo,
  onSwiper,
  onSlideChange,
  animationClass,
  registerSlideVideo,
  unregisterSlideVideo,
  activeSlideConfig,
  autoplayEnabled,
  autoplayProgress,
  videoPlaying,
  videoCurrentTime,
  videoDuration,
  videoBuffered,
  videoVolume,
  videoMuted,
  videoWaiting,
  videoEnded,
  videoToggle,
  videoSeek,
  videoScrubStart,
  videoScrubEnd,
  videoSetVolume,
  videoToggleMute,
  mergedSwiperOptions,
  isMultiSlide,
} = props.slider

/** Whether the slider runs in vertical direction */
const isVertical = computed(() => mergedSwiperOptions.value.direction === 'vertical')

/** Check if a slide at the given index has a video background */
function isVideo(index: number): boolean {
  const slide = props.slides[index]
  if (!slide) return false
  return isVideoUrl(slide.bgSrc) || (!!slide.bgDarkSrc && isVideoUrl(slide.bgDarkSrc))
}

/** Whether pagination dots should be visible */
const shouldShowPagination = computed(() =>
  features.pagination && totalSnaps.value > 1 && activeSlideConfig.value.showPagination,
)

/** Whether navigation arrows should be visible */
const shouldShowNavigation = computed(() =>
  features.navigation && props.slides.length > 1 && activeSlideConfig.value.showNavigation,
)

/** Whether the video scrubber bar should be visible */
const shouldShowVideoScrubber = computed(() =>
  features.video
  && activeSlideConfig.value.showProgress
  && isActiveSlideVideo.value
  && videoDuration.value > 0
  && !isMultiSlide.value,
)

/** Whether the autoplay progress bar should be visible */
const shouldShowAutoplayProgress = computed(() =>
  !shouldShowVideoScrubber.value
  && autoplayEnabled
  && activeSlideConfig.value.showProgress,
)

// ─── Parallax (only when feature enabled) ───
const parallaxConfig = computed(() => resolveParallaxConfig(toValue(props.parallax)))

if (features.parallax) {
  const { top: elTop, height: elHeight } = useElementBounding(containerRef)
  const { height: winHeight } = useWindowSize()

  // Reactive bg parallax — uses element bounding for pixel-perfect offset
  // regardless of where the slider sits on the page.
  watchEffect(() => {
    const cfg = parallaxConfig.value
    if (!cfg.bg) return
    const el = containerRef.value
    if (!el) return

    const wh = winHeight.value
    const eh = elHeight.value
    if (!wh || !eh) return

    const bgs = el.querySelectorAll<HTMLElement>('.hero-slide-bg')
    // Scroll progress: 0 = element top at viewport bottom, 1 = element bottom at viewport top
    const totalScroll = wh + eh
    const progress = Math.min(Math.max((wh - elTop.value) / totalScroll, 0), 1)

    // Max pixel travel based on container height and speed
    const maxTravel = eh * cfg.speed * 0.4
    // Offset centered at progress 0.5 — no gap at any scroll position
    const offset = (progress - 0.5) * 2 * maxTravel

    for (const bg of bgs) {
      bg.style.height = `calc(100% + ${maxTravel * 2}px)`
      bg.style.top = `${-maxTravel}px`
      bg.style.transform = `translate3d(0, ${offset}px, 0)`
    }
  })

  // Content parallax with GSAP ScrollTrigger
  useGSAP(({ gsap }) => {
    const cfg = parallaxConfig.value
    if (!cfg.content) return
    const el = containerRef.value
    if (!el) return

    gsap.to(el.querySelectorAll('.hero-slide-content'), {
      yPercent: 35 * cfg.speed,
      opacity: cfg.minOpacity,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, { scope: containerRef })
}
</script>

<template>
  <component :is="as" ref="containerRef" class="hero-slider group/slider relative size-full" :class="ui.root">
    <Swiper v-bind="mergedSwiperOptions" :parallax="true" :modules="swiperModules" class="size-full" :class="ui.swiper"
      @swiper="onSwiper" @slide-change="onSlideChange">
      <SwiperSlide v-for="(slide, index) in slides" :key="index" class="size-full overflow-hidden" :class="ui.slide">
        <HeroSlide :bg-src="slide.bgSrc" :bg-dark-src="slide.bgDarkSrc" :poster="slide.poster"
          :image-preset="imagePreset" :eager="index === 0" :is-active="index === activeIndex || isMultiSlide"
          :animation-class="animationClass(index)" :slide-index="index" :on-video-ready="registerSlideVideo"
          :on-video-removed="unregisterSlideVideo" :media-controls-options="slide.config?.mediaControlsOptions"
          :show-video-controls="(index === activeIndex || isMultiSlide) ? (slide.config?.showVideoControls ?? activeSlideConfig.showVideoControls) : false"
          :video-loop="slide.config?.videoLoop ?? false" :auto-play="!isMultiSlide" :container-class="ui.container"
          :bg-class="ui.bg" :get-container-el="() => containerRef">
          <slot name="slide" v-bind="{
            slide, index,
            isActive: index === activeIndex,
            animationClass: animationClass(index),
            isVideo: isVideo(index),
            videoPlaying,
            videoDuration,
            videoCurrentTime,
            videoWaiting,
            videoEnded,
            videoMuted,
            videoVolume,
            videoToggle, videoSeek, videoSetVolume, videoToggleMute,
          }" />
          <template #video-controls="videoProps">
            <slot name="video-controls" v-bind="videoProps" />
          </template>
          <template #overlay>
            <slot name="overlay"
              v-bind="{ patterns: overlayPatterns, index, isActive: index === activeIndex, patternCSS, patternSize }">
              <!-- Default overlay rendering -->
              <div v-for="(pattern, i) in overlayPatterns" :key="i" class="pointer-events-none absolute inset-0 z-2"
                :style="{
                  backgroundImage: patternCSS(pattern),
                  backgroundSize: patternSize(pattern),
                  opacity: pattern.opacity ?? 0.15,
                }" />
            </slot>
          </template>
        </HeroSlide>
      </SwiperSlide>
    </Swiper>

    <!-- UI controls layer -->
    <div class="pointer-events-none absolute inset-0 z-50 overflow-hidden" :class="ui.controls">
      <slot v-if="shouldShowPagination" name="pagination"
        v-bind="{ activeIndex, snapIndex, totalSnaps, total: slides.length, progress: autoplayProgress, goTo, vertical: isVertical, autoplayEnabled }">
        <HeroPagination :slides="slides" :active-index="activeIndex" :snap-index="snapIndex" :total-snaps="totalSnaps"
          :progress="autoplayEnabled ? autoplayProgress : 1" :vertical="isVertical" @slide-to="goTo" />
      </slot>

      <slot v-if="shouldShowNavigation" name="navigation"
        v-bind="{ prev, next, activeIndex, slides, vertical: isVertical }">
        <HeroNavigation :slides="slides" :active-index="activeIndex" :vertical="isVertical" @prev="prev" @next="next" />
      </slot>

      <!-- Video scrubber (replaces progress bar when active slide is video) -->
      <HeroVideoScrubber v-if="shouldShowVideoScrubber" ref="videoScrubberRef" :model-value="videoCurrentTime"
        :max="videoDuration" :secondary="videoBuffered"
        class="pointer-events-auto absolute z-11 bottom-0 left-0 right-0 transition-[height,padding] duration-250 ease-out" :class="isVertical
          ? ['top-0 ltr:right-0 rtl:left-0 h-full', videoScrubberRef?.active ? 'w-2.5' : 'w-1']
          : [videoScrubberRef?.active ? 'h-2.5 pb-2 px-3' : 'h-1']"
        @update:model-value="(v: number) => videoSeek(v)" @scrubber-mousedown="videoScrubStart"
        @scrubber-mouseup="videoScrubEnd">
        <template #default="{ position, pendingValue }">
          <div class="hero-scrub-tooltip rounded-sm" :style="{ left: position }">
            {{ formatTime(pendingValue) }}
          </div>
        </template>
      </HeroVideoScrubber>

      <!-- Autoplay progress bar: horizontal at bottom, vertical on the side -->
      <div v-if="shouldShowAutoplayProgress" class="pointer-events-none absolute z-4 bg-white/50" :class="[isVertical
        ? 'top-0 ltr:right-0 rtl:left-0 h-full w-1'
        : 'bottom-0 left-0 w-full h-1', ui.progress]">
        <div class="bg-white transition-all duration-50 rounded-e-sm" :class="isVertical ? 'w-full' : 'h-full'" :style="isVertical
          ? { height: `${autoplayProgress * 100}%` }
          : { width: `${autoplayProgress * 100}%` }" />
      </div>
    </div>
  </component>
</template>
