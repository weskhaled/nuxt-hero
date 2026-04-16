import { describe, expect, it, vi } from 'vitest'
import type { HeroFeatures } from '../../src/runtime/types'
import { resolveFeatures } from '../../src/module/features'

describe('resolveFeatures', () => {
  it('returns a copy without mutating input', () => {
    const input: HeroFeatures = { navigation: true }
    const result = resolveFeatures(input)
    expect(result).not.toBe(input)
    expect(result).toEqual({ navigation: true })
  })

  it('auto-enables video when hls is true', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = resolveFeatures({ hls: true })
    expect(result.video).toBe(true)
    expect(result.hls).toBe(true)
    expect(consoleSpy).toHaveBeenCalledWith(
      '[nuxt-hero] `hls: true` requires `video: true` — auto-enabling video.',
    )
    consoleSpy.mockRestore()
  })

  it('does not warn when both hls and video are true', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = resolveFeatures({ hls: true, video: true })
    expect(result.video).toBe(true)
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('filters invalid effects', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = resolveFeatures({ effects: ['fade', 'bogus' as any, 'cube'] })
    expect(result.effects).toEqual(['fade', 'cube'])
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown effect "bogus"'),
    )
    consoleSpy.mockRestore()
  })

  it('passes through valid effects unchanged', () => {
    const result = resolveFeatures({ effects: ['fade', 'flip'] })
    expect(result.effects).toEqual(['fade', 'flip'])
  })

  it('handles empty features', () => {
    const result = resolveFeatures({})
    expect(result).toEqual({})
  })
})
