/**
 * Mousewheel "one slide per gesture" lock.
 *
 * Trackpad inertia keeps firing `wheel` events for hundreds of ms after the
 * finger lifts, so once the first transition ends a leftover inertia event can
 * roll the slider past the intended slide. A fixed `thresholdTime` can't win
 * (inertia length varies with fling strength). Instead: on each mousewheel-driven
 * change, disable Swiper's mousewheel and re-enable it once the wheel has been
 * quiet (gesture settled) — robust to any inertia length, and it doesn't
 * over-block deliberate consecutive scrolls.
 *
 * The `lockedByUs` flag is load-bearing: the wheel listener must only re-enable a
 * lock *we* engaged. Without it, the listener re-enabled mousewheel any time it
 * was off — including when the consumer set `mousewheel: false` — so a disabled
 * mousewheel turned itself back on after the first scroll. Swiper only emits
 * `scroll` while mousewheel is enabled, so `lockedByUs` can never be set for a
 * consumer-disabled wheel.
 */
export function setupMousewheelGestureLock(s: any): void {
  if (!s?.el || typeof s.mousewheel?.disable !== 'function') return
  const QUIET_MS = 220
  let timer: ReturnType<typeof setTimeout> | undefined
  let lockedByUs = false
  const reenableWhenQuiet = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!s.destroyed && lockedByUs) {
        s.mousewheel?.enable?.()
        lockedByUs = false
      }
    }, QUIET_MS)
  }
  // While locked, our own listener keeps deferring re-enable as inertia arrives.
  s.el.addEventListener('wheel', () => { if (lockedByUs) reenableWhenQuiet() }, { passive: true })
  // Swiper emits 'scroll' on every mousewheel-driven slide change.
  s.on('scroll', () => {
    if (s.mousewheel?.enabled) {
      s.mousewheel.disable()
      lockedByUs = true
    }
    reenableWhenQuiet()
  })
}
