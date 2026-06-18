import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { useEventListener, useMediaQuery, useMounted } from '@vueuse/core'
import type { HeroEnvironment } from '#hero/types'

interface NetworkInformationLike extends EventTarget {
  saveData?: boolean
  effectiveType?: string
}

/**
 * Reactive, SSR-safe client-environment signals for mobile / PWA adaptiveness.
 *
 * Every exposed flag reads `false`/empty on the server **and during the first
 * client render** (gated on `useMounted`), then settles to its real value after
 * mount — so reading them to drive rendering never causes a hydration mismatch.
 *
 * `prefersDataSaver` is the headline flag: the client is data- or
 * battery-constrained (`Save-Data` / `navigator.connection.saveData`,
 * `prefers-reduced-data: reduce`, or a `2g`/`slow-2g` effective connection).
 * `<HeroSlider :data-saver="'auto'">` uses it to enable its lite mode (no video
 * autoplay/preload, no parallax). Consumers can read it directly to adapt their
 * own slot content (e.g. swap a heavy widget for a static one on cellular).
 */
export function useHeroEnvironment(): HeroEnvironment {
  const mounted = useMounted()

  const reducedMotionRaw = useMediaQuery('(prefers-reduced-motion: reduce)')
  const reducedDataRaw = useMediaQuery('(prefers-reduced-data: reduce)')
  const coarsePointerRaw = useMediaQuery('(pointer: coarse)')

  // Network Information API — Chromium / Android only; absent on iOS Safari etc.
  const nav = typeof navigator !== 'undefined' ? (navigator as unknown as { connection?: NetworkInformationLike }) : undefined
  const conn = nav?.connection ?? null

  const saveDataRaw = ref(!!conn?.saveData)
  const effectiveTypeRaw = ref(conn?.effectiveType ?? '')

  if (conn) {
    useEventListener(conn, 'change', () => {
      saveDataRaw.value = !!conn.saveData
      effectiveTypeRaw.value = conn.effectiveType ?? ''
    })
  }

  // Gate every signal behind `mounted` so SSR and the first client render agree.
  const gate = (r: Ref<boolean>): ComputedRef<boolean> => computed(() => mounted.value && r.value)

  const slowConnectionRaw = computed(() =>
    effectiveTypeRaw.value === '2g' || effectiveTypeRaw.value === 'slow-2g')

  const prefersDataSaver = computed(() =>
    mounted.value && (saveDataRaw.value || reducedDataRaw.value || slowConnectionRaw.value))

  return {
    mounted,
    reducedMotion: gate(reducedMotionRaw),
    reducedData: gate(reducedDataRaw),
    coarsePointer: gate(coarsePointerRaw),
    saveData: gate(saveDataRaw),
    slowConnection: gate(slowConnectionRaw),
    effectiveType: computed(() => mounted.value ? effectiveTypeRaw.value : ''),
    prefersDataSaver,
  }
}
