import { describe, expect, it, vi } from 'vitest'
import { ref, computed } from 'vue'

// Mock @vueuse/core. The rAF loop is a no-op in tests (these specs assert
// initial state + pause/resume/reset/setDelay, not real-time ticking).
vi.mock('@vueuse/core', () => {
  const { ref } = require('vue')
  return {
    useRafFn: (_cb: () => void, _opts?: { immediate?: boolean }) => ({
      pause: () => {},
      resume: () => {},
    }),
    useDocumentVisibility: () => ref('visible'),
    useMediaQuery: () => ref(false),
  }
})

import { createAutoplayState } from '../src/runtime/composables/_autoplay'

describe('createAutoplayState', () => {
  it('starts enabled with default delay', () => {
    const { autoplayEnabled, autoplayDelay, autoplayPaused } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    expect(autoplayEnabled).toBe(true)
    expect(autoplayDelay.value).toBe(5000)
    expect(autoplayPaused.value).toBe(false)
  })

  it('reads delay from swiperOptions.autoplay.delay', () => {
    const { autoplayDelay } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false),
      { swiperOptions: { autoplay: { delay: 8000 } } }
    )
    expect(autoplayDelay.value).toBe(8000)
  })

  it('disables when autoplay is false', () => {
    const { autoplayEnabled, autoplayPaused } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false),
      { swiperOptions: { autoplay: false } }
    )
    expect(autoplayEnabled).toBe(false)
    expect(autoplayPaused.value).toBe(true)
  })

  it('autoplayPause sets paused to true', () => {
    const { autoplayPaused, autoplayPause } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    autoplayPause()
    expect(autoplayPaused.value).toBe(true)
  })

  it('autoplayResume sets paused to false', () => {
    const { autoplayPaused, autoplayPause, autoplayResume } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    autoplayPause()
    autoplayResume()
    expect(autoplayPaused.value).toBe(false)
  })

  it('autoplayReset resets elapsed to 0', () => {
    const { autoplayProgress, autoplayReset } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    autoplayReset()
    expect(autoplayProgress.value).toBe(0)
  })

  it('autoplaySetDelay updates delay', () => {
    const { autoplayDelay, autoplaySetDelay } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    autoplaySetDelay(10000)
    expect(autoplayDelay.value).toBe(10000)
  })

  it('autoplayRemaining starts at full delay', () => {
    const { autoplayRemaining, autoplayDelay } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    expect(autoplayRemaining.value).toBe(autoplayDelay.value)
  })

  it('autoplayProgress starts at 0', () => {
    const { autoplayProgress } = createAutoplayState(
      vi.fn(), computed(() => false), ref(false), {}
    )
    expect(autoplayProgress.value).toBe(0)
  })
})

describe('createAutoplayState — Swiper autoplay options', () => {
  it('pauses on hover by default; pauseOnMouseEnter: false keeps it running', () => {
    const hovered = ref(true)
    const byDefault = createAutoplayState(vi.fn(), computed(() => false), hovered, {})
    expect(byDefault.autoplayRunning.value).toBe(false)
    const optedOut = createAutoplayState(vi.fn(), computed(() => false), hovered,
      { swiperOptions: { autoplay: { pauseOnMouseEnter: false } } })
    expect(optedOut.autoplayRunning.value).toBe(true)
  })

  it('pauses while keyboard focus is inside the slider', () => {
    const focused = ref(false)
    const state = createAutoplayState(vi.fn(), computed(() => false), ref(false), {}, undefined, { isKeyboardFocused: focused })
    expect(state.autoplayRunning.value).toBe(true)
    focused.value = true
    expect(state.autoplayRunning.value).toBe(false)
  })

  it('keeps running after user interaction unless disableOnInteraction is set', () => {
    const keepGoing = createAutoplayState(vi.fn(), computed(() => false), ref(false), {})
    keepGoing.onUserInteraction()
    expect(keepGoing.autoplayPaused.value).toBe(false)
    const stops = createAutoplayState(vi.fn(), computed(() => false), ref(false),
      { swiperOptions: { autoplay: { disableOnInteraction: true } } })
    stops.onUserInteraction()
    expect(stops.autoplayPaused.value).toBe(true)
  })
})
