# Animations

There are three layers, and you can mix them:

| Layer | What it animates | Needs |
|---|---|---|
| [Choreography](#choreography) — `data-hero-animate` | Individual elements, staggered, direction-aware | nothing (pure CSS) |
| [JS hooks](#js-hooks) — `onEnter` / `onLeave` | Anything, with any engine (Web Animations, GSAP, …) | your engine |
| [Class-based](#class-based-animations) — `enter` / `leave` classes | The whole content block at once | nothing, or animate.css |

Slide *transitions* (how slides replace each other) are a separate concern — see [Slide effects](#slide-effects-swiper).

## Choreography

Mark elements inside a slide with a preset. When the slide becomes active they
enter one after another; when it leaves they exit quickly against the travel
direction.

```vue
<HeroSlider :slides="slides">
  <template #slide="{ slide }">
    <span data-hero-animate="fade-down">{{ slide.eyebrow }}</span>
    <h1 data-hero-animate="clip-up">{{ slide.title }}</h1>
    <p data-hero-animate="blur-in">{{ slide.description }}</p>
    <div data-hero-animate="zoom-in">
      <button>Shop now</button>
    </div>
  </template>
</HeroSlider>
```

### Presets

| Preset | Motion |
|---|---|
| `fade` | opacity only |
| `fade-up` / `fade-down` | rises / drops into place |
| `fade-left` / `fade-right` | moves left (enters from the right) / moves right |
| `slide` | enters from the side you navigate toward (vertical sliders and RTL included) |
| `zoom-in` / `zoom-out` | grows in / settles from large |
| `blur-in` | focus pull |
| `clip-up` / `clip-left` / `clip-right` | mask reveal upward / wipe from the right / wipe from the left |
| `flip-up` | 3D hinge from the bottom edge |
| `rotate-in` | tilted rise |

Presets animate `transform`, so give inline elements `display: inline-block`
(transforms don't apply to inline boxes). Don't put `data-hero-animate` and
Swiper's `data-swiper-parallax` on the same element — wrap one in the other.

### Timing

Set defaults for a slider with the `animate` option, override them per slide
with `animation`, or per element with CSS variables:

```ts
const slider = useHeroSlider(container, slides, {
  animate: {
    duration: 700,      // ms per element            --hero-anim-duration
    stagger: 90,        // ms between elements       --hero-anim-stagger
    delay: 0,           // ms before the first one   --hero-anim-delay
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',     // --hero-anim-easing
    distance: '1.5rem', // travel of moving presets  --hero-anim-distance
    leaveDuration: 300, // ms                        --hero-anim-leave-duration
  },
})

const slides = [
  { bgSrc: '/a.jpg', animation: { stagger: 150, easing: 'linear' } }, // this slide only
]
```

```vue
<!-- one element -->
<p data-hero-animate="fade-up" style="--hero-anim-delay: 400ms">…</p>
```

`animate` also accepts a ref, a getter or a reactive object, so it can be tuned
live. With `<HeroSlider>` alone (no composable), pass it through
`:options="{ animate: { … } }"`.

### Order

Siblings are staggered in document order automatically. Elements in different
parents each start their own sequence — set `--hero-anim-index` to place an
element in the overall order:

```vue
<div><h1 data-hero-animate="clip-up">Title</h1></div>
<div class="actions">
  <a data-hero-animate="fade-up" style="--hero-anim-index: 1">Shop</a>
  <a data-hero-animate="fade-up" style="--hero-anim-index: 2">Learn more</a>
</div>
```

### First slide, replay

The slider renders each slide's state (`data-hero-anim="in" | "out" | "idle"`)
on the server too, so the first slide's intro plays from CSS on page load — no
flash, no JavaScript needed. Control it with `animate.initial`:

| `initial` | First slide |
|---|---|
| `true` (default) | plays its intro on load |
| `false` | shown statically; animations start with the first slide change |
| `'visible'` | hidden until the slider scrolls into view, then plays (needs JS — use it below the fold) |

`slider.replayAnimation()` restarts the active slide's entrance — presets and
`onEnter` hook — e.g. after changing presets at runtime.

### Outside a slider

The presets work on any container: put `data-hero-anim="in"` on it and the
`data-hero-animate` elements inside play their entrance. Remount the container
(for example by changing its `key`) to replay.

### Reduced motion

With `prefers-reduced-motion: reduce`, choreographed content simply appears.

## JS hooks

For anything the presets don't cover, hook a JavaScript engine in. A hook gets
the slide's content element and a context, and can return something to stop:
a Web Animations `Animation` (`cancel()`), a GSAP tween/timeline (`kill()`), or
a cleanup function. It's stopped automatically when the slide changes again, so
animations never pile up.

```ts
import { gsap } from 'gsap'

const slides = [
  {
    bgSrc: '/a.jpg',
    animation: {
      onEnter: (el, { direction, reducedMotion }) => {
        if (reducedMotion) return
        return gsap.timeline().from(el.querySelectorAll('.line'), {
          yPercent: 110, opacity: 0, stagger: 0.12, ease: 'expo.out',
        })
      },
    },
  },
]
```

Set slider-wide hooks with `animate: { onEnter, onLeave }`; a slide's own
`animation.onEnter` / `onLeave` takes precedence.

| Context field | Type | |
|---|---|---|
| `index` | `number` | slide entering / leaving |
| `direction` | `'next' \| 'prev'` | direction of the change |
| `initial` | `boolean` | first slide's entrance on mount |
| `reducedMotion` | `boolean` | user prefers reduced motion |

## Class-based animations

The original API: one class string animates the whole content block.

### Built-in classes

| Enter | Exit |
|-------|------|
| `hero-fadeIn` | `hero-fadeOut` |
| `hero-slideInUp` | `hero-slideOutDown` |
| `hero-slideInRight` | `hero-slideInLeft` |
| `hero-zoomIn` | `hero-zoomOut` |

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

// or a default for every slide
useHeroSlider(container, slides, {
  enterAnimation: 'hero-animated hero-fadeIn',
  leaveAnimation: 'hero-animated hero-fadeOut',
})
```

With `<HeroSlider>` alone (drop-in mode), use the props:
`<HeroSlider enter-animation="hero-animated hero-fadeIn" leave-animation="hero-animated hero-fadeOut">`.
An `enterAnimation` / `leaveAnimation` in `:options` takes precedence, and the
props are ignored in controlled mode (`:slider`).

### animate.css

Install the optional `animate.css` peer dependency for 80+ more animations and
use its classes the same way:

```bash
pnpm add animate.css
```

```ts
{
  animation: {
    enter: 'animate__animated animate__fadeInUp',
    leave: 'animate__animated animate__fadeOutDown',
  },
}
```

## Multi-slide behavior

When `slidesPerView > 1` (or `'auto'`), content animations are off: every
visible card shows its content statically. The `isMultiSlide` computed ref
from the composable reflects this state.

## Slide effects (Swiper)

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

Each effect must be enabled. In Nuxt, use the module's feature flags. In plain
Vue, register the effect module (e.g. `EffectFade`) and import its CSS
(`swiper/css/effect-fade`):

```ts
// nuxt.config.ts
hero: {
  features: {
    effects: ['fade'],
  },
}
```
