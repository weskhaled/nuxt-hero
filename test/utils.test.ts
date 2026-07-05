import { describe, expect, it } from 'vitest'
import { DEFAULT_PARALLAX, formatTime, isHlsUrl, isVideoUrl, patternCSS, patternSize, resolveParallaxConfig } from '../src/runtime/utils'

describe('isVideoUrl', () => {
  it('detects mp4 URLs', () => {
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true)
  })

  it('detects webm URLs', () => {
    expect(isVideoUrl('https://example.com/video.webm')).toBe(true)
  })

  it('detects m3u8 URLs', () => {
    expect(isVideoUrl('https://example.com/stream.m3u8')).toBe(true)
  })

  it('detects URLs with query params', () => {
    expect(isVideoUrl('https://example.com/video.mp4?token=abc')).toBe(true)
  })

  it('rejects image URLs', () => {
    expect(isVideoUrl('https://example.com/image.jpg')).toBe(false)
    expect(isVideoUrl('https://example.com/image.png')).toBe(false)
  })
})

describe('patternCSS', () => {
  it('returns repeating-linear-gradient for lines', () => {
    const result = patternCSS({ type: 'lines' })
    expect(result).toContain('repeating-linear-gradient')
  })

  it('returns radial-gradient for dots', () => {
    const result = patternCSS({ type: 'dots' })
    expect(result).toContain('radial-gradient(circle')
  })

  it('returns radial-gradient for gradient', () => {
    const result = patternCSS({ type: 'gradient' })
    expect(result).toContain('radial-gradient')
  })

  it('returns custom css for custom type', () => {
    const result = patternCSS({ type: 'custom', css: 'linear-gradient(red, blue)' })
    expect(result).toBe('linear-gradient(red, blue)')
  })

  it('uses provided color', () => {
    const result = patternCSS({ type: 'lines', color: 'red' })
    expect(result).toContain('red')
  })
})

describe('patternSize', () => {
  it('returns 2px 2px for lines', () => {
    expect(patternSize({ type: 'lines' })).toBe('2px 2px')
  })

  it('returns 20px 20px for dots', () => {
    expect(patternSize({ type: 'dots' })).toBe('20px 20px')
  })

  it('returns cover for gradient', () => {
    expect(patternSize({ type: 'gradient' })).toBe('cover')
  })
})

describe('resolveParallaxConfig', () => {
  it('returns disabled config for false', () => {
    const result = resolveParallaxConfig(false)
    expect(result.bg).toBe(false)
    expect(result.content).toBe(false)
    expect(result.speed).toBe(0)
  })

  it('returns defaults for true', () => {
    const result = resolveParallaxConfig(true)
    expect(result).toEqual(DEFAULT_PARALLAX)
  })

  it('merges partial config with defaults', () => {
    const result = resolveParallaxConfig({ speed: 0.5 })
    expect(result.speed).toBe(0.5)
    expect(result.bg).toBe(true)
    expect(result.content).toBe(true)
    expect(result.minOpacity).toBe(0.7)
  })
})

describe('isHlsUrl', () => {
  it('detects m3u8 URLs', () => {
    expect(isHlsUrl('https://example.com/stream.m3u8')).toBe(true)
  })

  it('detects m3u8 with query params', () => {
    expect(isHlsUrl('https://example.com/stream.m3u8?token=abc')).toBe(true)
  })

  it('rejects mp4 URLs', () => {
    expect(isHlsUrl('https://example.com/video.mp4')).toBe(false)
  })

  it('rejects image URLs', () => {
    expect(isHlsUrl('https://example.com/image.jpg')).toBe(false)
  })
})

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats 65 seconds as 01:05', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('formats 3661 seconds as 61:01', () => {
    expect(formatTime(3661)).toBe('61:01')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(62.7)).toBe('01:02')
  })
})

