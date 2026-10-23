# Configuration

## Module Options

Configure the module in your `nuxt.config.ts` under the `hero` key:

```ts
export default defineNuxtConfig({
  hero: {
    // Component name prefix (<HeroSlider>, <HeroPagination>, …)
    prefix: 'Hero',

    // Default volume for video backgrounds (0 = muted, 1 = full)
    defaultVolume: 0,

    // Dark detection for bgDarkSrc: 'class' (.dark on <html>) | 'media'
    darkMode: 'class',

    // Put Swiper's CSS + hero.css in cascade layers so your classes win
    cssLayer: false,

    // Feature flags (see below). Anything you set wins over the defaults.
    features: {
      effects: ['fade'],
    },
  },
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | `'Hero'` | Component name prefix |
| `defaultVolume` | `number` | `0` | Initial volume of video backgrounds (0–1) |
| `darkMode` | `'class' \| 'media'` | `'class'` | How dark mode is detected for `bgDarkSrc` (see below) |
| `cssLayer` | `boolean` | `false` | Load Swiper's CSS and `hero.css` into cascade layers (`hero-vendor`, `hero`) so your classes win over them (see [Theming → Cascade layers](/theming#cascade-layers)) |
| `features` | `HeroFeatures` | see below | Which parts and Swiper modules are built in |
| `tailwind` | — | — | **Deprecated**, ignored with a warning. Remove it |

### `darkMode`

How dark mode is detected for the per-slide `bgDarkSrc` image/video swap:

- **`'class'`** (default): tracks a `dark` class on `<html>`. This is the
  convention shared by Tailwind's class strategy, Nuxt UI, and
  `@nuxtjs/color-mode` with `classSuffix: ''`. Any color-mode implementation that
  toggles that class works, and none is required.
- **`'media'`**: the OS-level `prefers-color-scheme: dark` media query, for
  apps with no class-based dark mode.

This option only affects the background swap. The chrome's CSS dark styles always
key off `.dark` (see [Theming → Dark mode](/theming#dark-mode)).

### `cssLayer`

With `cssLayer: true`, Swiper's CSS and `hero.css` load into cascade layers that
are declared before your app's CSS. Any class you write then wins over them. One
example is `ui.slide: 'w-80'` with `slidesPerView: 'auto'`, which Swiper's
`.swiper-slide { width: 100% }` would otherwise override. The trade-off:
unlayered app CSS, including resets, also beats the slider's styles. Details
and the plain-Vue equivalent are in [Theming](/theming#cascade-layers).

### `tailwind` (deprecated)

No longer used. Hero styles ship as **plain CSS** (injected by the module), so
no Tailwind pipeline is involved. Setting the option logs a warning and does
nothing, so remove it from your config.

## Feature Flags

Feature flags decide which parts of the slider render and which Swiper modules
and CSS are bundled. Swiper modules and CSS behind a disabled flag are never
imported. The slider's own parts (navigation, pagination, video) are lazy
chunks that load only when they render.

**Defaults** (the same as the [Vue plugin](/vue)):

| Flag | Default |
|------|---------|
| `navigation`, `pagination`, `video`, `a11y` | `true` |
| `parallax` | `true` when the `gsap` package resolves from your app, otherwise `false` |
| everything else | `false` |

The flags you set are merged over these defaults. Setting `parallax: true`
without `gsap` installed logs a warning and keeps parallax off.

### Slider features

| Flag | What it enables |
|------|-----------------|
| `navigation` | The slider's arrows (`<HeroNavigation>`) |
| `pagination` | The slider's pagination pill (`<HeroPagination>`) |
| `video` | Video backgrounds, controls and scrubber (lazy-loaded per video slide) |
| `hls` | `.m3u8` playback through `hls.js` (lazy-loaded). Turns on `video` |
| `parallax` | GSAP scroll parallax (`<HeroSlider :parallax>`), lazy-loaded. Needs `gsap` |

### Swiper modules

Each flag registers a Swiper module on every slider, plus its CSS where it has
one:

| Flag | Swiper Module | CSS Loaded | Notes |
|------|--------------|------------|-------|
| `a11y` | `A11y` | — | Screen-reader support (**on by default**) |
| `keyboard` | `Keyboard` | — | Arrow-key navigation; enable with `swiperOptions.keyboard` |
| `mousewheel` | `Mousewheel` | — | Wheel/trackpad navigation, one slide per gesture; enable with `swiperOptions.mousewheel` |
| `swiperNavigation` | `Navigation` | `swiper/css/navigation` | Only for Swiper's **native** `swiperOptions.navigation` |
| `swiperPagination` | `Pagination` | `swiper/css/pagination` | Only for Swiper's **native** `swiperOptions.pagination` |
| `freeMode` | `FreeMode` | `swiper/css/free-mode` | Free-scroll without snapping |
| `thumbs` | `Thumbs` | `swiper/css/thumbs` | Thumbnail gallery |
| `grid` | `Grid` | `swiper/css/grid` | Multi-row grid layout |
| `zoom` | `Zoom` | `swiper/css/zoom` | Pinch/double-tap zoom |
| `scrollbar` | `Scrollbar` | `swiper/css/scrollbar` | Scrollbar indicator |
| `controller` | `Controller` | — | Sync multiple sliders |
| `virtual` | `Virtual` | `swiper/css/virtual` | Virtual slides for large lists |
| `hashNavigation` | `HashNavigation` | — | URL hash linking |
| `history` | `History` | — | Browser history |
| `swiperParallax` | `Parallax` | — | Swiper's transition parallax |

::: tip Mousewheel and keyboard need both
The flag registers the module, and the Swiper option turns it on. Setting
`swiperOptions.mousewheel` without the module does nothing, and the slider logs a
dev warning. The module isn't registered automatically.
:::

### Slide Effects

Enable effects via the `effects` array. Each effect registers its Swiper module and CSS:

| Effect | Description |
|--------|-------------|
| `fade` | Crossfade between slides |
| `cube` | 3D cube rotation (best with exactly 4 slides) |
| `coverflow` | 3D coverflow carousel |
| `creative` | Custom CSS transform transitions |
| `cards` | Stacked cards with depth |
| `flip` | 3D flip transition |

```ts
// Only bundle fade and creative effects
hero: {
  features: {
    effects: ['fade', 'creative'],
  },
}
```

Unknown effect names are dropped with a warning.

### Components

`<HeroSlider>` and `<HeroSlide>` are always registered. `<HeroPagination>` and
`<HeroNavigation>` are registered when their flag is on. `<HeroVideoControls>`,
`<HeroVideoScrubber>` and `<HeroSlideVideo>` are registered when `video` is on.
`<HeroIcon>` is not auto-registered in Nuxt.

### Auto-Enabled Dependencies

- Setting `hls: true` automatically enables `video: true`.
- If your app happens to use `@nuxtjs/color-mode`, the module sets its
  `classSuffix` to `''` so the toggled class is `.dark`. Color-mode is
  **not required**: dark detection watches the `.dark` class directly.

## Types

`HeroModuleOptions`, `HeroFeatures` and every public type are exported from
`nuxt-hero`. See [Types](/types).

## Dark mode

The chrome is dark-mode aware via the **`.dark` class** convention (`:where(.dark)`
ancestor selectors in the shipped CSS). Tailwind, Nuxt UI and a `color-mode`
`classSuffix: ''` setup use the same strategy. In such an app the hero shares
the existing `.dark` toggle with no extra wiring. Apps without a class toggle can
set `darkMode: 'media'` for the background swap. For the chrome, see
[Theming → Dark mode](/theming#dark-mode).

## Theming

Colors and sizes are `--hero-*` CSS custom properties. Internal elements accept
extra classes through the `ui` prop. The full token list, `ui` keys and styling
hooks are on the [Theming](/theming) page.

```css
/* e.g. pin the accent to a specific primary shade */
.hero-slider { --hero-primary: var(--ui-color-primary-400); }
```

## RTL

Set `dir="rtl"` on an ancestor, for example `<html dir="rtl">` as a bilingual app
does per locale. The slider then follows automatically. Swiper's slide direction
syncs at init **and** on runtime locale switches. The navigation, pagination,
progress bar and hover thumbnails all flip. No per-instance configuration is
needed.

## Accessibility

The slider follows the WAI-ARIA APG carousel pattern. Its labels can be
localized, and autoplay pauses on hover, keyboard focus and reduced motion. See
[Accessibility](/accessibility).
