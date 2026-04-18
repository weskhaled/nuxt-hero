import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { useEventListener, useIdle } from '@vueuse/core'
import type { ResolvedSlideConfig } from '#hero/types'

/**
 * Watch-mode + fullscreen idle coordination.
 *
 * Single source of truth for the two idle-driven states:
 * - `isWatchIdle` — fade content/chrome on a playing video slide that opted into
 *   watch mode (`slide.config.watchMode`) once the user has been idle for
 *   `watchIdleMs`.
 * - `isFullscreenIdle` — hide cursor when idle while any element is fullscreen.
 *
 * `useIdle`'s timeout is captured at init (it doesn't accept a ref), so the
 * value used is the active slide's `watchIdleMs` at mount time. Per-slide
 * overrides apply to *gating* (watchMode flag), not the timeout itself.
 */
export function useWatchMode(
  activeSlideConfig: ComputedRef<ResolvedSlideConfig>,
  isActiveSlideVideo: ComputedRef<boolean>,
  videoPlaying: ComputedRef<boolean>,
) {
  const { idle } = useIdle(activeSlideConfig.value.watchIdleMs, {
    events: ['mousemove', 'mousedown', 'keydown', 'touchstart'],
  })

  const isWatchIdle = computed(() =>
    activeSlideConfig.value.watchMode
    && isActiveSlideVideo.value
    && videoPlaying.value
    && idle.value,
  )

  // Fullscreen detection — Document API is the only reliable source.
  const isFullscreen = ref(false)
  useEventListener(typeof document !== 'undefined' ? document : null, 'fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  const isFullscreenIdle = computed(() => isFullscreen.value && idle.value)

  return { idle, isWatchIdle, isFullscreen, isFullscreenIdle } as {
    idle: Ref<boolean>
    isWatchIdle: ComputedRef<boolean>
    isFullscreen: Ref<boolean>
    isFullscreenIdle: ComputedRef<boolean>
  }
}
