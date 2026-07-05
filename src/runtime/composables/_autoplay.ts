import type { ComputedRef, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { useDocumentVisibility, useMediaQuery, useRafFn } from '@vueuse/core'
import type { UseHeroSliderOptions } from '../types'

/**
 * Creates the autoplay timer state. Drives slide advancement off a
 * `requestAnimationFrame` loop (delta-accumulated elapsed time) rather than a
 * fixed-interval timer, and only ticks when it actually should:
 *
 * - paused via the public API (`autoplayPause`)
 * - the active slide opts into video-wait (`pauseUntilVideoEnds`)
 * - the slider is hovered
 * - the slider is scrolled offscreen (`isVisible`)
 * - the browser tab is hidden (`useDocumentVisibility`)
 * - the user prefers reduced motion (`prefers-reduced-motion`)
 *
 * When none of those hold the rAF loop runs; otherwise it's fully paused, so an
 * idle / offscreen / backgrounded slider does zero per-frame work.
 *
 * @param advanceSlide - Callback to advance to the next slide
 * @param shouldPauseForVideo - Reactive flag: true when active slide is a video AND opts into pause-until-end
 * @param isHovered - Whether the user is hovering over the slider
 * @param options - Swiper options containing autoplay delay config
 * @param isVisible - Whether the slider is currently within the viewport (defaults to always-visible)
 * @returns Autoplay state refs and control functions
 */
export function createAutoplayState(
  advanceSlide: () => void,
  shouldPauseForVideo: ComputedRef<boolean>,
  isHovered: Ref<boolean>,
  options: Pick<UseHeroSliderOptions, 'swiperOptions'>,
  isVisible?: Ref<boolean>,
) {
  const swiperOptions = options.swiperOptions ?? {}

  const autoplayEnabled = swiperOptions.autoplay !== false
  const initialDelay =
    swiperOptions.autoplay && typeof swiperOptions.autoplay === 'object'
      ? (swiperOptions.autoplay.delay ?? 5000)
      : 5000

  const elapsed = ref(0)
  const autoplayDelay = ref(initialDelay)
  const autoplayPaused = ref(!autoplayEnabled)

  const autoplayProgress = computed(() => Math.min(elapsed.value / autoplayDelay.value, 1))
  const autoplayRemaining = computed(() => Math.max(autoplayDelay.value - elapsed.value, 0))

  // Environmental pause signals.
  const documentVisibility = useDocumentVisibility()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const visible = isVisible ?? ref(true)

  // rAF loop — `delta` is ms since the previous frame. Paused/resumed by the
  // `canRun` watcher below, so it never schedules frames while idle.
  const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
    ({ delta }) => {
      elapsed.value += delta
      if (elapsed.value >= autoplayDelay.value) {
        advanceSlide()
        elapsed.value = 0
      }
    },
    { immediate: false },
  )

  // Single source of truth for whether the timer should be ticking.
  const canRun = computed(() =>
    autoplayEnabled
    && !autoplayPaused.value
    && !shouldPauseForVideo.value
    && !isHovered.value
    && visible.value
    && documentVisibility.value !== 'hidden'
    && !prefersReducedMotion.value,
  )

  watch(canRun, (run) => {
    if (run) {
      // Restart the full delay whenever the timer (re)starts — preserves the
      // previous hover / video-resume semantics (a slide always gets its full
      // delay after a pause rather than advancing immediately).
      elapsed.value = 0
      resumeRaf()
    }
    else {
      pauseRaf()
    }
  }, { immediate: true })

  function autoplayPause() {
    autoplayPaused.value = true
  }

  function autoplayResume() {
    autoplayPaused.value = false
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
