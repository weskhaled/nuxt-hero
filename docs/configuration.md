# Configuration

## Module Options

Configure the module in your `nuxt.config.ts` under the `hero` key:

```ts
export default defineNuxtConfig({
  hero: {
    // Component name prefix (e.g., <HeroSlider>, <HeroPagination>)
    prefix: 'Hero',

    // Enable @nuxtjs/color-mode integration for dark mode support
    colorMode: true,

    // Enable @nuxt/icon for built-in navigation/control icons
    icon: true,

    // Default volume for video backgrounds (0 = muted, 1 = full)
    defaultVolume: 0,

    // Feature flags — opt-in to Swiper modules and capabilities
    features: {
      // Swiper modules
      navigation: true,     // Navigation arrows
      pagination: true,     // Pagination dots
      mousewheel: false,    // Mousewheel control
      keyboard: false,      // Keyboard navigation
      a11y: false,          // Accessibility module
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
      parallax: true,       // GSAP ScrollTrigger parallax
      video: true,          // Video backgrounds + controls
      hls: false,           // HLS streaming (requires video: true)
    },
  },
})
```

### Feature Flags

Feature flags control which Swiper modules and CSS are bundled. Only enabled features are included in your production bundle — keeping it lean.

| Flag | Swiper Module | CSS Loaded | Notes |
|------|--------------|------------|-------|
| `navigation` | `Navigation` | `swiper/css/navigation` | Prev/next arrows |
| `pagination` | `Pagination` | `swiper/css/pagination` | Dot indicators |
| `mousewheel` | `Mousewheel` | — | Scroll to change slides |
| `keyboard` | `Keyboard` | — | Arrow key navigation |
| `a11y` | `A11y` | — | Screen reader support |
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

- Setting `hls: true` automatically enables `video: true`
- Setting `colorMode: true` registers `@nuxtjs/color-mode` with sensible defaults (`classSuffix: ''`, `dataValue: 'theme'`)
- Setting `icon: true` registers `@nuxt/icon` with `cssLayer: 'base'`
