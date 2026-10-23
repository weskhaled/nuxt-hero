# Video Backgrounds

## Setup

Video backgrounds are **on by default**: the `video` feature defaults to `true`
in both the Nuxt module and the Vue plugin. The video code is lazy-loaded, so
image-only sliders never download it. HLS (`.m3u8`) is opt-in, see
[below](#hls-streaming).

```ts
// nuxt.config.ts: only needed to turn video off, or HLS on
export default defineNuxtConfig({
  hero: {
    features: {
      video: true,
      hls: false, // true for .m3u8 streams on non-Safari browsers
    },
  },
})
```

## Basic Video Slide

Videos are detected by file extension (`.mp4`, `.webm`, `.mov`, `.ogg`, `.m3u8`):

```ts
const slides = [
  {
    bgSrc: '/hero-video.mp4',
    poster: '/hero-poster.jpg',
    title: 'Welcome',
  },
]
```

For URLs without a telling extension (CDN or signed URLs), set `bgType`:

```ts
{ bgSrc: 'https://cdn.example.com/media/8f2c1a?token=…', bgType: 'video' }
{ bgSrc: 'https://stream.example.com/live/abc', bgType: 'hls' }
```

## Video Configuration

Per-slide video options via `config`:

```ts
{
  bgSrc: '/cinematic.mp4',
  poster: '/poster.jpg',
  config: {
    videoLoop: false,             // Loop playback (default: false)
    pauseUntilVideoEnds: true,    // Hold autoplay while the video plays
    showVideoControls: true,      // Show the video controls (default: true)
    videoControls: { settings: false }, // Which parts render (see Controls)
    watchMode: true,              // Cinema mode: fade the UI when idle
    watchIdleMs: 8000,            // Idle timeout (ms)
    mediaControlsOptions: {       // VueUse useMediaControls passthrough
      // ...
    },
  },
}
```

`showProgress` only affects the **autoplay** progress bar. The video's seek bar
is a part of the controls (`videoControls.scrubber`).

### Loop and autoplay

The **autoplay timer** decides when the slider advances. The video ending
doesn't advance it.

| Config | Behaviour |
|--------|-----------|
| default | The video plays once (`videoLoop: false`) while the timer keeps running. The slider advances when the timer runs out, whether or not the video has finished |
| `videoLoop: true` | The video loops. The timer advances the slider as usual |
| `pauseUntilVideoEnds: true` | The timer is held while the video plays or buffers. When the video ends, the timer resumes, so the slide still gets its delay before advancing. **No effect with `videoLoop: true`**, because a looping video never ends |
| `swiperOptions.autoplay: false` | Nothing advances automatically. Listen to `@video-ended` to move on yourself |

```vue
<script setup>
const hero = useTemplateRef('hero')
</script>

<template>
  <!-- Advance as soon as a video finishes, with autoplay off -->
  <HeroSlider ref="hero" :slides="slides" :options="{ swiperOptions: { autoplay: false } }"
    @video-ended="() => hero?.slider.next()" />
</template>
```

`@video-ended` receives the index of the slide whose video ended.

## Controls

The default controls are a centered play button with a progress ring, plus a
bottom bar with the scrubber, play/pause, mute and volume, time, a playback-speed
menu and fullscreen. Turn parts off with `videoControls`, on the slider or per
slide. A slide's value is merged over the slider's:

```ts
useHeroSlider(container, slides, {
  videoControls: {
    playButton: true,                     // centered play/pause + progress ring
    scrubber: true,                       // seek bar
    volume: true,                         // mute toggle + volume slider
    time: true,                           // "00:12 / 01:30"
    settings: { rates: [0.5, 1, 1.5, 2] }, // speed menu (true = 0.5, 0.75, 1, 1.25, 1.5, 2)
    fullscreen: false,                    // fullscreen button
  },
})
```

Every part defaults to `true`. The fullscreen button only appears where the
browser supports the Fullscreen API. It fullscreens the whole slider, not just
the video. The bar's play/pause button is always present. To hide every control
on a slide, use `config.showVideoControls: false`.

Style the bar and the center button with `ui.videoControls` / `ui.playButton`,
or with tokens like `--hero-ctrl-size` and `--hero-play-size`
([Theming](/theming)).

## Programmatic Video Control

The composable exposes the active slide's video state. In drop-in mode, reach it
through a template ref (`hero.value?.slider`):

```vue
<script setup>
const slider = useHeroSlider(container, slides, options)

// Check state
console.log(slider.videoPlaying.value)
console.log(slider.videoCurrentTime.value)
console.log(slider.videoDuration.value)

// Control playback
slider.videoToggle()           // Play/pause
slider.videoSeek(30)           // Seek to 30s
slider.videoSetVolume(0.5)     // Set volume to 50%
slider.videoToggleMute()       // Toggle mute

// Scrubber drag coordination
slider.videoScrubStart()       // Pause video, remember play state
slider.videoScrubEnd()         // Resume if was playing
</script>
```

## HLS Streaming

For `.m3u8` streams, enable the `hls` feature and install `hls.js`:

```bash
pnpm add hls.js
```

```ts
// nuxt.config.ts
hero: {
  features: {
    video: true,
    hls: true,
  },
}
```

```ts
const slides = [
  { bgSrc: 'https://stream.example.com/live/playlist.m3u8' },
]
```

hls.js is loaded lazily, and only when an `.m3u8` source is encountered — and
it's **injected, never imported**: with `hls: false` (the default) hls.js is
completely absent from the build graph, so not installing it can never break
your build. With the `hls` feature on, Safari / iOS play HLS natively even
without hls.js. With it off, `.m3u8` sources (and `bgType: 'hls'`) don't play at
all.

In plain Vue, pass the loader to the plugin instead of the feature flag alone:

```ts
app.use(HeroPlugin, {
  features: { hls: true },
  hlsLoader: () => import('hls.js'),
})
```

## Dark Mode Video

Use `bgDarkSrc` to provide an alternative video for dark mode:

```ts
{
  bgSrc: '/hero-light.mp4',
  bgDarkSrc: '/hero-dark.mp4',
}
```

The two sources may even be **different formats** — e.g. a progressive `.mp4`
in light and an HLS `.m3u8` stream in dark. On a theme switch the `<video>`
element is re-created for the new source (it's keyed by URL), so there's no
residual `MediaSource`/buffer left behind and the new source always loads
cleanly. The poster shows briefly while the new source buffers.

## Mobile / data saver

Video backgrounds ship mobile-friendly by default: `preload="metadata"`,
`playsinline` (+ legacy `webkit-playsinline`), `disablepictureinpicture`,
`disableremoteplayback`, and a forced `muted` property for reliable inline
autoplay on iOS. On data-/battery-constrained clients (Save-Data,
`prefers-reduced-data`, slow connection) the slider's lite mode kicks in and the
video **doesn't autoplay or preload** — the poster shows until the user taps
play. See [`dataSaver` / `useHeroEnvironment`](/composable#useheroenvironment).

## Custom Video Controls

### Replace the center button only

`#play-button` swaps the centered button and keeps the default bar:

```vue
<template #play-button="{ playing, waiting, progress, toggle }">
  <button type="button" class="size-20 rounded-full bg-white/30 text-white" :disabled="waiting"
    :aria-label="playing ? 'Pause video' : 'Play video'" @click="toggle()">
    {{ playing ? 'Pause' : 'Play' }} · {{ Math.round(progress) }}%
  </button>
</template>
```

Its props are plain values: `playing`, `waiting`, `progress` (0–100), `toggle`,
`index` and `slide`.

### Replace all controls

`#video-controls` replaces the center button and the bar. Its media props are
**refs**, and slot props aren't auto-unwrapped, so use `.value` in the template:

```vue
<script setup>
import { formatTime } from '#hero/utils' // plain Vue: from 'nuxt-hero/vue'
</script>

<template>
  <HeroSlider :slides="slides">
    <template #video-controls="{ playing, togglePlay, currentTime, duration, seek, muted, rate, toggleFullscreen }">
      <div class="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-black/50 p-4 text-white">
        <button type="button" @click="togglePlay()">
          {{ playing.value ? 'Pause' : 'Play' }}
        </button>
        <input type="range" class="flex-1" min="0" :max="duration.value" step="0.1"
          :value="currentTime.value" aria-label="Seek" @input="seek(Number($event.target.value))">
        <span>{{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}</span>
        <button type="button" @click="muted.value = !muted.value">{{ muted.value ? 'Unmute' : 'Mute' }}</button>
        <button type="button" @click="rate.value = rate.value === 1 ? 1.5 : 1">{{ rate.value }}×</button>
        <button type="button" @click="toggleFullscreen()">Fullscreen</button>
      </div>
    </template>
  </HeroSlider>
</template>
```

| Prop | Type |
|------|------|
| `playing`, `muted`, `waiting` | `Ref<boolean>` |
| `currentTime`, `duration`, `volume`, `rate` | `Ref<number>` |
| `buffered` | `Ref<[number, number][]>` |
| `togglePlay()`, `toggleFullscreen()` | `() => void` |
| `seek(time)` | `(time: number) => void` |
| `hls` | `{ loading, error, qualities, setQuality } \| null` (`null` unless the `hls` feature is on) |
| `index`, `slide` | `number`, `HeroSlide` |

Notes:

- The slot renders in a click-through layer above the slide content: put
  `pointer-events: auto` on your controls (and `swiper-no-swiping` on a bar you
  drag, so it doesn't swipe the slide).
- Add `data-hero-video-controls` to your bar to get the default bar's behaviour:
  the pagination pill lifts clear of it, and watch mode slides it away.
- `showVideoControls: false` hides custom controls too.

See [Components → `#video-controls`](/components#video-controls) for the full
reference.
