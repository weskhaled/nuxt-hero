import { existsSync } from 'node:fs'
import { join } from 'pathe'
import { addComponent, addImports, addTemplate, createResolver, defineNuxtModule, hasNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { HeroFeatures, SwiperEffect } from './runtime/types'

export interface HeroModuleOptions {
  /** Component name prefix. Default: 'Hero' */
  prefix?: string
  /** Enable @nuxtjs/color-mode. Default: true */
  colorMode?: boolean
  /** Enable @nuxt/icon. Default: true */
  icon?: boolean
  /** Default volume for video backgrounds (0-1). Default: 0 */
  defaultVolume?: number
  /** Opt-in feature flags. Default: {} (nothing enabled) */
  features?: HeroFeatures
}

/** Maps boolean feature flags to their Swiper module import name */
const SWIPER_MODULE_MAP: Record<string, { module: string; css?: string }> = {
  navigation: { module: 'Navigation', css: 'swiper/css/navigation' },
  pagination: { module: 'Pagination', css: 'swiper/css/pagination' },
  mousewheel: { module: 'Mousewheel' },
  keyboard: { module: 'Keyboard' },
  a11y: { module: 'A11y' },
  freeMode: { module: 'FreeMode', css: 'swiper/css/free-mode' },
  thumbs: { module: 'Thumbs', css: 'swiper/css/thumbs' },
  grid: { module: 'Grid', css: 'swiper/css/grid' },
  zoom: { module: 'Zoom', css: 'swiper/css/zoom' },
  scrollbar: { module: 'Scrollbar', css: 'swiper/css/scrollbar' },
  controller: { module: 'Controller' },
  virtual: { module: 'Virtual', css: 'swiper/css/virtual' },
  hashNavigation: { module: 'HashNavigation' },
  history: { module: 'History' },
  swiperParallax: { module: 'Parallax' },
}

/** Maps effect names to their Swiper module import name and CSS */
const EFFECT_MAP: Record<SwiperEffect, { module: string; css: string }> = {
  fade: { module: 'EffectFade', css: 'swiper/css/effect-fade' },
  cube: { module: 'EffectCube', css: 'swiper/css/effect-cube' },
  coverflow: { module: 'EffectCoverflow', css: 'swiper/css/effect-coverflow' },
  creative: { module: 'EffectCreative', css: 'swiper/css/effect-creative' },
  cards: { module: 'EffectCards', css: 'swiper/css/effect-cards' },
  flip: { module: 'EffectFlip', css: 'swiper/css/effect-flip' },
}

const VALID_EFFECTS: SwiperEffect[] = ['fade', 'cube', 'coverflow', 'creative', 'cards', 'flip']

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

    // ─── Resolve features ───
    const features: HeroFeatures = { ...options.features }

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

    // ─── Tailwind v4 + DaisyUI ───
    setupTailwind(nuxt, runtimeDir)

    // ─── CSS: core always, modules conditional ───
    nuxt.options.css.push('swiper/css')
    nuxt.options.css.push(resolve('./runtime/assets/hero.css'))

    // Add CSS for enabled Swiper modules
    for (const [key, mapping] of Object.entries(SWIPER_MODULE_MAP)) {
      if (features[key as keyof HeroFeatures] && mapping.css) {
        nuxt.options.css.push(mapping.css)
      }
    }

    // Add CSS for enabled effects
    if (features.effects) {
      for (const effect of features.effects) {
        nuxt.options.css.push(EFFECT_MAP[effect].css)
      }
    }

    // ─── Runtime config: detect optional modules + features ───
    ;(nuxt.options.runtimeConfig.public as any).hero = {
      hasNuxtImage: hasNuxtModule('@nuxt/image'),
      defaultVolume: options.defaultVolume ?? 0,
      features,
    }

    // ─── Components: conditional registration ───
    // Slider and Slide always registered
    addComponent({ name: `${prefix}Slider`, filePath: resolve('./runtime/components/slider/index.vue') })
    addComponent({ name: `${prefix}Slide`, filePath: resolve('./runtime/components/slider/HeroSlide.vue') })

    if (features.pagination) {
      addComponent({ name: `${prefix}Pagination`, filePath: resolve('./runtime/components/navigation/HeroPagination.vue') })
    }
    if (features.navigation) {
      addComponent({ name: `${prefix}Navigation`, filePath: resolve('./runtime/components/navigation/HeroNavigation.vue') })
    }
    if (features.video) {
      addComponent({ name: `${prefix}VideoControls`, filePath: resolve('./runtime/components/video/HeroVideoControls.vue') })
      addComponent({ name: `${prefix}VideoScrubber`, filePath: resolve('./runtime/components/video/HeroVideoScrubber.vue') })
      addComponent({ name: `${prefix}SlideVideo`, filePath: resolve('./runtime/components/video/HeroSlideVideo.vue') })
    }

    // ─── Composables ───
    addImports({ name: 'useHeroSlider', from: resolve('./runtime/composables/useHeroSlider') })

    // ─── Alias: #hero → runtime dir ───
    nuxt.options.alias['#hero'] = runtimeDir

    // ─── Virtual module: #hero/swiper-modules ───
    setupVirtualSwiperModules(nuxt, features)

    // ─── Vite ───
    setupVite(nuxt, runtimeDir, features)
  },
})

