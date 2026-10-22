import type { SwiperOptions } from 'swiper/types'
import type { useMediaControls } from '@vueuse/core'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

type UseMediaControlsOptions = NonNullable<Parameters<typeof useMediaControls>[1]>
/**
 * Extracted from VueUse's useMediaControls second parameter. An interface (not
 * a bare alias) so declaration emit can name it — VueUse doesn't export its own
 * `UseMediaControlsOptions`, and the alias would otherwise inline to it (TS4023)
 * and drop the .d.ts of every component whose props use it.
 */
export interface MediaControlsOptions extends UseMediaControlsOptions {}

// ─── Feature Config ───

export type SwiperEffect = 'fade' | 'cube' | 'coverflow' | 'creative' | 'cards' | 'flip'

export interface HeroFeatures {
  navigation?: boolean
  pagination?: boolean
  mousewheel?: boolean
  keyboard?: boolean
  a11y?: boolean
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
  /** GSAP scroll-based parallax (ScrollTrigger) */
  parallax?: boolean
  /** Swiper slide-transition parallax module */
  swiperParallax?: boolean
  /** Video backgrounds + useMediaControls */
  video?: boolean
  /** HLS streaming (lazy hls.js import). Requires video: true */
  hls?: boolean
}

// ─── Accessibility labels (localizable) ───

/**
 * Overridable `aria-label`s for the built-in chrome. Pass via `<HeroSlider :labels>`
 * to localize (e.g. Arabic in a bilingual app). Any omitted key falls back to its
 * English default.
 */
export interface HeroLabels {
  /** Accessible name for the carousel region (aria-label). Default: 'Carousel' */
  carousel?: string
  /** Previous-slide navigation button */
  prev?: string
  /** Next-slide navigation button */
  next?: string
  /** Play button (video) */
  play?: string
  /** Pause button (video) */
  pause?: string
  /** Mute toggle (video) */
  mute?: string
  /** Volume slider (video) */
  volume?: string
  /** Seek scrubber (video) */
  seek?: string
  /** Settings / playback-speed button (video) */
  settings?: string
  /** Playback-speed menu heading. Default: 'Playback speed' */
  speed?: string
  /** The 1× playback-speed option. Default: 'Normal' */
  speedNormal?: string
  /** Pagination nav landmark. Default: 'Slide pagination' */
  pagination?: string
  /** Per-dot label — `{n}` is replaced with the 1-based slide number. Default: 'Go to slide {n}' */
  goToSlide?: string
  /** Enter-fullscreen button (video) */
  fullscreenEnter?: string
  /** Exit-fullscreen button (video) */
  fullscreenExit?: string
}

// ─── Animation ───

/**
 * Built-in content presets — put one on any element inside a slide:
 * `<h1 data-hero-animate="clip-up">`. Movement presets name the direction of
 * travel (`fade-up` rises into place); `slide` follows the navigation direction.
 */
export type HeroAnimatePreset =
  | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'slide'
  | 'zoom-in' | 'zoom-out' | 'blur-in'
  | 'clip-up' | 'clip-left' | 'clip-right'
  | 'flip-up' | 'rotate-in'

/** Navigation direction of the latest slide change. */
export type HeroSlideDirection = 'next' | 'prev'

/**
 * Timing for `data-hero-animate` elements. Every value maps to a CSS custom
 * property (in brackets), so it can also be set in CSS — down to a single
 * element: `style="--hero-anim-delay: 300ms"`.
 */
export interface HeroAnimateTiming {
  /** Enter duration per element in ms (`--hero-anim-duration`). Default: 700 */
  duration?: number
  /** Delay between consecutive elements in ms (`--hero-anim-stagger`). Default: 90 */
  stagger?: number
  /** Delay before the first element in ms (`--hero-anim-delay`). Default: 0 */
  delay?: number
  /** CSS easing (`--hero-anim-easing`). Default: `cubic-bezier(0.22, 1, 0.36, 1)` */
  easing?: string
  /** Travel distance of the movement presets, any CSS length (`--hero-anim-distance`). Default: `1.5rem` */
  distance?: string
  /** Leave duration in ms (`--hero-anim-leave-duration`). Default: 300 */
  leaveDuration?: number
}

