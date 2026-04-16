import { join } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { HeroFeatures } from '../runtime/types'
import { EFFECT_MAP, SWIPER_MODULE_MAP } from './constants'

export function setupCss(nuxt: Nuxt, runtimeDir: string, features: HeroFeatures): void {
  nuxt.options.css.push('swiper/css')
  nuxt.options.css.push(join(runtimeDir, 'assets/hero.css'))

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
}
