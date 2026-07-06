import { addPluginTemplate, hasNuxtModule } from '@nuxt/kit'
import type { HeroFeatures } from '../runtime/types'
import { EFFECT_MAP, SWIPER_MODULE_MAP } from './constants'

/** Swiper module import names for the enabled feature flags + effects. */
export function swiperModuleNames(features: HeroFeatures): string[] {
  const names: string[] = []
  for (const [key, mapping] of Object.entries(SWIPER_MODULE_MAP)) {
    if (features[key as keyof HeroFeatures]) names.push(mapping.module)
  }
  if (features.effects) {
    for (const effect of features.effects) names.push(EFFECT_MAP[effect].module)
  }
  return [...new Set(names)]
}

/**
 * Generate the app plugin that provides the hero runtime config.
 *
 * This is the single Nuxt↔runtime bridge: components read the config via
 * `useHeroConfig()` (plain Vue provide/inject), so the same runtime code works
 * under the Vue plugin (`nuxt-hero/vue`) with zero Nuxt imports. Swiper modules
 * are statically imported per enabled feature (tree-shaken like the old virtual
 * module), and `imageComponent` is `<NuxtImg>` when `@nuxt/image` is installed.
 */
export function setupConfigPlugin(
  runtimeDir: string,
  config: { features: HeroFeatures; defaultVolume: number; darkMode: 'class' | 'media' },
): void {
  const modules = swiperModuleNames(config.features)
  const hasImage = hasNuxtModule('@nuxt/image')

  addPluginTemplate({
    filename: 'nuxt-hero/config-plugin.mjs',
    // Written to .nuxt for inspectability (and so editors can jump into it).
    write: true,
    getContents: () => [
      `import { defineNuxtPlugin } from '#app'`,
      `import { HERO_CONFIG_KEY } from '${runtimeDir}/config'`,
      modules.length ? `import { ${modules.join(', ')} } from 'swiper/modules'` : '',
      hasImage ? `import { NuxtImg } from '#components'` : `const NuxtImg = null`,
      // Optional-dep imports are only GENERATED when their feature is enabled —
      // this keeps `gsap` (imported by HeroParallax) and `hls.js` completely
      // out of the build graph otherwise, so consumers who skipped the optional
      // peers still build. defineAsyncComponent keeps parallax a lazy chunk;
      // the hls loader is only called when an `.m3u8` source actually plays.
      config.features.parallax
        ? `import { defineAsyncComponent } from 'vue'\nconst HeroParallax = defineAsyncComponent(() => import('${runtimeDir}/components/slider/HeroParallax.vue'))`
        : `const HeroParallax = null`,
      config.features.hls
        ? `const hlsLoader = () => import('hls.js')`
        : `const hlsLoader = null`,
      ``,
      `export default defineNuxtPlugin((nuxtApp) => {`,
      `  nuxtApp.vueApp.provide(HERO_CONFIG_KEY, {`,
      `    features: ${JSON.stringify(config.features)},`,
      `    defaultVolume: ${JSON.stringify(config.defaultVolume)},`,
      `    darkMode: ${JSON.stringify(config.darkMode)},`,
      `    swiperModules: [${modules.join(', ')}],`,
      `    imageComponent: NuxtImg,`,
      `    parallaxComponent: HeroParallax,`,
      `    hlsLoader,`,
      `  })`,
      `})`,
      ``,
    ].filter(Boolean).join('\n'),
  })
}
