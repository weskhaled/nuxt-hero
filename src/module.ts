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
    colorMode: true,
    icon: true,
    defaultVolume: 0,
    features: {},
  },
  moduleDependencies: (_nuxt: any): Record<string, { defaults?: Record<string, unknown> }> => ({
    '@nuxtjs/color-mode': {
      defaults: {
        classSuffix: '',
        dataValue: 'theme',
      },
    },
    '@nuxt/icon': {
      defaults: {
        cssLayer: 'base',
      },
    },
  }),
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')
    const prefix = options.prefix ?? 'Hero'

    // Resolve & validate features
    const features = resolveFeatures(options.features ?? {})

    // Tailwind v4 integration
    setupTailwind(nuxt, runtimeDir)

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
