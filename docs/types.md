# Types

**Nuxt**: the public types are exported from the package root:

```ts
import type {
  HeroSlide,
  HeroSlideData,       // alias of HeroSlide (the name the Vue entry uses)
  SlideConfig,
  ResolvedSlideConfig,
  SlideAnimation,
  HeroAnimatePreset,
  HeroAnimateOptions,
  HeroAnimateTiming,
  HeroAnimationHook,
  HeroAnimationContext,
  HeroAnimationHandle,
  HeroSlideDirection,
  HeroSlideChange,
  HeroVideoControlsConfig,
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
  HeroLabels,
  HeroRuntimeConfig,
  SwiperOptions,
} from 'nuxt-hero'
```

**Plain Vue**: the same types come from `nuxt-hero/vue`, without
`HeroModuleOptions`. There the slide type is `HeroSlideData`, because
`HeroSlide` names the component.

`HeroSlideChange` and `HeroVideoControlsConfig` come from both entries too:
`import type { HeroSlideChange } from 'nuxt-hero'` (Nuxt) or `'nuxt-hero/vue'`.

## HeroSlide

Defines a single slide in the slider.

```ts
interface HeroSlide {
  /** Background image or video URL (type detected from the extension, see bgType) */
  bgSrc: string
  /** Dark-mode alternative (falls back to bgSrc) */
  bgDarkSrc?: string
  /** Media type for URLs without a telling extension (CDN / signed URLs) */
  bgType?: 'image' | 'video' | 'hls'
  /** Alt text for an informative background image. Default: '' (decorative) */
  bgAlt?: string
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

Without `bgType`, the type comes from the file extension: `.mp4`, `.webm`,
`.mov` and `.ogg` are video, `.m3u8` is HLS, and anything else is an image. Set
`bgType` when the URL doesn't end in a telling extension. A query string after
the extension is fine.

## SlideConfig

Per-slide display and media configuration. All fields are optional and inherit from the composable-level defaults when omitted.

```ts
interface SlideConfig {
  showPagination?: boolean          // Show the pagination pill
  showNavigation?: boolean          // Show navigation arrows
  showProgress?: boolean            // Show the autoplay progress bar (not the video scrubber)
  showVideoControls?: boolean       // Show video controls (video slides only)
  showAutoplayToggle?: boolean      // Show the autoplay pause/play toggle
  videoControls?: HeroVideoControlsConfig // Parts of the default video controls (merged over the slider's)
  videoLoop?: boolean               // Loop the video (default: false)
  pauseUntilVideoEnds?: boolean     // Hold autoplay while the video plays (default: false)
  mediaControlsOptions?: MediaControlsOptions  // VueUse useMediaControls options
  watchMode?: boolean               // Cinema mode for video slides
  watchIdleMs?: number              // Idle timeout before watch mode hides the UI (default: 10000)
}
```

`videoLoop: false` doesn't advance the slider when the video ends. Advancing is
always up to the autoplay timer. With `pauseUntilVideoEnds: true` the timer is
held while the video plays and resumes after it ends, so the slide still gets its
full delay. That option has no effect with `videoLoop: true`, because a looping
video never ends. See [Video → Loop and autoplay](/video#loop-and-autoplay).

### ResolvedSlideConfig

A slide's `config` merged over the slider defaults, as returned by
`activeSlideConfig` / `getSlideConfig(index)`:

```ts
interface ResolvedSlideConfig {
  showPagination: boolean
  showNavigation: boolean
  showProgress: boolean
  showVideoControls: boolean
  showAutoplayToggle: boolean
  videoControls: HeroVideoControlsConfig
  videoLoop: boolean
  pauseUntilVideoEnds: boolean
  mediaControlsOptions?: MediaControlsOptions
  watchMode: boolean
  watchIdleMs: number
}
```

## HeroVideoControlsConfig

Which parts of the default video controls render. Every part defaults to
`true`. Set it on the slider (`videoControls`) or per slide
(`config.videoControls`).

```ts
interface HeroVideoControlsConfig {
  playButton?: boolean                     // Centered play/pause button with progress ring
  scrubber?: boolean                       // Seek bar
  volume?: boolean                         // Mute toggle + volume slider
  time?: boolean                           // Current time / duration label
  settings?: boolean | { rates: number[] } // Speed menu; rates default to [0.5, 0.75, 1, 1.25, 1.5, 2]
  fullscreen?: boolean                     // Fullscreen button (when the browser allows it)
}
```

## HeroSlideChange

Payload of `<HeroSlider @change>`.

```ts
interface HeroSlideChange {
  index: number                 // The slide now active
  previousIndex: number         // The slide that was active
  direction: HeroSlideDirection // 'next' | 'prev'
  slide: HeroSlide              // The active slide's data
}
```

## SlideAnimation

Per-slide animation — class-based `enter` / `leave`, choreography timing
overrides, and JS hooks. See [Animations](./animations).

```ts
interface SlideAnimation extends HeroAnimateTiming {
  /** CSS class for the content block entering (e.g. 'hero-animated hero-slideInUp') */
  enter?: string
  /** CSS class for the content block leaving (e.g. 'hero-animated hero-slideOutDown') */
  leave?: string
  /** Per-slide hooks (override `animate.onEnter` / `onLeave`) */
  onEnter?: HeroAnimationHook
  onLeave?: HeroAnimationHook
}
```

## HeroAnimateOptions

```ts
interface HeroAnimateTiming {
  duration?: number      // ms, default 700        (--hero-anim-duration)
  stagger?: number       // ms, default 90         (--hero-anim-stagger)
  delay?: number         // ms, default 0          (--hero-anim-delay)
  easing?: string        // default cubic-bezier(0.22, 1, 0.36, 1)
  distance?: string      // CSS length, default '1.5rem'
  leaveDuration?: number // ms, default 300
}

