# Upgrading

## From 0.7

Most apps need no changes. Read this list if you use the Nuxt module with an
explicit or empty `features` object, if you style the pagination yourself, or
if you build slider internals by hand.

### Nuxt: the chrome is now on by default

The Nuxt module now uses the same `features` defaults as the Vue plugin:

| Flag | Before | Now |
|------|--------|-----|
| `navigation` | off | **on** |
| `pagination` | off | **on** |
| `video` | off | **on** |
| `a11y` | on | on |
| `parallax` | off | **on when `gsap` is installed**; requested without `gsap` → warning, stays off |

Your own settings still win, and flags you don't set take these defaults. To
keep the previous look, turn the flags off explicitly:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hero: {
    features: { navigation: false, pagination: false, video: false, parallax: false },
  },
})
```

The per-slider `showNavigation` / `showPagination` / `showVideoControls` options
hide the chrome for one slider without changing the app-wide flags.

### Nuxt: Swiper's own Navigation / Pagination modules are opt-in

The `navigation` and `pagination` flags now control the slider's **own**
arrows and dots. They no longer register Swiper's `Navigation` / `Pagination`
modules or load their CSS. The slider's own controls never needed them. If you configure
Swiper's native controls (`swiperOptions.navigation` / `swiperOptions.pagination`),
turn on the new flags:

```ts
hero: {
  features: { swiperNavigation: true, swiperPagination: true },
}
```

### Pagination: `swiper-pagination` class removed

The pagination pill no longer carries Swiper's `swiper-pagination` class. Target
`.hero-pagination` instead, or use `ui.pagination`. CSS keyed off
`.swiper-pagination` no longer matches.

### `#pagination` slot: navigate with `goToSnap`

Dots represent **snap points**. With `slidesPerGroup > 1`, a dot index isn't a
slide index. The `#pagination` slot now also provides `goToSnap(snap)`. Use it for
dots built from `totalSnaps` / `snapIndex`:

```vue
<template #pagination="{ snapIndex, totalSnaps, goToSnap }">
  <button v-for="i in totalSnaps" :key="i" @click="goToSnap(i - 1)" />
</template>
```

`goTo(index)` still navigates by slide index.

### `ResolvedSlideConfig` has new fields

`ResolvedSlideConfig` now also requires `showAutoplayToggle: boolean` and
`videoControls: HeroVideoControlsConfig`. This matters only if you construct the
type yourself, for example in tests or mocks.

### Design-token defaults now lose to your values

The `--hero-*` defaults (including the larger touch sizes) moved to
`:where(:root)`. That has zero specificity, so your overrides now win
reliably, whichever stylesheet loads first. If you raised specificity or added
`!important` to work around this, you can drop the workaround. See
[Theming](/theming).

### Behaviour fixes you may notice

- `pauseUntilVideoEnds` has no effect with `videoLoop: true`, as documented
  before. A looping video never ends, so the timer is no longer held forever.
- The `enterAnimation` / `leaveAnimation` props on `<HeroSlider>` now work in
  drop-in mode. An `enterAnimation` / `leaveAnimation` inside `:options` takes
  precedence.
- A per-slide `config.watchIdleMs` now sets that slide's idle timeout. Before,
  only the value at mount time was used.
- `swiperOptions.initialSlide` now sets `activeIndex` correctly from the start.
- Changing `:options` on a drop-in `<HeroSlider>` now takes effect. See
  [reactive options](/composable#reactive-options).
- Autoplay now honours `pauseOnMouseEnter`, `disableOnInteraction` and
  `stopOnLastSlide`. It also pauses while keyboard focus is inside the slider.
  `disableOnInteraction` defaults to `false` here, so existing sliders keep
  running after a swipe. See [Accessibility → Autoplay](/accessibility#autoplay).

### New

The release also adds `v-model:active-index`, the `change` / `swiper` /
`videoEnded` events, the `#background` / `#progress` / `#play-button` slots,
`videoControls` parts, `showAutoplayToggle`, `bgType` / `bgAlt`, new `ui` keys,
labels and tokens, and the `cssLayer` module option. Start at
[Components](/components) and [Theming](/theming).
