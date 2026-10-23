// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, inject } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { HERO_CONFIG_DEFAULTS, HERO_CONFIG_KEY, useHeroConfig } from '../src/runtime/config'
import type { HeroRuntimeConfig } from '../src/runtime/config'
import { HeroPlugin, HeroSlider, createHeroConfig } from '../src/vue'

function mountWith(setup: () => unknown, plugin?: [typeof HeroPlugin, Record<string, unknown>?]) {
  let captured: unknown
  const app = createApp(defineComponent({
    setup() {
      captured = setup()
      return () => h('div')
    },
  }))
  if (plugin) app.use(plugin[0], plugin[1])
  const el = document.createElement('div')
  app.mount(el)
  app.unmount()
  return captured
}

describe('createHeroConfig', () => {
  it('applies defaults (features on, hls off, a11y on)', () => {
    const cfg = createHeroConfig()
    expect(cfg.features.navigation).toBe(true)
    expect(cfg.features.pagination).toBe(true)
    expect(cfg.features.video).toBe(true)
    expect(cfg.features.parallax).toBe(true)
    expect(cfg.features.a11y).toBe(true)
    expect(cfg.features.hls).toBeUndefined()
    expect(cfg.defaultVolume).toBe(0)
    expect(cfg.darkMode).toBe('class')
    expect(cfg.swiperModules).toEqual([])
  })

  it('merges user features over defaults', () => {
    const cfg = createHeroConfig({ features: { navigation: false } })
    expect(cfg.features.navigation).toBe(false)
    expect(cfg.features.pagination).toBe(true)
  })

  it('honours defaultVolume, darkMode and swiperModules', () => {
    const fakeModule = { name: 'A11y' }
    const cfg = createHeroConfig({ defaultVolume: 0.5, darkMode: 'media', swiperModules: [fakeModule] })
    expect(cfg.defaultVolume).toBe(0.5)
    expect(cfg.darkMode).toBe('media')
    expect(cfg.swiperModules).toEqual([fakeModule])
  })

  it('keeps optional-dep hooks null by default (gsap/hls stay out of the graph)', () => {
    const cfg = createHeroConfig()
    expect(cfg.parallaxComponent).toBeNull()
    expect(cfg.hlsLoader).toBeNull()
  })

  it('wraps a parallax loader function into a lazy component and passes hlsLoader through', () => {
    const loader = () => Promise.resolve({ default: defineComponent({ render: () => h('span') }) })
    const hls = () => Promise.resolve({})
    const cfg = createHeroConfig({ parallaxComponent: loader, hlsLoader: hls })
    // defineAsyncComponent returns a component options object, not the loader
    expect(typeof cfg.parallaxComponent).toBe('object')
    expect(cfg.hlsLoader).toBe(hls)
  })

  it('accepts a real component for parallaxComponent without wrapping', () => {
    const comp = defineComponent({ render: () => h('span') })
    const cfg = createHeroConfig({ parallaxComponent: comp })
    expect(cfg.parallaxComponent).toBe(comp)
  })
})

describe('HeroPlugin', () => {
  it('provides the resolved config app-wide', () => {
    const injected = mountWith(
      () => inject(HERO_CONFIG_KEY),
      [HeroPlugin, { defaultVolume: 0.3 }],
    ) as HeroRuntimeConfig
    expect(injected.defaultVolume).toBe(0.3)
    expect(injected.features.pagination).toBe(true)
  })

  it('registers prefixed global components by default', () => {
    const app = createApp(defineComponent({ render: () => h('div') }))
    app.use(HeroPlugin)
    expect(app.component('HeroSlider')).toBeTruthy()
    expect(app.component('HeroSlide')).toBeTruthy()
    expect(app.component('HeroPagination')).toBeTruthy()
  })

  it('registers the lazy layers as async components (on-demand chunks)', () => {
    const app = createApp(defineComponent({ render: () => h('div') }))
    app.use(HeroPlugin)
    for (const name of ['HeroPagination', 'HeroNavigation', 'HeroVideoControls', 'HeroVideoScrubber', 'HeroSlideVideo'])
      expect((app.component(name) as { __asyncLoader?: unknown }).__asyncLoader, name).toBeTypeOf('function')
    expect((app.component('HeroSlider') as { __asyncLoader?: unknown }).__asyncLoader).toBeUndefined()
  })

  it('honours a custom prefix and registerComponents: false', () => {
    const app = createApp(defineComponent({ render: () => h('div') }))
    app.use(HeroPlugin, { prefix: 'My' })
    expect(app.component('MySlider')).toBeTruthy()
    expect(app.component('HeroSlider')).toBeUndefined()

    const bare = createApp(defineComponent({ render: () => h('div') }))
    bare.use(HeroPlugin, { registerComponents: false })
    expect(bare.component('HeroSlider')).toBeUndefined()
  })
})