export interface HeroAnimationContext {
  /** Index of the slide entering / leaving */
  index: number
  /** Direction of the slide change */
  direction: HeroSlideDirection
  /** True for the first slide's entrance when the slider mounts */
  initial: boolean
  /** The user prefers reduced motion — skip or shorten the animation */
  reducedMotion: boolean
}

/**
 * Anything a hook can hand back to be stopped when the slide changes again:
 * a Web Animations `Animation` (`cancel`), a GSAP tween/timeline (`kill`), or
 * a cleanup function.
 */
export type HeroAnimationHandle = { cancel: () => void } | { kill: () => void } | (() => void)

/** Custom animation hook — receives the slide's content element. */
export type HeroAnimationHook = (el: HTMLElement, ctx: HeroAnimationContext) => HeroAnimationHandle | void

export interface HeroAnimateOptions extends HeroAnimateTiming {
  /**
   * The first slide's entrance: `true` plays it on load (from CSS, before
   * hydration), `false` shows the content statically, `'visible'` waits until
   * the slider scrolls into view (content stays hidden until JS runs — use it
   * for sliders below the fold). Default: true
   */
  initial?: boolean | 'visible'
  /** Runs when a slide becomes active (JS animation engines: WAAPI, GSAP, …) */
  onEnter?: HeroAnimationHook
  /** Runs when a slide stops being active */
  onLeave?: HeroAnimationHook
}

export interface SlideAnimation extends HeroAnimateTiming {
  /** Class for the content block entering, e.g. 'hero-animated hero-fadeIn' or animate.css classes */
  enter?: string
  /** Class for the content block leaving, e.g. 'animate__animated animate__fadeOutDown' */
  leave?: string
  /** Per-slide enter hook (overrides `animate.onEnter`) */
  onEnter?: HeroAnimationHook
  /** Per-slide leave hook (overrides `animate.onLeave`) */
  onLeave?: HeroAnimationHook
}

// ─── Slide Config ───

export interface SlideConfig {
  /** Show pagination dots when this slide is active. Default: inherited from HeroSliderProps */
  showPagination?: boolean
  /** Show navigation arrows when this slide is active. Default: inherited from HeroSliderProps */
  showNavigation?: boolean
  /** Show progress bar / video scrubber when this slide is active. Default: inherited from HeroSliderProps */
  showProgress?: boolean
  /** Show video controls when this slide is active (video slides only). Default: inherited from HeroSliderProps */
  showVideoControls?: boolean
  /** Loop video playback. When false, auto-advances to next slide on video end. Default: false */
  videoLoop?: boolean
  /**
   * Pause the autoplay timer while a video background plays, and advance only
   * when the video ends. When false (default), autoplay timer keeps ticking
   * during video playback — the next slide is decided by the timer, not the video.
   * Has no effect if `videoLoop: true`. Default: false
   */
  pauseUntilVideoEnds?: boolean
  /** VueUse useMediaControls options passed through to the video element. @see https://vueuse.org/core/useMediaControls/ */
  mediaControlsOptions?: MediaControlsOptions
  /**
   * Watch mode — when active and this slide is a video, fade out content,
   * overlay patterns, and the centered play button; slide out the video
   * controls after `watchIdleMs` of mouse inactivity. Default: inherited
   * from HeroSliderProps.watchMode
   */
  watchMode?: boolean
  /** Idle timeout in ms before watch mode kicks in. Default: inherited from HeroSliderProps.watchIdleMs (10000) */
  watchIdleMs?: number
}

/** Resolved slide config with boolean defaults applied */
export interface ResolvedSlideConfig {
  showPagination: boolean
  showNavigation: boolean
  showProgress: boolean
  showVideoControls: boolean
  videoLoop: boolean
  pauseUntilVideoEnds: boolean
  mediaControlsOptions?: MediaControlsOptions
  watchMode: boolean
  watchIdleMs: number
}

