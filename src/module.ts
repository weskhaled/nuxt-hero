import { createResolver, defineNuxtModule, hasNuxtModule } from '@nuxt/kit'
import type { HeroModuleOptions } from './module/types'
import { resolveFeatures } from './module/features'
import { setupTailwind } from './module/tailwind'
import { setupCss } from './module/css'
import { setupVirtualSwiperModules } from './module/swiper'
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
    tailwind: 'auto',
    features: {},
  },
  moduleDependencies: (_nuxt: any): Record<string, { defaults?: Record<string, unknown> }> => ({
    // color-mode powers the optional dark-image swap. We only nudge `classSuffix`
    // to '' so the toggled class is `.dark` (matching Tailwind/Nuxt UI), and never
    // touch `dataValue` — the host keeps full ownership of its <html> attributes.
    '@nuxtjs/color-mode': {
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

    // Tailwind v4 integration ('auto' skips our own setup when the host already
    // provides Tailwind — e.g. Nuxt UI — so we never double-register the plugin)
    setupTailwind(nuxt, runtimeDir, options.tailwind ?? 'auto')

    // CSS: core always, modules conditional
    setupCss(nuxt, runtimeDir, features)

    // Runtime config
    ;(nuxt.options.runtimeConfig.public as any).hero = {
      hasNuxtImage: hasNuxtModule('@nuxt/image'),
      defaultVolume: options.defaultVolume ?? 0,
      features,
    }

    // Components & composables
    registerComponents(runtimeDir, prefix, features)
    registerComposables(runtimeDir)

    // Alias: #hero → runtime dir
    nuxt.options.alias['#hero'] = runtimeDir

    // Virtual module: #hero/swiper-modules
    setupVirtualSwiperModules(nuxt, features)

    // Vite config
    setupVite(nuxt, runtimeDir, features)
  },
})
