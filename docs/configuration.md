# Configuration

## Module Options

Configure the module in your `nuxt.config.ts` under the `hero` key:

```ts
export default defineNuxtConfig({
  hero: {
    // Component name prefix (e.g., <HeroSlider>, <HeroPagination>)
    prefix: 'Hero',

    // Default volume for video backgrounds (0 = muted, 1 = full)
    defaultVolume: 0,

    // Dark detection for bgDarkSrc: 'class' (.dark on <html>) | 'media'
    darkMode: 'class',

    // Feature flags — opt-in to Swiper modules and capabilities
    features: {
      // Swiper modules
      navigation: true,     // Navigation arrows
      pagination: true,     // Pagination dots
      mousewheel: false,    // Mousewheel control
      keyboard: false,      // Keyboard navigation
      a11y: true,           // Accessibility module (ON by default)
      freeMode: false,      // Free-scroll mode
      thumbs: false,        // Thumbnails
      grid: false,          // Grid layout
      zoom: false,          // Pinch-to-zoom
      scrollbar: false,     // Scrollbar
      controller: false,    // Multi-slider sync
      virtual: false,       // Virtual slides
      hashNavigation: false,// Hash-based slide linking
      history: false,       // Browser history integration
      swiperParallax: false,// Swiper's built-in parallax

      // Slide effects (array — include only what you use)
      effects: ['fade', 'cube', 'coverflow', 'creative', 'cards', 'flip'],

      // Media features
      parallax: true,       // GSAP ScrollTrigger parallax (lazy-loaded)
      video: true,          // Video backgrounds + controls (lazy-loaded)
      hls: false,           // HLS streaming (requires video: true)
    },
  },
})
```

Only `a11y` is enabled by default; every other feature is opt-in (an empty
`features: {}` registers just the core slider + the accessibility module).

### `darkMode`

How dark mode is detected for the per-slide `bgDarkSrc` image/video swap:

- **`'class'`** (default) — reactively tracks a `dark` class on `<html>` (the
  convention shared by Tailwind's class strategy, Nuxt UI, and
  `@nuxtjs/color-mode` with `classSuffix: ''`). Works with any color-mode
  implementation that toggles that class — none is required.
- **`'media'`** — the OS-level `prefers-color-scheme: dark` media query, for
  apps with no class-based dark mode.

### `tailwind` (deprecated)

No longer used. Hero styles ship as **plain CSS** (injected by the module), so
no Tailwind pipeline is involved. Setting the option logs a warning and does
nothing — remove it from your config.

### Feature Flags

Feature flags control which Swiper modules and CSS are bundled. Only enabled features are included in your production bundle — keeping it lean.

| Flag | Swiper Module | CSS Loaded | Notes |
|------|--------------|------------|-------|
| `navigation` | `Navigation` | `swiper/css/navigation` | Prev/next arrows |
| `pagination` | `Pagination` | `swiper/css/pagination` | Dot indicators |
| `mousewheel` | `Mousewheel` | — | Scroll to change slides (one slide per gesture) |
| `keyboard` | `Keyboard` | — | Arrow key navigation |
| `a11y` | `A11y` | — | Screen-reader support (**on by default**) |
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

### Auto-Enabled Dependencies

- Setting `hls: true` automatically enables `video: true`.
- If your app happens to use `@nuxtjs/color-mode`, the module nudges its
  `classSuffix` to `''` so the toggled class is `.dark` — but color-mode is
  **not required** (dark detection watches the `.dark` class directly).

## Dark mode

The chrome is dark-mode aware via the **`.dark` class** convention (`:where(.dark)`
ancestor selectors in the shipped CSS) — the same strategy Tailwind, Nuxt UI, and
a `color-mode` `classSuffix: ''` setup use. Dropped into such an app the hero
shares the existing `.dark` toggle with no extra wiring; apps without a class
toggle can set `darkMode: 'media'` to follow `prefers-color-scheme` instead.

## Theming (colors)

Slide chrome reads CSS custom properties, so active states can adopt your app's
brand and adapt to light/dark automatically. Defaults are media-safe (white over
imagery); override any of them on `.hero-slider` (or `:root`):

| Variable | Default | Used by |
|----------|---------|---------|
| `--hero-primary` | `var(--ui-primary, #fff)` | Active pagination ring, autoplay progress, video scrubber fill |
| `--hero-on-media` | `#fff` | Inactive dots, icons, time labels |
| `--hero-surface` | `rgb(0 0 0 / 0.35)` | Pagination bar background |
| `--hero-progress-bg` | `rgb(0 0 0 / 0.2)` | Progress / scrubber / volume tracks |

`--hero-primary` defaults to Nuxt UI's `--ui-primary`, which already shifts shade
per color-scheme — so in a Nuxt UI app the accents match your primary **and**
adapt to light/dark for free. Standalone (no `--ui-primary`) it falls back to
white.

```css
/* e.g. pin the accent to a specific primary shade */
.hero-slider { --hero-primary: var(--ui-color-primary-400); }
```

## RTL

Set `dir="rtl"` on an ancestor (e.g. `<html dir="rtl">`, as a bilingual app does
per locale) and the slider follows automatically — Swiper's slide direction
syncs at init **and** on runtime locale switches, and the navigation, pagination,
progress bar, and hover thumbnails all flip. No per-instance configuration.

## Accessibility

With `a11y` on (default), Swiper announces slide changes via an `aria-live`
region and labels each slide. On top of that the slider applies the WAI-ARIA APG
carousel pattern (`role="region"` + `aria-roledescription="carousel"` on the
root, `aria-roledescription="slide"` per slide, and `inert` on inactive slides).
All control labels are localizable via the `<HeroSlider :labels>` prop, and
autoplay + parallax respect `prefers-reduced-motion`.
