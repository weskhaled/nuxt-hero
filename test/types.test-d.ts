/**
 * Type-resolution smoke test for the public type surface of `nuxt-hero`.
 *
 * This file is type-only — it does not need vitest's runtime. Its purpose is to
 * fail `tsc` / `vue-tsc` if any named type export disappears from the package
 * root. Imports are resolved from `../src/module`, which is the published
 * entry point (same file consumers hit via `nuxt-hero`).
 */

import type {
  HeroFeatures,
  HeroModuleOptions,
  HeroSlide,
  HeroSliderProps,
  HeroSliderUI,
  MediaControlsOptions,
  OverlayPattern,
  OverlayPatternType,
  ParallaxConfig,
  ResolvedSlideConfig,
  SlideAnimation,
  SlideConfig,
  SwiperEffect,
  SwiperOptions,
  UseHeroSliderOptions,
  UseHeroSliderReturn,
  VideoMediaControls,
} from '../src/module'

// ─── HeroSlide shape ───
const slide: HeroSlide = {
  bgSrc: '/hero.jpg',
  title: 'Welcome',
  animation: { enter: 'animate__fadeInUp', leave: 'animate__fadeOutDown' },
  config: { showPagination: true, videoLoop: false },
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _bg: string = slide.bgSrc

// ─── HeroModuleOptions + HeroFeatures + SwiperEffect ───
const modOpts: HeroModuleOptions = {
  prefix: 'Hero',
  features: { video: true, parallax: true, effects: ['fade', 'cube'] },
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _features: HeroFeatures | undefined = modOpts.features
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _effect: SwiperEffect = 'fade'

// ─── SwiperOptions is an object type (re-exported from swiper/types) ───
type SwiperOptionsIsObject = SwiperOptions extends object ? true : false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _swiperOptsCheck: SwiperOptionsIsObject = true

// ─── UseHeroSliderOptions + UseHeroSliderReturn ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _sliderOpts: UseHeroSliderOptions = { showPagination: true, swiperOptions: {} }
type NextIsFn = UseHeroSliderReturn['next'] extends () => void ? true : false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _nextCheck: NextIsFn = true

// ─── Overlay + Parallax + UI + resolved/slide configs ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _overlayType: OverlayPatternType = 'lines'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _overlay: OverlayPattern = { type: 'dots', opacity: 0.2 }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _parallax: ParallaxConfig = { bg: true, speed: 0.125 }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ui: HeroSliderUI = { root: 'relative', swiper: 'h-full' }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _resolved: ResolvedSlideConfig = {
  showPagination: true,
  showNavigation: true,
  showProgress: true,
  showVideoControls: true,
  videoLoop: false,
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _slideCfg: SlideConfig = { showPagination: false }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _anim: SlideAnimation = { enter: 'animate__fadeIn' }

// ─── HeroSliderProps requires slides + slider ───
type PropsHasSlides = HeroSliderProps['slides'] extends HeroSlide[] ? true : false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _propsSlidesCheck: PropsHasSlides = true

// ─── VideoMediaControls + MediaControlsOptions ───
type VmcHasPlaying = VideoMediaControls extends { playing: infer _P } ? true : false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _vmcCheck: VmcHasPlaying = true
type McoIsObject = MediaControlsOptions extends object ? true : false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _mcoCheck: McoIsObject = true