describe('SSR (plain Vue, no Nuxt)', () => {
  it('renders the slider to string with carousel ARIA, slots and <img> fallback', async () => {
    const slides = [
      { bgSrc: 'https://example.com/a.jpg', title: 'Alpha' },
      { bgSrc: 'https://example.com/b.jpg', title: 'Beta' },
    ]
    const app = createSSRApp({
      render: () => h(HeroSlider, { slides }, {
        slide: ({ slide }: { slide: { title?: string } }) => h('h2', slide.title),
      }),
    })
    app.use(HeroPlugin)

    const html = await renderToString(app)
    expect(html).toContain('hero-slider')
    expect(html).toContain('aria-roledescription="carousel"')
    expect(html).toContain('hero-slide-bg')
    expect(html).toContain('<h2>Alpha</h2>')
    // No imageComponent configured → native <img>, eager + high priority on slide 1
    expect(html).toContain('<img')
    expect(html).toContain('fetchpriority="high"')
  })
})

describe('SSR content choreography', () => {
  const slides = [
    { bgSrc: 'https://example.com/a.jpg', title: 'Alpha' },
    { bgSrc: 'https://example.com/b.jpg', title: 'Beta' },
  ]
  async function render(animate?: Record<string, unknown>) {
    const app = createSSRApp({
      render: () => h(HeroSlider, { slides, options: { animate } }, {
        slide: ({ slide }: { slide: { title?: string } }) => h('h2', { 'data-hero-animate': 'fade-up' }, slide.title),
      }),
    })
    app.use(HeroPlugin)
    return renderToString(app)
  }
  const states = (html: string) => [...html.matchAll(/data-hero-anim="(\w+)"/g)].map(m => m[1])

  it('renders the first slide entering and the rest hidden, so the intro plays from CSS', async () => {
    const html = await render({ duration: 500 })
    expect(states(html)).toEqual(['in', 'idle'])
    expect(html).toContain('--hero-anim-duration:500ms')
    expect(html).toContain('--hero-dir:1')
    expect(html).toContain('data-direction="next"')
  })

  it("initial: false shows the first slide statically; 'visible' holds it hidden", async () => {
    expect(states(await render({ initial: false }))).toEqual(['idle'])
    expect(states(await render({ initial: 'visible' }))).toEqual(['idle', 'idle'])
  })
})

describe('SSR slots and labels', () => {
  it('renders #background and #progress slots and translated role descriptions', async () => {
    const slides = [
      { bgSrc: 'https://example.com/a.jpg', title: 'Alpha' },
      { bgSrc: 'https://example.com/b.jpg', title: 'Beta' },
    ]
    const app = createSSRApp({
      render: () => h(HeroSlider, { slides, labels: { carouselRole: 'carrousel', slideRole: 'diapositive' } }, {
        background: ({ src, index }: { src: string, index: number }) => h('picture', { 'class': 'custom-bg', 'data-i': index }, src),
        progress: ({ progress }: { progress: number }) => h('div', { class: 'custom-progress' }, String(progress)),
      }),
    })
    app.use(HeroPlugin)
    const html = await renderToString(app)
    expect(html.match(/class="custom-bg"/g)).toHaveLength(2)
    expect(html).toContain('custom-progress')
    expect(html).not.toContain('hero-autoplay-progress-fill')
    expect(html).toContain('aria-roledescription="carrousel"')
    expect(html).toContain('aria-roledescription="diapositive"')
  })
})

describe('useHeroConfig', () => {
  it('falls back to defaults without a provider', () => {
    const cfg = mountWith(() => useHeroConfig()) as HeroRuntimeConfig
    expect(cfg).toBe(HERO_CONFIG_DEFAULTS)
    expect(cfg.features.video).toBe(true)
  })

  it('reads the provided config when the plugin is installed', () => {
    const cfg = mountWith(() => useHeroConfig(), [HeroPlugin, { defaultVolume: 0.7 }]) as HeroRuntimeConfig
    expect(cfg.defaultVolume).toBe(0.7)
  })
})
