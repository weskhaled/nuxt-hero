/**
 * nuxt-hero/vue — use the hero slider in ANY Vue 3 app, no Nuxt required.
 *
 * Two ways to consume, à la VueUse:
 *
 * 1. **Plugin** (global components + app-wide config):
 *    ```ts
 *    import { createApp } from 'vue'
 *    import { HeroPlugin } from 'nuxt-hero/vue'
 *    import { A11y, EffectFade } from 'swiper/modules'
 *    import 'swiper/css'
 *    import 'nuxt-hero/hero.css'
 *
 *    createApp(App).use(HeroPlugin, {
 *      swiperModules: [A11y, EffectFade],
 *      defaultVolume: 0,
 *    })
 *    ```
 *    Then `<HeroSlider :slides="slides" />` anywhere.
 *
 * 2. **À la carte** (tree-shaken, no plugin):
 *    ```ts
 *    import { HeroSlider, useHeroSlider } from 'nuxt-hero/vue'
 *    ```
 *    Components fall back to sane defaults when the plugin isn't installed;
 *    pass Swiper modules per-instance via `options.swiperOptions.modules`.
 */
import type { App, Plugin } from 'vue'
import { markRaw } from 'vue'
import type { HeroRuntimeConfig } from '../runtime/config'
import { HERO_CONFIG_DEFAULTS, HERO_CONFIG_KEY, resolveFeatures } from '../runtime/config'
import HeroSlider from '../runtime/components/slider/index.vue'
import HeroSlide from '../runtime/components/slider/HeroSlide.vue'
import HeroPagination from '../runtime/components/navigation/HeroPagination.vue'
import HeroNavigation from '../runtime/components/navigation/HeroNavigation.vue'
import HeroVideoControls from '../runtime/components/video/HeroVideoControls.vue'
import HeroVideoScrubber from '../runtime/components/video/HeroVideoScrubber.vue'
import HeroSlideVideo from '../runtime/components/video/HeroSlideVideo.vue'
import HeroIcon from '../runtime/components/HeroIcon.vue'

// ─── Options ───

export interface HeroPluginOptions extends Partial<Omit<HeroRuntimeConfig, 'features'>> {
  /** Feature flags — default: everything except `hls` enabled. */
  features?: HeroRuntimeConfig['features']
  /**
   * Component name prefix for global registration. Default: `'Hero'`
   * (`<HeroSlider>`). Set to e.g. `'My'` for `<MySlider>`.
   */
  prefix?: string
  /**
   * Register components globally. Default: `true`. Set `false` to only
   * provide the config (import components yourself for tree-shaking).
   */
  registerComponents?: boolean
}

/** Resolve plugin options into the runtime config components inject. */
export function createHeroConfig(options: HeroPluginOptions = {}): HeroRuntimeConfig {
  const features = resolveFeatures({ ...HERO_CONFIG_DEFAULTS.features, ...options.features })
  return {
    features,
    defaultVolume: options.defaultVolume ?? HERO_CONFIG_DEFAULTS.defaultVolume,
    darkMode: options.darkMode ?? HERO_CONFIG_DEFAULTS.darkMode,
    swiperModules: options.swiperModules ?? [],
    // markRaw: a component definition must never be made reactive.
    imageComponent: options.imageComponent ? markRaw(options.imageComponent) : null,
  }
}

// ─── Plugin ───

export const HeroPlugin: Plugin<[HeroPluginOptions?]> = {
  install(app: App, options: HeroPluginOptions = {}) {
    app.provide(HERO_CONFIG_KEY, createHeroConfig(options))

    if (options.registerComponents !== false) {
      const prefix = options.prefix ?? 'Hero'
      app.component(`${prefix}Slider`, HeroSlider)
      app.component(`${prefix}Slide`, HeroSlide)
      app.component(`${prefix}Pagination`, HeroPagination)
      app.component(`${prefix}Navigation`, HeroNavigation)
      app.component(`${prefix}VideoControls`, HeroVideoControls)
      app.component(`${prefix}VideoScrubber`, HeroVideoScrubber)
      app.component(`${prefix}SlideVideo`, HeroSlideVideo)
      app.component(`${prefix}Icon`, HeroIcon)
    }
  },
}

export default HeroPlugin

// ─── À-la-carte exports ───

export {
  HeroSlider,
  HeroSlide,
  HeroPagination,
  HeroNavigation,
  HeroVideoControls,
  HeroVideoScrubber,
  HeroSlideVideo,
  HeroIcon,
}

export { useHeroSlider } from '../runtime/composables/useHeroSlider'
export { useHeroEnvironment } from '../runtime/composables/_environment'
export { useHeroDark } from '../runtime/composables/_dark'
export { HERO_CONFIG_DEFAULTS, HERO_CONFIG_KEY, resolveFeatures } from '../runtime/config'
export { isVideoUrl, isHlsUrl, formatTime, resolveParallaxConfig } from '../runtime/utils'

// ─── Types ───

export type { HeroRuntimeConfig } from '../runtime/config'
export type {
  HeroFeatures,
  SwiperEffect,
  HeroSlide as HeroSlideData,
  SlideConfig,
  ResolvedSlideConfig,
  SlideAnimation,
  HeroSliderProps,
  HeroSliderUI,
  HeroLabels,
  HeroEnvironment,
  OverlayPattern,
  OverlayPatternType,
  ParallaxConfig,
  UseHeroSliderOptions,
  UseHeroSliderReturn,
  VideoMediaControls,
  MediaControlsOptions,
} from '../runtime/types'
export type { SwiperOptions } from 'swiper/types'
