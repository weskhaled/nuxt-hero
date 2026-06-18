/**
 * Type-resolution smoke test for the public type surface of `nuxt-hero`.
 *
 * This file is type-only — it does not need vitest's runtime. Its purpose is to
 * fail `tsc` / `vue-tsc` if any named type export disappears from the package
 * root. Imports are resolved from `../src/module`, which is the published
 * entry point (same file consumers hit via `nuxt-hero`).
 *
 * Locals are declared as `export const` so TypeScript treats them as used
 * (this file is compiled as a module, never executed — exports are harmless).
 */

import type {
  HeroEnvironment,
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
export const _slide: HeroSlide = {
  bgSrc: '/hero.jpg',
  title: 'Welcome',
  animation: { enter: 'animate__fadeInUp', leave: 'animate__fadeOutDown' },
  config: { showPagination: true, videoLoop: false },
}
export const _bg: string = _slide.bgSrc

// ─── HeroModuleOptions + HeroFeatures + SwiperEffect ───
export const _modOpts: HeroModuleOptions = {
  prefix: 'Hero',
  features: { video: true, parallax: true, effects: ['fade', 'cube'] },
}
export const _features: HeroFeatures | undefined = _modOpts.features
export const _effect: SwiperEffect = 'fade'

// ─── SwiperOptions is an object type (re-exported from swiper/types) ───
type SwiperOptionsIsObject = SwiperOptions extends object ? true : false
export const _swiperOptsCheck: SwiperOptionsIsObject = true

// ─── UseHeroSliderOptions + UseHeroSliderReturn ───
export const _sliderOpts: UseHeroSliderOptions = { showPagination: true, swiperOptions: {} }
type NextIsFn = UseHeroSliderReturn['next'] extends () => void ? true : false
export const _nextCheck: NextIsFn = true

// ─── Overlay + Parallax + UI + resolved/slide configs ───
export const _overlayType: OverlayPatternType = 'lines'
export const _overlay: OverlayPattern = { type: 'dots', opacity: 0.2 }
export const _parallax: ParallaxConfig = { bg: true, speed: 0.125 }
export const _ui: HeroSliderUI = { root: 'relative', swiper: 'h-full' }
export const _resolved: ResolvedSlideConfig = {
  showPagination: true,
  showNavigation: true,
  showProgress: true,
  showVideoControls: true,
  videoLoop: false,
  pauseUntilVideoEnds: false,
  watchMode: false,
  watchIdleMs: 10000,
}
export const _slideCfg: SlideConfig = { showPagination: false }
export const _anim: SlideAnimation = { enter: 'animate__fadeIn' }

// ─── HeroSliderProps: slides required; slider + options optional (drop-in mode) ───
type PropsHasSlides = HeroSliderProps['slides'] extends HeroSlide[] ? true : false
export const _propsSlidesCheck: PropsHasSlides = true
// `slider` is optional — undefined is assignable (uncontrolled / drop-in usage).
type SliderIsOptional = undefined extends HeroSliderProps['slider'] ? true : false
export const _sliderOptionalCheck: SliderIsOptional = true
// `options` (uncontrolled-mode composable config) is part of the prop surface.
type OptionsIsUseHeroSliderOptions
  = NonNullable<HeroSliderProps['options']> extends UseHeroSliderOptions ? true : false
export const _propsOptionsCheck: OptionsIsUseHeroSliderOptions = true
// `dataSaver` accepts 'auto' | boolean (mobile/PWA lite mode).
export const _dataSaver: HeroSliderProps['dataSaver'] = 'auto'
// `imageSizes` is the @nuxt/image responsive-sizes passthrough (string DSL).
export const _imageSizes: HeroSliderProps['imageSizes'] = '100vw'
// `useHeroEnvironment()` return shape — `prefersDataSaver` is a boolean signal.
type EnvDataSaverIsBool = HeroEnvironment['prefersDataSaver'] extends { value: boolean } ? true : false
export const _envCheck: EnvDataSaverIsBool = true

// ─── VideoMediaControls + MediaControlsOptions ───
type VmcHasPlaying = VideoMediaControls extends { playing: infer _P } ? true : false
export const _vmcCheck: VmcHasPlaying = true
type McoIsObject = MediaControlsOptions extends object ? true : false
export const _mcoCheck: McoIsObject = true
