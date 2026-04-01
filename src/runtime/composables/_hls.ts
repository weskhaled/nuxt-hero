import { ref, watch, type Ref, type MaybeRef, toValue } from 'vue'
import type HlsType from 'hls.js'
import { tryOnScopeDispose } from '@vueuse/core'

export interface UseHlsOptions {
  /**
   * Start loading segments immediately or wait until play.
   * @default true
   */
  autoLoad?: boolean
}

export interface UseHlsReturn {
  /** Whether hls.js is loading/attaching */
  loading: Ref<boolean>
  /** Error message if HLS setup failed */
  error: Ref<string | null>
  /** Available quality levels (heights) once manifest is parsed */
  qualities: Ref<number[]>
  /** Set quality: 0 = auto, otherwise the height value */
  setQuality: (height: number) => void
  /** Destroy the HLS instance manually */
  destroy: () => void
}

/**
 * Composable for HLS video playback.
 *
 * Uses `hls.js` when available, falls back to native HLS (Safari).
 * The `<video>` element is still controlled by VueUse's `useMediaControls`.
 *
 * `hls.js` is dynamically imported — only loaded when an `.m3u8` source is used.
 *
 * @example
 * ```ts
 * const videoRef = useTemplateRef<HTMLVideoElement>('videoRef')
 * const { loading, error, qualities, setQuality } = useHls(videoRef, () => props.hlsSrc)
 * ```
 */
export function useHls(
  videoEl: MaybeRef<HTMLVideoElement | null | undefined>,
  src: MaybeRef<string>,
  options: UseHlsOptions = {},
): UseHlsReturn {
  const { autoLoad = true } = options

  const loading = ref(false)
  const error = ref<string | null>(null)
  const qualities = ref<number[]>([])

  let hls: HlsType | null = null
  let HlsClass: typeof HlsType | null = null

  async function init() {
    const el = toValue(videoEl)
    const url = toValue(src)

    cleanup()

    if (!el || !url) return

    // Native HLS support (Safari, iOS)
    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = url
      return
    }

    loading.value = true
    error.value = null

    try {
      // Dynamic import — hls.js is only loaded when needed
      if (!HlsClass) {
        const mod = await import('hls.js')
        HlsClass = mod.default || mod
      }

      if (!HlsClass.isSupported()) {
        // Last resort: try setting src directly
        el.src = url
        loading.value = false
        return
      }

      hls = new HlsClass({
        autoStartLoad: autoLoad,
      })

      hls.loadSource(url)
      hls.attachMedia(el)

      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        if (!hls) return
        qualities.value = hls!.levels.map(l => l.height)
        loading.value = false
      })

      hls.on(HlsClass.Events.ERROR, (_event: string, data: { fatal: boolean; type: string; details: string }) => {
        if (data.fatal) {
          error.value = `HLS error: ${data.type} — ${data.details}`
          loading.value = false

          // Try recovery
          if (data.type === HlsClass!.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad()
          } else if (data.type === HlsClass!.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError()
          } else {
            cleanup()
          }
        }
      })

      // Deferred loading: start when user hits play
      if (!autoLoad) {
        const onPlay = () => {
          el.removeEventListener('play', onPlay)
          hls?.startLoad()
        }
        el.addEventListener('play', onPlay)
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load hls.js'
      loading.value = false
    }
  }

  function cleanup() {
    if (hls) {
      hls.destroy()
      hls = null
    }
    qualities.value = []
  }

  function setQuality(height: number) {
    if (!hls) return
    if (height === 0) {
      // Auto quality
      hls.currentLevel = -1
    } else {
      const idx = hls.levels.findIndex(l => l.height === height)
      if (idx !== -1) hls.currentLevel = idx
    }
  }

  function destroy() {
    cleanup()
  }

  // Re-init when src or element changes
  watch([() => toValue(videoEl), () => toValue(src)], () => init(), { immediate: true })

  tryOnScopeDispose(cleanup)

  return { loading, error, qualities, setQuality, destroy }
}
