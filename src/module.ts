import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { HeroModuleOptions } from './module/types'
import { resolveFeatures } from './module/features'
import { setupCss } from './module/css'
import { setupConfigPlugin } from './module/plugin'
import { setupVite } from './module/vite'
import { registerComponents, registerComposables } from './module/components'

export type { HeroModuleOptions } from './module/types'
export type {
  HeroFeatures,
  SwiperEffect,
  HeroSlide,
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
} from './runtime/types'
export type { HeroRuntimeConfig } from './runtime/config'
export type { SwiperOptions } from 'swiper/types'

export default defineNuxtModule<HeroModuleOptions>({
  meta: {
    name: 'nuxt-hero',
    configKey: 'hero',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: {
    prefix: 'Hero',
    defaultVolume: 0,
    darkMode: 'class',
    features: {},
  },
  moduleDependencies: (_nuxt: any): Record<string, { optional?: boolean; defaults?: Record<string, unknown> }> => ({
    // color-mode is NOT required — dark detection watches the `.dark` class on
    // <html> directly. When the host does use @nuxtjs/color-mode we only nudge
    // `classSuffix` to '' so its toggled class is `.dark` (matching
    // Tailwind/Nuxt UI); we never touch `dataValue` or install the module.
    '@nuxtjs/color-mode': {
      optional: true,
      defaults: {
        classSuffix: '',
      },
    },
  }),
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')
    const prefix = options.prefix ?? 'Hero'

    // Resolve & validate features
    const features = resolveFeatures(options.features ?? {})

    if (options.tailwind !== undefined) {
      console.warn('[nuxt-hero] The `tailwind` option is deprecated and ignored — hero styles now ship as plain CSS (no Tailwind pipeline required). Remove it from `hero` config.')
    }

    // CSS: swiper core + our compiled-in plain CSS, per-feature Swiper CSS
    setupCss(nuxt, runtimeDir, features)

    // App plugin providing the runtime config (features, Swiper modules,
    // NuxtImg when available) via Vue provide/inject — the single Nuxt bridge.
    setupConfigPlugin(runtimeDir, {
      features,
      defaultVolume: options.defaultVolume ?? 0,
      darkMode: options.darkMode ?? 'class',
    })

    // Components & composables
    registerComponents(runtimeDir, prefix, features)
    registerComposables(runtimeDir)

    // Alias: #hero → runtime dir (back-compat for consumers importing #hero/types)
    nuxt.options.alias['#hero'] = runtimeDir

    // Vite config
    setupVite(nuxt, runtimeDir, features)
  },
})
