import type { HeroFeatures } from '../runtime/types'

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

export type { HeroFeatures, SwiperEffect } from '../runtime/types'
