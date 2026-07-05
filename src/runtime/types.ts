import type { SwiperOptions } from 'swiper/types'
import type { useMediaControls } from '@vueuse/core'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'

/** Extracted from VueUse's useMediaControls second parameter */
export type MediaControlsOptions = NonNullable<Parameters<typeof useMediaControls>[1]>

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

export interface SlideAnimation {
  /** animate.css class for content entering. e.g. 'animate__fadeInUp' */
  enter?: string
  /** animate.css class for content leaving. e.g. 'animate__fadeOutDown' */
  leave?: string
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
