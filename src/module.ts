import { createRequire } from 'node:module'
import { join } from 'pathe'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { HeroModuleOptions } from './module/types'
import { resolveFeatures } from './module/features'
import { setupCss } from './module/css'
import { setupConfigPlugin } from './module/plugin'
import { setupVite } from './module/vite'
import { registerComponents, registerComposables } from './module/components'

export type { HeroModuleOptions } from './module/types'

/** Whether a package resolves from the app (e.g. an optional peer is installed). */
function canResolve(id: string, rootDir: string): boolean {
  try {
    createRequire(join(rootDir, 'package.json')).resolve(id)
    return true
  }
  catch {
    return false
  }
}
export type {
  HeroFeatures,
  SwiperEffect,
  HeroSlide,
  /** Same type as `HeroSlide` — the name the `nuxt-hero/vue` entry uses (its `HeroSlide` is the component) */
  HeroSlide as HeroSlideData,
  SlideConfig,
  ResolvedSlideConfig,
  SlideAnimation,
  HeroAnimatePreset,
  HeroAnimateTiming,
  HeroAnimateOptions,
  HeroAnimationHook,
  HeroAnimationContext,
  HeroAnimationHandle,
  HeroSlideDirection,
  HeroSlideChange,
  HeroVideoControlsConfig,
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

    // Same defaults as the Vue plugin, under anything the user sets: the hero
    // chrome renders out of the box. Parallax needs the optional `gsap` peer —
    // on by default only when it resolves, and switched off (with a warning)
    // when requested without it, so HeroParallax's import never breaks a build.
    const hasGsap = canResolve('gsap', nuxt.options.rootDir)
    const requested = { navigation: true, pagination: true, video: true, parallax: hasGsap, ...options.features }
    if (requested.parallax && !hasGsap) {
      console.warn('[nuxt-hero] `features.parallax` needs the `gsap` package — install it (`pnpm add gsap`). Parallax is disabled.')
      requested.parallax = false
    }
    const features = resolveFeatures(requested)

    if (options.tailwind !== undefined) {
      console.warn('[nuxt-hero] The `tailwind` option is deprecated and ignored — hero styles now ship as plain CSS (no Tailwind pipeline required). Remove it from `hero` config.')
    }

    // CSS: swiper core + our compiled-in plain CSS, per-feature Swiper CSS
    setupCss(nuxt, runtimeDir, features, options.cssLayer ?? false)

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
