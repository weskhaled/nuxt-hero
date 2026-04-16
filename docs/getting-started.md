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
    <template #slide="{ slide, isActive, isVideo, videoPlaying, videoToggle }">
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
| `slider` | `UseHeroSliderReturn` | required | Return value of `useHeroSlider()` |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `boolean \| ParallaxConfig` | `true` | Parallax configuration |
| `imagePreset` | `string` | `''` | `@nuxt/image` preset name |
| `as` | `string` | `'div'` | Wrapper element tag |
| `ui` | `HeroSliderUI` | `{}` | Class overrides for internal elements |

### HeroSlide Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bgSrc` | `string` | yes | Background image or video URL |
| `bgDarkSrc` | `string` | no | Dark mode background URL |
| `thumbSrc` | `string` | no | Thumbnail for navigation preview |
| `title` | `string` | no | Slide title |
| `poster` | `string` | no | Poster frame for video backgrounds |
| `animation` | `{ enter?, leave? }` | no | Per-slide animation override |
| `config` | `SlideConfig` | no | Per-slide display & media config |

### SlideConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showPagination` | `boolean` | inherited | Show pagination when this slide is active |
| `showNavigation` | `boolean` | inherited | Show navigation when this slide is active |
| `showProgress` | `boolean` | inherited | Show progress bar when this slide is active |
| `showVideoControls` | `boolean` | inherited | Show video controls (video slides only) |
| `videoLoop` | `boolean` | `false` | Loop video playback |
| `mediaControlsOptions` | `MediaControlsOptions` | — | VueUse useMediaControls options |

### useHeroSlider Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `swiperOptions` | `SwiperOptions` | `{}` | Swiper configuration (autoplay.delay, speed, effect, direction, etc.) |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `showPagination` | `boolean` | `true` | Show pagination dots |
| `showNavigation` | `boolean` | `true` | Show navigation arrows |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showVideoControls` | `boolean` | `true` | Show video controls overlay |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `slide` | `{ slide, index, isActive, animationClass, isVideo, videoPlaying, videoDuration, videoCurrentTime, videoWaiting, videoEnded, videoMuted, videoVolume, videoToggle, videoSeek, videoSetVolume, videoToggleMute }` | Slide content |
| `pagination` | `{ activeIndex, snapIndex, totalSnaps, total, progress, goTo, vertical, autoplayEnabled }` | Custom pagination |
| `navigation` | `{ prev, next, activeIndex, slides, vertical }` | Custom navigation |
| `overlay` | `{ patterns, index, isActive, patternCSS, patternSize }` | Custom overlay rendering |
| `video-controls` | `{ playing, currentTime, duration, buffered, volume, muted, waiting, hls }` | Custom video controls |

## Built-in Animations

Use with the `hero-animated` base class:

- `hero-fadeIn` / `hero-fadeOut`
- `hero-slideInUp` / `hero-slideOutDown`
- `hero-slideInRight` / `hero-slideInLeft`
- `hero-zoomIn` / `hero-zoomOut`

Or use [animate.css](https://animate.style/) classes (install the `animate.css` peer dependency).
