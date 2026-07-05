import type { Component, InjectionKey } from 'vue'
import { inject } from 'vue'
import type { HeroFeatures } from './types'

/**
 * Runtime configuration shared by every hero component in the app.
 *
 * Provided by:
 * - the **Nuxt module** via a generated plugin (features come from `nuxt.config`,
 *   Swiper modules are statically imported per enabled feature, and
 *   `imageComponent` is `<NuxtImg>` when `@nuxt/image` is installed), or
 * - the **Vue plugin** (`app.use(HeroPlugin, options)` from `nuxt-hero/vue`), or
 * - nothing at all — components fall back to {@link HERO_CONFIG_DEFAULTS}, so a
 *   bare `import { HeroSlider } from 'nuxt-hero/vue'` works standalone.
 */
export interface HeroRuntimeConfig {
  /** Feature flags gating which chrome renders (navigation, pagination, video, …). */
  features: HeroFeatures
  /** Default volume for video backgrounds (0–1). Default: 0 (muted). */
  defaultVolume: number
  /**
   * Component used to render slide background images. Defaults to a plain
   * `<img>`. The Nuxt module sets this to `NuxtImg` when `@nuxt/image` is
   * installed so `imagePreset` / `imageSizes` keep working.
   */
  imageComponent?: Component | null
  /**
   * Swiper modules registered on every slider (merged with any per-slider
   * `swiperOptions.modules`). The Nuxt module fills this from feature flags;
   * Vue-plugin users pass the modules they need (e.g. `[A11y, EffectFade]`).
   */
  swiperModules?: unknown[]
  /**
   * How dark mode is detected for the `bgDarkSrc` image/video swap:
   * - `'class'` (default): a `dark` class on `<html>` (Tailwind / Nuxt UI /
   *   `@nuxtjs/color-mode` with `classSuffix: ''` convention).
   * - `'media'`: the `prefers-color-scheme: dark` media query.
   */
  darkMode?: 'class' | 'media'
}

/**
 * Defaults used when no config was provided (bare component import in a plain
 * Vue app). Feature flags default ON — in that context they only gate rendering
 * (bundling is the consumer bundler's concern), so "everything available" is
 * the least surprising default. HLS stays opt-in: it implies the optional
 * `hls.js` dependency for non-Safari browsers.
 */
export const HERO_CONFIG_DEFAULTS: HeroRuntimeConfig = {
  features: {
    navigation: true,
    pagination: true,
    video: true,
    a11y: true,
    parallax: true,
  },
  defaultVolume: 0,
  imageComponent: null,
  swiperModules: [],
  darkMode: 'class',
}

export const HERO_CONFIG_KEY: InjectionKey<HeroRuntimeConfig> = Symbol.for('nuxt-hero:config')

/**
 * Read the app-level hero config. Safe without a provider — falls back to
 * {@link HERO_CONFIG_DEFAULTS}. Must be called during component setup.
 */
export function useHeroConfig(): HeroRuntimeConfig {
  return inject(HERO_CONFIG_KEY, HERO_CONFIG_DEFAULTS)
}

/**
 * Normalize and validate feature flags. Returns a new object — never mutates
 * the input. Shared by the Nuxt module (build time) and the Vue plugin
 * (install time).
 */
export function resolveFeatures(raw: HeroFeatures): HeroFeatures {
  const features: HeroFeatures = { ...raw }

  // Accessibility on by default — registers Swiper's A11y module, which adds the
  // carousel role, an aria-live region announcing slide changes, and aria-hidden
  // on inactive slides. Opt out explicitly with `a11y: false`.
  if (features.a11y === undefined) features.a11y = true

  // hls requires video
  if (features.hls && !features.video) {
    console.warn('[nuxt-hero] `hls: true` requires `video: true` — auto-enabling video.')
    features.video = true
  }

  // Validate effects
  if (features.effects) {
    features.effects = features.effects.filter((e) => {
      if (!VALID_EFFECTS.includes(e)) {
        console.warn(`[nuxt-hero] Unknown effect "${e}" — ignoring. Valid: ${VALID_EFFECTS.join(', ')}`)
        return false
      }
      return true
    })
  }

  return features
}

export const VALID_EFFECTS = ['fade', 'cube', 'coverflow', 'creative', 'cards', 'flip'] as const