// ─── Slide ───

export interface HeroSlide {
  /** Background image or video URL (auto-detected from extension) */
  bgSrc: string
  /** Dark-mode alternative (falls back to bgSrc) */
  bgDarkSrc?: string
  /** Thumbnail for pagination tooltip / navigation preview */
  thumbSrc?: string
  /** Slide title (used in nav-slit preview) */
  title?: string
  /** Poster frame for video backgrounds */
  poster?: string
  /** Per-slide animation config (overrides global enterAnimation/leaveAnimation) */
  animation?: SlideAnimation
  /** Per-slide display & media config (overrides global HeroSliderProps defaults) */
  config?: SlideConfig
  /** Any extra data the consumer needs in the slot */
  [key: string]: unknown
}

// ─── Overlay ───

export type OverlayPatternType = 'lines' | 'dots' | 'gradient' | 'custom'

export interface OverlayPattern {
  /** Pattern type */
  type: OverlayPatternType
  /** Pattern opacity (0-1). Default: 0.15 */
  opacity?: number
  /** Pattern color. Default: 'black' */
  color?: string
  /** Custom CSS background-image value (only for type: 'custom') */
  css?: string
}

// ─── Parallax ───

export interface ParallaxConfig {
  /** Enable parallax on background image/video. Default: true */
  bg?: boolean
  /** Enable parallax on content container. Default: true */
  content?: boolean
  /** Parallax speed multiplier. Default: 0.125 */
  speed?: number
  /** Minimum opacity percentage (0-1). Default: 0.7 */
  minOpacity?: number
}

// ─── UI Customization ───

export interface HeroSliderUI {
  /** Root wrapper element */
  root?: string
  /** Swiper container */
  swiper?: string
  /** Each SwiperSlide */
  slide?: string
  /** Slide inner container (.hero-slide) */
  container?: string
  /** Slide background layer (.hero-slide-bg) */
  bg?: string
  /** UI controls overlay layer (pagination, navigation, progress) */
  controls?: string
  /** Autoplay progress bar track */
  progress?: string
}

// ─── Environment (mobile / PWA adaptiveness) ───

/**
 * Reactive, SSR-safe client-environment signals returned by `useHeroEnvironment()`.
 * Every flag is `false`/empty on the server and during the first client render,
 * then settles to its real value after mount — safe to drive rendering with.
 */
export interface HeroEnvironment {
  /** True once the component has mounted on the client. */
  mounted: Ref<boolean>
  /** `prefers-reduced-motion: reduce`. */
  reducedMotion: ComputedRef<boolean>
  /** `prefers-reduced-data: reduce`. */
  reducedData: ComputedRef<boolean>
  /** `pointer: coarse` — touch-primary device. */
  coarsePointer: ComputedRef<boolean>
  /** `navigator.connection.saveData` (Save-Data). */
  saveData: ComputedRef<boolean>
  /** Effective connection type is `2g` / `slow-2g`. */
  slowConnection: ComputedRef<boolean>
  /** Raw `navigator.connection.effectiveType` (`'4g'`, `'3g'`, …) or `''`. */
  effectiveType: ComputedRef<string>
  /**
   * Data-/battery-constrained client → drives the slider's lite mode. True when
   * Save-Data, `prefers-reduced-data`, or a slow connection is detected.
   */
  prefersDataSaver: ComputedRef<boolean>
}

// ─── Component Props ───

