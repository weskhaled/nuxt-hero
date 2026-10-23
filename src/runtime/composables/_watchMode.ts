import type { ComputedRef, Ref } from 'vue'
import { computed, effectScope, ref, watch } from 'vue'
import type { EffectScope } from 'vue'
import { tryOnScopeDispose, useEventListener, useIdle } from '@vueuse/core'
import type { ResolvedSlideConfig } from '../types'

/**
 * Watch-mode + fullscreen idle coordination.
 *
 * Single source of truth for the two idle-driven states:
 * - `isWatchIdle` — fade content/chrome on a playing video slide that opted into
 *   watch mode (`slide.config.watchMode`) once the user has been idle for
 *   `watchIdleMs`.
 * - `isFullscreenIdle` — hide cursor when idle while any element is fullscreen.
 *
 * `useIdle` takes its timeout once (no ref), so it's recreated in its own
 * effect scope whenever the active slide's `watchIdleMs` changes — per-slide
 * overrides apply to the timeout as well as the watchMode gate.
 */
export function useWatchMode(
  activeSlideConfig: ComputedRef<ResolvedSlideConfig>,
  isActiveSlideVideo: ComputedRef<boolean>,
  videoPlaying: ComputedRef<boolean>,
) {
  const idle = ref(false)
  let idleScope: EffectScope | undefined
  watch(() => activeSlideConfig.value.watchIdleMs, (ms) => {
    idleScope?.stop()
    idleScope = effectScope()
    idleScope.run(() => {
      const tracker = useIdle(ms, { events: ['mousemove', 'mousedown', 'keydown', 'touchstart'] })
      watch(tracker.idle, (v) => { idle.value = v }, { immediate: true })
    })
  }, { immediate: true })
  tryOnScopeDispose(() => idleScope?.stop())

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
