# Getting Started

## Installation

```bash
pnpm add nuxt-hero
```

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-hero'],
})
```

### Peer Dependencies

**Required:**

```bash
pnpm add tailwindcss @tailwindcss/vite swiper @vueuse/nuxt @vueuse/core @nuxtjs/color-mode
```

**Optional:**

```bash
pnpm add @nuxt/image hls.js animate.css
```

## Basic Usage

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
    :swiper-options="{ autoplay: { delay: 5000 }, speed: 600 }"
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

## Module Options

```ts
export default defineNuxtConfig({
  hero: {
    prefix: 'Hero',      // Component name prefix
    colorMode: true,      // Enable @nuxtjs/color-mode
    icon: true,           // Enable @nuxt/icon
    defaultVolume: 0,     // Default volume for video backgrounds (0-1)
  },
})
```

## Props

### HeroSlider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `HeroSlide[]` | required | Array of slide objects |
| `swiperOptions` | `SwiperOptions` | `{}` | Swiper config pass-through |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `boolean \| ParallaxConfig` | `true` | Parallax configuration |
| `imagePreset` | `string` | `''` | `@nuxt/image` preset name |
| `as` | `string` | `'div'` | Wrapper element tag |

### HeroSlide Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bgSrc` | `string` | yes | Background image or video URL |
| `bgDarkSrc` | `string` | no | Dark mode background URL |
| `thumbSrc` | `string` | no | Thumbnail for navigation preview |
| `title` | `string` | no | Slide title |
| `poster` | `string` | no | Poster frame for video backgrounds |
| `animation` | `{ enter?, leave? }` | no | Per-slide animation override |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `slide` | `{ slide, index, isActive, animationClass }` | Slide content |
| `pagination` | `{ activeIndex, total, progress, slideTo, vertical }` | Custom pagination |
| `navigation` | `{ prev, next, activeIndex, slides, vertical }` | Custom navigation |
| `video-controls` | `{ playing, currentTime, duration, volume, muted, waiting, hls }` | Custom video controls |

## Built-in Animations

Use with the `hero-animated` base class:

- `hero-fadeIn` / `hero-fadeOut`
- `hero-slideInUp` / `hero-slideOutDown`
- `hero-slideInRight` / `hero-slideInLeft`
- `hero-zoomIn` / `hero-zoomOut`

Or use [animate.css](https://animate.style/) classes (install the `animate.css` peer dependency).
