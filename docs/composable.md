# useHeroSlider

The core composable that manages all slider state: navigation, autoplay, video
and hover detection. Use it for *controlled* mode (`<HeroSlider :slider>`). In
drop-in mode `<HeroSlider>` calls it for you with its `options` prop, and the
result is exposed on a template ref as `.slider`.

## Usage

```ts
const containerRef = useTemplateRef('containerRef')
const slides = ref<HeroSlide[]>([...])

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 }, speed: 600, effect: 'fade' },
  showAutoplayToggle: true,
  videoControls: { settings: false },
})
```

```vue
<HeroSlider ref="containerRef" :slider="slider" :slides="slides" />
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `containerRef` | `MaybeRefOrGetter<HTMLElement \| null>` | Root DOM element or component ref. It scopes hover, focus and visibility detection and parallax |
| `slides` | `MaybeRefOrGetter<HeroSlide[]>` | Slide definitions (array, ref or getter) |
| `options` | `MaybeRefOrGetter<UseHeroSliderOptions>` | Options object, or a ref / getter to change them later (see below) |

## Options

| Option | Type | Default | Per slide | Description |
|--------|------|---------|:---------:|-------------|
| `swiperOptions` | `SwiperOptions` | `{}` | | Any [Swiper parameter](https://swiperjs.com/swiper-api#parameters), see [below](#swiper-options) |
| `enterAnimation` | `string` | `''` | `animation.enter` | Default enter animation class |
| `leaveAnimation` | `string` | `''` | `animation.leave` | Default leave animation class |
| `animate` | `MaybeRefOrGetter<HeroAnimateOptions>` | `{}` | `animation` | `data-hero-animate` timing and JS hooks, see [Animations](/animations) |
| `showPagination` | `boolean` | `true` | ✓ | Show the pagination pill |
| `showNavigation` | `boolean` | `true` | ✓ | Show the navigation arrows |
| `showProgress` | `boolean` | `true` | ✓ | Show the **autoplay** progress bar. The video scrubber is controlled by `videoControls.scrubber` |
| `showVideoControls` | `boolean` | `true` | ✓ | Show video controls on video slides |
| `showAutoplayToggle` | `boolean` | `false` | ✓ | Show a pause/play button for autoplay ([WCAG 2.2.2](/accessibility#autoplay)) |
| `videoControls` | `HeroVideoControlsConfig` | all parts on | ✓ | Which parts of the default video controls render, see [Video](/video#controls) |
| `watchMode` | `boolean` | `false` | ✓ | Cinema mode for video slides, see [below](#watch-mode) |
| `watchIdleMs` | `number` | `10000` | ✓ | Idle time before watch mode hides the chrome |

**Per slide**: set the same key in `slide.config` to override it for one slide.
A slide's `videoControls` is merged over the slider's. Slide-only options
(`videoLoop`, `pauseUntilVideoEnds`, `mediaControlsOptions`) are listed under
[`SlideConfig`](/types#slideconfig).

### Reactive options

`options` can be a ref, a getter or a computed value. Changes then apply
without re-mounting: display options, `videoControls`, watch mode, animation
classes, `animate`, `autoplay.delay` and the other autoplay fields below. Swiper parameters are passed to Swiper's
Vue component, which applies what Swiper can update after init. For anything
structural, re-mount the slider (for example by changing its `:key`).

```ts
const compact = ref(false)

