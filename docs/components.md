# Components

## HeroSlider

The main slider component. Wraps Swiper and manages backgrounds, overlays, animations, video, and parallax.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `HeroSlide[]` | **required** | Array of slide objects |
| `slider` | `UseHeroSliderReturn` | **required** | Return value of `useHeroSlider()` |
| `enterAnimation` | `string` | `''` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | Default leave animation class |
| `overlayPatterns` | `OverlayPattern[]` | `[{ type: 'lines', opacity: 0.1 }]` | Stacked overlay patterns |
| `parallax` | `boolean \| ParallaxConfig` | `true` | Parallax config — `false` to disable, `true` for defaults, or object |
| `imagePreset` | `string` | `''` | `@nuxt/image` preset name for backgrounds |
| `as` | `string` | `'div'` | Wrapper element tag |
| `ui` | `HeroSliderUI` | `{}` | Class overrides for internal elements |

### Slots

#### `#slide`

Main content slot for each slide.

```vue
<template #slide="{ slide, index, isActive, animationClass, isVideo,
  videoPlaying, videoDuration, videoCurrentTime, videoWaiting, videoEnded,
  videoMuted, videoVolume, videoToggle, videoSeek, videoSetVolume, videoToggleMute }">
  <div class="flex size-full items-center justify-center">
    <h1>{{ slide.title }}</h1>
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
| `videoPlaying` | `boolean` | Video playback state |
| `videoDuration` | `number` | Video duration in seconds |
| `videoCurrentTime` | `number` | Current playback position |
| `videoWaiting` | `boolean` | Video is buffering |
| `videoEnded` | `boolean` | Video has ended |
| `videoMuted` | `boolean` | Video mute state |
| `videoVolume` | `number` | Video volume (0–1) |
| `videoToggle` | `() => void` | Play/pause toggle |
| `videoSeek` | `(time: number) => void` | Seek to time |
| `videoSetVolume` | `(v: number) => void` | Set volume |
| `videoToggleMute` | `() => void` | Toggle mute |

#### `#pagination`

Replace the default pagination dots.

```vue
<template #pagination="{ activeIndex, snapIndex, totalSnaps, total,
  progress, goTo, vertical, autoplayEnabled }">
  <div class="flex gap-2">
    <button v-for="i in total" :key="i" @click="goTo(i - 1)">
      {{ i }}
    </button>
  </div>
</template>
```

#### `#navigation`

Replace the default prev/next arrows.

```vue
<template #navigation="{ prev, next, activeIndex, slides, vertical }">
  <button @click="prev">Previous</button>
  <button @click="next">Next</button>
</template>
```

#### `#overlay`

Custom overlay rendering per slide.

```vue
<template #overlay="{ patterns, index, isActive, patternCSS, patternSize }">
  <div v-for="(p, i) in patterns" :key="i"
    :style="{ backgroundImage: patternCSS(p), backgroundSize: patternSize(p), opacity: p.opacity }"
    class="absolute inset-0" />
</template>
```

#### `#video-controls`

Replace the built-in video controls.

```vue
<template #video-controls="{ playing, currentTime, duration, buffered,
  volume, muted, waiting, hls }">
  <div class="absolute bottom-4 left-4">
    <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
  </div>
</template>
```

## HeroSlide

Internal slide component. Renders background image/video, overlay patterns, and content via the `#slide` slot. Automatically registered — not typically used directly.

## HeroNavigation

Navigation arrows. Adapts orientation for `direction: 'vertical'` — arrows move to top/bottom. Automatically rendered when `showNavigation: true`.

## HeroPagination

Pagination dots with tooltip thumbnails. Adapts position for vertical layouts (moves to the side). Automatically rendered when `showPagination: true`.

## HeroSlideVideo

Video background component. Supports MP4, WebM, and HLS (`.m3u8`). Integrates with VueUse's `useMediaControls` for reactive playback state.

## HeroVideoControls

Built-in video controls overlay with play/pause, volume, mute, and fullscreen. Automatically rendered when `showVideoControls: true`.

## HeroVideoScrubber

Video timeline scrubber with buffered progress visualization. Rendered as part of the progress bar when the active slide is a video.

## UI Customization

Override internal element classes with the `ui` prop:

```vue
<HeroSlider
  :ui="{
    root: 'my-hero-root',
    swiper: 'rounded-xl overflow-hidden',
    slide: 'bg-gray-900',
    container: 'p-8',
    bg: 'brightness-75',
    controls: 'z-50',
    progress: 'bg-blue-500',
  }"
/>
```

| Key | Target | Description |
|-----|--------|-------------|
| `root` | Root wrapper | Outermost element |
| `swiper` | Swiper container | The `<Swiper>` wrapper |
| `slide` | SwiperSlide | Each slide wrapper |
| `container` | `.hero-slide` | Slide inner container |
| `bg` | `.hero-slide-bg` | Background image/video layer |
| `controls` | Controls overlay | Pagination, navigation, progress |
| `progress` | Progress bar track | Autoplay/video progress |
