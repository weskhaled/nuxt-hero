import type { HeroFeatures } from '../runtime/types'

export interface HeroModuleOptions {
  /** Component name prefix. Default: 'Hero' */
  prefix?: string
  /** Default volume for video backgrounds (0-1). Default: 0 */
  defaultVolume?: number
  /**
   * How dark mode is detected for the `bgDarkSrc` image/video swap:
   * - `'class'` (default): a `dark` class on `<html>` (Tailwind class strategy,
   *   Nuxt UI, `@nuxtjs/color-mode` with `classSuffix: ''`).
   * - `'media'`: the OS-level `prefers-color-scheme: dark` media query.
   */
  darkMode?: 'class' | 'media'
  /**
   * @deprecated No longer used — hero styles ship as plain CSS with no Tailwind
   * pipeline required. Setting this logs a warning and does nothing. Remove it.
   */
  tailwind?: 'auto' | boolean
  /** Opt-in feature flags. Default: {} (nothing enabled) */
  features?: HeroFeatures
}

export type { HeroFeatures, SwiperEffect } from '../runtime/types'
