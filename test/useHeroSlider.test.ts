import { describe, expect, it, vi } from 'vitest'

vi.mock('@vueuse/core', () => ({
  useElementHover: () => {
    const { ref } = require('vue')
    return ref(false)
  },
  useIntervalFn: (cb: () => void, interval: number, opts?: { immediate?: boolean }) => {
    let id: ReturnType<typeof setInterval> | null = null
    if (opts?.immediate) id = setInterval(cb, interval)
    return {
      pause: () => { if (id) { clearInterval(id); id = null } },
      resume: () => { if (!id) id = setInterval(cb, interval) },
    }
  },
}))

import { ref } from 'vue'
import { useHeroSlider } from '../src/runtime/composables/useHeroSlider'
import type { HeroSlide } from '../src/runtime/types'

const makeSlides = (count = 3): HeroSlide[] =>
  Array.from({ length: count }, (_, i) => ({
    bgSrc: `https://example.com/img-${i}.jpg`,
    title: `Slide ${i}`,
  }))

describe('useHeroSlider (new flat API)', () => {
  it('returns navigation functions at top level', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(typeof slider.next).toBe('function')
    expect(typeof slider.prev).toBe('function')
    expect(typeof slider.goTo).toBe('function')
  })

  it('returns slide state', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(slider.activeIndex.value).toBe(0)
    expect(slider.snapIndex.value).toBe(0)
    expect(slider.activeSlide.value).toEqual(makeSlides()[0])
    expect(typeof slider.animationClass).toBe('function')
    expect(slider.isActiveSlideVideo.value).toBe(false)
  })

  it('returns autoplay state', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(slider.autoplayEnabled).toBe(true)
    expect(slider.autoplayProgress.value).toBe(0)
    expect(slider.autoplayRemaining.value).toBe(5000)
    expect(slider.autoplayDelay.value).toBe(5000)
    expect(slider.autoplayPaused.value).toBe(false)
    expect(typeof slider.autoplayPause).toBe('function')
    expect(typeof slider.autoplayResume).toBe('function')
    expect(typeof slider.autoplayReset).toBe('function')
    expect(typeof slider.autoplaySetDelay).toBe('function')
  })

  it('returns video state with safe defaults', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(slider.videoPlaying.value).toBe(false)
    expect(slider.videoCurrentTime.value).toBe(0)
    expect(slider.videoDuration.value).toBe(0)
    expect(slider.videoBuffered.value).toBe(0)
    expect(slider.videoVolume.value).toBe(0)
    expect(slider.videoMuted.value).toBe(false)
    expect(slider.videoWaiting.value).toBe(false)
    expect(slider.videoEnded.value).toBe(false)
    expect(typeof slider.videoToggle).toBe('function')
    expect(typeof slider.videoSeek).toBe('function')
    expect(typeof slider.videoSetVolume).toBe('function')
    expect(typeof slider.videoToggleMute).toBe('function')
  })

  it('returns internal bindings', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(typeof slider.onSwiper).toBe('function')
    expect(typeof slider.onSlideChange).toBe('function')
    expect(typeof slider.registerSlideVideo).toBe('function')
    expect(typeof slider.unregisterSlideVideo).toBe('function')
  })

  it('returns mergedSwiperOptions with defaults and autoplay disabled', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides(), {
      swiperOptions: { spaceBetween: 20, autoplay: { delay: 3000 } } as any,
    })
    const opts = slider.mergedSwiperOptions.value
    expect(opts.slidesPerView).toBe(1)
    expect(opts.spaceBetween).toBe(20)
    expect(opts.grabCursor).toBe(true)
    expect(opts.autoplay).toBe(false)
  })

  it('isMultiSlide is false when slidesPerView is 1 (default)', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    expect(slider.isMultiSlide.value).toBe(false)
  })

  it('isMultiSlide is true when slidesPerView > 1', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides(), {
      swiperOptions: { slidesPerView: 3 } as any,
    })
    expect(slider.isMultiSlide.value).toBe(true)
  })

  it('isMultiSlide is true when slidesPerView is auto', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides(), {
      swiperOptions: { slidesPerView: 'auto' } as any,
    })
    expect(slider.isMultiSlide.value).toBe(true)
  })

  it('animationClass returns empty string when isMultiSlide', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides(), {
      swiperOptions: { slidesPerView: 3 } as any,
      enterAnimation: 'animate__fadeIn',
    })
    expect(slider.animationClass(0)).toBe('')
  })

  it('autoplayPause/Resume work', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    slider.autoplayPause()
    expect(slider.autoplayPaused.value).toBe(true)
    slider.autoplayResume()
    expect(slider.autoplayPaused.value).toBe(false)
  })

  it('autoplaySetDelay updates delay', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    slider.autoplaySetDelay(10000)
    expect(slider.autoplayDelay.value).toBe(10000)
  })

  it('video registration populates video refs', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    const mockControls = {
      playing: ref(true),
      currentTime: ref(10),
      duration: ref(100),
      buffered: ref([[0, 50]] as [number, number][]),
      volume: ref(0.8),
      muted: ref(false),
      waiting: ref(false),
      ended: ref(false),
    }
    slider.registerSlideVideo(0, mockControls)
    expect(slider.videoPlaying.value).toBe(true)
    expect(slider.videoCurrentTime.value).toBe(10)
    expect(slider.videoDuration.value).toBe(100)
    expect(slider.videoBuffered.value).toBe(50)
    expect(slider.videoVolume.value).toBe(0.8)
  })

  it('videoToggle toggles playback', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    const controls = {
      playing: ref(false),
      currentTime: ref(0),
      duration: ref(100),
      buffered: ref([] as [number, number][]),
      volume: ref(0),
      muted: ref(false),
      waiting: ref(false),
      ended: ref(false),
    }
    slider.registerSlideVideo(0, controls)
    slider.videoToggle()
    expect(controls.playing.value).toBe(true)
  })

  it('navigation delegates to swiper', () => {
    const container = ref<HTMLElement | null>(null)
    const slider = useHeroSlider(container, makeSlides())
    const mock = { activeIndex: 0, snapIndex: 0, snapGrid: [0, 1, 2], slideNext: vi.fn(), slidePrev: vi.fn(), slideTo: vi.fn() }
    slider.onSwiper(mock)
    slider.next()
    expect(mock.slideNext).toHaveBeenCalled()
    slider.goTo(2)
    expect(mock.slideTo).toHaveBeenCalledWith(2)
  })
})
