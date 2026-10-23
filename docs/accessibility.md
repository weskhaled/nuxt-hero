# Accessibility

The slider follows the [WAI-ARIA APG carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).
All of its controls are native buttons and range inputs, and every label can be
localized.

## Carousel semantics

With more than one slide:

| Element | Attributes |
|---------|------------|
| Root | `role="region"`, `aria-roledescription` = `labels.carouselRole` (`'carousel'`), `aria-label` = `labels.carousel` (`'Carousel'`) |
| Each slide | `aria-roledescription` = `labels.slideRole` (`'slide'`) |
| Inactive slides | `inert`: removed from the accessibility tree and not focusable, so Tab never moves into a hidden slide |

With several slides per view (`slidesPerView > 1` or `'auto'`) no slide is
`inert`, because every visible card stays usable.

Swiper's **A11y module** adds slide labels and a live region on top of this. In
Nuxt it's the `a11y` feature, on by default (`features.a11y: false` turns it
off). In plain Vue, pass `A11y` in `swiperModules`.

## Keyboard

- **Tab** reaches every control (arrows, dots, video buttons, scrubber, volume,
  speed menu, autoplay toggle). **Enter** or **Space** activates a button. The
  scrubber and the volume slider are native range inputs, so the arrow keys
  move them.
- **Focus ring**: a 2px `:focus-visible` outline in `--hero-primary`. Mouse
  clicks don't show it.
- **Speed menu**: the trigger has `aria-haspopup="menu"` and `aria-expanded`.
  Options are `menuitemradio` with `aria-checked`. **Escape** or a click outside
  closes the menu.
- **Arrow keys between slides**: use Swiper's Keyboard module. In Nuxt, set
  `features.keyboard: true`; in Vue, add `Keyboard` to `swiperModules`. Then
  enable it with `swiperOptions: { keyboard: true }`.

## Autoplay

[WCAG 2.2.2 (Pause, Stop, Hide)](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
requires a way to pause content that moves on its own. The autoplay timer
already pauses whenever one of these holds:

| Condition | Notes |
|-----------|-------|
| The pointer is over the slider | `swiperOptions.autoplay.pauseOnMouseEnter` (default `true`) |
| Keyboard focus is inside the slider | `:focus-visible` focus only. Clicking an arrow with the mouse doesn't freeze it |
| The slider is scrolled out of view, or the tab is hidden | |
| The user prefers reduced motion | `prefers-reduced-motion: reduce`: autoplay doesn't advance at all |
| Paused through the API or the toggle | `autoplayPause()` / `autoplayResume()` |
| A `pauseUntilVideoEnds` video is playing | See [Video](/video#loop-and-autoplay) |

Hover and focus pauses don't help touch users. To give everyone a control, show
the **autoplay toggle**, a pause/play button in the bottom inline-start corner:

```vue
<HeroSlider :slides="slides" :options="{ showAutoplayToggle: true }" />
```

It's off by default (`showAutoplayToggle: false`) and can be set per slide
(`slide.config.showAutoplayToggle`). It renders only while autoplay is enabled.
Its labels are `labels.pauseAutoplay` and `labels.playAutoplay`.

Related Swiper autoplay options the slider honours:

| Option | Default here | Effect |
|--------|--------------|--------|
| `disableOnInteraction` | `false` (Swiper's own default is `true`) | `true`: any user navigation (drag, arrows, dots, keys, wheel, or `next()` / `prev()` / `goTo()` / `goToSnap()` calls) pauses autoplay until resumed |
| `stopOnLastSlide` | `false` | `true`: on the last slide, autoplay stops with a full progress bar (`autoplayPaused` becomes `true`) instead of rewinding to the first slide |

### Announcements

Swiper's A11y module marks the slide wrapper as an `aria-live` region. The slider
uses its own timer rather than Swiper's autoplay, so it manages that attribute
itself. It sets `aria-live="off"` while the timer runs, so automatic changes
aren't announced. When the timer is paused (hover, focus, toggle, reduced
motion…) it sets `aria-live="polite"`, so slide changes are announced. The slider
only touches the attribute when the A11y module has set it.

## Labels

Every built-in label can be overridden with `<HeroSlider :labels>`, for example
to localize it. Omitted keys keep their English default.

```vue
<HeroSlider
  :slides="slides"
  :labels="{ carousel: 'Featured stories', goToSlide: 'Slide {n} of {total}: {title}' }"
/>
```

| Key | Used for | Default |
|-----|----------|---------|
| `carousel` | Root region name (`aria-label`) | `'Carousel'` |
| `carouselRole` | Root `aria-roledescription` | `'carousel'` |
| `slideRole` | Each slide's `aria-roledescription` | `'slide'` |
| `prev` | Previous-slide arrow | `'Previous slide'` |
| `next` | Next-slide arrow | `'Next slide'` |
| `pagination` | Pagination landmark | `'Slide pagination'` |
| `goToSlide` | Each dot. `{n}` = dot number (1-based), `{total}` = dot count, `{title}` = the dot's first slide title (empty if none) | `'Go to slide {n}'` |
| `autoplayProgress` | Active dot's progress ring | `'Autoplay progress'` |
| `pauseAutoplay` | Autoplay toggle while running | `'Pause autoplay'` |
| `playAutoplay` | Autoplay toggle while paused | `'Play autoplay'` |
| `play` | Video play buttons | `'Play video'` |
| `pause` | Video pause buttons | `'Pause video'` |
| `videoProgress` | Center play button's progress ring | `'Video progress'` |
| `mute` | Mute toggle | `'Toggle mute'` |
| `volume` | Volume slider | `'Volume'` |
| `seek` | Scrubber | `'Seek'` |
| `settings` | Speed-menu button | `'Settings'` |
| `speed` | Speed-menu heading | `'Playback speed'` |
| `speedNormal` | The 1× option | `'Normal'` |
| `fullscreenEnter` | Fullscreen button | `'Enter fullscreen'` |
| `fullscreenExit` | Fullscreen button while fullscreen | `'Exit fullscreen'` |

Each `goToSlide` placeholder is replaced once.

## Images

Background images are decorative by default (`alt=""`). When an image carries
meaning, describe it with `bgAlt`:

```ts
{ bgSrc: '/team.jpg', bgAlt: 'Our team at the 2025 offsite' }
```

Thumbnail previews on the navigation arrows are decorative too, because the
button's label already names it.

## Reduced motion

With `prefers-reduced-motion: reduce`:

- autoplay doesn't advance;
- `data-hero-animate` content appears without animating. Class-based
  animations (`hero-*`, animate.css) are cut to 1 ms;
- JS animation hooks receive `reducedMotion: true` in their context, so they can
  skip their animation;
- scroll parallax is skipped;
- arrow, preview and pagination-tooltip transitions are near-instant, and the
  video controls bar appears without its entrance animation.

## Touch

On coarse pointers (`pointer: coarse`) the targets grow (WCAG 2.5.8):

| Token | Mouse | Touch |
|-------|-------|-------|
| `--hero-ctrl-size` | `2rem` | `2.5rem` |
| `--hero-play-size` | `3rem` | `3.5rem` |
| `--hero-dot-size` | `0.625rem` | `0.75rem` |
| `--hero-dot-hit` | `1rem` | `2rem` |

The arrows and the scrubber also get larger hit areas. The centered play button
stays visible while the video is paused, so the user can tap to play. On devices
without hover, the volume slider is hidden and only the mute toggle shows.
See [Theming](/theming#sizes-and-spacing) to adjust these sizes.