export interface HeroSliderProps {
  /** Array of slides */
  slides: HeroSlide[]
  /**
   * Composable return value — makes `<HeroSlider>` a *controlled* component.
   *
   * **Optional.** Omit it for the drop-in / *uncontrolled* mode: the component
   * creates its own `useHeroSlider()` internally (configured via the `options`
   * prop) and exposes it on a template ref (`heroRef.value?.slider`). Pass your
   * own when you need to drive the slider from the parent (external nav buttons,
   * synced state, multiple control surfaces).
   */
  slider?: UseHeroSliderReturn
  /**
   * Composable options for the *uncontrolled* mode (Swiper config, animations,
   * display defaults). Ignored when a `slider` prop is supplied — configure the
   * controlled instance through `useHeroSlider()` instead.
   */
  options?: UseHeroSliderOptions
  /** Default animation class for content entering */
  enterAnimation?: string
  /** Default animation class for content leaving */
  leaveAnimation?: string
  /** Stacked overlay patterns on top of each slide background */
  overlayPatterns?: OverlayPattern[]
  /** Parallax config - pass false to disable, true for defaults, object for fine control */
  parallax?: MaybeRefOrGetter<boolean | ParallaxConfig>
  /** @nuxt/image preset name for slide backgrounds */
  imagePreset?: string
  /**
   * `@nuxt/image` `sizes` for slide backgrounds — drives a responsive `srcset`
   * so small screens download a smaller image (a mobile/PWA win). **Off by
   * default** (`''`): a single preset-width `src` is emitted, unchanged. Set
   * `'100vw'` for a full-bleed hero **when your `@nuxt/image` provider can
   * transform widths** (e.g. ipx, Cloudinary, a Supabase-render provider) —
   * otherwise the provider returns the same URL per width and the srcset is
   * degenerate (harmless but pointless).
   *
   * ⚠️ This is `@nuxt/image`'s key:value DSL, **not** CSS `sizes` syntax. Use
   * `'100vw'` or breakpoint keys like `'xs:100vw md:100vw lg:100vw'`. Passing CSS
   * media-query syntax (`'(min-width: 1024px) 1024px, 100vw'`) mis-parses and
   * collapses the rendered width to ~1px.
   */
  imageSizes?: string
  /** Wrapper element tag. Default: 'div' */
  as?: string
  /** Class overrides for internal elements (Nuxt UI-style) */
  ui?: HeroSliderUI
  /** Localizable aria-labels for the built-in navigation + video controls */
  labels?: HeroLabels
  /**
   * Adaptive "lite mode" for constrained mobile / PWA clients. When active,
   * video backgrounds don't autoplay or preload (the poster shows, tap to play)
   * and scroll parallax is skipped — saving cellular data, CPU and battery.
   * - `'auto'` (default): follow the client environment (Save-Data /
   *   `prefers-reduced-data` / slow connection) via `useHeroEnvironment()`.
   * - `true`: always lite. `false`: never lite (always autoplay + parallax).
   */
  dataSaver?: 'auto' | boolean
}

// ─── Composable Options ───

export interface UseHeroSliderOptions {
  /**
   * Swiper configuration passed through to the `<Swiper>` component.
   *
   * Every standard Swiper option is accepted — `slidesPerView`, `spaceBetween`,
   * `centeredSlides`, `loop`, `effect`, `speed`, `breakpoints`, etc.
   *
   * **Autoplay:** The `autoplay.delay` value configures the built-in progress
   * timer (default 5000ms). Swiper's native autoplay is always disabled;
   * the composable manages slide advancement and progress tracking internally.
   *
   * **Mousewheel:** Set `mousewheel: true` (or an options object) and the
   * Mousewheel Swiper module is auto-registered — no manual import needed.
   *
   * **Vertical direction:** Set `direction: 'vertical'` and the UI adapts:
   * - Pagination moves to the side (right in LTR, left in RTL)
   * - Navigation: prev on top, next on bottom
   * - Progress bar renders vertically on the side
   */
  swiperOptions?: SwiperOptions
  enterAnimation?: string
  leaveAnimation?: string
  /**
   * Content choreography for `data-hero-animate` elements: timing defaults and
   * JS hooks. Accepts a ref / getter / reactive object for live tuning.
   * Per-slide `slide.animation` values override these.
   */
  animate?: MaybeRefOrGetter<HeroAnimateOptions | undefined>
  /** Show pagination dots. Default: true. Can be overridden per-slide via slide.config */
  showPagination?: boolean
  /** Show navigation arrows. Default: true. Can be overridden per-slide via slide.config */
  showNavigation?: boolean
  /** Show progress bar / video scrubber. Default: true. Can be overridden per-slide via slide.config */
  showProgress?: boolean
  /** Show video controls overlay. Default: true. Can be overridden per-slide via slide.config */
  showVideoControls?: boolean
  /** Watch mode default. Default: false. Can be overridden per-slide via slide.config */
  watchMode?: boolean
  /** Watch idle timeout (ms) default. Default: 10000. Can be overridden per-slide via slide.config */
  watchIdleMs?: number
}

