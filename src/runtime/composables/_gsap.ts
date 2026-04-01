// Vue
import {
  type Ref,
  type WatchSource,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  readonly,
  ref,
  shallowRef,
  watch,
} from 'vue'
// VueUse
import { type MaybeComputedElementRef, unrefElement, useMediaQuery } from '@vueuse/core'
// GSAP
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Any GSAP plugin accepted by gsap.registerPlugin(). */
export type GSAPPlugin = object

export interface UseGSAPOptions {
  /** Root element or ref to scope GSAP selectors to. */
  scope?: MaybeComputedElementRef
  /** GSAP plugins to register before the callback runs. e.g. [ScrollTrigger, Draggable] */
  plugins?: GSAPPlugin[]
  /** Respect prefers-reduced-motion. When true, callback is skipped. @default true */
  respectReducedMotion?: boolean
  /** Reactive sources that trigger re-initialization (reverts then re-runs callback after nextTick). */
  watchSources?: WatchSource[]
}

export interface UseGSAPReturn {
  /** The gsap instance with plugins registered. Use instead of importing gsap directly. */
  gsap: typeof import('gsap').gsap
  /** The GSAP context, undefined before mount / on server. */
  context: Readonly<Ref<gsap.Context | undefined>>
  /** Wrap a function so animations are tracked by this context. */
  contextSafe: <T extends (...args: any[]) => any>(fn: T) => T
  /** Create a gsap.timeline() tracked by this context. */
  timeline: (vars?: gsap.TimelineVars) => gsap.core.Timeline
  /** Revert and re-run the animation callback. */
  refresh: () => void
  /** Manually kill the context. */
  kill: () => void
  /** Whether the user prefers reduced motion (reactive). */
  prefersReducedMotion: Readonly<Ref<boolean>>
}

export interface UseGSAPCallbackContext {
  gsap: typeof import('gsap').gsap
  context: gsap.Context
}

// ---------------------------------------------------------------------------
// SSR no-op
// ---------------------------------------------------------------------------

function createSSRNoOp(): UseGSAPReturn {
  const noop = (() => {}) as any
  return {
    gsap: new Proxy({} as any, { get: () => noop }),
    context: readonly(shallowRef(undefined)) as any,
    contextSafe: (fn: any) => fn,
    timeline: () => ({}) as any,
    refresh: noop,
    kill: noop,
    prefersReducedMotion: readonly(ref(false)),
  }
}

// ---------------------------------------------------------------------------
// Lazy core-plugin registration
// ---------------------------------------------------------------------------

let _coreReady = false
function ensureCorePlugins() {
  if (_coreReady) return
  _coreReady = true
  gsap.registerPlugin(ScrollTrigger)
}

// ---------------------------------------------------------------------------
// Main composable
// ---------------------------------------------------------------------------

/**
 * Vue composable that wraps `gsap.context()` for safe, scoped GSAP animations.
 *
 * - Creates animations in `onMounted` (DOM is available).
 * - Scopes selectors to a container element via `gsap.context()`.
 * - Automatically reverts all animations and ScrollTriggers on unmount.
 * - Supports `prefers-reduced-motion` — callback is skipped when preferred.
 * - Provides `contextSafe()` for creating animations in event handlers.
 * - Returns a `timeline()` helper that auto-tracks timelines in the context.
 *
 * @example
 * ```vue
 * <script setup>
 * const container = ref<HTMLElement | null>(null)
 *
 * const { gsap, contextSafe, timeline } = useGSAP((self) => {
 *   self.gsap.to('.box', { x: 100, duration: 0.6 })
 * }, { scope: container })
 *
 * const onClick = contextSafe(() => {
 *   gsap.to('.box', { rotation: 360 })
 * })
 * </script>
 * ```
 */
export function useGSAP(
  callbackOrOptions?: ((self: UseGSAPCallbackContext) => void) | UseGSAPOptions,
  maybeOptions?: UseGSAPOptions,
): UseGSAPReturn {
  // SSR bail-out — no side-effects on the server.
  if (import.meta.env.SSR) {
    return createSSRNoOp()
  }

  // Ensure ScrollTrigger (and any future core plugins) are registered once.
  ensureCorePlugins()

  // -----------------------------------------------------------------------
  // Normalize arguments
  // -----------------------------------------------------------------------

  let callback: ((self: UseGSAPCallbackContext) => void) | undefined
  let options: UseGSAPOptions

  if (typeof callbackOrOptions === 'function') {
    callback = callbackOrOptions
    options = maybeOptions ?? {}
  }
  else {
    callback = undefined
    options = callbackOrOptions ?? {}
  }

  const {
    scope,
    plugins,
    respectReducedMotion = true,
    watchSources,
  } = options

  // Register user-provided plugins.
  if (plugins && plugins.length > 0) {
    gsap.registerPlugin(...plugins as any[])
  }

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  const context = shallowRef<gsap.Context | undefined>()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // -----------------------------------------------------------------------
  // Core helpers
  // -----------------------------------------------------------------------

  let stopWatchSources: (() => void) | undefined

  /** Revert and destroy the current GSAP context. */
  function revert() {
    context.value?.revert()
    context.value = undefined
  }

  /** Initialize (or re-initialize) the GSAP context. Reverts any existing one first. */
  function init() {
    revert()

    // Skip animations when the user prefers reduced motion.
    if (respectReducedMotion && prefersReducedMotion.value) {
      return
    }

    const el = scope ? unrefElement(scope) : undefined

    // If a scope was specified but the element isn't mounted yet, bail out.
    if (scope && !el) return

    context.value = gsap.context((ctx) => {
      callback?.({ gsap, context: ctx })
    }, el ?? undefined)
  }

  /** Revert then re-create all animations. */
  function refresh() {
    init()
  }

  /** Manually kill the context and clean up watchers. */
  function kill() {
    stopWatchSources?.()
    revert()
  }

  /**
   * Wraps a function so any GSAP animations it creates are tracked
   * by this context. Use for event handlers, watchers, or any
   * code that runs outside the initial callback.
   */
  function contextSafe<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      if (!context.value) {
        // Context not ready — no-op to avoid errors.
        return
      }
      let result: any
      context.value.add(() => {
        result = fn(...args)
      })
      return result
    }) as T
  }

  /**
   * Create a `gsap.timeline()` tracked by the current context.
   * Falls back to a standalone timeline when no context exists yet.
   */
  function timeline(vars?: gsap.TimelineVars): gsap.core.Timeline {
    if (context.value) {
      let tl: gsap.core.Timeline | undefined
      context.value.add(() => {
        tl = gsap.timeline(vars)
      })
      return tl ?? gsap.timeline(vars)
    }
    return gsap.timeline(vars)
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  const instance = getCurrentInstance()

  if (instance) {
    onMounted(() => {
      init()
    })

    onUnmounted(() => {
      revert()
    })
  }

  // Re-initialize when watch sources change (after nextTick so DOM is settled).
  if (watchSources && watchSources.length > 0) {
    stopWatchSources = watch(watchSources, () => {
      nextTick(() => init())
    })
  }

  // React to reduced-motion preference changes.
  if (respectReducedMotion) {
    watch(prefersReducedMotion, (reduced) => {
      if (reduced) {
        revert()
      }
      else {
        init()
      }
    })
  }

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  return {
    gsap,
    context: readonly(context) as Readonly<Ref<gsap.Context | undefined>>,
    contextSafe,
    timeline,
    refresh,
    kill,
    prefersReducedMotion: readonly(prefersReducedMotion),
  }
}
