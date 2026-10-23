import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import { useDocumentVisibility, useMediaQuery, useRafFn } from '@vueuse/core'
import type { UseHeroSliderOptions } from '../types'

/**
 * Creates the autoplay timer state. Drives slide advancement off a
 * `requestAnimationFrame` loop (delta-accumulated elapsed time) rather than a
 * fixed-interval timer, and only ticks when it actually should:
 *
 * - paused via the public API (`autoplayPause`)
 * - the active slide opts into video-wait (`pauseUntilVideoEnds`)
 * - the slider is hovered (`autoplay.pauseOnMouseEnter`, default true)
 * - keyboard focus is inside the slider (WCAG 2.2.2 — assistive-tech users
 *   aren't moved on mid-read)
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
 * @param extra - Optional signals: `isKeyboardFocused`, and `isAtEnd` for `stopOnLastSlide`
 * @returns Autoplay state refs and control functions
 *
 * Honours Swiper's `autoplay.pauseOnMouseEnter` (default true),
 * `disableOnInteraction` (default **false** — Swiper's own default is true;
 * kept false so existing sliders don't stop after a swipe) and
 * `stopOnLastSlide` (default false).
 */
export function createAutoplayState(
  advanceSlide: () => void,
  shouldPauseForVideo: ComputedRef<boolean>,
  isHovered: Ref<boolean>,
  options: MaybeRefOrGetter<Pick<UseHeroSliderOptions, 'swiperOptions'>>,
  isVisible?: Ref<boolean>,
  extra: { isKeyboardFocused?: Ref<boolean>, isAtEnd?: () => boolean } = {},
) {
  // Options may be reactive: on/off is fixed at creation (`autoplayEnabled` is
  // a plain boolean in the public API); delay and flags follow changes.
  const autoplayCfg = () => {
    const autoplay = toValue(options).swiperOptions?.autoplay
    return typeof autoplay === 'object' ? autoplay : {}
  }
  const autoplayEnabled = toValue(options).swiperOptions?.autoplay !== false
  const initialDelay = autoplayCfg().delay ?? 5000
  const keyboardFocused = extra.isKeyboardFocused ?? ref(false)

  const elapsed = ref(0)
  const autoplayDelay = ref(initialDelay)
  // Follow a changed `autoplay.delay` (reactive options).
  watch(() => autoplayCfg().delay, (delay) => {
    if (delay != null) autoplayDelay.value = delay
  })
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
        if (autoplayCfg().stopOnLastSlide && extra.isAtEnd?.()) {
          // Hold a full bar on the last slide instead of rewinding.
          elapsed.value = autoplayDelay.value
          autoplayPaused.value = true
          return
        }
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
    && !((autoplayCfg().pauseOnMouseEnter ?? true) && isHovered.value)
    && !keyboardFocused.value
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

  /** A user-driven navigation (drag, arrows, dots, keys, wheel) */
  function onUserInteraction() {
    if (autoplayCfg().disableOnInteraction) autoplayPaused.value = true
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
    onUserInteraction,
    /** Whether the timer is ticking right now (no pause signal holds it) */
    autoplayRunning: canRun,
  }
}