// ─── Composable Return ───

export interface UseHeroSliderReturn {
  // ─── Navigation ───
  next: () => void
  prev: () => void
  goTo: (index: number) => void

  // ─── Slide State ───
  activeIndex: Ref<number>
  snapIndex: Ref<number>
  totalSnaps: Ref<number>
  activeSlide: ComputedRef<HeroSlide>
  activeSlideConfig: ComputedRef<ResolvedSlideConfig>
  isActiveSlideVideo: ComputedRef<boolean>
  /** True when slidesPerView > 1 (or 'auto') — disables content animations */
  isMultiSlide: ComputedRef<boolean>
  animationClass: (index: number) => string
  /** Index of the previously active slide (-1 before the first change) */
  previousIndex: Readonly<Ref<number>>
  /** Direction of the latest slide change — drives direction-aware animations */
  direction: Readonly<Ref<HeroSlideDirection>>
  /** Resolved `animate` options (reactive) */
  animateOptions: ComputedRef<HeroAnimateOptions>
  /** Restart the active slide's content animation (presets + `onEnter` hook) */
  replayAnimation: () => void
  /** True for the two frames a replay holds the active slide in its hidden state */
  animationReplaying: Readonly<Ref<boolean>>
  /** Whether the slider is within the viewport */
  isVisible: Readonly<Ref<boolean>>

  // ─── Autoplay ───
  autoplayEnabled: boolean
  autoplayProgress: ComputedRef<number>
  autoplayRemaining: ComputedRef<number>
  autoplayDelay: Ref<number>
  autoplayPaused: Ref<boolean>
  autoplayPause: () => void
  autoplayResume: () => void
  autoplayReset: () => void
  autoplaySetDelay: (ms: number) => void

  // ─── Video ───
  videoPlaying: ComputedRef<boolean>
  videoCurrentTime: ComputedRef<number>
  videoDuration: ComputedRef<number>
  videoBuffered: ComputedRef<number>
  videoVolume: ComputedRef<number>
  videoMuted: ComputedRef<boolean>
  videoWaiting: ComputedRef<boolean>
  videoEnded: ComputedRef<boolean>
  videoToggle: () => void
  videoSeek: (time: number) => void
  /** Call when scrubber drag starts — pauses video, remembers play state */
  videoScrubStart: () => void
  /** Call when scrubber drag ends — resumes if was playing before scrub */
  videoScrubEnd: () => void
  videoSetVolume: (v: number) => void
  videoToggleMute: () => void

  // ─── Hover ───
  isHovered: Ref<boolean>

  // ─── Container ───
  containerEl: ComputedRef<HTMLElement | null>

  // ─── Swiper Options (merged, for HeroSlider component) ───
  mergedSwiperOptions: ComputedRef<Record<string, unknown>>

  // ─── Internal Bindings (for HeroSlider component) ───
  onSwiper: (swiper: any) => void
  onSlideChange: () => void
  registerSlideVideo: (index: number, controls: VideoMediaControls) => void
  unregisterSlideVideo: (index: number) => void
}

// ─── Video Media Controls ───

export interface VideoMediaControls {
  playing: Ref<boolean>
  currentTime: Ref<number>
  duration: Ref<number>
  buffered: Ref<[number, number][]>
  volume: Ref<number>
  muted: Ref<boolean>
  waiting: Ref<boolean>
  ended: Ref<boolean>
  /** Playback rate (1 = normal). Drives the speed menu in the video controls. */
  rate: Ref<number>
}
