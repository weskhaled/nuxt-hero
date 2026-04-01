import { describe, expect, it } from 'vitest'
import { ref, nextTick } from 'vue'
import { createSlideState } from '../src/runtime/composables/_slides'
import type { HeroSlide } from '../src/runtime/types'

const makeSlides = (count = 3): HeroSlide[] =>
  Array.from({ length: count }, (_, i) => ({
    bgSrc: `https://example.com/img-${i}.jpg`,
    title: `Slide ${i}`,
  }))

describe('createSlideState', () => {
  it('activeSlide returns the slide at activeIndex', () => {
    const slides = makeSlides()
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { activeSlide } = createSlideState(() => slides, activeIndex, previousIndex, {})
    expect(activeSlide.value).toBe(slides[0])
  })

  it('activeSlide follows activeIndex changes', async () => {
    const slides = makeSlides()
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { activeSlide } = createSlideState(() => slides, activeIndex, previousIndex, {})
    activeIndex.value = 2
    await nextTick()
    expect(activeSlide.value).toBe(slides[2])
  })

  it('isActiveSlideVideo detects video URLs when videoEnabled', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'video.mp4' }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { isActiveSlideVideo } = createSlideState(() => slides, activeIndex, previousIndex, {}, true)
    expect(isActiveSlideVideo.value).toBe(true)
  })

  it('isActiveSlideVideo returns false for images', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'image.jpg' }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { isActiveSlideVideo } = createSlideState(() => slides, activeIndex, previousIndex, {}, true)
    expect(isActiveSlideVideo.value).toBe(false)
  })

  it('isActiveSlideVideo returns false when videoEnabled is false', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'video.mp4' }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { isActiveSlideVideo } = createSlideState(() => slides, activeIndex, previousIndex, {}, false)
    expect(isActiveSlideVideo.value).toBe(false)
  })

  it('activeSlideConfig uses per-slide config overrides', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'a.jpg', config: { showPagination: false } }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { activeSlideConfig } = createSlideState(() => slides, activeIndex, previousIndex, { showPagination: true })
    expect(activeSlideConfig.value.showPagination).toBe(false)
  })

  it('activeSlideConfig falls back to display defaults', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'a.jpg' }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { activeSlideConfig } = createSlideState(() => slides, activeIndex, previousIndex, { showNavigation: false })
    expect(activeSlideConfig.value.showNavigation).toBe(false)
  })

  it('animationClass returns enter animation for active slide', () => {
    const slides: HeroSlide[] = [
      { bgSrc: 'a.jpg', animation: { enter: 'fadeIn' } },
      { bgSrc: 'b.jpg' },
    ]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { animationClass } = createSlideState(() => slides, activeIndex, previousIndex, {}, true, 'defaultEnter')
    expect(animationClass(0)).toBe('fadeIn')
  })

  it('animationClass falls back to global enter animation', () => {
    const slides: HeroSlide[] = [{ bgSrc: 'a.jpg' }]
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { animationClass } = createSlideState(() => slides, activeIndex, previousIndex, {}, true, 'globalEnter')
    expect(animationClass(0)).toBe('globalEnter')
  })

  it('animationClass returns empty for non-active non-previous', () => {
    const slides = makeSlides()
    const activeIndex = ref(0)
    const previousIndex = ref(-1)
    const { animationClass } = createSlideState(() => slides, activeIndex, previousIndex, {})
    expect(animationClass(2)).toBe('')
  })
})
