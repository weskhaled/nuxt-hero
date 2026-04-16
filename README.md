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
- Tailwind CSS v4

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
pnpm add tailwindcss @tailwindcss/vite swiper @vueuse/nuxt @vueuse/core @nuxtjs/color-mode
```

Optional:

```bash
pnpm add @nuxt/image hls.js animate.css
```

## Usage

The slider uses a **composable + component** pattern. Call `useHeroSlider()` to create the slider state, then pass it to `<HeroSlider>`:

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

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
    config: {
      showVideoControls: true,
      videoLoop: false,
    },
  },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600 },
  enterAnimation: 'hero-animated hero-fadeIn',
  leaveAnimation: 'hero-animated hero-fadeOut',
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

## Props

### `HeroSlider`

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

### `HeroSlide` object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bgSrc` | `string` | yes | Background image or video URL |
| `bgDarkSrc` | `string` | no | Dark mode background URL |
| `thumbSrc` | `string` | no | Thumbnail for navigation preview |
| `title` | `string` | no | Slide title |
| `poster` | `string` | no | Poster frame for video backgrounds |
| `animation` | `{ enter?, leave? }` | no | Per-slide animation override |
| `config` | `SlideConfig` | no | Per-slide display & media config |

### `SlideConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `showPagination` | `boolean` | inherited | Show pagination when this slide is active |
| `showNavigation` | `boolean` | inherited | Show navigation when this slide is active |
| `showProgress` | `boolean` | inherited | Show progress bar when this slide is active |
| `showVideoControls` | `boolean` | inherited | Show video controls (video slides only) |
| `videoLoop` | `boolean` | `false` | Loop video playback |
| `mediaControlsOptions` | `MediaControlsOptions` | — | VueUse useMediaControls options |

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

### `HeroSliderUI`

Class overrides for internal elements (Nuxt UI-style):

| Field | Description |
|-------|-------------|
| `root` | Root wrapper element |
| `swiper` | Swiper container |
| `slide` | Each SwiperSlide |
| `container` | Slide inner container (`.hero-slide`) |
| `bg` | Slide background layer (`.hero-slide-bg`) |
| `controls` | UI controls overlay (pagination, navigation, progress) |
| `progress` | Autoplay progress bar track |

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

## Composables

### `useHeroSlider(containerRef, slides, options?)`

Core slider composable — creates and manages all slider state. Must be called in `<script setup>` and its return value passed to `<HeroSlider>` via the `slider` prop.

**Parameters:**
- `containerRef` — Template ref for the root slider element (used for hover detection and GSAP scoping)
- `slides` — Reactive array of `HeroSlide` objects
- `options` — `UseHeroSliderOptions`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `swiperOptions` | `SwiperOptions` | `{}` | Swiper configuration (autoplay.delay, speed, effect, direction, etc.) |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `showPagination` | `boolean` | `true` | Show pagination dots |
| `showNavigation` | `boolean` | `true` | Show navigation arrows |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showVideoControls` | `boolean` | `true` | Show video controls overlay |

**Returns:** `UseHeroSliderReturn` with navigation, slide state, autoplay, video controls, and hover state.

### `useGSAP(callback?, options?)`

Vue composable wrapping `gsap.context()` for safe, scoped GSAP animations with automatic cleanup.

### `useHls(videoEl, src, options?)`

HLS video playback composable — dynamically loads hls.js, with Safari native fallback.

## Project Structure

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
