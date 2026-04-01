import { describe, expect, it, vi } from 'vitest'
import { createSwiperState } from '../src/runtime/composables/_swiper'
import type { HeroSlide } from '../src/runtime/types'

const makeSlides = (count = 3): HeroSlide[] =>
  Array.from({ length: count }, (_, i) => ({
    bgSrc: `https://example.com/img-${i}.jpg`,
    title: `Slide ${i}`,
  }))

describe('createSwiperState', () => {
  it('initializes with activeIndex 0', () => {
    const { activeIndex } = createSwiperState(() => makeSlides())
    expect(activeIndex.value).toBe(0)
  })

  it('initializes snapIndex 0 and totalSnaps 1', () => {
    const { snapIndex, totalSnaps } = createSwiperState(() => makeSlides())
    expect(snapIndex.value).toBe(0)
    expect(totalSnaps.value).toBe(1)
  })

  it('onSwiper stores instance and updates snap info', () => {
    const { swiperInstance, snapIndex, totalSnaps, onSwiper } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 0, snapIndex: 1, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    expect(swiperInstance.value).toBe(mock)
    expect(snapIndex.value).toBe(1)
    expect(totalSnaps.value).toBe(3)
  })

  it('onSlideChange updates activeIndex and snapIndex', () => {
    const { activeIndex, snapIndex, onSwiper, onSlideChange } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 2, snapIndex: 2, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    onSlideChange()
    expect(activeIndex.value).toBe(2)
    expect(snapIndex.value).toBe(2)
  })

  it('next() calls slideNext when not at last snap', () => {
    const { onSwiper, next } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 0, snapIndex: 0, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    next()
    expect(mock.slideNext).toHaveBeenCalled()
  })

  it('next() wraps to 0 at last snap', () => {
    const { onSwiper, onSlideChange, next } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 2, snapIndex: 2, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    onSlideChange()
    next()
    expect(mock.slideTo).toHaveBeenCalledWith(0)
  })

  it('prev() calls slidePrev when not at first slide', () => {
    const { onSwiper, onSlideChange, prev } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 1, snapIndex: 1, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    onSlideChange()
    prev()
    expect(mock.slidePrev).toHaveBeenCalled()
  })

  it('prev() wraps to last slide from index 0', () => {
    const { onSwiper, prev } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 0, snapIndex: 0, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    prev()
    expect(mock.slideTo).toHaveBeenCalledWith(2)
  })

  it('goTo() delegates to swiper.slideTo', () => {
    const { onSwiper, goTo } = createSwiperState(() => makeSlides())
    const mock = { activeIndex: 0, snapIndex: 0, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    onSwiper(mock)
    goTo(1)
    expect(mock.slideTo).toHaveBeenCalledWith(1)
  })

  it('navigation methods are no-ops without swiper instance', () => {
    const { next, prev, goTo } = createSwiperState(() => makeSlides())
    expect(() => { next(); prev(); goTo(1) }).not.toThrow()
  })
})
