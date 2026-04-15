import type { HeroFeatures } from '../runtime/types'
import { VALID_EFFECTS } from './constants'

/**
 * Normalize and validate feature flags.
 * Returns a new object — never mutates the input.
 */
export function resolveFeatures(raw: HeroFeatures): HeroFeatures {
  const features: HeroFeatures = { ...raw }

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

  return features
}
