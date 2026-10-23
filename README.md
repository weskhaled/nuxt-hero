# nuxt-hero

A full-featured hero slider for **Nuxt** and **plain Vue 3** — parallax, video backgrounds, overlay patterns, and customizable animations.

## Features

- **Works in Nuxt (module) AND any Vue 3 app (plugin / à-la-carte imports)** — same components, same API
- **Zero styling toolchain required** — chrome ships as plain CSS (no Tailwind, no color-mode module, no icon dependency)
- Swiper-based slider with rAF autoplay progress (pauses offscreen / hidden / reduced-motion)
- GSAP-powered parallax (background + content) — **lazy-loaded**, only when `parallax` is enabled
- Video backgrounds (MP4, WebM, HLS via hls.js) — **lazy-loaded**, only on video slides
- Touch-friendly chrome: bigger targets on coarse pointers, tap-to-play stays visible, safe-area aware in fullscreen
- Accessible: WAI-ARIA APG carousel pattern, visible `:focus-visible` rings, autoplay that pauses on hover / keyboard focus / reduced motion plus an optional pause toggle (WCAG 2.2.2), localizable labels
- Overlay patterns (lines, dots, gradient, custom)
- Dark mode via the `.dark` class (Tailwind / Nuxt UI compatible) or `prefers-color-scheme`
- Themeable chrome via `--hero-*` CSS variables (accent adopts your `--ui-primary`), `ui` class overrides, optional cascade layers
- `v-model:active-index`, `change` / `videoEnded` events, and slots for every part (background, pagination, navigation, progress, video controls, play button)
- Full RTL support (slide direction syncs at init + on runtime locale switch)
- Mobile / PWA "lite mode": no video autoplay/preload + no parallax on Save-Data / slow connections
- Element-by-element content choreography (`data-hero-animate`: 14 CSS presets, auto-stagger, direction-aware, zero deps) + JS hooks for GSAP / Web Animations; animate.css classes still work
- Thumbnail navigation previews
- Vertical and horizontal layouts

## Installation (Nuxt)

```bash
pnpm add nuxt-hero swiper @vueuse/core
```

Supports `swiper` 11 / 12 / 14 and `@vueuse/core` 14 / 15 (both entry points).

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-hero'],
})
```

That's it. Styles are injected automatically, and no Tailwind, color-mode or
icon setup is needed. Navigation arrows, pagination, video backgrounds and
Swiper's A11y module are on by default. Scroll parallax is on too when `gsap` is
installed. Turn any of them off with
[`features`](docs/configuration.md#feature-flags).

### Optional peers (only if you use the matching feature)

```bash
pnpm add @nuxt/image gsap hls.js animate.css
```

- `@nuxt/image` — optimized backgrounds (auto-detected; `imagePreset` / `imageSizes` activate)
- `gsap` — scroll parallax (the `parallax` feature turns on once it's installed)
- `hls.js` — `.m3u8` video on non-Safari browsers (`features.hls: true`)
- `animate.css` — extra animation classes for `enterAnimation` / `leaveAnimation`

Optional deps are **injected, never imported**: with their feature flag off,
gsap / hls.js are completely absent from the build graph — skipping them can't
break your build.

## Installation (plain Vue 3)

```bash
pnpm add nuxt-hero swiper @vueuse/core
```

Register the plugin (global components + app-wide config):

```ts
import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y, EffectFade } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'

createApp(App)
  .use(HeroPlugin, {
    // Swiper modules every slider gets (pass what you use)
    swiperModules: [A11y, EffectFade],
    // features default to navigation, pagination, video, a11y, parallax on (hls off);
    // in Vue they only gate rendering, and parallax also needs `parallaxComponent`
    // features: { navigation: false },
  })
  .mount('#app')
```

…or import à la carte without the plugin (tree-shaken, defaults apply):

```vue
<script setup>
import { HeroSlider } from 'nuxt-hero/vue'
import 'swiper/css'
import 'nuxt-hero/hero.css'

const slides = [{ bgSrc: '/photo.jpg', title: 'Hello' }]
</script>

<template>
  <HeroSlider :slides="slides" style="height: 100vh" />
</template>
```

Per-instance Swiper modules also work without the plugin:
`:options="{ swiperOptions: { modules: [EffectFade], effect: 'fade' } }"`.

Optional features opt in through the plugin (each needs its optional peer):

```ts
app.use(HeroPlugin, {
  parallaxComponent: () => import('nuxt-hero/vue/parallax'), // needs gsap
  features: { hls: true },
  hlsLoader: () => import('hls.js'),                         // needs hls.js
})
```

A complete runnable app lives in [`examples/vue`](./examples/vue) — Vite + Vue
only, no Tailwind/gsap/hls.js (it's also the CI smoke test for that claim).

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
    <template #slide="{ slide }">
      <div class="flex size-full items-center justify-center">
        <h1 data-hero-animate="fade-up" class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

The slider fills its parent (`height: 100%`), so give it a height. Tailwind's
`h-screen` is used here, but `style="height: 100svh"` or any class of your own
works just as well.

Read and drive the active slide with `v-model:active-index`, and react to changes
with `@change`:

```vue
<!-- onChange receives { index, previousIndex, direction, slide } -->
<HeroSlider v-model:active-index="active" :slides="slides" @change="onChange" />
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

