import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import type { HeroSlide, HeroVideoControlsConfig, ResolvedSlideConfig, SlideAnimation } from '../types'
import { isVideoSlide } from '../utils'

/**
 * Creates reactive slide state — active slide, per-slide config resolution,
 * video detection, and animation class computation.
 *
 * @param slides - Reactive array of slide definitions
 * @param activeIndex - Currently active slide index
 * @param previousIndex - Previously active slide index (for leave animations)
 * @param displayDefaults - Default visibility flags for UI controls
 * @param videoEnabled - Whether video backgrounds are enabled
 * @param enterAnimation - Default enter animation class
 * @param leaveAnimation - Default leave animation class
 * @returns Computed slide state and animation helpers
 */
export function createSlideState(
  slides: MaybeRefOrGetter<HeroSlide[]>,
  activeIndex: Ref<number>,
  previousIndex: Ref<number>,
  displayDefaults: MaybeRefOrGetter<{
    showPagination?: boolean
    showNavigation?: boolean
    showProgress?: boolean
    showVideoControls?: boolean
    showAutoplayToggle?: boolean
    videoControls?: HeroVideoControlsConfig
    watchMode?: boolean
    watchIdleMs?: number
  }>,
  videoEnabled = true,
  enterAnimation: MaybeRefOrGetter<string> = '',
  leaveAnimation: MaybeRefOrGetter<string> = '',
) {
  const activeSlide = computed<HeroSlide>(() => toValue(slides)[activeIndex.value] ?? { bgSrc: '' })

  const isActiveSlideVideo = computed(() => videoEnabled && isVideoSlide(activeSlide.value))

  /** Any slide's config: its own `config` over the slider-level defaults. */
  function getSlideConfig(index: number): ResolvedSlideConfig {
    const cfg = toValue(slides)[index]?.config ?? {}
    const defaults = toValue(displayDefaults)
    return {
      showPagination: cfg.showPagination ?? defaults.showPagination ?? true,
      showNavigation: cfg.showNavigation ?? defaults.showNavigation ?? true,
      showProgress: cfg.showProgress ?? defaults.showProgress ?? true,
      showVideoControls: cfg.showVideoControls ?? defaults.showVideoControls ?? true,
      showAutoplayToggle: cfg.showAutoplayToggle ?? defaults.showAutoplayToggle ?? false,
      videoControls: { ...defaults.videoControls, ...cfg.videoControls },
      videoLoop: cfg.videoLoop ?? false,
      pauseUntilVideoEnds: cfg.pauseUntilVideoEnds ?? false,
      mediaControlsOptions: cfg.mediaControlsOptions,
      watchMode: cfg.watchMode ?? defaults.watchMode ?? false,
      watchIdleMs: cfg.watchIdleMs ?? defaults.watchIdleMs ?? 10000,
    }
  }

  const activeSlideConfig = computed<ResolvedSlideConfig>(() => getSlideConfig(activeIndex.value))

  function resolveAnimation(index: number): SlideAnimation {
    const slide = toValue(slides)[index]
    return {
      enter: slide?.animation?.enter || toValue(enterAnimation) || undefined,
      leave: slide?.animation?.leave || toValue(leaveAnimation) || undefined,
    }
  }

  function animationClass(index: number): string {
    const anim = resolveAnimation(index)
    if (index === activeIndex.value && anim.enter) return anim.enter
    if (index === previousIndex.value && anim.leave) return anim.leave
    return ''
  }

  return {
    activeSlide,
    isActiveSlideVideo,
    activeSlideConfig,
    getSlideConfig,
    animationClass,
  }
}
