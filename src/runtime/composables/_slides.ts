import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import type { HeroSlide, ResolvedSlideConfig, SlideAnimation } from '#hero/types'
import { isVideoUrl } from '#hero/utils'

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
  displayDefaults: {
    showPagination?: boolean
    showNavigation?: boolean
    showProgress?: boolean
    showVideoControls?: boolean
  },
  videoEnabled = true,
  enterAnimation = '',
  leaveAnimation = '',
) {
  const activeSlide = computed<HeroSlide>(() => toValue(slides)[activeIndex.value] ?? { bgSrc: '' })

  const isActiveSlideVideo = computed(() => {
    if (!videoEnabled) return false
    const slide = activeSlide.value
    return slide ? isVideoUrl(slide.bgSrc) : false
  })

  const activeSlideConfig = computed<ResolvedSlideConfig>(() => {
    const cfg = activeSlide.value?.config ?? {}
    return {
      showPagination: cfg.showPagination ?? displayDefaults.showPagination ?? true,
      showNavigation: cfg.showNavigation ?? displayDefaults.showNavigation ?? true,
      showProgress: cfg.showProgress ?? displayDefaults.showProgress ?? true,
      showVideoControls: cfg.showVideoControls ?? displayDefaults.showVideoControls ?? true,
      videoLoop: cfg.videoLoop ?? false,
      pauseUntilVideoEnds: cfg.pauseUntilVideoEnds ?? false,
      mediaControlsOptions: cfg.mediaControlsOptions,
    }
  })

  function resolveAnimation(index: number): SlideAnimation {
    const slide = toValue(slides)[index]
    return {
      enter: slide?.animation?.enter || enterAnimation || undefined,
      leave: slide?.animation?.leave || leaveAnimation || undefined,
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
    animationClass,
  }
}