function setupTailwind(nuxt: Nuxt, runtimeDir: string) {
  // Detect if the host app already has Tailwind (e.g. via @nuxt/ui)
  const hostHasTailwind = hasNuxtModule('@nuxt/ui', nuxt)

  // Use @source to point Tailwind at the runtime directory directly.
  // This overrides Tailwind v4's default node_modules exclusion and is
  // far more reliable than @source inline() with extracted tokens.
  const sourceDirective = `@source "${runtimeDir}/**/*.{vue,css}";`

  // Only inject our own Tailwind entrypoint if the host doesn't provide one
  if (!hostHasTailwind) {
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
      const plugin = await import('@tailwindcss/vite').then(r => r.default)
      config.plugins ||= []
      config.plugins.push(plugin())
    })

    if (nuxt.options.builder !== '@nuxt/vite-builder') {
      nuxt.options.postcss.plugins['@tailwindcss/postcss'] = {}
    }
  }
  else {
    // Host has Tailwind — add source so our classes get generated
    const { dst } = addTemplate({
      filename: 'nuxt-hero/tailwind.css',
      write: true,
      getContents: () => sourceDirective,
    })
    nuxt.options.css.push(dst)
  }
}

function setupVirtualSwiperModules(nuxt: Nuxt, features: HeroFeatures) {
  const modules: string[] = []

  // Boolean feature flags
  for (const [key, mapping] of Object.entries(SWIPER_MODULE_MAP)) {
    if (features[key as keyof HeroFeatures]) {
      modules.push(mapping.module)
    }
  }

  // Effects
  if (features.effects) {
    for (const effect of features.effects) {
      modules.push(EFFECT_MAP[effect].module)
    }
  }

  const imports = modules.length > 0
    ? `import { ${modules.join(', ')} } from 'swiper/modules'`
    : ''

  const exported = modules.length > 0
    ? `export const swiperModules = [${modules.join(', ')}]`
    : 'export const swiperModules = []'

  addTemplate({
    filename: 'nuxt-hero/swiper-modules.mjs',
    write: true,
    getContents: () => [imports, exported, ''].join('\n'),
  })

  // Add alias so components can import from '#hero/swiper-modules'
  nuxt.options.alias['#hero/swiper-modules'] = nuxt.options.buildDir + '/nuxt-hero/swiper-modules.mjs'
}

function setupVite(nuxt: Nuxt, runtimeDir: string, features: HeroFeatures) {
  // ─── Deduplicate shared deps ───
  // When this module is consumed from source (e.g. `../nuxt-hero/src/module`)
  // or linked via pnpm, the runtime code may resolve @vueuse/core, gsap, etc.
  // from the module's own node_modules — a separate instance from the host app.
  // This breaks shared Vue reactivity. Force these deps to resolve from the
  // host project's node_modules so there's a single instance.
  const hostNodeModules = join(nuxt.options.rootDir, 'node_modules')
  const sharedDeps = ['@vueuse/core']
  if (features.parallax) sharedDeps.push('gsap')

  for (const dep of sharedDeps) {
    const hostPath = join(hostNodeModules, dep)
    if (existsSync(hostPath)) {
      nuxt.options.alias[dep] = hostPath
    }
  }

  // ─── File watching ───
  nuxt.options.vite.server ??= {}
  nuxt.options.vite.server.watch ??= {}
  nuxt.options.vite.server.watch.ignored ??= []
  if (Array.isArray(nuxt.options.vite.server.watch.ignored)) {
    nuxt.options.vite.server.watch.ignored.push(`!${runtimeDir}/**`)
  }

  // ─── Vite pre-bundling ───
  nuxt.options.vite.optimizeDeps ??= {}
  nuxt.options.vite.optimizeDeps.include ??= []
  nuxt.options.vite.optimizeDeps.include.push('swiper/vue', '@vueuse/core')

  if (features.parallax) {
    nuxt.options.vite.optimizeDeps.include.push('gsap', 'gsap/ScrollTrigger')
  }

  // Only pre-bundle swiper/modules if any Swiper modules are enabled
  const hasAnyModule = Object.keys(SWIPER_MODULE_MAP).some(k => features[k as keyof HeroFeatures])
    || (features.effects && features.effects.length > 0)
  if (hasAnyModule) {
    nuxt.options.vite.optimizeDeps.include.push('swiper/modules')
  }

  nuxt.options.build.transpile.push('swiper')
}