const slider = useHeroSlider(containerRef, slides, () => ({
  showNavigation: !compact.value,
  swiperOptions: { autoplay: { delay: compact.value ? 3000 : 6000 } },
}))
```

In drop-in mode the `:options` prop works the same way: bind a new object and it
takes effect.

::: warning Autoplay on/off is fixed at creation
Whether autoplay exists (`swiperOptions.autoplay !== false`) is read once. To
stop and start it later, use `autoplayPause()` / `autoplayResume()`.
:::

### Swiper Options

All standard [Swiper options](https://swiperjs.com/swiper-api#parameters) are accepted via `swiperOptions`:

```ts
useHeroSlider(container, slides, {
  swiperOptions: {
    effect: 'fade',              // needs the effect enabled (Nuxt: features.effects; Vue: its module + CSS)
    direction: 'vertical',       // 'horizontal' | 'vertical' (UI adapts)
    speed: 800,                  // Transition speed in ms
    slidesPerView: 1,            // Visible slides (> 1 or 'auto' = multi-slide mode)
    slidesPerGroup: 1,           // Slides per snap; pagination dots follow
    spaceBetween: 0,             // Gap between slides (px)
    initialSlide: 0,             // Starting slide
    mousewheel: true,            // needs the Mousewheel module (Nuxt: features.mousewheel)
    keyboard: true,              // needs the Keyboard module (Nuxt: features.keyboard)
    autoplay: { delay: 5000 },   // the built-in timer (see below)
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  },
})
```

The slider defaults are `slidesPerView: 1`, `spaceBetween: 0`, `grabCursor: true`
and `touchEventsTarget: 'container'`. Your values override them. `mousewheel`
defaults to `forceToAxis: true`, and the slider moves one slide per wheel gesture.

::: warning Modules aren't auto-registered
`mousewheel`, `keyboard`, effects and other module-backed options only work
when their Swiper module is registered. In Nuxt, use the matching
[feature flag](/configuration#swiper-modules). In Vue, use `swiperModules` or
`swiperOptions.modules`. A dev warning flags `mousewheel` without the module.
:::

#### Autoplay

Swiper's native autoplay is always disabled. The composable runs its own timer,
which drives the progress ring and bar and knows about videos. Autoplay is **on
by default** (5000 ms). Pass `autoplay: false` to turn it off. These
`autoplay` fields are honoured:

| Field | Default | Description |
|-------|---------|-------------|
| `delay` | `5000` | Time per slide in ms (follows option changes) |
| `pauseOnMouseEnter` | `true` | Pause while the pointer is over the slider |
| `disableOnInteraction` | `false` | Pause autoplay after any user navigation. **Swiper's own default is `true`**. It's `false` here so existing sliders keep running after a swipe |
| `stopOnLastSlide` | `false` | Stop on the last slide instead of rewinding to the first |

The timer also pauses while keyboard focus is inside the slider, while it's
offscreen or the tab is hidden, with `prefers-reduced-motion`, and during a
`pauseUntilVideoEnds` video. See [Accessibility → Autoplay](/accessibility#autoplay).

::: warning
`effect: 'cube'` is designed for exactly 4 slides. Using a different count triggers a dev-time warning. Use `'cards'` or `'coverflow'` for other counts.
:::

### Watch Mode

Watch mode gives video slides a cinema-like experience. While the video plays
and the user is idle for `watchIdleMs` (no mouse, key or touch input), the
content, overlay patterns, play button, pagination, arrows and autoplay bar fade
out. The video controls slide away too. Any input brings everything back.

```ts
useHeroSlider(container, slides, {
  watchMode: true,        // Enable globally
  watchIdleMs: 8000,      // 8 seconds idle before hiding the chrome
})
```

Per-slide override (both the flag and the timeout):

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
| `next()` | `() => void` | Go to the next slide (wraps to the first) |
| `prev()` | `() => void` | Go to the previous slide (wraps to the last) |
| `goTo(index)` | `(index: number) => void` | Go to a slide |
| `goToSnap(snap)` | `(snap: number) => void` | Go to a snap point (pagination dot). Accounts for `slidesPerGroup` |
| `swiper` | `ShallowRef<Swiper \| undefined>` | The Swiper instance (`undefined` until Swiper initializes), an escape hatch for its full API |

These four navigation calls count as user interaction for
`autoplay.disableOnInteraction`.

### Slide State

| Property | Type | Description |
|----------|------|-------------|
| `activeIndex` | `Ref<number>` | Current active slide index |
| `snapIndex` | `Ref<number>` | Current snap point index |
| `totalSnaps` | `Ref<number>` | Total snap points |
| `activeSlide` | `ComputedRef<HeroSlide>` | Current slide data |
| `activeSlideConfig` | `ComputedRef<ResolvedSlideConfig>` | The active slide's resolved config (slide `config` over slider defaults) |
| `getSlideConfig(index)` | `(index: number) => ResolvedSlideConfig` | Resolved config of any slide |
| `isActiveSlideVideo` | `ComputedRef<boolean>` | Whether the active slide has a video background |
| `isMultiSlide` | `ComputedRef<boolean>` | True when `slidesPerView > 1` or `'auto'`, which disables content animations |
| `animationClass(index)` | `(index: number) => string` | Get the CSS animation class for a slide |
| `previousIndex` | `Readonly<Ref<number>>` | Previously active slide (`-1` before the first change) |
| `direction` | `Readonly<Ref<'next' \| 'prev'>>` | Direction of the latest slide change |
| `animateOptions` | `ComputedRef<HeroAnimateOptions>` | Resolved `animate` options |
| `replayAnimation()` | `() => void` | Restart the active slide's content animation (presets + `onEnter`). See [Animations](./animations#first-slide-replay) |
| `animationReplaying` | `Readonly<Ref<boolean>>` | `true` for the two frames a replay holds the active slide hidden |
| `isVisible` | `Readonly<Ref<boolean>>` | Whether the slider is within the viewport |

### Autoplay

| Property | Type | Description |
|----------|------|-------------|
| `autoplayEnabled` | `boolean` | Whether autoplay is configured (fixed at creation) |
| `autoplayRunning` | `ComputedRef<boolean>` | Whether the timer is ticking right now (not paused by the API, hover, focus, video, visibility or reduced motion) |
| `autoplayProgress` | `ComputedRef<number>` | Progress of the current timer, 0–1 |
| `autoplayRemaining` | `ComputedRef<number>` | Remaining ms before advance |
| `autoplayDelay` | `Ref<number>` | Current delay in ms |
| `autoplayPaused` | `Ref<boolean>` | Paused through the API or toggle (or by `disableOnInteraction` / `stopOnLastSlide`) |
| `autoplayPause()` | `() => void` | Pause the timer |
| `autoplayResume()` | `() => void` | Resume the timer |
| `autoplayReset()` | `() => void` | Reset the timer |
| `autoplaySetDelay(ms)` | `(ms: number) => void` | Change autoplay delay |

### Video

All video state refers to the **active** slide's video, with safe defaults when
there is none.

| Property | Type | Description |
|----------|------|-------------|
| `videoPlaying` | `ComputedRef<boolean>` | Video playback state |
| `videoCurrentTime` | `ComputedRef<number>` | Current position (seconds) |
| `videoDuration` | `ComputedRef<number>` | Total duration (seconds) |
| `videoBuffered` | `ComputedRef<number>` | End of the last buffered range (seconds) |
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

`onSwiper`, `onSlideChange`, `registerSlideVideo` and `unregisterSlideVideo`
are internal bindings used by `<HeroSlider>`.

# useHeroEnvironment

Reactive, **SSR-safe** client-environment signals for mobile / PWA adaptiveness.
`<HeroSlider :data-saver="'auto'">` (the default) uses these to enable its lite
mode — video backgrounds don't autoplay or preload, and scroll parallax is
skipped — on data-/battery-constrained clients. You can also read them directly
to adapt your own slot content (e.g. swap a heavy widget for a static one on
cellular).

Every flag is `false`/empty on the server **and** during the first client render
(gated on `useMounted`), then settles to its real value after mount — so reading
them to drive rendering never causes a hydration mismatch.

## Usage

```vue
<script setup>
const { prefersDataSaver, saveData, slowConnection, reducedMotion } = useHeroEnvironment()
</script>
```

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `prefersDataSaver` | `ComputedRef<boolean>` | Data-/battery-constrained client (Save-Data, `prefers-reduced-data`, or 2g/slow-2g). Drives lite mode. |
| `saveData` | `ComputedRef<boolean>` | `navigator.connection.saveData` |
| `slowConnection` | `ComputedRef<boolean>` | Effective connection is `2g` / `slow-2g` |
| `effectiveType` | `ComputedRef<string>` | Raw `navigator.connection.effectiveType` (or `''`) |
| `reducedMotion` | `ComputedRef<boolean>` | `prefers-reduced-motion: reduce` |
| `reducedData` | `ComputedRef<boolean>` | `prefers-reduced-data: reduce` |
| `coarsePointer` | `ComputedRef<boolean>` | `pointer: coarse` (touch-primary device) |
| `mounted` | `Ref<boolean>` | True once mounted on the client |

> The Network Information API (`saveData` / `effectiveType`) is Chromium/Android
> only; on browsers without it those flags stay `false` and the media-query
> signals still work.


# useHeroDark

`useHeroDark(strategy?: 'class' | 'media'): ComputedRef<boolean>` returns the dark-mode
signal behind the `bgDarkSrc` swap. `'class'` (default) tracks a `dark` class on
`<html>`, and `'media'` follows `prefers-color-scheme`. It's always `false` on the
server. Auto-imported in Nuxt, and exported from `nuxt-hero/vue`.
