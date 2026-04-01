import type { OverlayPattern, ParallaxConfig } from './types'

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|ogg|m3u8)(\?|$)/i
const HLS_EXTENSIONS = /\.(m3u8)(\?|$)/i

/** Check if a URL points to a video file based on extension (.mp4, .webm, .mov, .ogg, .m3u8) */
export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url)
}

/** Check if a URL points to an HLS stream (.m3u8) */
export function isHlsUrl(url: string): boolean {
  return HLS_EXTENSIONS.test(url)
}

/** Generate CSS background-image for a pattern */
export function patternCSS(pattern: OverlayPattern): string {
  const color = pattern.color ?? 'black'

  switch (pattern.type) {
    case 'lines':
      return `repeating-linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color}), repeating-linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%, ${color})`
    case 'dots':
      return `radial-gradient(circle, ${color} 1px, transparent 1px)`
    case 'gradient':
      return `radial-gradient(circle at 55% 60%, #00aaff, #002aff, rgba(144,143,255,1))`
    case 'custom':
      return pattern.css ?? ''
  }
}

/** Get the CSS background-size value appropriate for a pattern type */
export function patternSize(pattern: OverlayPattern): string {
  switch (pattern.type) {
    case 'lines':
      return '2px 2px'
    case 'dots':
      return '20px 20px'
    default:
      return 'cover'
  }
}

/** Default parallax config */
export const DEFAULT_PARALLAX: Required<ParallaxConfig> = {
  bg: true,
  content: true,
  speed: 0.125,
  minOpacity: 0.7,
}

/**
 * Resolve a parallax prop value to a full config object.
 * `false` disables all parallax, `true` uses defaults, objects are merged with defaults.
 */
export function resolveParallaxConfig(value: boolean | ParallaxConfig): Required<ParallaxConfig> {
  if (value === false) return { bg: false, content: false, speed: 0, minOpacity: 1 }
  if (value === true) return { ...DEFAULT_PARALLAX }
  return { ...DEFAULT_PARALLAX, ...value }
}

/** Format seconds as MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/** Safely extract hero config from Nuxt runtime config */
export function getHeroConfig(runtimeConfig: { public: Record<string, unknown> }): Record<string, any> {
  return (runtimeConfig.public as Record<string, any>).hero ?? {}
}
