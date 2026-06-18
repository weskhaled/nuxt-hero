import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { useElementHover, useElementVisibility } from '@vueuse/core'
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
    watchMode,
    watchIdleMs,
  } = options

  // Merge user Swiper options with sensible defaults.
  // Native autoplay is always disabled — the composable manages its own timer.
  const mergedSwiperOptions = computed(() => {
    const { __autoplay, ...userOpts } = swiperOptions as Record<string, unknown>
    const merged = {
      slidesPerView: 1,
      spaceBetween: 0,
      grabCursor: true,
      // Listen for drags on the container, not the wrapper. Swiper's default
      // ('wrapper') breaks 3D effects (cube/flip): the wrapper is rotated
      // edge-on, so its hit-area collapses to a sliver and pointer-downs over
      // the visible face land on the container instead — making every slide
      // after the first un-draggable. The container always covers the face.
      touchEventsTarget: 'container',
      ...userOpts,
      autoplay: false,
    } as Record<string, unknown>

    // Default mousewheel to on-axis only (vertical page-scroll shouldn't drive a
    // horizontal slider, and vice-versa). One-slide-per-gesture debouncing is
    // handled in <HeroSlider> (see the gesture lock) rather than a fixed
    // `thresholdTime`, which can't cover variable trackpad-inertia length.
    // Any option the consumer passes still wins.
    if (merged.mousewheel) {
      const mw = merged.mousewheel === true ? {} : (merged.mousewheel as Record<string, unknown>)
      merged.mousewheel = { forceToAxis: true, ...mw }
    }

    return merged
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

  // Dev-time sanity checks on common Swiper misconfigurations.
  // Suppressed in production — Nuxt sets import.meta.dev during SSR/dev.
  if (import.meta.dev && swiperOptions.effect === 'cube') {
    const count = toValue(slides).length
    if (count !== 4) {
      // eslint-disable-next-line no-console
      console.warn(
        `[nuxt-hero] effect: 'cube' is designed for exactly 4 slides (got ${count}). `
        + `Extra slides render with offscreen translates. Use 'cards' or 'coverflow' for other counts.`,
      )
    }
  }

  // ─── Compose internal modules ───
  const swiper = createSwiperState(slides)

  const slideState = createSlideState(
    slides,
    swiper.activeIndex,
    swiper.previousIndex,
    { showPagination, showNavigation, showProgress, showVideoControls, watchMode, watchIdleMs },
    videoEnabled,
    enterAnimation,
    leaveAnimation,
  )

  // Resolve DOM element from ref — handles component instances (ref on <HeroSlider>)
  const resolvedContainer = computed(() => resolveElement(containerRef))
  const isHovered = useElementHover(resolvedContainer)
  // Drives autoplay's offscreen-pause — no per-frame work when scrolled away.
  const isVisible = useElementVisibility(resolvedContainer)

  const video = createVideoState(swiper.activeIndex, videoEnabled)

  // ─── Cross-module coordination ───

  // Pause autoplay timer while a video is playing on a slide that opts into
  // "wait for video end". Once the video ends, the flag flips to false and the
  // timer resumes — so the slide still honours its full autoplay delay before
  // advancing, rather than jumping immediately on video end.
  //
  // The `videoPlaying || videoWaiting` guard means we only hold the timer while
  // the video is actually playing or buffering toward play — never indefinitely.
  // Without it, a slide that never plays (e.g. data-saver / lite mode suppresses
  // autoplay) would strand the timer and the slider would get stuck on that slide.
  //
  // This is the single source of truth for video-driven advancement: the
  // autoplay timer alone decides when to call advanceSlide.
  const shouldPauseForVideo = computed(() =>
    slideState.isActiveSlideVideo.value
    && slideState.activeSlideConfig.value.pauseUntilVideoEnds
    && !video.videoEnded.value
    && (video.videoPlaying.value || video.videoWaiting.value),
  )

  const autoplay = createAutoplayState(
    swiper.advanceSlide,
    shouldPauseForVideo,
    isHovered,
    options,
    isVisible,
  )

  // Autoplay progress always reflects the autoplay timer.
  // Video-duration progress is surfaced separately via videoCurrentTime/videoDuration
  // and rendered by the video scrubber — the two must not be conflated.
  const autoplayProgress = autoplay.autoplayProgress

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
