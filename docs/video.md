# Video Backgrounds

## Setup

Enable the video feature in your module config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hero: {
    features: {
      video: true,
      hls: false, // Enable for .m3u8 streams
    },
  },
})
```

## Basic Video Slide

Videos are auto-detected by file extension (`.mp4`, `.webm`, `.mov`, `.ogg`, `.m3u8`):

```ts
const slides = [
  {
    bgSrc: '/hero-video.mp4',
    poster: '/hero-poster.jpg',
    title: 'Welcome',
  },
]
```

## Video Configuration

Per-slide video options via `config`:

```ts
{
  bgSrc: '/cinematic.mp4',
  poster: '/poster.jpg',
  config: {
    videoLoop: true,              // Loop playback (default: false)
    pauseUntilVideoEnds: true,    // Pause autoplay until video ends
    showVideoControls: true,      // Show play/pause, volume, fullscreen
    showProgress: true,           // Show video scrubber
    watchMode: true,              // Cinema mode — fade UI on idle
    watchIdleMs: 8000,            // Idle timeout (ms)
    mediaControlsOptions: {       // VueUse useMediaControls passthrough
      // ...
    },
  },
}
```

### Video Loop vs Auto-Advance

- `videoLoop: false` (default) — video plays once, then auto-advances to next slide
- `videoLoop: true` — video loops indefinitely, autoplay timer controls advancement
- `pauseUntilVideoEnds: true` — autoplay timer pauses while video plays, resumes after video ends. Has no effect when `videoLoop: true`

## Programmatic Video Control

The composable exposes full video state:

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
your build. Safari / iOS play HLS natively without hls.js either way.

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

Replace the built-in controls via the `#video-controls` slot:

```vue
<template #video-controls="{ playing, currentTime, duration, buffered,
  volume, muted, waiting, hls }">
  <div class="absolute bottom-0 inset-x-0 p-4 bg-black/50">
    <button @click="slider.videoToggle()">
      {{ playing ? 'Pause' : 'Play' }}
    </button>
    <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
  </div>
</template>
```
