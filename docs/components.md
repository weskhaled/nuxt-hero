# Components

**Nuxt**: `<HeroSlider>` and `<HeroSlide>` are always auto-registered.
`<HeroPagination>` and `<HeroNavigation>` are registered when their feature flag
is on, and `<HeroVideoControls>`, `<HeroVideoScrubber>` and `<HeroSlideVideo>`
when `video` is on. `<HeroIcon>` is not auto-registered in Nuxt.

**Plain Vue**: every component is exported from `nuxt-hero/vue`, and
`app.use(HeroPlugin)` registers them all globally. See
[Plain Vue usage](/vue).

In practice you only use `<HeroSlider>`. It renders everything else.

## HeroSlider

The main slider component. It wraps Swiper and manages backgrounds, overlays,
animations, video and parallax.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `HeroSlide[]` | **required** | Array of slide objects (see [Types](/types#heroslide)) |
| `activeIndex` | `number` | — | Active slide. Bind with `v-model:active-index` to read it and to navigate from the parent. Also sets the starting slide |
| `slider` | `UseHeroSliderReturn` | — | `useHeroSlider()` return value for *controlled* mode. Omit it for drop-in mode: the component creates its own, exposed on a template ref as `.slider` |
| `options` | `UseHeroSliderOptions` | — | Composable options for *drop-in* mode ([reactive](/composable#reactive-options)). Ignored when `slider` is passed |
| `enterAnimation` | `string` | `''` | Shorthand for `options.enterAnimation` (drop-in mode; a value in `options` wins) |
| `leaveAnimation` | `string` | `''` | Shorthand for `options.leaveAnimation` (drop-in mode; a value in `options` wins) |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `MaybeRefOrGetter<boolean \| ParallaxConfig>` | `true` | Scroll parallax: `false` disables it, `true` uses the defaults, an object fine-tunes it. Needs the `parallax` feature |
| `imagePreset` | `string` | `''` | `@nuxt/image` preset name for backgrounds |
| `imageSizes` | `string` | `''` | `@nuxt/image` `sizes` DSL for a responsive `srcset`, so small screens fetch a smaller image. Off by default. For a full-bleed hero use `'sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw'` **with a transform-capable provider** (ipx with the host in `image.domains`, Cloudinary, Supabase-render). It's the key:value DSL with your `image.screens` keys (default `sm`–`2xl`, no `xs`) — a bare `'100vw'` renders a broken `1w, 2w` srcset in @nuxt/image 2, and CSS `sizes` syntax mis-parses to ~1px |
| `as` | `string` | `'div'` | Root element tag |
| `ui` | `HeroSliderUI` | `{}` | Class overrides for internal elements ([keys](#ui-customization)) |
| `labels` | `HeroLabels` | — | Localizable accessible labels ([list](/accessibility#labels)) |
| `dataSaver` | `'auto' \| boolean` | `'auto'` | Mobile/PWA lite mode. `'auto'` follows the client environment (Save-Data / `prefers-reduced-data` / slow connection) via `useHeroEnvironment()`. `true` / `false` force it. Lite mode stops video autoplay and preload and skips parallax |

### Events

| Event | Payload | When |
|-------|---------|------|
| `change` | `HeroSlideChange` | After every slide change: `{ index, previousIndex, direction, slide }` |
| `update:activeIndex` | `number` | After every slide change (powers `v-model:active-index`) |
| `swiper` | `Swiper` | Once, with the Swiper instance, as an escape hatch to its full API |
| `videoEnded` | `number` | The active slide's video played to its end (payload: slide index). A video with `videoLoop: true` never ends |

```vue
<script setup>
const active = ref(0)
</script>

<template>
  <HeroSlider
    v-model:active-index="active"
    :slides="slides"
    @change="({ index, direction }) => console.log('now on', index, direction)"
    @video-ended="(index) => console.log('video done on slide', index)"
  />
</template>
```

### Exposed

A template ref on `<HeroSlider>` exposes `slider`: the `useHeroSlider()` return
value, whether you passed it in (controlled) or the component created it
(drop-in). See [Return Value](/composable#return-value).

```ts
const hero = useTemplateRef('hero')
hero.value?.slider.goTo(2)
hero.value?.slider.swiper.value?.update()
```

### Slots

| Slot | Replaces | Rendered |
|------|----------|----------|
| [`#slide`](#slide) | Slide content | Every slide |
| [`#background`](#background) | The background image / video | Every slide |
| [`#overlay`](#overlay) | Overlay patterns | Every slide |
| [`#video-controls`](#video-controls) | The whole video controls UI | Video slides with controls shown |
| [`#play-button`](#play-button) | Only the centered play button | Video slides with the default controls |
| [`#pagination`](#pagination) | The pagination pill | `pagination` feature on, more than one snap, `showPagination` |
| [`#navigation`](#navigation) | The arrows | `navigation` feature on, more than one slide, `showNavigation` |
| [`#progress`](#progress) | The autoplay bar | Autoplay enabled, `showProgress` |

::: warning Make custom controls clickable
`#pagination`, `#navigation` and `#progress` render inside the slider's
controls layer, which has `pointer-events: none` so it doesn't block drags.
Give your interactive elements `pointer-events: auto` (Tailwind:
`pointer-events-auto`). Position them absolutely within the slider.
:::

#### `#slide`

Main content slot for each slide.

```vue
<template #slide="{ slide, isActive, next }">
  <div class="flex size-full flex-col items-center justify-center gap-4">
    <h1 data-hero-animate="clip-up">{{ slide.title }}</h1>
    <button v-if="isActive" @click="next()">Next</button>
  </div>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `slide` | `HeroSlide` | Current slide data |
| `index` | `number` | Slide index |
| `isActive` | `boolean` | Whether this slide is active |
| `animationClass` | `string` | Resolved CSS animation class |
| `isVideo` | `boolean` | Whether the slide has a video background |
| `videoPlaying` | `boolean` | Video playback state ¹ |
| `videoDuration` | `number` | Video duration in seconds ¹ |
| `videoCurrentTime` | `number` | Current playback position ¹ |
| `videoWaiting` | `boolean` | Video is buffering ¹ |
| `videoEnded` | `boolean` | Video has ended ¹ |
| `videoMuted` | `boolean` | Mute state of the active video |
| `videoVolume` | `number` | Volume of the active video (0–1) |
| `videoToggle` | `() => void` | Play/pause the active video |
| `videoSeek` | `(time: number) => void` | Seek the active video |
| `videoSetVolume` | `(v: number) => void` | Set volume |
| `videoToggleMute` | `() => void` | Toggle mute |
| `next` / `prev` | `() => void` | Go to the next / previous slide |
| `goTo` | `(index: number) => void` | Go to a slide |

¹ Playback state belongs to the **active** slide's video, so it's live only on
the active slide. Other slides receive idle values (`false` / `0`). This keeps a
playing video from re-rendering every slide on each `timeupdate`.

#### `#background`

Replaces the background media, for example with `<picture>`, a canvas or a
Lottie animation. Parallax still moves the background layer around it.

```vue
<template #background="{ slide, src, eager }">
  <picture>
    <source :srcset="slide.avif" type="image/avif">
    <img :src="src" :loading="eager ? 'eager' : 'lazy'" alt="" class="size-full object-cover">
  </picture>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `src` | `string` | Background URL, already switched to `bgDarkSrc` in dark mode |
| `isVideo` | `boolean` | Whether the slide would render a video (`bgType` or extension, and the `video` feature) |
| `isActive` | `boolean` | Active slide (always `true` with several slides per view) |
| `poster` | `string \| undefined` | The slide's `poster` |
| `eager` | `boolean` | `true` for the first slide. Load it eagerly, because it's the LCP candidate |
| `slide` | `HeroSlide` | Slide data |
| `index` | `number` | Slide index |

The slot replaces the built-in video too. A video slide rendered through
`#background` gets no built-in video controls.

#### `#overlay`

Custom overlay rendering per slide.

```vue
<template #overlay="{ patterns, patternCSS, patternSize }">
  <div v-for="(p, i) in patterns" :key="i"
    :style="{ backgroundImage: patternCSS(p), backgroundSize: patternSize(p), opacity: p.opacity }"
    class="pointer-events-none absolute inset-0" />
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `patterns` | `OverlayPattern[]` | The `overlayPatterns` prop |
| `slide` | `HeroSlide` | Slide data |
| `index` | `number` | Slide index |
| `isActive` | `boolean` | Whether this slide is active |
| `patternCSS` | `(p: OverlayPattern) => string` | `background-image` value for a pattern |
| `patternSize` | `(p: OverlayPattern) => string` | `background-size` value for a pattern |

#### `#video-controls`

Replaces the built-in video controls (center button and bottom bar). It renders
on video slides while controls are shown (`showVideoControls`) and the video is
ready.

::: warning The media state props are refs
`playing`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `waiting`
and `rate` are Vue **refs**. Slot props aren't auto-unwrapped, so use `.value`
in the template too. They're writable: `muted.value = true` mutes, and
`rate.value = 1.5` changes the speed.
:::

```vue
<script setup>
// Nuxt: `import { formatTime } from '#hero/utils'` · Vue: from 'nuxt-hero/vue'
const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
</script>

<template>
  <HeroSlider :slides="slides">
    <template #video-controls="{ playing, togglePlay, currentTime, duration, seek, muted }">
      <div data-hero-video-controls class="pointer-events-auto swiper-no-swiping absolute inset-x-0 bottom-0 flex items-center gap-3 bg-black/50 p-4 text-white">
        <button type="button" @click="togglePlay()">{{ playing.value ? 'Pause' : 'Play' }}</button>
        <input type="range" min="0" :max="duration.value" step="0.1" :value="currentTime.value"
          aria-label="Seek" @input="seek(Number($event.target.value))">
        <span>{{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}</span>
        <button type="button" @click="muted.value = !muted.value">{{ muted.value ? 'Unmute' : 'Mute' }}</button>
      </div>
    </template>
  </HeroSlider>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `playing` | `Ref<boolean>` | Playing state (set it to play / pause) |
| `togglePlay` | `() => void` | Play/pause |
| `currentTime` | `Ref<number>` | Position in seconds |
| `duration` | `Ref<number>` | Duration in seconds |
| `buffered` | `Ref<[number, number][]>` | Buffered time ranges `[start, end]` |
| `volume` | `Ref<number>` | Volume 0–1 |
| `muted` | `Ref<boolean>` | Mute state |
| `waiting` | `Ref<boolean>` | Buffering |
| `rate` | `Ref<number>` | Playback rate (1 = normal) |
| `seek` | `(time: number) => void` | Seek to a time in seconds |
| `toggleFullscreen` | `() => void` | Fullscreen the slider (not just the video), as the default button does |
| `hls` | `object \| null` | `{ loading: Ref<boolean>, error: Ref<string \| null>, qualities: Ref<number[]>, setQuality(height) }` when the `hls` feature is on, else `null` |
| `index` | `number` | Slide index |
| `slide` | `HeroSlide` | Slide data |

The slot renders in each slide's video-controls layer, above the content. That
layer is click-through (`pointer-events: none`), like the slider's controls
layer, so put `pointer-events: auto` on your controls. Add
`data-hero-video-controls` to your bar to get what the default bar gets: the
pagination pill lifts clear of it, and watch mode slides it away when idle.
`swiper-no-swiping` (a Swiper class) stops drags on the bar from swiping.

#### `#play-button`

Replaces only the centered play button and keeps the rest of the default
controls. It isn't used when `#video-controls` is provided, or when
`videoControls.playButton` is `false`.

```vue
<template #play-button="{ playing, waiting, progress, toggle }">
  <button type="button" class="size-20 rounded-full bg-white/30 text-white" :disabled="waiting"
    :aria-label="playing ? 'Pause video' : 'Play video'" @click="toggle()">
    {{ playing ? '❚❚' : '▶' }} {{ Math.round(progress) }}%
  </button>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `playing` | `boolean` | Playing state |
| `waiting` | `boolean` | Buffering |
| `progress` | `number` | Playback progress, 0–100 |
| `toggle` | `() => void` | Play/pause |
| `index` | `number` | Slide index |
| `slide` | `HeroSlide` | Slide data |

#### `#pagination`

Replaces the default pagination pill.

```vue
<template #pagination="{ snapIndex, totalSnaps, goToSnap }">
  <div class="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
    <button v-for="i in totalSnaps" :key="i" type="button" :aria-label="`Go to slide ${i}`"
      :aria-current="snapIndex === i - 1 ? 'step' : undefined"
      :class="snapIndex === i - 1 ? 'bg-white' : 'bg-white/40'" class="size-3 rounded-full"
      @click="goToSnap(i - 1)" />
  </div>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `activeIndex` | `number` | Active slide index |
| `snapIndex` | `number` | Active snap point (dot) |
| `totalSnaps` | `number` | Number of snap points (dots) |
| `total` | `number` | Number of slides |
| `progress` | `number` | Autoplay progress of the current slide, 0–1 |
| `goTo` | `(index: number) => void` | Go to a **slide** |
| `goToSnap` | `(snap: number) => void` | Go to a **snap point**. Use this for dots, because it's correct with `slidesPerGroup > 1` |
| `vertical` | `boolean` | `direction: 'vertical'` |
| `autoplayEnabled` | `boolean` | Whether autoplay is on |

#### `#navigation`

Replaces the default prev/next arrows.

```vue
<template #navigation="{ prev, next, vertical }">
  <div class="absolute inset-0 flex items-center justify-between p-4" :class="vertical && 'flex-col'">
    <button type="button" class="pointer-events-auto" @click="prev()">Previous</button>
    <button type="button" class="pointer-events-auto" @click="next()">Next</button>
  </div>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `prev` / `next` | `() => void` | Go to the previous / next slide (wraps around) |
| `activeIndex` | `number` | Active slide index |
| `slides` | `HeroSlide[]` | All slides (for previews) |
| `vertical` | `boolean` | `direction: 'vertical'` |

#### `#progress`

Replaces the autoplay progress bar.

```vue
<template #progress="{ progress, paused, running, pause, resume }">
  <div class="pointer-events-auto absolute end-4 top-4 flex items-center gap-2 text-white">
    <button type="button" @click="paused ? resume() : pause()">{{ paused ? 'Play' : 'Pause' }}</button>
    <span>{{ Math.round(progress * 100) }}%</span>
  </div>
</template>
```

| Prop | Type | Description |
|------|------|-------------|
| `progress` | `number` | Autoplay progress of the current slide, 0–1 |
| `vertical` | `boolean` | `direction: 'vertical'` |
| `paused` | `boolean` | Paused through the API / toggle (`autoplayPaused`) |
| `running` | `boolean` | The timer is ticking right now — false while paused, hovered, focused, offscreen, … (`autoplayRunning`) |
| `pause` / `resume` | `() => void` | Pause / resume autoplay |

## HeroSlide

The internal slide component. It renders the background image or video, the
scrim, overlay patterns and the `#slide` content. `<HeroSlider>` renders it for
you.

## HeroNavigation

Navigation arrows with a thumbnail and title preview on hover (from the adjacent
slide's `thumbSrc` / `title`). In vertical sliders the arrows move to the top
and bottom. Shown when the `navigation` feature and `showNavigation` are on.

## HeroPagination

The pagination pill: one dot per snap point, with a progress ring on the active
dot and thumbnail tooltips on hover. It moves to the side in vertical sliders,
and scrolls when the dots overflow. Shown when the `pagination` feature and
`showPagination` are on. It emits `slideTo` with the **snap** index.

## HeroSlideVideo

Video background component. Supports MP4, WebM, MOV, Ogg and HLS (`.m3u8`, or
`bgType: 'hls'`). Integrates with VueUse's `useMediaControls` for reactive
playback state.

## HeroVideoControls

The built-in video controls: a centered play button with a progress ring, plus a
bottom bar with play/pause, mute + volume, time, playback speed and fullscreen.
Each part can be turned off with [`videoControls`](/video#controls). Shown when
`showVideoControls` is on.

## HeroVideoScrubber

The seek bar at the top of the video controls bar. It shows buffered ranges and
a time tooltip. Toggle it with `videoControls.scrubber`. It doesn't depend on
`showProgress`, which only affects the autoplay bar.

## HeroIcon

The small inline SVG icon set used by the chrome. It's exported from
`nuxt-hero/vue` and registered by the Vue plugin. It isn't auto-registered in
Nuxt.

## UI Customization

Override internal element classes with the `ui` prop:

```vue
<HeroSlider
  :ui="{
    root: 'rounded-xl overflow-hidden',
    content: 'px-8',
    bg: 'brightness-75',
    progressFill: 'bg-amber-400',
    pagination: 'shadow-lg',
    autoplayToggle: 'bg-black/40',
  }"
/>
```

| Key | Target | Description |
|-----|--------|-------------|
| `root` | `.hero-slider` | Root element |
| `swiper` | `.hero-swiper` | The Swiper container |
| `slide` | `.hero-swiper-slide` | Each Swiper slide |
| `container` | `.hero-slide` | Slide inner container |
| `bg` | `.hero-slide-bg` | Background image/video layer |
| `scrim` | `.hero-slide-scrim` | Inset scrim over the background |
| `content` | `.hero-slide-content` | Content layer (`#slide`) |
| `controls` | `.hero-controls` | Controls layer: pagination, navigation, progress, autoplay toggle |
| `progress` | `.hero-autoplay-progress` | Autoplay bar track |
| `progressFill` | `.hero-autoplay-progress-fill` | Autoplay bar fill |
| `pagination` | `.hero-pagination` | Pagination pill |
| `navigation` | `.hero-nav` | Navigation arrows wrapper |
| `videoControls` | `.hero-media-controls` | Video controls bar |
| `playButton` | `.hero-play-center-btn` | Centered video play button |
| `autoplayToggle` | `.hero-autoplay-toggle` | Autoplay pause/play toggle |

Keys for a built-in part have no effect when you replace that part with a slot.
If a class seems ignored, the shipped CSS is probably winning the cascade. See
[Theming → `ui` classes](/theming#ui-classes) and `cssLayer`.
