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
pnpm add tailwindcss @tailwindcss/vite swiper @vueuse/nuxt @vueuse/core @nuxtjs/color-mode
```

```bash [npm]
npm install tailwindcss @tailwindcss/vite swiper @vueuse/nuxt @vueuse/core @nuxtjs/color-mode
```

:::

**Optional:**

```bash
pnpm add @nuxt/image hls.js animate.css
```

| Package | Purpose |
|---------|---------|
| `@nuxt/image` | Optimized image loading with presets |
| `hls.js` | HLS video streaming (`.m3u8`) |
| `animate.css` | Extra animation classes beyond built-in ones |

## Basic Usage

The slider uses a **composable + component** pattern. Call `useHeroSlider()` to create the slider state, then pass it to `<HeroSlider>`:

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

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

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600 },
})
</script>

<template>
  <HeroSlider
    ref="containerRef"
    :slider="slider"
    :slides="slides"
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