interface HeroAnimateOptions extends HeroAnimateTiming {
  /** First slide's entrance: on load (true), static (false), or when scrolled into view ('visible') */
  initial?: boolean | 'visible'
  onEnter?: HeroAnimationHook
  onLeave?: HeroAnimationHook
}

type HeroAnimatePreset =
  | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'slide'
  | 'zoom-in' | 'zoom-out' | 'blur-in' | 'clip-up' | 'clip-left' | 'clip-right'
  | 'flip-up' | 'rotate-in'

type HeroAnimationHook = (el: HTMLElement, ctx: HeroAnimationContext) => HeroAnimationHandle | void

interface HeroAnimationContext {
  index: number
  direction: 'next' | 'prev'   // HeroSlideDirection
  initial: boolean
  reducedMotion: boolean
}

/** Stopped automatically on the next slide change */
type HeroAnimationHandle = { cancel: () => void } | { kill: () => void } | (() => void)
```

## OverlayPattern

Stackable overlay patterns rendered on top of slide backgrounds.

```ts
type OverlayPatternType = 'lines' | 'dots' | 'gradient' | 'custom'

interface OverlayPattern {
  type: OverlayPatternType
  opacity?: number   // 0–1, default: 0.15
  color?: string     // CSS color, default: 'black' (gradient: a vignette in this color; without one, the default blue glow)
  css?: string       // Custom CSS background-image (only for type: 'custom')
}
```

### Pattern Examples

```ts
// Diagonal lines
{ type: 'lines', opacity: 0.1 }

// Dot grid
{ type: 'dots', opacity: 0.08, color: 'white' }

// Radial gradient — the default blue glow, or a vignette in `color`
{ type: 'gradient', opacity: 0.4 }
{ type: 'gradient', opacity: 0.6, color: 'rgb(0 0 0)' }

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
  root?: string           // Root element (.hero-slider)
  swiper?: string         // Swiper container
  slide?: string          // Each SwiperSlide
  container?: string      // Slide inner container (.hero-slide)
  bg?: string             // Background layer (.hero-slide-bg)
  scrim?: string          // Inset scrim (.hero-slide-scrim)
  content?: string        // Content layer (.hero-slide-content)
  controls?: string       // Controls layer (.hero-controls)
  progress?: string       // Autoplay bar track
  progressFill?: string   // Autoplay bar fill
  pagination?: string     // Pagination pill (.hero-pagination)
  navigation?: string     // Arrows wrapper (.hero-nav)
  videoControls?: string  // Video controls bar (.hero-media-controls)
  playButton?: string     // Centered video play button
  autoplayToggle?: string // Autoplay pause/play toggle
}
```

See [Theming → `ui` classes](/theming#ui-classes).

## HeroFeatures

Feature flags: the slider parts that render, plus the Swiper modules
registered in Nuxt. See [Configuration → Feature Flags](/configuration#feature-flags).

```ts
type SwiperEffect = 'fade' | 'cube' | 'coverflow' | 'creative' | 'cards' | 'flip'

interface HeroFeatures {
  navigation?: boolean       // The slider's arrows (default: true)
  pagination?: boolean       // The slider's pagination pill (default: true)
  swiperNavigation?: boolean // Swiper's Navigation module + CSS, for native swiperOptions.navigation
  swiperPagination?: boolean // Swiper's Pagination module + CSS, for native swiperOptions.pagination
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
  parallax?: boolean         // GSAP scroll parallax (Nuxt default: true when gsap is installed)
  swiperParallax?: boolean   // Swiper transition parallax
  video?: boolean            // Video backgrounds (default: true)
  hls?: boolean              // HLS streaming (turns on video)
}
```

## HeroModuleOptions

Top-level module configuration for `nuxt.config.ts`.

```ts
interface HeroModuleOptions {
  prefix?: string               // Component name prefix (default: 'Hero')
  defaultVolume?: number        // Default video volume 0–1 (default: 0)
  darkMode?: 'class' | 'media'  // Dark detection for bgDarkSrc (default: 'class')
  features?: HeroFeatures       // Default: navigation, pagination, video, a11y on; parallax when gsap is installed
  cssLayer?: boolean            // Swiper CSS + hero.css in cascade layers hero-vendor, hero (default: false)
  /** @deprecated Ignored (logs a warning). Hero styles are plain CSS. */
  tailwind?: 'auto' | boolean
}
```

## HeroLabels

Localizable accessible labels for the built-in chrome. Pass them via
`<HeroSlider :labels>`, for example to provide Arabic strings in a bilingual app.
Any omitted key falls back to its English default. The full table is on the
[Accessibility](/accessibility#labels) page.

```ts
interface HeroLabels {
  carousel?: string         // Carousel region name (default: 'Carousel')
  carouselRole?: string     // Region aria-roledescription (default: 'carousel')
  slideRole?: string        // Slide aria-roledescription (default: 'slide')
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
  goToSlide?: string        // Per-dot label: {n} dot number, {total} dot count, {title} slide title (default: 'Go to slide {n}')
  autoplayProgress?: string // Active dot's progress ring (default: 'Autoplay progress')
  pauseAutoplay?: string    // Autoplay toggle, running (default: 'Pause autoplay')
  playAutoplay?: string     // Autoplay toggle, paused (default: 'Play autoplay')
  fullscreenEnter?: string  // Enter fullscreen (default: 'Enter fullscreen')
  fullscreenExit?: string   // Exit fullscreen (default: 'Exit fullscreen')
  videoProgress?: string    // Center play button's progress ring (default: 'Video progress')
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
