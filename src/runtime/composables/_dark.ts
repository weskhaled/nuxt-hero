import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'
import { useMediaQuery, useMutationObserver } from '@vueuse/core'

/**
 * Framework-agnostic dark-mode signal for the `bgDarkSrc` image/video swap.
 *
 * - `'class'` strategy (default): reactively tracks a `dark` class on `<html>`
 *   — the convention shared by Tailwind's class strategy, Nuxt UI, and
 *   `@nuxtjs/color-mode` with `classSuffix: ''`. Works with ANY color-mode
 *   implementation that toggles that class; no dependency on a specific one.
 * - `'media'` strategy: the OS-level `prefers-color-scheme: dark` media query,
 *   for hosts with no class-based dark mode.
 *
 * Always `false` on the server. Call sites gate rendering behind `useMounted`
 * (as `HeroSlide` does) so SSR and first client render agree.
 */
export function useHeroDark(strategy: 'class' | 'media' = 'class'): ComputedRef<boolean> {
  if (strategy === 'media') {
    // Scoped to the calling component — listeners are cleaned up with it.
    const media = useMediaQuery('(prefers-color-scheme: dark)')
    return computed(() => media.value)
  }

  const classDark = ref(false)
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    const update = () => { classDark.value = root.classList.contains('dark') }
    update()
    useMutationObserver(root, update, { attributes: true, attributeFilter: ['class'] })
  }
  return computed(() => classDark.value)
}
