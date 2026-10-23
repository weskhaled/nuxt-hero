# Theming

The slider chrome is plain CSS (`hero.css`). You can restyle it at three
levels, from lightest to heaviest:

1. **Design tokens**: `--hero-*` custom properties for colors and sizes.
2. **`ui` classes**: extra classes on internal elements (Tailwind-friendly).
3. **Slots**: replace a part entirely (`#pagination`, `#navigation`,
   `#progress`, `#video-controls`, `#play-button`, `#background`, …). See
   [Components → Slots](/components#slots).

## Design tokens

```css
/* every slider */
:root {
  --hero-primary: #f59e0b;
}

/* one slider: <HeroSlider class="promo-hero"> */
.promo-hero {
  --hero-scrim: none;
  --hero-dot-size: 0.5rem;
  --hero-pagination-offset: 2rem;
}
```

The defaults are declared with zero specificity (`:where(:root)`), so your
values win wherever you set them, whichever stylesheet loads first.

On touch devices (`pointer: coarse`) the four control-size tokens get larger
defaults, also at zero specificity — a size you set yourself (on `:root`, the
slider, or a class) wins on every device. To keep the touch bump, set your own
value inside `@media (pointer: coarse)` too.

### Colors

| Variable | Default | Affects |
|----------|---------|---------|
| `--hero-primary` | `var(--ui-primary, #ffffff)` | Accent color: active dot ring, autoplay bar fill, scrubber and volume fill, center play-button ring, focus outlines |
| `--hero-on-media` | `#ffffff` | Foreground over media: control icons, inactive dots, time label |
| `--hero-surface` | `rgb(0 0 0 / 0.35)` | Pagination pill background |
| `--hero-ring` | `rgb(255 255 255 / 0.9)` | Ring around the pagination pill and its thumbnail tooltips |
| `--hero-progress-bg` | `rgb(255 255 255 / 0.2)` | Tracks: autoplay bar, video scrubber, volume slider |
| `--hero-ctrl-bg` | `rgb(255 255 255 / 0.25)` | Filled buttons: video controls bar, volume group, autoplay toggle |
| `--hero-ctrl-bg-hover` | `rgb(255 255 255 / 0.35)` | The same buttons on hover |
| `--hero-nav-color` | `#000` · dark `#fff` | Navigation arrow icon |
| `--hero-nav-bg` | `rgb(255 255 255 / 0.4)` · dark `rgb(0 0 0 / 0.4)` | Navigation arrow background |
| `--hero-nav-ring` | `#fff` · dark `#000` | Navigation arrow outline |
| `--hero-scrim` | `0rem -8rem 8rem -6rem rgb(0 0 0) inset` | Bottom inset shadow on every slide (a `box-shadow` value). `none` disables it |

`--hero-primary` follows Nuxt UI's `--ui-primary`, which already changes shade
for light and dark mode. In a Nuxt UI app the accent matches your brand with no
extra setup. Without `--ui-primary` it falls back to white.

### Sizes and spacing

| Variable | Default | Affects |
|----------|---------|---------|
| `--hero-ctrl-size` | `2rem` · touch `2.5rem` | Video bar buttons, autoplay toggle |
| `--hero-play-size` | `3rem` · touch `3.5rem` | Centered video play button |
| `--hero-dot-size` | `0.625rem` · touch `0.75rem` | Inactive pagination dot |
| `--hero-dot-hit` | `1rem` · touch `2rem` | Clickable area of each dot |
| `--hero-dot-ring-size` | `0.75rem` | Diameter of the active dot's progress ring |
| `--hero-dot-ring-thickness` | `0.15rem` | Stroke width of that ring |
| `--hero-pagination-offset` | `1rem` | Distance of the pagination pill and autoplay toggle from the slider edge |
| `--hero-pagination-lift` | `4.75rem` | Bottom offset of the pill and toggle while a video controls bar is showing (single-slide mode), so they clear the bar |
| `--hero-autoplay-bar-size` | `0.25rem` | Thickness of the autoplay progress bar |
| `--hero-nav-preview-width` | `9rem` | Width of the thumbnail strip an arrow reveals on hover (horizontal sliders) |

`--hero-dot-ring-size` and `--hero-dot-ring-thickness` are not declared by
default. The values above are fallbacks, so set them anywhere above the
pagination.

### Animation

Content choreography (`data-hero-animate`) reads `--hero-anim-duration`,
`--hero-anim-stagger`, `--hero-anim-delay`, `--hero-anim-easing`,
`--hero-anim-distance`, `--hero-anim-leave-duration` and `--hero-anim-index`.
The `animate` option sets them for you. See
[Animations → Timing](/animations#timing).

## `ui` classes

`ui` adds your classes to internal elements, next to the built-in ones:

```vue
<HeroSlider
  :slides="slides"
  :ui="{
    root: 'rounded-3xl overflow-hidden',
    content: 'px-6 md:px-16',
    pagination: 'shadow-lg',
    playButton: 'size-16',
  }"
/>
```

| Key | Element | Notes |
|-----|---------|-------|
| `root` | `.hero-slider` | Root element |
| `swiper` | `.hero-swiper` | Swiper container |
| `slide` | `.hero-swiper-slide` | Each Swiper slide (also has `.swiper-slide`) |
| `container` | `.hero-slide` | Slide inner container |
| `bg` | `.hero-slide-bg` | Background layer (image, video or `#background`) |
| `scrim` | `.hero-slide-scrim` | Inset scrim over the background |
| `content` | `.hero-slide-content` | Content layer holding `#slide` |
| `controls` | `.hero-controls` | Slider-level UI layer (pagination, navigation, progress, autoplay toggle) |
| `progress` | `.hero-autoplay-progress` | Autoplay bar track (default bar only, not `#progress`) |
| `progressFill` | `.hero-autoplay-progress-fill` | Autoplay bar fill (default bar only) |
| `pagination` | `.hero-pagination` | Pagination pill (default component only, not `#pagination`) |
| `navigation` | `.hero-nav` | Navigation arrows wrapper (default component only) |
| `videoControls` | `.hero-media-controls` | Video controls bar (default controls only, not `#video-controls`) |
| `playButton` | `.hero-play-center-btn` | Centered video play button (default button only, not `#play-button`) |
| `autoplayToggle` | `.hero-autoplay-toggle` | Autoplay pause/play button (`showAutoplayToggle`) |

::: warning When a `ui` class has no effect
Your class and the shipped CSS may set the same property. Then the cascade
decides which one applies. Two common cases:

- **Tailwind v4** puts utilities in `@layer utilities`. Unlayered CSS beats
  layered CSS, so `hero.css` and Swiper's CSS win over the utility.
- **Swiper's** `.swiper-slide { width: 100% }` beats `ui.slide: 'w-80'` with
  `slidesPerView: 'auto'`.

Fix both with [cascade layers](#cascade-layers).
:::

## Cascade layers

Put Swiper's CSS and `hero.css` in cascade layers, and any class you write wins
over them.

**Nuxt:**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hero: { cssLayer: true },
})
```

The module then imports the same sheets (Swiper core, enabled Swiper module and
effect CSS, `hero.css`) into two layers, `hero-vendor` and `hero`, and declares
the layer order before your app CSS:

```css
@layer theme, base, hero-vendor, hero, components, utilities;
```

Tailwind v4's layer names sit around the slider's: its Preflight (`base`) can't
reset the slider's buttons, while utilities (e.g. `ui.slide: 'w-80'`) still win.
Without Tailwind those names are just empty layers. Default: `false`.

**Plain Vue:** import the styles into layers yourself, instead of the plain
imports:

```css
/* main.css — before any other CSS, so the order statement comes first */
@layer theme, base, hero-vendor, hero, components, utilities;
@import 'swiper/css' layer(hero-vendor);
@import 'swiper/css/effect-fade' layer(hero-vendor); /* any module / effect CSS you use */
@import 'nuxt-hero/hero.css' layer(hero);
```

::: warning Trade-off
Layered styles lose to every **unlayered** rule, so global unlayered resets
(e.g. `img { height: auto }`, `button { … }` outside any layer) now override the
slider too. If something looks off after you enable layers, look for those.
Tailwind's own Preflight is fine — it lives in `base`, before the slider.
:::

## Styling hooks

The root element exposes the slider's state, so you can style it from outside:

| Hook | Values | Meaning |
|------|--------|---------|
| `[data-idle]` | `"true"` / `"false"` | No mouse, key or touch input for the active slide's `watchIdleMs` |
| `[data-watch-mode]` | `"true"` / `"false"` | The active slide has watch mode on |
| `[data-video-active]` | `"true"` / `"false"` | The active slide has a video background |
| `[data-multi-slide]` | present / absent | More than one slide per view (`slidesPerView > 1` or `'auto'`) |
| `[data-direction]` | `"next"` / `"prev"` | Direction of the latest slide change |
| `.hero-watch-idle` | class | Watch mode is hiding the chrome: video playing and the user idle |
| `.hero-fs-idle` | class | The slider is fullscreen and the user idle (cursor hidden) |
| `[data-hero-video-controls]` | on **your** element | Marks a custom `#video-controls` bar: the pagination lifts clear of it and watch mode slides it away |

Each slide's content wrapper also carries `data-hero-anim="in" | "out" | "idle"`
(see [Animations](/animations#first-slide-replay)).

```css
/* Dim the content while a video slide plays in watch mode */
.hero-slider.hero-watch-idle .hero-slide-content { opacity: 0.2 !important; }

/* Hide the arrows on video slides */
.hero-slider[data-video-active='true'] .hero-nav { display: none; }
```

## Dark mode

The chrome's dark styles key off a **`.dark` ancestor class** (zero specificity,
via `:where(.dark)`). This is the convention Tailwind, Nuxt UI and
`@nuxtjs/color-mode` (`classSuffix: ''`) share. Only the navigation tokens
change in dark mode. A few other details change too: the arrow preview and the
centered play button background.

Set your own dark values with a more specific selector:

```css
:root      { --hero-nav-bg: rgb(255 255 255 / 0.6); }
:root.dark { --hero-nav-bg: rgb(0 0 0 / 0.6); }
```

The `darkMode: 'media'` option only switches slide backgrounds (`bgDarkSrc`). The
CSS still keys off `.dark`. Apps without a `.dark` class can set the tokens in a
media query:

```css
@media (prefers-color-scheme: dark) {
  :root { --hero-nav-color: #fff; --hero-nav-bg: rgb(0 0 0 / 0.4); --hero-nav-ring: #000; }
}
```

## Examples

**Brand accent, quieter chrome:**

```css
.hero-slider {
  --hero-primary: var(--ui-color-primary-400);
  --hero-surface: rgb(0 0 0 / 0.55);
  --hero-ring: transparent;
  --hero-scrim: 0 -12rem 10rem -8rem rgb(0 0 0 / 0.8) inset;
}
```

**Card carousel** (`slidesPerView: 'auto'` with fixed-width cards, Nuxt):

```ts
// nuxt.config.ts — let `ui.slide` win over Swiper's width
hero: { cssLayer: true }
```

```vue
<HeroSlider
  :slides="slides"
  :options="{ swiperOptions: { slidesPerView: 'auto', spaceBetween: 16 } }"
  :ui="{ slide: 'w-80 rounded-2xl' }"
  class="h-96"
/>
```
