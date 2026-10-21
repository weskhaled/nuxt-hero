import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

vi.mock('@vueuse/core', () => ({
  tryOnScopeDispose: (fn: () => void) => {
    const { onScopeDispose, getCurrentScope } = require('vue')
    if (getCurrentScope()) onScopeDispose(fn)
  },
}))

import { useHls } from '../src/runtime/composables/_hls'

/** Minimal hls.js stand-in that records every instance it creates. */
function createFakeHls() {
  const instances: { destroyed: boolean }[] = []
  class FakeHls {
    static Events = { MANIFEST_PARSED: 'manifestParsed', ERROR: 'error' }
    static ErrorTypes = { NETWORK_ERROR: 'network', MEDIA_ERROR: 'media' }
    static isSupported = () => true
    destroyed = false
    levels = []
    constructor() { instances.push(this) }
    loadSource() {}
    attachMedia() {}
    on() {}
    destroy() { this.destroyed = true }
  }
  return { FakeHls, instances }
}

/** A loader whose pending calls we resolve by hand, to simulate a slow hls.js download. */
function deferredLoader(mod: unknown) {
  const pending: (() => void)[] = []
  const loader = vi.fn(() => new Promise<unknown>((r) => { pending.push(() => r(mod)) }))
  return { loader, resolve: () => pending.splice(0).forEach(fn => fn()) }
}

const fakeVideo = () => ({ canPlayType: () => '', addEventListener() {}, removeEventListener() {} }) as unknown as HTMLVideoElement

describe('useHls', () => {
  it('keeps a single live instance when src changes while hls.js is still loading', async () => {
    const { FakeHls, instances } = createFakeHls()
    const { loader, resolve } = deferredLoader({ default: FakeHls })
    const src = ref('https://example.test/a.m3u8')

    const scope = effectScope()
    scope.run(() => useHls(fakeVideo(), src, { loader }))

    src.value = 'https://example.test/b.m3u8' // e.g. dark-mode source swap mid-download
    await nextTick()
    resolve()
    await new Promise(r => setTimeout(r, 0))

    expect(instances.filter(i => !i.destroyed)).toHaveLength(1)
    scope.stop()
  })

  it('creates no instance when disposed before hls.js finishes loading', async () => {
    const { FakeHls, instances } = createFakeHls()
    const { loader, resolve } = deferredLoader({ default: FakeHls })

    const scope = effectScope()
    const { loading } = scope.run(() => useHls(fakeVideo(), 'https://example.test/a.m3u8', { loader }))!
    expect(loading.value).toBe(true)

    scope.stop()
    resolve()
    await new Promise(r => setTimeout(r, 0))

    expect(instances).toHaveLength(0)
    expect(loading.value).toBe(false)
  })
})
