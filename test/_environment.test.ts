import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Controllable stand-ins for the VueUse primitives the composable builds on.
const h = vi.hoisted(() => {
  const { ref } = require('vue')
  return {
    mounted: ref(true),
    reducedMotion: ref(false),
    reducedData: ref(false),
    coarsePointer: ref(false),
    changeCb: null as null | (() => void),
  }
})

vi.mock('@vueuse/core', () => {
  const { ref } = require('vue')
  return {
    useMounted: () => h.mounted,
    useMediaQuery: (q: string) => {
      if (q.includes('reduced-motion')) return h.reducedMotion
      if (q.includes('reduced-data')) return h.reducedData
      if (q.includes('coarse')) return h.coarsePointer
      return ref(false)
    },
    // Capture the 'change' handler so tests can simulate a connection change.
    useEventListener: (_t: unknown, _e: string, cb: () => void) => { h.changeCb = cb; return () => {} },
  }
})

import { useHeroEnvironment } from '../src/runtime/composables/_environment'

function setConnection(c: Record<string, unknown> | undefined) {
  vi.stubGlobal('navigator', c === undefined ? {} : { connection: c })
}

describe('useHeroEnvironment', () => {
  beforeEach(() => {
    h.mounted.value = true
    h.reducedMotion.value = false
    h.reducedData.value = false
    h.coarsePointer.value = false
    h.changeCb = null
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reports no constraints on a fast connection with no prefs', () => {
    setConnection({ saveData: false, effectiveType: '4g' })
    const env = useHeroEnvironment()
    expect(env.prefersDataSaver.value).toBe(false)
    expect(env.saveData.value).toBe(false)
    expect(env.slowConnection.value).toBe(false)
    expect(env.effectiveType.value).toBe('4g')
  })

  it('prefersDataSaver true when Save-Data is on', () => {
    setConnection({ saveData: true, effectiveType: '4g' })
    const env = useHeroEnvironment()
    expect(env.saveData.value).toBe(true)
    expect(env.prefersDataSaver.value).toBe(true)
  })

  it('prefersDataSaver true on a slow (2g) connection', () => {
    setConnection({ saveData: false, effectiveType: '2g' })
    const env = useHeroEnvironment()
    expect(env.slowConnection.value).toBe(true)
    expect(env.prefersDataSaver.value).toBe(true)
  })

  it('prefersDataSaver true under prefers-reduced-data', () => {
    setConnection({ saveData: false, effectiveType: '4g' })
    h.reducedData.value = true
    const env = useHeroEnvironment()
    expect(env.prefersDataSaver.value).toBe(true)
  })

  it('reacts to a connection change event', () => {
    const conn: Record<string, unknown> = { saveData: false, effectiveType: '4g' }
    setConnection(conn)
    const env = useHeroEnvironment()
    expect(env.saveData.value).toBe(false)
    conn.saveData = true
    h.changeCb?.()
    expect(env.saveData.value).toBe(true)
    expect(env.prefersDataSaver.value).toBe(true)
  })

  it('gates every flag to false until mounted (SSR-safe)', () => {
    setConnection({ saveData: true, effectiveType: '2g' })
    h.mounted.value = false
    const env = useHeroEnvironment()
    expect(env.prefersDataSaver.value).toBe(false)
    expect(env.saveData.value).toBe(false)
    expect(env.slowConnection.value).toBe(false)
    expect(env.effectiveType.value).toBe('')
  })

  it('works without the Network Information API (media-query flags only)', () => {
    setConnection(undefined)
    h.reducedMotion.value = true
    const env = useHeroEnvironment()
    expect(env.saveData.value).toBe(false)
    expect(env.reducedMotion.value).toBe(true)
    expect(env.prefersDataSaver.value).toBe(false)
  })
})
