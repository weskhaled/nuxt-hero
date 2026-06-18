import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupMousewheelGestureLock } from '../src/runtime/composables/_mousewheelLock'

/**
 * Builds a minimal fake Swiper instance: a real `EventTarget` for `el` (so the
 * lock's `wheel` listener fires on dispatch) and a stub `mousewheel` whose
 * enable/disable track the `enabled` flag, plus an `on`/`emit` event bus.
 */
function makeSwiper(opts: { enabled: boolean }) {
  const handlers: Record<string, Array<() => void>> = {}
  const el = new EventTarget()
  const mousewheel = {
    enabled: opts.enabled,
    enable: vi.fn(() => { mousewheel.enabled = true }),
    disable: vi.fn(() => { mousewheel.enabled = false }),
  }
  const s = {
    el,
    destroyed: false,
    mousewheel,
    on: (ev: string, cb: () => void) => { (handlers[ev] ||= []).push(cb) },
    emit: (ev: string) => { (handlers[ev] || []).forEach(cb => cb()) },
  }
  return { s, el, mousewheel }
}

const wheel = () => new Event('wheel')

describe('setupMousewheelGestureLock', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('does NOT re-enable a mousewheel the consumer left disabled (regression)', () => {
    const { s, el, mousewheel } = makeSwiper({ enabled: false })
    setupMousewheelGestureLock(s)
    // Scrolling over a slider with `mousewheel: false` must not turn it on.
    el.dispatchEvent(wheel())
    vi.advanceTimersByTime(500)
    expect(mousewheel.enable).not.toHaveBeenCalled()
    expect(mousewheel.enabled).toBe(false)
  })

  it('locks one gesture: disables on scroll, re-enables after the quiet window', () => {
    const { s, mousewheel } = makeSwiper({ enabled: true })
    setupMousewheelGestureLock(s)
    s.emit('scroll') // mousewheel-driven slide change
    expect(mousewheel.disable).toHaveBeenCalledTimes(1)
    expect(mousewheel.enabled).toBe(false)
    vi.advanceTimersByTime(219) // just under the 220ms quiet threshold
    expect(mousewheel.enable).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2) // cross the threshold
    expect(mousewheel.enable).toHaveBeenCalledTimes(1)
    expect(mousewheel.enabled).toBe(true)
  })

  it('defers re-enable while inertia wheel events keep arriving', () => {
    const { s, el, mousewheel } = makeSwiper({ enabled: true })
    setupMousewheelGestureLock(s)
    s.emit('scroll') // timer armed for t≈220
    vi.advanceTimersByTime(150)
    el.dispatchEvent(wheel()) // inertia → re-arm to t≈370
    vi.advanceTimersByTime(150) // t≈300, still before re-armed deadline
    expect(mousewheel.enable).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100) // t≈400, past it
    expect(mousewheel.enable).toHaveBeenCalledTimes(1)
  })

  it('no-ops when the mousewheel module is absent', () => {
    const on = vi.fn()
    const s = { el: new EventTarget(), on }
    expect(() => setupMousewheelGestureLock(s)).not.toThrow()
    expect(on).not.toHaveBeenCalled()
  })
})
