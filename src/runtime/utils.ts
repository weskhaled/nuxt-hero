import type { HeroAnimationHandle, HeroAnimateTiming, HeroSlide, OverlayPattern, ParallaxConfig } from './types'

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

/**
 * Whether a slide has a video background — its explicit `bgType`, else either
 * source's extension (light or dark), so the answer doesn't flip with the theme.
 */
export function isVideoSlide(slide: Pick<HeroSlide, 'bgSrc' | 'bgDarkSrc' | 'bgType'> | undefined): boolean {
  if (!slide) return false
  if (slide.bgType) return slide.bgType !== 'image'
  return isVideoUrl(slide.bgSrc) || (!!slide.bgDarkSrc && isVideoUrl(slide.bgDarkSrc))
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
      // Without a color: the original blue glow. With one: a vignette in that
      // color (clear center → color at the edges).
      return pattern.color
        ? `radial-gradient(circle at 55% 60%, transparent, ${pattern.color})`
        : `radial-gradient(circle at 55% 60%, #00aaff, #002aff, rgba(144,143,255,1))`
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

/**
 * Map animate timing options to the CSS custom properties hero.css reads for
 * `data-hero-animate` elements. Unset keys are omitted, so CSS defaults (or a
 * value set higher up the tree) still apply.
 */
export function animateVars(timing: HeroAnimateTiming | undefined): Record<string, string> {
  const vars: Record<string, string> = {}
  if (!timing) return vars
  if (timing.duration != null) vars['--hero-anim-duration'] = `${timing.duration}ms`
  if (timing.stagger != null) vars['--hero-anim-stagger'] = `${timing.stagger}ms`
  if (timing.delay != null) vars['--hero-anim-delay'] = `${timing.delay}ms`
  if (timing.easing) vars['--hero-anim-easing'] = timing.easing
  if (timing.distance) vars['--hero-anim-distance'] = timing.distance
  if (timing.leaveDuration != null) vars['--hero-anim-leave-duration'] = `${timing.leaveDuration}ms`
  return vars
}

/** Stop whatever an animation hook returned (WAAPI `cancel`, GSAP `kill`, or a cleanup fn). */
export function stopAnimationHandle(handle: HeroAnimationHandle | void): void {
  if (!handle) return
  if (typeof handle === 'function') handle()
  else if ('cancel' in handle) handle.cancel()
  else if ('kill' in handle) handle.kill()
}
