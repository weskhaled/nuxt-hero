import { describe, expect, it, vi } from 'vitest'

const templates: Array<{ filename: string, getContents: () => string }> = []
vi.mock('@nuxt/kit', () => ({
  addTemplate: (t: { filename: string, getContents: () => string }) => {
    templates.push(t)
    return { dst: `/build/${t.filename}` }
  },
}))

import { setupCss } from '../../src/module/css'

const fakeNuxt = () => ({ options: { css: ['~/assets/app.css'] } }) as unknown as Parameters<typeof setupCss>[0]

describe('setupCss', () => {
  it('pushes Swiper core, hero.css and enabled module/effect CSS (no Pagination/Navigation by default)', () => {
    const nuxt = fakeNuxt()
    setupCss(nuxt, '/rt', { navigation: true, pagination: true, freeMode: true, effects: ['fade'] })
    expect(nuxt.options.css).toEqual(['~/assets/app.css', 'swiper/css', '/rt/assets/hero.css', 'swiper/css/free-mode', 'swiper/css/effect-fade'])
  })

  it('ships Swiper Pagination / Navigation CSS only behind their own flags', () => {
    const nuxt = fakeNuxt()
    setupCss(nuxt, '/rt', { swiperPagination: true, swiperNavigation: true })
    expect(nuxt.options.css).toContain('swiper/css/pagination')
    expect(nuxt.options.css).toContain('swiper/css/navigation')
  })

  it('cssLayer: one layered file, first in line, ordered between Tailwind base and components', () => {
    const nuxt = fakeNuxt()
    setupCss(nuxt, '/rt', { effects: ['cube'] }, true)
    expect(nuxt.options.css[0]).toBe('/build/nuxt-hero/styles.css')
    const css = templates.at(-1)!.getContents()
    expect(css).toContain('@layer theme, base, hero-vendor, hero, components, utilities;')
    expect(css).toContain("@import 'swiper/css' layer(hero-vendor);")
    expect(css).toContain("@import 'swiper/css/effect-cube' layer(hero-vendor);")
    expect(css).toContain("@import '/rt/assets/hero.css' layer(hero);")
    expect(css.indexOf('@layer theme')).toBeLessThan(css.indexOf('@import'))
  })
})
