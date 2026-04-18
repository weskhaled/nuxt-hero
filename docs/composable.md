# useHeroSlider

The core composable that manages all slider state — navigation, autoplay, video, and hover detection.

## Usage

```ts
const containerRef = useTemplateRef('containerRef')
const slides = ref<HeroSlide[]>([...])

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600, effect: 'fade' },
  showPagination: true,
  showNavigation: true,
  showProgress: true,
  watchMode: false,
})
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `containerRef` | `MaybeRefOrGetter<HTMLElement \| null>` | Root DOM element or component ref — used for hover detection and GSAP scoping |
| `slides` | `MaybeRefOrGetter<HeroSlide[]>` | Reactive array of slide definitions |
| `options` | `UseHeroSliderOptions` | Configuration object (see below) |

## Options

```ts
interface UseHeroSliderOptions {
  swiperOptions?: SwiperOptions
  enterAnimation?: string        // Default: ''
  leaveAnimation?: string        // Default: ''
  showPagination?: boolean       // Default: true
  showNavigation?: boolean       // Default: true
  showProgress?: boolean         // Default: true
  showVideoControls?: boolean    // Default: true
  watchMode?: boolean            // Default: false
  watchIdleMs?: number           // Default: 10000
}
```

### Swiper Options

All standard [Swiper options](https://swiperjs.com/swiper-api#parameters) are accepted via `swiperOptions`:

```ts
useHeroSlider(container, slides, {
  swiperOptions: {
    effect: 'fade',              // 'fade' | 'cube' | 'coverflow' | 'creative' | 'cards' | 'flip'
    direction: 'vertical',      // 'horizontal' | 'vertical'
    speed: 800,                  // Transition speed in ms
    loop: true,                  // Infinite loop
    slidesPerView: 1,            // Visible slides
    spaceBetween: 0,             // Gap between slides (px)
    centeredSlides: false,       // Center active slide
    grabCursor: true,            // Show grab cursor
    mousewheel: true,            // Mousewheel control (auto-registers module)
    autoplay: { delay: 5000 },   // Autoplay delay (timer is managed internally)
    breakpoints: {               // Responsive breakpoints
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  },
})
```

::: tip
Swiper's native autoplay is always disabled. The composable manages its own progress timer using `autoplay.delay` as the interval. This enables smooth progress tracking and video-aware pausing.
:::

::: warning
`effect: 'cube'` is designed for exactly 4 slides. Using a different count triggers a dev-time warning. Use `'cards'` or `'coverflow'` for other counts.
:::

### Watch Mode

Watch mode provides a cinema-like experience for video slides. When active and the video is playing, content, overlay patterns, and the play button fade out. After `watchIdleMs` of mouse inactivity, video controls slide out too.

```ts
useHeroSlider(container, slides, {
  watchMode: true,        // Enable globally
  watchIdleMs: 8000,      // 8 seconds idle before hiding controls
})
```

Per-slide override:

```ts
const slides = [
  {
    bgSrc: '/cinematic.mp4',
    config: {
      watchMode: true,      // Enable for this slide only
      watchIdleMs: 5000,    // Custom idle timeout
    },
  },
]
```

## Return Value

The composable returns a flat object with all slider state and controls:

### Navigation

| Property | Type | Description |
|----------|------|-------------|
| `next()` | `() => void` | Go to next slide |
| `prev()` | `() => void` | Go to previous slide |
| `goTo(index)` | `(index: number) => void` | Go to specific slide |

### Slide State

| Property | Type | Description |
|----------|------|-------------|
| `activeIndex` | `Ref<number>` | Current active slide index |
| `snapIndex` | `Ref<number>` | Current snap point index |
| `totalSnaps` | `Ref<number>` | Total snap points |
| `activeSlide` | `ComputedRef<HeroSlide>` | Current slide data |
| `activeSlideConfig` | `ComputedRef<ResolvedSlideConfig>` | Resolved config with defaults |
| `isActiveSlideVideo` | `ComputedRef<boolean>` | Whether active slide has video bg |
| `isMultiSlide` | `ComputedRef<boolean>` | True when `slidesPerView > 1` — disables content animations |
| `animationClass(index)` | `(index: number) => string` | Get CSS animation class for a slide |

### Autoplay

| Property | Type | Description |
|----------|------|-------------|
| `autoplayEnabled` | `boolean` | Whether autoplay is configured |
| `autoplayProgress` | `ComputedRef<number>` | Progress 0–1 of current timer |
| `autoplayRemaining` | `ComputedRef<number>` | Remaining ms before advance |
| `autoplayDelay` | `Ref<number>` | Current delay in ms |
| `autoplayPaused` | `Ref<boolean>` | Whether autoplay is paused |
| `autoplayPause()` | `() => void` | Pause the timer |
| `autoplayResume()` | `() => void` | Resume the timer |
| `autoplayReset()` | `() => void` | Reset the timer |
| `autoplaySetDelay(ms)` | `(ms: number) => void` | Change autoplay delay |

### Video

| Property | Type | Description |
|----------|------|-------------|
| `videoPlaying` | `ComputedRef<boolean>` | Video playback state |
| `videoCurrentTime` | `ComputedRef<number>` | Current position (seconds) |
| `videoDuration` | `ComputedRef<number>` | Total duration (seconds) |
| `videoBuffered` | `ComputedRef<number>` | Buffered amount |
| `videoVolume` | `ComputedRef<number>` | Volume (0–1) |
| `videoMuted` | `ComputedRef<boolean>` | Mute state |
| `videoWaiting` | `ComputedRef<boolean>` | Buffering state |
| `videoEnded` | `ComputedRef<boolean>` | Video has ended |
| `videoToggle()` | `() => void` | Play/pause toggle |
| `videoSeek(time)` | `(time: number) => void` | Seek to position |
| `videoScrubStart()` | `() => void` | Call when scrubber drag starts |
| `videoScrubEnd()` | `() => void` | Call when scrubber drag ends |
| `videoSetVolume(v)` | `(v: number) => void` | Set volume |
| `videoToggleMute()` | `() => void` | Toggle mute |

### Other

| Property | Type | Description |
|----------|------|-------------|
| `isHovered` | `Ref<boolean>` | Whether the container is being hovered |
| `containerEl` | `ComputedRef<HTMLElement \| null>` | Resolved container DOM element |
| `mergedSwiperOptions` | `ComputedRef<Record<string, unknown>>` | Final Swiper config (for component binding) |