> When `:slider` is passed, the `options`, `enter-animation` and
> `leave-animation` props are ignored. Configure the controlled instance through
> `useHeroSlider()` instead.

## Props

### `HeroSlider`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `HeroSlide[]` | required | Array of slide objects |
| `activeIndex` | `number` | — | Active slide, for `v-model:active-index` (also sets the starting slide) |
| `slider` | `UseHeroSliderReturn` | — | A `useHeroSlider()` return value for *controlled* mode. Omit it for drop-in mode |
| `options` | `UseHeroSliderOptions` | — | Composable options for drop-in mode (reactive). Ignored with `slider` |
| `enterAnimation` / `leaveAnimation` | `string` | `''` | Default content animation classes (drop-in mode) |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `boolean \| ParallaxConfig` | `true` | Scroll parallax configuration |
| `imagePreset` / `imageSizes` | `string` | `''` | `@nuxt/image` preset / `sizes` DSL for backgrounds |
| `as` | `string` | `'div'` | Root element tag |
| `ui` | `HeroSliderUI` | `{}` | Class overrides for internal elements |
| `labels` | `HeroLabels` | — | Localizable accessible labels |
| `dataSaver` | `'auto' \| boolean` | `'auto'` | Lite mode for constrained clients (no video autoplay/preload, no parallax) |

Details: [docs/components.md](docs/components.md).

### `HeroSlide` object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bgSrc` | `string` | yes | Background image or video URL |
| `bgDarkSrc` | `string` | no | Dark mode background URL |
| `bgType` | `'image' \| 'video' \| 'hls'` | no | Media type for URLs without a telling extension |
| `bgAlt` | `string` | no | Alt text for an informative image (default: decorative `''`) |
| `thumbSrc` | `string` | no | Thumbnail for navigation / pagination previews |
| `title` | `string` | no | Slide title |
| `poster` | `string` | no | Poster frame for video backgrounds |
| `animation` | `SlideAnimation` | no | Per-slide classes (`enter` / `leave`), choreography timing and `onEnter` / `onLeave` hooks |
| `config` | `SlideConfig` | no | Per-slide display and media config (`showProgress`, `videoLoop`, `pauseUntilVideoEnds`, `videoControls`, `watchMode`, …) |

`SlideConfig`, `ParallaxConfig`, `OverlayPattern`, `HeroSliderUI` and the other
types are in [docs/types.md](docs/types.md).

## Events

| Event | Payload | When |
|-------|---------|------|
| `change` | `{ index, previousIndex, direction, slide }` | After every slide change |
| `update:activeIndex` | `number` | After every slide change (`v-model:active-index`) |
| `swiper` | Swiper instance | Once Swiper is created |
| `videoEnded` | `number` (slide index) | The active slide's video reached its end |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `slide` | `{ slide, index, isActive, animationClass, isVideo, videoPlaying, videoDuration, videoCurrentTime, videoWaiting, videoEnded, videoMuted, videoVolume, videoToggle, videoSeek, videoSetVolume, videoToggleMute, next, prev, goTo }` | Slide content |
| `background` | `{ src, isVideo, isActive, poster, eager, slide, index }` | Replace the background media |
| `overlay` | `{ patterns, slide, index, isActive, patternCSS, patternSize }` | Custom overlay rendering |
| `pagination` | `{ activeIndex, snapIndex, totalSnaps, total, progress, goTo, goToSnap, vertical, autoplayEnabled }` | Custom pagination (dots should call `goToSnap`) |
| `navigation` | `{ prev, next, activeIndex, slides, vertical }` | Custom navigation |
| `progress` | `{ progress, vertical, paused, running, pause, resume }` | Custom autoplay progress |
| `video-controls` | `{ playing, togglePlay, currentTime, duration, buffered, volume, muted, waiting, rate, seek, hls, index, slide, toggleFullscreen }` | Custom video controls (media state props are refs: use `.value`) |
| `play-button` | `{ playing, waiting, progress, toggle, index, slide }` | Custom centered play button |

