import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import type { UseHeroSliderOptions } from '#hero/types'

/**
 * Creates the autoplay timer state. Manages elapsed time, progress,
 * and pause/resume logic. Pauses automatically when the active slide
 * requests video-wait mode (`pauseUntilVideoEnds`) or the slider is hovered.
 *
 * @param advanceSlide - Callback to advance to the next slide
 * @param shouldPauseForVideo - Reactive flag: true when active slide is a video AND opts into pause-until-end
 * @param isHovered - Whether the user is hovering over the slider
 * @param options - Swiper options containing autoplay delay config
 * @returns Autoplay state refs and control functions
 */
export function createAutoplayState(
  advanceSlide: () => void,
  shouldPauseForVideo: ComputedRef<boolean>,
  isHovered: Ref<boolean>,
  options: Pick<UseHeroSliderOptions, 'swiperOptions'>,
) {
  const swiperOptions = options.swiperOptions ?? {}

  const autoplayEnabled = swiperOptions.autoplay !== false
  const initialDelay =
    swiperOptions.autoplay && typeof swiperOptions.autoplay === 'object'
      ? (swiperOptions.autoplay.delay ?? 5000)
      : 5000

  const TICK_MS = 50
  const elapsed = ref(0)
  const autoplayDelay = ref(initialDelay)
  const autoplayPaused = ref(!autoplayEnabled)

  const autoplayProgress = computed(() => {
    return Math.min(elapsed.value / autoplayDelay.value, 1)
  })

  const autoplayRemaining = computed(() => {
    return Math.max(autoplayDelay.value - elapsed.value, 0)
  })

  const { pause: pauseTimer, resume: resumeTimer } = useIntervalFn(() => {
    if (shouldPauseForVideo.value || isHovered.value) return
    elapsed.value += TICK_MS
    if (elapsed.value >= autoplayDelay.value) {
      advanceSlide()
      elapsed.value = 0
    }
  }, TICK_MS, { immediate: autoplayEnabled })

  // Pause timer when active slide opts into pause-until-video-ends
  watch(shouldPauseForVideo, (shouldPause) => {
    if (!autoplayEnabled) return
    if (shouldPause) {
      pauseTimer()
    } else if (!autoplayPaused.value && !isHovered.value) {
      elapsed.value = 0
      resumeTimer()
    }
  })

  // Pause timer on hover
  watch(isHovered, (hovered) => {
    if (!autoplayEnabled) return
    if (hovered) {
      elapsed.value = 0
      pauseTimer()
    } else if (!autoplayPaused.value && !shouldPauseForVideo.value) {
      resumeTimer()
    }
  })

  function autoplayPause() {
    autoplayPaused.value = true
    pauseTimer()
  }

  function autoplayResume() {
    autoplayPaused.value = false
    resumeTimer()
  }

  function autoplayReset() {
    elapsed.value = 0
  }

  function autoplaySetDelay(ms: number) {
    autoplayDelay.value = ms
  }

  /** Called by parent when slide changes */
  function onSlideChange() {
    elapsed.value = 0
  }

  return {
    autoplayEnabled,
    autoplayProgress,
    autoplayRemaining,
    autoplayDelay,
    autoplayPaused,
    autoplayPause,
    autoplayResume,
    autoplayReset,
    autoplaySetDelay,
    onSlideChange,
  }
}
