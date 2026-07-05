# Getting Started

## Installation

::: code-group

```bash [pnpm]
pnpm add nuxt-hero
```

```bash [npm]
npm install nuxt-hero
```

```bash [yarn]
yarn add nuxt-hero
```

:::

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-hero'],
})
```

### Peer Dependencies

**Required:**

::: code-group

```bash [pnpm]
pnpm add swiper @vueuse/core
```

```bash [npm]
npm install swiper @vueuse/core
```

:::

Styles are plain CSS injected by the module — **no Tailwind, `@nuxtjs/color-mode`
or icon package is required**.

**Optional** (only needed for the matching feature):

```bash
pnpm add @nuxt/image hls.js animate.css gsap
```

| Package | Purpose |
|---------|---------|
| `@nuxt/image` | Optimized image loading with presets |
| `hls.js` | HLS video streaming (`.m3u8`) |
| `animate.css` | Extra animation classes beyond built-in ones |
| `gsap` | Scroll parallax (`features.parallax`) |

## Using with plain Vue (no Nuxt)

Everything also works in any Vue 3 app via the `nuxt-hero/vue` entry — as an
app plugin or à-la-carte imports. See [Vue usage](/vue) for the full guide.

```ts
import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y } from 'swiper/modules'

import 'swiper/css'
import 'nuxt-hero/hero.css'

createApp(App).use(HeroPlugin, { swiperModules: [A11y] }).mount('#app')
```

## Basic Usage (drop-in)

The fastest way in: pass `:slides` (and optional `:options`) and `<HeroSlider>`
creates and owns the slider state internally — no `useHeroSlider()` call, no
`containerRef` wiring.

```vue
<script setup>
const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'Mountain Vista',
    animation: {
      enter: 'hero-animated hero-slideInUp',
      leave: 'hero-animated hero-slideOutDown',
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    title: 'Golden Valley',
  },
]
</script>

<template>
  <HeroSlider
    :slides="slides"
    :options="{ swiperOptions: { autoplay: { delay: 5000 }, speed: 600 } }"
    :parallax="{ bg: true, content: true, speed: 0.5 }"
    :overlay-patterns="[{ type: 'lines', opacity: 0.1 }]"
    class="h-screen"
  >
    <template #slide="{ slide, isActive }">
      <div class="flex size-full items-center justify-center">
        <h1 class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

Need to drive the slider from outside (custom buttons, synced state)? Put a
template ref on `<HeroSlider>` — the internally-created slider is exposed:

```vue
<script setup>
const hero = useTemplateRef('hero')
</script>

<template>
  <HeroSlider ref="hero" :slides="slides" />
  <button @click="hero?.slider.prev()">Prev</button>
  <button @click="hero?.slider.next()">Next</button>
</template>
```

## Controlled Usage

For full external control — sharing the slider across multiple components, or
reacting to its state in your own logic — create the state yourself with
`useHeroSlider()` and pass it via `:slider`. Wire `ref` so the composable can
scope hover/visibility/parallax to the rendered root:

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [
  { bgSrc: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', title: 'Mountain Vista' },
  { bgSrc: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', title: 'Golden Valley' },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600 },
})

// `slider.activeIndex`, `slider.next()`, `slider.autoplayPause()`, … are all
// reactive and callable from here.
</script>

<template>
  <HeroSlider
    ref="containerRef"
    :slider="slider"
    :slides="slides"
    class="h-screen"
  >
    <template #slide="{ slide }">
      <div class="flex size-full items-center justify-center">
        <h1 class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

> When you pass `:slider`, the `options` prop is ignored — configure the
> controlled instance through `useHeroSlider()` instead.
