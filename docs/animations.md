# Animations

## Built-in Animation Classes

nuxt-hero ships with built-in CSS animation classes. Use the `hero-animated` base class combined with a direction class:

| Enter | Exit |
|-------|------|
| `hero-fadeIn` | `hero-fadeOut` |
| `hero-slideInUp` | `hero-slideOutDown` |
| `hero-slideInRight` | `hero-slideInLeft` |
| `hero-zoomIn` | `hero-zoomOut` |

### Usage

```ts
const slides = [
  {
    bgSrc: '/mountain.jpg',
    animation: {
      enter: 'hero-animated hero-slideInUp',
      leave: 'hero-animated hero-slideOutDown',
    },
  },
]
```

Or set a global default:

```ts
const slider = useHeroSlider(container, slides, {
  enterAnimation: 'hero-animated hero-fadeIn',
  leaveAnimation: 'hero-animated hero-fadeOut',
})
```

Per-slide `animation` overrides the global default.

## animate.css Integration

Install the optional `animate.css` peer dependency for 80+ additional animations:

```bash
pnpm add animate.css
```

Then use `animate__animated` with any animate.css class:

```ts
{
  animation: {
    enter: 'animate__animated animate__fadeInUp',
    leave: 'animate__animated animate__fadeOutDown',
  },
}
```

## Multi-Slide Behavior

When `slidesPerView > 1` (or `'auto'`), content animations are automatically disabled to avoid visual conflicts. The `isMultiSlide` computed ref from the composable reflects this state.

## Slide Effects (Swiper)

Slide transition effects are separate from content animations. Configure via `swiperOptions.effect`:

```ts
useHeroSlider(container, slides, {
  swiperOptions: {
    effect: 'fade',      // Crossfade slides
    speed: 800,          // Transition duration
  },
})
```

Available effects: `fade`, `cube`, `coverflow`, `creative`, `cards`, `flip`.

Each effect must be enabled in the module's feature flags:

```ts
// nuxt.config.ts
hero: {
  features: {
    effects: ['fade'],
  },
}
```
