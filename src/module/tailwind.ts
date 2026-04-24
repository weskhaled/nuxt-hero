import { addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function setupTailwind(nuxt: Nuxt, runtimeDir: string): void {
  // @source points Tailwind at the runtime directory directly, overriding
  // the default node_modules exclusion so our classes get generated.
  const sourceDirective = `@source "${runtimeDir}/**/*.{vue,css}";`

  // No host Tailwind — provide our own entrypoint
  const lines = [
    `@import 'tailwindcss';`,
    ``,
    `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`,
    ``,
    sourceDirective,
  ]

  const { dst } = addTemplate({
    filename: 'nuxt-hero/tailwind.css',
    write: true,
    getContents: () => lines.join('\n'),
  })
  nuxt.options.css.unshift(dst)

  nuxt.hook('vite:extend', async ({ config }) => {
    try {
      const plugin = await import('@tailwindcss/vite').then(r => r.default)
      config.plugins ||= []
      config.plugins.push(plugin())
    }
    catch (err) {
      console.warn('[nuxt-hero] Failed to load @tailwindcss/vite — install it in your project. Hero styles will not render correctly.', err)
    }
  })

  if (nuxt.options.builder !== '@nuxt/vite-builder') {
    nuxt.options.postcss.plugins['@tailwindcss/postcss'] = {}
  }
}
