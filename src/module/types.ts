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
  /**
   * Feature flags. Defaults match the Vue plugin: `navigation`, `pagination`,
   * `video` and `a11y` on; `parallax` on when `gsap` is installed. Anything
   * you set here wins.
   */
  features?: HeroFeatures
  /**
   * Put Swiper's CSS and hero.css in cascade layers (`@layer hero-vendor, hero`)
   * so your classes always win over them — e.g. `ui.slide: 'w-80'` with
   * `slidesPerView: 'auto'`, which Swiper's `.swiper-slide { width: 100% }`
   * otherwise overrides. Unlayered app CSS (resets included) then beats the
   * slider's styles too, so check global `button` / `img` rules. Default: false
   */
  cssLayer?: boolean
}

export type { HeroFeatures, SwiperEffect } from '../runtime/types'
