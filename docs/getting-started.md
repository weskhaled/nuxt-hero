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

Supported versions: `swiper` 11, 12 or 14 (Swiper 14 targets Chrome/Edge 110+,
Safari 16.4+, Firefox 110+ — stay on 12 for older browsers) and `@vueuse/core`
14 or 15.

Styles are plain CSS injected by the module — **no Tailwind, `@nuxtjs/color-mode`
or icon package is required**.

**Optional** (only needed for the matching feature):

```bash
pnpm add @nuxt/image hls.js animate.css gsap
```

| Package | Purpose |
|---------|---------|
| `@nuxt/image` | Optimized image loading with presets |
| `hls.js` | HLS video streaming (`.m3u8`) on browsers without native HLS (`features.hls`) |
| `animate.css` | Extra animation classes beyond built-in ones |
| `gsap` | Scroll parallax (the `parallax` feature turns on when `gsap` is installed) |

### What's on by default

The module registers the slider with these `features` on:

| Feature | Default | What it gives you |
|---------|---------|-------------------|
| `navigation` | on | Prev / next arrows with thumbnail previews |
| `pagination` | on | Pagination pill with an autoplay progress ring |
| `video` | on | Video backgrounds and their controls (lazy-loaded) |
| `a11y` | on | Swiper's A11y module |
| `parallax` | on when `gsap` is installed | Scroll parallax (lazy-loaded) |

Everything else (`keyboard`, `mousewheel`, effects, `hls`, …) is opt-in. Flags
you set override the defaults:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-hero'],
  hero: {
    features: {
      navigation: false,   // no arrows anywhere
      keyboard: true,      // + Swiper's Keyboard module
      effects: ['fade'],   // + the fade effect (module + CSS)
    },
  },
})
```

See [Configuration](/configuration#feature-flags) for every flag.

## Using with plain Vue (no Nuxt)

Everything also works in any Vue 3 app via the `nuxt-hero/vue` entry, as an
app plugin or as à-la-carte imports. See [Vue usage](/vue) for the full guide.

```ts
import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y } from 'swiper/modules'

import 'swiper/css'
import 'nuxt-hero/hero.css'

createApp(App).use(HeroPlugin, { swiperModules: [A11y] }).mount('#app')
```

## Give it a height

`<HeroSlider>` fills its parent (`width: 100%; height: 100%`), so it needs a
height from you. The examples use Tailwind's `h-screen`. Tailwind isn't required,
and any CSS works:

```vue
<!-- inline -->
<HeroSlider :slides="slides" style="height: 100svh" />

<!-- or a class from your own stylesheet: .hero { height: 80vh; } -->
<HeroSlider :slides="slides" class="hero" />
```

Your class always wins over the default size.

## Basic Usage (drop-in)

The quickest way to start: pass `:slides`, plus `:options` if you need them.
`<HeroSlider>` then creates and owns the slider state, so you don't call
`useHeroSlider()` or wire a `containerRef`.

```vue
<script setup>
const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'Mountain Vista',
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
    :overlay-patterns="[{ type: 'lines', opacity: 0.1 }]"
    class="h-screen"
  >
    <template #slide="{ slide }">
      <div class="flex size-full items-center justify-center">
        <h1 data-hero-animate="fade-up" class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

Autoplay is on by default with a 5 s delay. Pass `autoplay: false` in
`swiperOptions` to turn it off. `data-hero-animate` animates content as each
slide enters. See [Animations](/animations).

### Reacting to the slider

Bind the active slide with `v-model:active-index`. Changing the value from the
parent navigates the slider, and its initial value sets the starting slide. To
handle each change, listen to `@change`:

```vue
<script setup>
const active = ref(0)

function onChange({ index, previousIndex, direction, slide }) {
  console.log(`${previousIndex} → ${index} (${direction})`, slide.title)
}
</script>

<template>
  <HeroSlider v-model:active-index="active" :slides="slides" class="h-screen" @change="onChange" />
  <p>Slide {{ active + 1 }} / {{ slides.length }}</p>
</template>
```

All props, events and slots are listed in [Components](/components).

### Driving it from outside

Put a template ref on `<HeroSlider>`. The slider it creates internally is exposed
as `.slider`, with the full [`useHeroSlider` API](/composable#return-value):

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

For full external control, create the state yourself with `useHeroSlider()` and
pass it via `:slider`. This suits sharing the slider across components or
reacting to its state in your own logic. Wire `ref` so the composable can scope
hover, visibility and parallax to the rendered root:

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

> When you pass `:slider`, the `options`, `enter-animation` and `leave-animation`
> props are ignored. Configure the controlled instance through `useHeroSlider()`
> instead.

## Next steps

- [Configuration](/configuration): module options and feature flags
- [Components](/components): props, events, slots and `ui` keys
- [Theming](/theming): colors, sizes and cascade layers
- [Accessibility](/accessibility): keyboard, autoplay pausing and labels
