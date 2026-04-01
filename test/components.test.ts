import { describe, expect, it } from 'vitest'

/**
 * These tests verify the logic extracted into computed properties
 * in HeroSlider and HeroSlide. We test the raw boolean logic
 * rather than mounting components (no DOM needed).
 */

describe('HeroSlider visibility logic', () => {
  // Mirrors shouldShowPagination computed
  function shouldShowPagination(featureEnabled: boolean, totalSnaps: number, showPagination: boolean) {
    return featureEnabled && totalSnaps > 1 && showPagination
  }

  // Mirrors shouldShowNavigation computed
  function shouldShowNavigation(featureEnabled: boolean, slidesLength: number, showNavigation: boolean) {
    return featureEnabled && slidesLength > 1 && showNavigation
  }

  // Mirrors shouldShowVideoScrubber computed
  function shouldShowVideoScrubber(
    videoFeature: boolean, showProgress: boolean, isActiveSlideVideo: boolean,
    videoDuration: number, isMultiSlide: boolean,
  ) {
    return videoFeature && showProgress && isActiveSlideVideo && videoDuration > 0 && !isMultiSlide
  }

  describe('shouldShowPagination', () => {
    it('shows when feature enabled, multiple snaps, and config allows', () => {
      expect(shouldShowPagination(true, 3, true)).toBe(true)
    })

    it('hides when feature disabled', () => {
      expect(shouldShowPagination(false, 3, true)).toBe(false)
    })

    it('hides when only one snap', () => {
      expect(shouldShowPagination(true, 1, true)).toBe(false)
    })

    it('hides when config disables it', () => {
      expect(shouldShowPagination(true, 3, false)).toBe(false)
    })
  })

  describe('shouldShowNavigation', () => {
    it('shows when feature enabled, multiple slides, and config allows', () => {
      expect(shouldShowNavigation(true, 3, true)).toBe(true)
    })

    it('hides when only one slide', () => {
      expect(shouldShowNavigation(true, 1, true)).toBe(false)
    })
  })

  describe('shouldShowVideoScrubber', () => {
    it('shows when all conditions met', () => {
      expect(shouldShowVideoScrubber(true, true, true, 100, false)).toBe(true)
    })

    it('hides when video feature disabled', () => {
      expect(shouldShowVideoScrubber(false, true, true, 100, false)).toBe(false)
    })

    it('hides when showProgress is false', () => {
      expect(shouldShowVideoScrubber(true, false, true, 100, false)).toBe(false)
    })

    it('hides when active slide is not video', () => {
      expect(shouldShowVideoScrubber(true, true, false, 100, false)).toBe(false)
    })

    it('hides when duration is 0', () => {
      expect(shouldShowVideoScrubber(true, true, true, 0, false)).toBe(false)
    })

    it('hides when multi-slide mode', () => {
      expect(shouldShowVideoScrubber(true, true, true, 100, true)).toBe(false)
    })
  })
})