Custom `pagination` / `navigation` / `progress` content sits in a
`pointer-events: none` layer. Give interactive elements `pointer-events: auto`.
Full reference and examples: [docs/components.md](docs/components.md#slots).

## Animations

Choreograph content element by element — pure CSS presets, staggered in
order, direction-aware, SSR-rendered:

```vue
<template #slide="{ slide }">
  <span data-hero-animate="fade-down">{{ slide.eyebrow }}</span>
  <h1 data-hero-animate="clip-up">{{ slide.title }}</h1>
  <p data-hero-animate="blur-in">{{ slide.description }}</p>
</template>
```

Presets: `fade`, `fade-up/down/left/right`, `slide`, `zoom-in/out`, `blur-in`,
`clip-up/left/right`, `flip-up`, `rotate-in`. Tune timing with the `animate`
option (`duration`, `stagger`, `delay`, `easing`, `distance`, `initial`), and
plug in GSAP or the Web Animations API with `onEnter` / `onLeave` hooks — see
[docs/animations.md](docs/animations.md).

The class-based API animates the whole block with one class, using the
`hero-animated` base class:

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
    darkMode: 'class',    // 'class' (.dark on <html>) | 'media' (prefers-color-scheme)
    cssLayer: false,      // true: Swiper CSS + hero.css in cascade layers, so your classes win
    features: {           // Defaults: navigation, pagination, video, a11y on; parallax when gsap is installed
      keyboard: true,     // Swiper modules are opt-in…
      effects: ['fade'],
    },
  },
})
```

> The old `tailwind` option is deprecated and ignored. Hero styles ship as
> plain CSS, so no Tailwind pipeline (and no `@nuxtjs/color-mode`) is required.

See the [configuration docs](docs/configuration.md) for all options and feature
flags, including `swiperNavigation` / `swiperPagination` for Swiper's native
controls. Coming from 0.7? Read [docs/upgrading.md](docs/upgrading.md).

## Theming & Accessibility

- [docs/theming.md](docs/theming.md): every `--hero-*` token, the `ui` keys,
  styling hooks (`data-*` attributes), dark mode and cascade layers.
- [docs/accessibility.md](docs/accessibility.md): carousel ARIA, keyboard,
  autoplay pausing and `showAutoplayToggle`, labels, reduced motion and touch
  sizes.

## Composables

### `useHeroSlider(containerRef, slides, options?)`

The core slider composable, which creates and manages all slider state. Call it
yourself for *controlled* mode and pass the result to `<HeroSlider :slider>`. In
drop-in mode `<HeroSlider>` calls it for you and exposes the result as
`.slider` on a template ref.

- `containerRef`: template ref for the rendered root (hover, focus and
  visibility detection, parallax scoping)
- `slides`: array, ref or getter of `HeroSlide` objects
- `options`: `UseHeroSliderOptions`, or a ref / getter of it to change options
  later. It includes `swiperOptions` (`autoplay.delay`, `pauseOnMouseEnter`,
  `disableOnInteraction`, `stopOnLastSlide`, effects…), `enterAnimation` /
  `leaveAnimation`, `animate`, `showPagination`, `showNavigation`,
  `showProgress` (autoplay bar), `showVideoControls`, `showAutoplayToggle`,
  `videoControls`, `watchMode` and `watchIdleMs`

It returns navigation (`next`, `prev`, `goTo`, `goToSnap`, `swiper`), slide state,
autoplay state and controls (`autoplayRunning`, `autoplayPause`, …), video state
and controls. Full reference: [docs/composable.md](docs/composable.md).

### `useHeroEnvironment()`

Reactive, **SSR-safe** client-environment signals (`prefersDataSaver`,
`saveData`, `slowConnection`, `reducedMotion`, `coarsePointer`, …) for mobile and
PWA adaptiveness. `<HeroSlider :data-saver="'auto'">` (the default) uses them for
its lite mode: video backgrounds don't autoplay or preload, and scroll parallax
is skipped on constrained clients. See
[docs/composable.md](docs/composable.md#useheroenvironment).

## Project Structure

```
src/
  module.ts          # Nuxt module entry (`nuxt-hero`)
  module/            # Nuxt-only wiring (component registration, CSS, config plugin)
  vue/index.ts       # Vue plugin entry (`nuxt-hero/vue`)
  runtime/           # Framework-agnostic runtime (plain Vue — no Nuxt imports)
    config.ts        # provide/inject runtime config + defaults
    components/
      slider/        # HeroSlider, HeroSlide, HeroParallax
      video/         # HeroSlideVideo, HeroVideoControls, HeroVideoScrubber
      navigation/    # HeroNavigation, HeroPagination
    composables/     # useHeroSlider, useHeroEnvironment, useHeroDark, …
    assets/hero.css  # All chrome styles — plain CSS, no Tailwind
    utils.ts         # Shared utilities (video detection, patterns, formatting)
    types.ts         # TypeScript interfaces
```

The `runtime/` tree never imports Nuxt APIs — components read app config via
`provide/inject` (`useHeroConfig()`), which the Nuxt module supplies from a
generated plugin and the Vue plugin supplies from `app.use(...)` options.

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
