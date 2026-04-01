# nuxt-hero

A full-featured hero slider Nuxt module with parallax, video backgrounds, overlay patterns, and customizable animations.

## Features

- Swiper-based slider with autoplay progress tracking
- GSAP-powered parallax (background + content)
- Video backgrounds (MP4, WebM, HLS via hls.js)
- Overlay patterns (lines, dots, gradient, custom)
- Dark mode support via `@nuxtjs/color-mode`
- Built-in + animate.css animations
- Thumbnail navigation previews
- Vertical and horizontal layouts
- `@nuxt/icon` for all icons (Lucide set)
- Tailwind CSS v4 + DaisyUI v5

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

### Peer dependencies

Required:

```bash
pnpm add tailwindcss @tailwindcss/vite swiper @vueuse/nuxt
```

Optional:

```bash
pnpm add @nuxt/image daisyui hls.js animate.css
```

## Usage

```vue
<script setup>
const slides = [
  {
    bgSrc: 'https://example.com/photo.jpg',
    bgDarkSrc: 'https://example.com/photo-dark.jpg',
    thumbSrc: 'https://example.com/thumb.jpg',
    title: 'First Slide',
    animation: {
      enter: 'hero-animated hero-slideInUp',
      leave: 'hero-animated hero-slideOutDown',
    },
  },
  {
    bgSrc: 'https://example.com/video.mp4',
    title: 'Video Slide',
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

## Props

### `HeroSlider`

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

### `HeroSlide` object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bgSrc` | `string` | yes | Background image or video URL |
| `bgDarkSrc` | `string` | no | Dark mode background URL |
| `thumbSrc` | `string` | no | Thumbnail for navigation preview |
| `title` | `string` | no | Slide title |
| `poster` | `string` | no | Poster frame for video backgrounds |
| `animation` | `{ enter?, leave? }` | no | Per-slide animation override |

### `ParallaxConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `bg` | `boolean` | `true` | Enable background parallax |
| `content` | `boolean` | `true` | Enable content parallax |
| `speed` | `number` | `0.125` | Parallax speed multiplier |
| `minOpacity` | `number` | `0.7` | Minimum content opacity on scroll |

### `OverlayPattern`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `'lines' \| 'dots' \| 'gradient' \| 'custom'` | required | Pattern type |
| `opacity` | `number` | `0.15` | Pattern opacity |
| `color` | `string` | `'black'` | Pattern color |
| `css` | `string` | — | Custom CSS `background-image` (for `type: 'custom'`) |

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

Or use [animate.css](https://animate.style/) classes (install `animate.css` peer dependency).

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

## Project Structure

The module's runtime components are organized by feature domain:

```
src/runtime/
  components/
    slider/          # Core slider
      index.vue      # HeroSlider — main component
      HeroSlide.vue  # Individual slide with bg image/video
    video/           # Video playback controls
      HeroVideoControls.vue
      HeroVideoScrubber.vue
    navigation/      # Slide navigation UI
      HeroNavigation.vue
      HeroPagination.vue
  composables/
    useHeroSlider.ts # Core slider state, autoplay, video registration
    useGSAP.ts       # Scoped GSAP animations with cleanup
    useHls.ts        # HLS video playback
  utils.ts           # Shared utilities (video detection, patterns, formatting)
  types.ts           # TypeScript interfaces
```

## Composables

### `useHeroSlider(containerRef, slides, options?)`

Core slider composable — manages Swiper, autoplay progress, hover-pause, and animations.

### `useGSAP(callback?, options?)`

Vue composable wrapping `gsap.context()` for safe, scoped GSAP animations with automatic cleanup.

### `useHls(videoEl, src, options?)`

HLS video playback composable — dynamically loads hls.js, with Safari native fallback.

## Development

```bash
pnpm install
pnpm dev        # Start playground
pnpm test       # Run tests
pnpm build      # Build module
pnpm lint       # Lint with oxlint
```

## License

MIT
