# nuxt-hero

A full-featured hero slider Nuxt module with parallax, video backgrounds, overlay patterns, and customizable animations.

## Features

- Swiper-based slider with rAF autoplay progress (pauses offscreen / hidden / reduced-motion)
- GSAP-powered parallax (background + content) — **lazy-loaded**, only when `parallax` is enabled
- Video backgrounds (MP4, WebM, HLS via hls.js) — **lazy-loaded**, only on video slides
- Overlay patterns (lines, dots, gradient, custom)
- Dark mode via the `.dark` class (Tailwind / Nuxt UI compatible)
- Themeable chrome via `--hero-*` CSS variables (accent adopts your `--ui-primary`)
- Full RTL support (slide direction syncs at init + on runtime locale switch)
- Mobile / PWA "lite mode": no video autoplay/preload + no parallax on Save-Data / slow connections
- Accessible: WAI-ARIA APG carousel pattern + localizable labels + reduced-motion
- Built-in + animate.css animations, thumbnail navigation previews
- Vertical and horizontal layouts
- Local inline-SVG icons (no icon dependency)
- Tailwind CSS v4 (auto-detects a host Tailwind, e.g. Nuxt UI)

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
pnpm add tailwindcss swiper @vueuse/nuxt @vueuse/core @nuxtjs/color-mode
```

Optional (installed only if you use the matching feature):

```bash
pnpm add @nuxt/image hls.js animate.css gsap @tailwindcss/vite
```

- `gsap` — only for `parallax`
- `@tailwindcss/vite` — only if the module sets Tailwind up itself (skip it when a host like Nuxt UI already provides Tailwind, or set `hero: { tailwind: false }`)
- `@nuxt/image` — optimized backgrounds · `hls.js` — `.m3u8` video · `animate.css` — extra animation classes

## Usage

### Drop-in (uncontrolled)

The quickest path: pass `:slides` (and optional `:options`) and `<HeroSlider>`
owns the slider state internally — no `useHeroSlider()` call, no `containerRef`.

```vue
<script setup>
const slides = [
  {
    bgSrc: 'https://example.com/photo.jpg',
    bgDarkSrc: 'https://example.com/photo-dark.jpg',
    title: 'First Slide',
  },
  {
    bgSrc: 'https://example.com/video.mp4',
    title: 'Video Slide',
    config: { showVideoControls: true, videoLoop: false },
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
    <template #slide="{ slide, isVideo, videoPlaying, videoToggle }">
      <div class="flex size-full items-center justify-center">
        <h1 class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

Need external controls? Put a `ref` on `<HeroSlider>` — the internally-created
slider is exposed as `.slider`:

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

### Controlled

For full external control (sharing the slider, reacting to its state), create
the state yourself with `useHeroSlider()` and pass it via `:slider`. Wire `ref`
so the composable can scope hover/visibility/parallax to the rendered root:

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [/* … */]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600 },
  enterAnimation: 'hero-animated hero-fadeIn',
  leaveAnimation: 'hero-animated hero-fadeOut',
})
</script>

<template>
  <HeroSlider ref="containerRef" :slider="slider" :slides="slides" class="h-screen">
    <template #slide="{ slide }">
      <h1 class="text-5xl font-bold text-white">{{ slide.title }}</h1>
    </template>
  </HeroSlider>
</template>
```

> When `:slider` is passed, the `options` prop is ignored — configure the
> controlled instance through `useHeroSlider()` instead.

## Props

### `HeroSlider`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `HeroSlide[]` | required | Array of slide objects |
| `slider` | `UseHeroSliderReturn` | — | Optional. Pass a `useHeroSlider()` return value for *controlled* mode. Omit for the drop-in mode (the component creates its own). |
| `options` | `UseHeroSliderOptions` | `{}` | Composable config for the *uncontrolled* mode. Ignored when `slider` is passed. |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `boolean \| ParallaxConfig` | `true` | Parallax configuration |
| `imagePreset` | `string` | `''` | `@nuxt/image` preset name |
| `imageSizes` | `string` | `''` | `@nuxt/image` `sizes` DSL → responsive `srcset` so small screens fetch a smaller image. Off by default; set `'100vw'` for a full-bleed hero **with a transform-capable provider**. Use the key:value DSL (`'100vw'`, `'xs:100vw md:50vw'`), **not** CSS `sizes` syntax. |
| `as` | `string` | `'div'` | Wrapper element tag |
| `ui` | `HeroSliderUI` | `{}` | Class overrides for internal elements |
| `dataSaver` | `'auto' \| boolean` | `'auto'` | Lite mode for constrained clients. `'auto'` follows the environment (Save-Data / `prefers-reduced-data` / slow connection); `true`/`false` force it. Suppresses video autoplay + preload and skips parallax. |
| `labels` | `HeroLabels` | `{}` | Localizable `aria-label`s for nav / video controls / carousel region |

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
    prefix: 'Hero',       // Component name prefix
    defaultVolume: 0,     // Default volume for video backgrounds (0-1)
    tailwind: 'auto',     // 'auto' (skip setup when a host Tailwind exists) | true | false
    features: {           // Opt-in Swiper modules / capabilities (a11y is on by default)
      navigation: true,
      pagination: true,
      parallax: true,
    },
  },
})
```

See the [configuration docs](./docs/configuration.md) for all options, feature
flags, dark mode, RTL, theming (`--hero-*` variables), and accessibility.

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

### `useHeroEnvironment()`

Reactive, **SSR-safe** client-environment signals for mobile / PWA adaptiveness.
`<HeroSlider :data-saver="'auto'">` uses these to decide its lite mode, but you
can read them directly to adapt your own slot content (e.g. swap a heavy widget
for a static one on cellular). Every flag is `false`/empty on the server and the
first client render, then settles after mount — safe to drive rendering with.

```vue
<script setup>
const { prefersDataSaver, saveData, slowConnection, reducedMotion, coarsePointer } = useHeroEnvironment()
</script>
```

| Flag | Type | Description |
|------|------|-------------|
| `prefersDataSaver` | `ComputedRef<boolean>` | Data-/battery-constrained client (Save-Data, `prefers-reduced-data`, or 2g/slow-2g). Drives lite mode. |
| `saveData` | `ComputedRef<boolean>` | `navigator.connection.saveData` |
| `slowConnection` | `ComputedRef<boolean>` | Effective connection is `2g` / `slow-2g` |
| `effectiveType` | `ComputedRef<string>` | Raw `navigator.connection.effectiveType` (or `''`) |
| `reducedMotion` | `ComputedRef<boolean>` | `prefers-reduced-motion: reduce` |
| `reducedData` | `ComputedRef<boolean>` | `prefers-reduced-data: reduce` |
| `coarsePointer` | `ComputedRef<boolean>` | `pointer: coarse` (touch-primary device) |
| `mounted` | `Ref<boolean>` | True once mounted on the client |

> **Mobile / PWA lite mode.** With `:data-saver="'auto'"` (the default) the
> slider automatically goes light on constrained clients: video backgrounds
> don't autoplay or preload (poster shown, tap to play — saving cellular data)
> and scroll parallax is skipped (saving CPU/battery). Video elements also ship
> `preload="metadata"`, `playsinline`/`webkit-playsinline`,
> `disablepictureinpicture`, `disableremoteplayback` and a forced `muted`
> property for reliable inline autoplay on iOS. Force the mode with
> `:data-saver="true | false"`. For smaller image downloads on small screens,
> pair it with `:image-sizes="'100vw'"` (responsive `srcset`) when your
> `@nuxt/image` provider can transform widths.

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
