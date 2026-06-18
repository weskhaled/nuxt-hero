import type { HeroFeatures } from '../runtime/types'

export interface HeroModuleOptions {
  /** Component name prefix. Default: 'Hero' */
  prefix?: string
  /** Default volume for video backgrounds (0-1). Default: 0 */
  defaultVolume?: number
  /**
   * How to wire Tailwind CSS v4.
   * - `'auto'` (default): set Tailwind up ourselves **unless** the host already
   *   provides it (e.g. Nuxt UI) — in which case we only register our runtime as
   *   a `@source` and reuse the host's pipeline (no duplicate `@tailwindcss/vite`).
   * - `true`: always set Tailwind up (standalone apps with no Tailwind).
   * - `false`: do nothing — the host is fully responsible for Tailwind and for
   *   scanning this module's runtime directory.
   */
  tailwind?: 'auto' | boolean
  /** Opt-in feature flags. Default: {} (nothing enabled) */
  features?: HeroFeatures
}

export type { HeroFeatures, SwiperEffect } from '../runtime/types'
