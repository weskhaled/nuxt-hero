import { addTemplate } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { HeroFeatures } from '../runtime/types'
import { EFFECT_MAP, SWIPER_MODULE_MAP } from './constants'

export function setupVirtualSwiperModules(nuxt: Nuxt, features: HeroFeatures): void {
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
