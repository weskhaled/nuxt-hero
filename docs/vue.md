# Using with plain Vue (no Nuxt)

The entire slider works in any Vue 3.5+ app through the **`nuxt-hero/vue`**
entry. The runtime is framework-agnostic (plain `provide/inject`, no Nuxt
imports); the Nuxt module and the Vue plugin are two thin shells around the same
components.

::: tip Runnable example
A complete minimal app lives at
[`examples/vue`](https://github.com/weskhaled/nuxt-hero/tree/main/examples/vue)
— Vite + Vue only, no Tailwind, no gsap, no hls.js. It doubles as the CI smoke
test proving the package builds without any optional dependency.
:::

## Install

```bash
pnpm add nuxt-hero swiper @vueuse/core
```

Optional, per feature: `gsap` (scroll parallax) · `hls.js` (HLS on non-Safari
browsers) · `animate.css` (extra animation classes). **None of them is ever
touched by your bundler unless you opt in** (see below) — skipping them can't
break your build.

## Styles

Two plain-CSS imports — no Tailwind, no build-tool configuration:

```ts
import 'swiper/css'          // Swiper core
import 'nuxt-hero/hero.css'  // slider chrome (pagination, nav, video controls…)
```

Add the CSS of any Swiper effect/module you use (mirrors Swiper's own docs):

```ts
import 'swiper/css/effect-fade'
```

## Option A — app plugin

Registers global components (`<HeroSlider>` etc.) and provides app-wide config:

```ts
import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y, Keyboard, EffectFade } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'

createApp(App)
  .use(HeroPlugin, {
    // Swiper modules every slider receives (pass only what you use — this is
    // what keeps the bundle lean outside Nuxt's feature-flag system)
    swiperModules: [A11y, Keyboard, EffectFade],
    defaultVolume: 0,
    darkMode: 'class', // or 'media' for prefers-color-scheme
    // features default to everything-on except `hls`; flags only gate which
    // chrome renders (navigation / pagination / video / parallax / a11y)
    // features: { navigation: true, pagination: true },
    // prefix: 'Hero',            // <HeroSlider> — change for <MySlider>
    // registerComponents: false, // provide config only, import components yourself
    // imageComponent: MyImage,   // custom image component for slide backgrounds
  })
  .mount('#app')
```

## Optional features (gsap / hls.js)

The optional dependencies are **injected, never imported** — `nuxt-hero/vue`
contains no reachable `import 'gsap'` or `import('hls.js')`, so a build without
them can't fail. Opt in through the plugin:

```ts
app.use(HeroPlugin, {
  // Scroll parallax (background drift + content fade on page scroll).
  // Requires:  pnpm add gsap
  parallaxComponent: () => import('nuxt-hero/vue/parallax'),

  // HLS (.m3u8) playback on browsers without native HLS (Chrome, Firefox).
  // Safari/iOS play HLS natively without this. Requires:  pnpm add hls.js
  features: { hls: true },
  hlsLoader: () => import('hls.js'),
})
```

Both stay lazy: the parallax chunk (and gsap) downloads only when a parallax
slider actually renders; hls.js only when an `.m3u8` source plays.

```vue
<template>
  <HeroSlider :slides="slides" style="height: 100vh">
    <template #slide="{ slide }">
      <h1>{{ slide.title }}</h1>
    </template>
  </HeroSlider>
</template>
```

## Option B — à la carte (tree-shaken)

No plugin needed — import components/composables directly, VueUse-style.
Defaults apply (all features on except `hls`); pass Swiper modules per instance:

```vue
<script setup>
import { HeroSlider } from 'nuxt-hero/vue'
import { EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'

const slides = [
  { bgSrc: '/day.jpg', bgDarkSrc: '/night.jpg', title: 'Hello' },
  { bgSrc: '/video.mp4', title: 'Video', config: { showVideoControls: true } },
]
</script>

<template>
  <HeroSlider
    :slides="slides"
    :options="{ swiperOptions: { modules: [EffectFade], effect: 'fade', autoplay: { delay: 5000 } } }"
    style="height: 100vh"
  />
</template>
```

The controlled mode works the same as in Nuxt:

```vue
<script setup>
import { ref } from 'vue'
import { HeroSlider, useHeroSlider } from 'nuxt-hero/vue'

const containerRef = ref(null)
const slider = useHeroSlider(containerRef, slides, { swiperOptions: { autoplay: { delay: 4000 } } })
</script>

<template>
  <HeroSlider ref="containerRef" :slider="slider" :slides="slides" />
  <button @click="slider.prev()">Prev</button>
  <button @click="slider.next()">Next</button>
</template>
```

## What's exported

| Export | Kind | Notes |
|--------|------|-------|
| `HeroPlugin` (default) | plugin | `app.use(HeroPlugin, options)` |
| `HeroSlider`, `HeroSlide`, `HeroPagination`, `HeroNavigation`, `HeroVideoControls`, `HeroVideoScrubber`, `HeroSlideVideo`, `HeroIcon` | components | compiled — no SFC tooling needed |
| `useHeroSlider`, `useHeroEnvironment`, `useHeroDark` | composables | same API as the Nuxt auto-imports |
| `createHeroConfig`, `HERO_CONFIG_KEY`, `HERO_CONFIG_DEFAULTS`, `resolveFeatures` | config | advanced: provide your own config scope |
| `isVideoUrl`, `isHlsUrl`, `formatTime`, `resolveParallaxConfig` | utils | |
| all public types | types | `HeroSlideData` is the slide **type** (`HeroSlide` names the component here) |

The parallax layer is a **separate entry** — `nuxt-hero/vue/parallax` exports
`HeroParallax` (and is the only entry that references gsap).

## Differences vs the Nuxt module

| | Nuxt module | Vue plugin |
|---|---|---|
| Swiper modules | auto-imported from `features` flags | you pass `swiperModules` (or per-instance `swiperOptions.modules`) |
| Swiper/effect CSS | injected automatically | you import (`swiper/css`, `swiper/css/effect-*`) |
| `hero.css` | injected automatically | you import `nuxt-hero/hero.css` |
| Slide images | `<NuxtImg>` when `@nuxt/image` is installed | native `<img>` (or pass `imageComponent`) |
| Scroll parallax | auto-wired when `features.parallax` | `parallaxComponent: () => import('nuxt-hero/vue/parallax')` |
| HLS (`.m3u8`) | auto-wired when `features.hls` | `hlsLoader: () => import('hls.js')` (Safari plays natively without it) |
| Components | auto-registered + lazy chunks per feature | global via plugin, or direct imports |
| SSR | works out of the box | works with standard Vue SSR (`renderToString`) |

Lazy loading still applies in both: GSAP loads only when parallax actually
renders, the video stack only on video slides, `hls.js` only for `.m3u8`
sources.
