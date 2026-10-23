import { join } from 'pathe'
import { addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { HeroFeatures } from '../runtime/types'
import { EFFECT_MAP, SWIPER_MODULE_MAP } from './constants'

/**
 * Swiper core + hero.css, then the CSS of enabled Swiper modules and effects.
 *
 * `cssLayer`: the same sheets imported into cascade layers from one generated
 * file, unshifted so its layer-order statement comes first. Tailwind's layer
 * names are pre-declared around ours — `theme, base, hero-vendor, hero,
 * components, utilities` — so its preflight (`base`) can't reset the slider's
 * buttons while its utilities still win; unlayered app CSS beats all of them.
 * Without Tailwind those names are just empty layers.
 */
export function setupCss(nuxt: Nuxt, runtimeDir: string, features: HeroFeatures, cssLayer = false): void {
  const vendor = ['swiper/css']
  for (const [key, mapping] of Object.entries(SWIPER_MODULE_MAP)) {
    if (features[key as keyof HeroFeatures] && mapping.css) vendor.push(mapping.css)
  }
  for (const effect of features.effects ?? []) vendor.push(EFFECT_MAP[effect].css)
  const heroCss = join(runtimeDir, 'assets/hero.css')

  if (!cssLayer) {
    nuxt.options.css.push(vendor[0]!, heroCss, ...vendor.slice(1))
    return
  }

  const { dst } = addTemplate({
    filename: 'nuxt-hero/styles.css',
    write: true,
    getContents: () => [
      '/* nuxt-hero `cssLayer: true` — Swiper + hero styles in cascade layers. */',
      '@layer theme, base, hero-vendor, hero, components, utilities;',
      ...vendor.map(sheet => `@import '${sheet}' layer(hero-vendor);`),
      `@import '${heroCss}' layer(hero);`,
      '',
    ].join('\n'),
  })
  nuxt.options.css.unshift(dst)
}
