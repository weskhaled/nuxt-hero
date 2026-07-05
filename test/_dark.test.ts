// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useHeroDark } from '../src/runtime/composables/_dark'

function inScope<T>(fn: () => T): { result: T; stop: () => void } {
  const scope = effectScope()
  const result = scope.run(fn) as T
  return { result, stop: () => scope.stop() }
}

describe('useHeroDark (class strategy)', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('is false without a dark class', () => {
    const { result, stop } = inScope(() => useHeroDark('class'))
    expect(result.value).toBe(false)
    stop()
  })

  it('reads an initial dark class', () => {
    document.documentElement.classList.add('dark')
    const { result, stop } = inScope(() => useHeroDark('class'))
    expect(result.value).toBe(true)
    stop()
  })

  it('reacts to the class being toggled at runtime', async () => {
    const { result, stop } = inScope(() => useHeroDark('class'))
    expect(result.value).toBe(false)

    document.documentElement.classList.add('dark')
    // MutationObserver callbacks flush as microtasks.
    await nextTick()
    await new Promise(r => setTimeout(r, 0))
    expect(result.value).toBe(true)

    document.documentElement.classList.remove('dark')
    await nextTick()
    await new Promise(r => setTimeout(r, 0))
    expect(result.value).toBe(false)
    stop()
  })
})
