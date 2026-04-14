import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watch } from 'vue'
import { useElementHover } from '@vueuse/core'
import type { HeroSlide, UseHeroSliderOptions, UseHeroSliderReturn } from '#hero/types'
import { createSwiperState } from './_swiper'
import { createSlideState } from './_slides'
import { createAutoplayState } from './_autoplay'
import { createVideoState } from './_video'

/**
 * Resolve a MaybeRefOrGetter to a DOM element.
 * Handles Vue component instances (returns $el), raw elements, and null.
 */
function resolveElement(source: MaybeRefOrGetter<any>): HTMLElement | null {
  const raw = toValue(source)
  if (!raw) return null
  // Vue component instance — extract root DOM element
  if (raw.$el) return raw.$el as HTMLElement
  // Already a DOM element
  if (raw instanceof HTMLElement) return raw
  return null
}

/**
 * Main composable for the hero slider. Composes navigation, slides, autoplay,
 * and video state into a single flat API.
 *
 * @param containerRef - Root DOM element ref (or component instance ref) for hover detection and GSAP scoping
 * @param slides - Reactive array of slide definitions
 * @param options - Swiper config, animation classes, and display defaults
 * @returns Flat object with all slider state and controls
 *
 * @example
 * ```vue
 * <script setup>
 * const container = ref<HTMLElement | null>(null)
 * const slides = [{ bgSrc: '/hero.jpg', title: 'Welcome' }]
 * const slider = useHeroSlider(container, slides, {
 *   swiperOptions: { autoplay: { delay: 3000 } },
 *   enterAnimation: 'hero-fadeIn hero-animated',
 * })
 * </script>
 * ```
 */
export function useHeroSlider(
  containerRef: MaybeRefOrGetter<HTMLElement | null>,
  slides: MaybeRefOrGetter<HeroSlide[]>,
  options: UseHeroSliderOptions = {},
): UseHeroSliderReturn {
  const {
    swiperOptions = {},
    enterAnimation = '',
    leaveAnimation = '',
    showPagination,
    showNavigation,
    showProgress,
    showVideoControls,
  } = options

  // Merge user Swiper options with sensible defaults.
  // Native autoplay is always disabled — the composable manages its own timer.
  const mergedSwiperOptions = computed(() => {
    const { autoplay, ...userOpts } = swiperOptions as Record<string, unknown>
    return {
      slidesPerView: 1,
      spaceBetween: 0,
      grabCursor: true,
      ...userOpts,
      autoplay: false,
    } as Record<string, unknown>
  })

  // Multiple slides visible at once — disables content animations
  const isMultiSlide = computed(() => {
    const spv = mergedSwiperOptions.value.slidesPerView
    return spv === 'auto' || (typeof spv === 'number' && spv > 1)
  })

  // Video is enabled by default (tests). In Nuxt context, the component
  // reads features from runtimeConfig and could pass it through options.
  // For now, composable always supports video — the component controls
  // whether video components are rendered via feature flags.
  const videoEnabled = true

  // ─── Compose internal modules ───
  const swiper = createSwiperState(slides)

  const slideState = createSlideState(
    slides,
    swiper.activeIndex,
    swiper.previousIndex,
    { showPagination, showNavigation, showProgress, showVideoControls },
    videoEnabled,
    enterAnimation,
    leaveAnimation,
  )

  // Resolve DOM element from ref — handles component instances (ref on <HeroSlider>)
  const resolvedContainer = computed(() => resolveElement(containerRef))
  const isHovered = useElementHover(resolvedContainer)

  const autoplay = createAutoplayState(
    swiper.advanceSlide,
    slideState.isActiveSlideVideo,
    isHovered,
    options,
  )

  const video = createVideoState(swiper.activeIndex, videoEnabled)

  // ─── Cross-module coordination ───

  // Use video progress for progress bar when active slide is video
  const autoplayProgress = computed(() => {
    const controls = video.activeControls.value
    if (controls && controls.duration.value > 0) {
      return Math.min(controls.currentTime.value / controls.duration.value, 1)
    }
    return autoplay.autoplayProgress.value
  })

  // Auto-advance when non-looping video ends
  if (videoEnabled) {
    watch(
      () => video.videoEnded.value,
      (ended) => {
        if (!ended) return
        if (!autoplay.autoplayEnabled) return
        if (slideState.activeSlideConfig.value.videoLoop) return
        if (!isHovered.value) {
          swiper.advanceSlide()
        }
      },
    )
  }

  // Coordinated onSlideChange
  function onSlideChange() {
    swiper.onSlideChange()
    autoplay.onSlideChange()
  }

  return {
    // Navigation
    next: swiper.next,
    prev: swiper.prev,
    goTo: swiper.goTo,

    // Slide state
    activeIndex: swiper.activeIndex,
    snapIndex: swiper.snapIndex,
    totalSnaps: swiper.totalSnaps,
    activeSlide: slideState.activeSlide,
    activeSlideConfig: slideState.activeSlideConfig,
    isActiveSlideVideo: slideState.isActiveSlideVideo,
    isMultiSlide,
    animationClass: (index: number) => isMultiSlide.value ? '' : slideState.animationClass(index),

    // Autoplay
    autoplayEnabled: autoplay.autoplayEnabled,
    autoplayProgress,
    autoplayRemaining: autoplay.autoplayRemaining,
    autoplayDelay: autoplay.autoplayDelay,
    autoplayPaused: autoplay.autoplayPaused,
    autoplayPause: autoplay.autoplayPause,
    autoplayResume: autoplay.autoplayResume,
    autoplayReset: autoplay.autoplayReset,
    autoplaySetDelay: autoplay.autoplaySetDelay,

    // Video
    videoPlaying: video.videoPlaying,
    videoCurrentTime: video.videoCurrentTime,
    videoDuration: video.videoDuration,
    videoBuffered: video.videoBuffered,
    videoVolume: video.videoVolume,
    videoMuted: video.videoMuted,
    videoWaiting: video.videoWaiting,
    videoEnded: video.videoEnded,
    videoToggle: video.videoToggle,
    videoSeek: video.videoSeek,
    videoScrubStart: video.videoScrubStart,
    videoScrubEnd: video.videoScrubEnd,
    videoSetVolume: video.videoSetVolume,
    videoToggleMute: video.videoToggleMute,

    // Hover
    isHovered,

    // Swiper options (merged)
    mergedSwiperOptions,

    // Container
    containerEl: resolvedContainer,

    // Internal bindings
    onSwiper: swiper.onSwiper,
    onSlideChange,
    registerSlideVideo: video.registerSlideVideo,
    unregisterSlideVideo: video.unregisterSlideVideo,
  }
}
