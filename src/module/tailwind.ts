import { addTemplate, hasNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

/**
 * Wire Tailwind v4 for the module's runtime CSS.
 *
 * @param mode `'auto'` (default) registers Tailwind ourselves unless the host
 *   already provides it (Nuxt UI); `true` always registers; `false` does nothing
 *   (host owns Tailwind and must scan this module's runtime dir itself).
 */
export function setupTailwind(nuxt: Nuxt, runtimeDir: string, mode: 'auto' | boolean): void {
  // Host fully owns Tailwind — opt out entirely.
  if (mode === false) return

  // Inject our Tailwind entry: registers the runtime dir as a `@source` (our
  // classes live in node_modules, which Tailwind skips by default) and the dark
  // variant. `.dark` matches Tailwind's class strategy, Nuxt UI, and a color-mode
  // `classSuffix: ''` setup — so dropped into such an app the hero shares the
  // host's existing `.dark` toggle with zero extra wiring.
  const lines = [
    `@import 'tailwindcss';`,
    ``,
    `@custom-variant dark (&:where(.dark, .dark *));`,
    ``,
    `@source "${runtimeDir}/**/*.{vue,css}";`,
  ]

  const { dst } = addTemplate({
    filename: 'nuxt-hero/tailwind.css',
    write: true,
    getContents: () => lines.join('\n'),
  })
  nuxt.options.css.unshift(dst)

  // Only register the Tailwind build plugin when the host doesn't already provide
  // one. Nuxt UI (and other Tailwind-v4 hosts) register `@tailwindcss/vite`
  // themselves; a second instance double-processes every stylesheet. `true`
  // forces registration even alongside a host (escape hatch).
  const hostOwnsTailwind = hasNuxtModule('@nuxt/ui')
  if (mode === 'auto' && hostOwnsTailwind) return

  nuxt.hook('vite:extend', async ({ config }) => {
    try {
      const plugin = await import('@tailwindcss/vite').then(r => r.default)
      config.plugins ||= []
      config.plugins.push(plugin())
    }
    catch (err) {
      console.warn('[nuxt-hero] Failed to load @tailwindcss/vite — install it, or set `hero: { tailwind: false }` to use your own Tailwind setup. Hero styles will not render correctly.', err)
    }
  })

  if (nuxt.options.builder !== '@nuxt/vite-builder') {
    nuxt.options.postcss.plugins['@tailwindcss/postcss'] = {}
  }
}
