# Types

All types are exported from the package root for TypeScript consumers:

```ts
import type {
  HeroSlide,
  SlideConfig,
  ResolvedSlideConfig,
  SlideAnimation,
  HeroSliderProps,
  HeroSliderUI,
  HeroFeatures,
  SwiperEffect,
  OverlayPattern,
  OverlayPatternType,
  ParallaxConfig,
  UseHeroSliderOptions,
  UseHeroSliderReturn,
  VideoMediaControls,
  MediaControlsOptions,
  HeroModuleOptions,
  HeroEnvironment,
} from 'nuxt-hero'
```

## HeroSlide

Defines a single slide in the slider.

```ts
interface HeroSlide {
  /** Background image or video URL (auto-detected from extension) */
  bgSrc: string
  /** Dark-mode alternative (falls back to bgSrc) */
  bgDarkSrc?: string
  /** Thumbnail for pagination tooltip / navigation preview */
  thumbSrc?: string
  /** Slide title */
  title?: string
  /** Poster frame for video backgrounds */
  poster?: string
  /** Per-slide animation config */
  animation?: SlideAnimation
  /** Per-slide display & media config */
  config?: SlideConfig
  /** Any extra data for the slot */
  [key: string]: unknown
}
```

Video detection is automatic based on file extension: `.mp4`, `.webm`, `.mov`, `.ogg`, `.m3u8`.

## SlideConfig

Per-slide display and media configuration. All fields are optional and inherit from the composable-level defaults when omitted.

```ts
interface SlideConfig {
  showPagination?: boolean          // Show pagination dots
  showNavigation?: boolean          // Show navigation arrows
  showProgress?: boolean            // Show progress bar / video scrubber
  showVideoControls?: boolean       // Show video controls overlay
  videoLoop?: boolean               // Loop video (default: false)
  pauseUntilVideoEnds?: boolean     // Pause autoplay until video ends (default: false)
  mediaControlsOptions?: MediaControlsOptions  // VueUse useMediaControls options
  watchMode?: boolean               // Cinema mode for video slides
  watchIdleMs?: number              // Idle timeout before watch mode hides UI (default: 10000)
}
```

## SlideAnimation

```ts
interface SlideAnimation {
  /** CSS class for content entering (e.g., 'hero-animated hero-fadeInUp') */
  enter?: string
  /** CSS class for content leaving (e.g., 'hero-animated hero-fadeOutDown') */
  leave?: string
}
```

## OverlayPattern

Stackable overlay patterns rendered on top of slide backgrounds.

```ts
type OverlayPatternType = 'lines' | 'dots' | 'gradient' | 'custom'

interface OverlayPattern {
  type: OverlayPatternType
  opacity?: number   // 0–1, default: 0.15
  color?: string     // CSS color, default: 'black'
  css?: string       // Custom CSS background-image (only for type: 'custom')
}
```

### Pattern Examples

```ts
// Diagonal lines
{ type: 'lines', opacity: 0.1 }

// Dot grid
{ type: 'dots', opacity: 0.08, color: 'white' }

// Radial gradient
{ type: 'gradient', opacity: 0.4 }

// Custom CSS background
{ type: 'custom', css: 'linear-gradient(to bottom, transparent 50%, black)', opacity: 0.6 }
```

## ParallaxConfig

GSAP ScrollTrigger parallax configuration.

```ts
interface ParallaxConfig {
  bg?: boolean        // Parallax on background (default: true)
  content?: boolean   // Parallax on content (default: true)
  speed?: number      // Speed multiplier (default: 0.125)
  minOpacity?: number // Minimum opacity during scroll (0–1, default: 0.7)
}
```

## HeroSliderUI

Class overrides for internal elements (Nuxt UI-style pattern).

```ts
interface HeroSliderUI {
  root?: string       // Root wrapper
  swiper?: string     // Swiper container
  slide?: string      // Each SwiperSlide
  container?: string  // Slide inner container
  bg?: string         // Background layer
  controls?: string   // UI controls overlay
  progress?: string   // Autoplay progress bar
}
```

## HeroFeatures

Feature flags for tree-shaking Swiper modules.

```ts
type SwiperEffect = 'fade' | 'cube' | 'coverflow' | 'creative' | 'cards' | 'flip'

interface HeroFeatures {
  navigation?: boolean
  pagination?: boolean
  mousewheel?: boolean
  keyboard?: boolean
  a11y?: boolean             // Screen-reader support (default: true; set false to opt out)
  freeMode?: boolean
  thumbs?: boolean
  grid?: boolean
  zoom?: boolean
  scrollbar?: boolean
  controller?: boolean
  virtual?: boolean
  hashNavigation?: boolean
  history?: boolean
  effects?: SwiperEffect[]
  parallax?: boolean         // GSAP ScrollTrigger parallax
  swiperParallax?: boolean   // Swiper transition parallax
  video?: boolean            // Video backgrounds
  hls?: boolean              // HLS streaming (requires video)
}
```

## HeroModuleOptions

Top-level module configuration for `nuxt.config.ts`.

```ts
interface HeroModuleOptions {
  prefix?: string                  // Component name prefix (default: 'Hero')
  defaultVolume?: number           // Default video volume 0–1 (default: 0)
  tailwind?: 'auto' | boolean      // Tailwind v4 wiring (default: 'auto')
  features?: HeroFeatures          // Feature flags (default: {} — a11y is on unless disabled)
}
```

## HeroLabels

Localizable `aria-label`s for the built-in chrome — pass via `<HeroSlider :labels>`
(e.g. to provide Arabic strings in a bilingual app). Any omitted key falls back to
its English default.

```ts
interface HeroLabels {
  carousel?: string         // Carousel region name (default: 'Carousel')
  prev?: string             // Previous-slide button (default: 'Previous slide')
  next?: string             // Next-slide button (default: 'Next slide')
  play?: string             // Play (default: 'Play video')
  pause?: string            // Pause (default: 'Pause video')
  mute?: string             // Mute toggle (default: 'Toggle mute')
  volume?: string           // Volume slider (default: 'Volume')
  seek?: string             // Seek scrubber (default: 'Seek')
  settings?: string         // Settings / speed (default: 'Settings')
  speed?: string            // Speed-menu heading (default: 'Playback speed')
  speedNormal?: string      // The 1× option (default: 'Normal')
  pagination?: string       // Pagination nav landmark (default: 'Slide pagination')
  goToSlide?: string        // Per-dot label, {n} = slide number (default: 'Go to slide {n}')
  fullscreenEnter?: string  // Enter fullscreen (default: 'Enter fullscreen')
  fullscreenExit?: string   // Exit fullscreen (default: 'Exit fullscreen')
}
```

## HeroEnvironment

Return type of [`useHeroEnvironment()`](/composable#useheroenvironment) —
reactive, SSR-safe client-environment signals for mobile / PWA adaptiveness.

```ts
interface HeroEnvironment {
  mounted: Ref<boolean>                  // true once mounted on the client
  reducedMotion: ComputedRef<boolean>    // prefers-reduced-motion: reduce
  reducedData: ComputedRef<boolean>      // prefers-reduced-data: reduce
  coarsePointer: ComputedRef<boolean>    // pointer: coarse (touch-primary)
  saveData: ComputedRef<boolean>         // navigator.connection.saveData
  slowConnection: ComputedRef<boolean>   // effectiveType is 2g / slow-2g
  effectiveType: ComputedRef<string>     // raw effectiveType, or ''
  prefersDataSaver: ComputedRef<boolean> // data-/battery-constrained → lite mode
}
```
