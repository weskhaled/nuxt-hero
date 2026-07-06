# Examples

All examples below run identically in **Nuxt** (components/composables are
auto-imported) and **plain Vue** — for Vue, import from `nuxt-hero/vue`:

```ts
import { HeroSlider, useHeroSlider } from 'nuxt-hero/vue'
```

See [Plain Vue usage](/vue) for setup and the runnable
[`examples/vue`](https://github.com/weskhaled/nuxt-hero/tree/main/examples/vue) app.

## Plain Vue — plugin + drop-in

```ts
// main.ts
import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y, EffectFade } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'

createApp(App).use(HeroPlugin, { swiperModules: [A11y, EffectFade] }).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { HeroSlideData } from 'nuxt-hero/vue'

const heroRef = ref()
const slides: HeroSlideData[] = [
  { bgSrc: '/hero-1.jpg', title: 'Welcome' },
  { bgSrc: '/hero-2.jpg', title: 'Explore' },
]
</script>

<template>
  <HeroSlider ref="heroRef" :slides="slides"
    :options="{ swiperOptions: { effect: 'fade', autoplay: { delay: 5000 } } }"
    style="height: 100svh">
    <template #slide="{ slide }">
      <h1>{{ slide.title }}</h1>
    </template>
  </HeroSlider>

  <!-- External controls via the exposed slider -->
  <button @click="heroRef?.slider.next()">Next</button>
</template>
```

## Plain Vue — à la carte (no plugin)

```vue
<script setup lang="ts">
import { HeroSlider } from 'nuxt-hero/vue'
import { EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'

const slides = [{ bgSrc: '/a.jpg', title: 'Standalone' }, { bgSrc: '/b.jpg' }]
</script>

<template>
  <!-- Defaults apply; Swiper modules per instance -->
  <HeroSlider :slides="slides"
    :options="{ swiperOptions: { modules: [EffectFade], effect: 'fade' } }"
    style="height: 80vh" />
</template>
```

## Basic Image Slider

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [
  { bgSrc: '/images/hero-1.jpg', title: 'Welcome' },
  { bgSrc: '/images/hero-2.jpg', title: 'Explore' },
  { bgSrc: '/images/hero-3.jpg', title: 'Discover' },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 4000 }, speed: 600 },
  enterAnimation: 'hero-animated hero-fadeIn',
  leaveAnimation: 'hero-animated hero-fadeOut',
})
</script>

<template>
  <HeroSlider ref="containerRef" :slider="slider" :slides="slides" class="h-screen">
    <template #slide="{ slide }">
      <div class="flex size-full items-center justify-center">
        <h1 class="text-6xl font-bold text-white drop-shadow-lg">
          {{ slide.title }}
        </h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

## Fade Effect with Dark Mode

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [
  {
    bgSrc: '/light-bg.jpg',
    bgDarkSrc: '/dark-bg.jpg',
    title: 'Adaptive Hero',
  },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { effect: 'fade', speed: 800 },
})
</script>

<template>
  <HeroSlider
    ref="containerRef"
    :slider="slider"
    :slides="slides"
    :parallax="{ bg: true, speed: 0.3 }"
    class="h-[80vh]"
  >
    <template #slide="{ slide }">
      <h1 class="text-white text-5xl font-bold">{{ slide.title }}</h1>
    </template>
  </HeroSlider>
</template>
```

## Vertical Slider with Mousewheel

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [
  { bgSrc: '/section-1.jpg', title: 'Section One' },
  { bgSrc: '/section-2.jpg', title: 'Section Two' },
  { bgSrc: '/section-3.jpg', title: 'Section Three' },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: {
    direction: 'vertical',
    mousewheel: true,
    speed: 1000,
  },
})
</script>

<template>
  <HeroSlider ref="containerRef" :slider="slider" :slides="slides" class="h-screen" />
</template>
```

::: tip
Vertical direction auto-adapts the UI: pagination moves to the side, navigation arrows go top/bottom, and the progress bar renders vertically.
:::

## Video Background with Watch Mode

```vue
<script setup>
const containerRef = useTemplateRef('containerRef')

const slides = [
  {
    bgSrc: '/cinematic-intro.mp4',
    poster: '/poster.jpg',
    title: 'Our Story',
    config: {
      watchMode: true,
      watchIdleMs: 5000,
      pauseUntilVideoEnds: true,
    },
  },
  { bgSrc: '/hero-image.jpg', title: 'Learn More' },
]

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 6000 }, effect: 'fade' },
})
</script>

<template>
  <HeroSlider ref="containerRef" :slider="slider" :slides="slides" class="h-screen">
    <template #slide="{ slide, isVideo, videoPlaying }">
      <div class="flex size-full items-center justify-center">
        <h1 class="text-5xl font-bold text-white">{{ slide.title }}</h1>
      </div>
    </template>
  </HeroSlider>
</template>
```

## Custom Overlay Patterns

```vue
<HeroSlider
  :overlay-patterns="[
    { type: 'dots', opacity: 0.06, color: 'white' },
    { type: 'custom', css: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%)', opacity: 1 },
  ]"
/>
```

## Autoplay Controls

```vue
<script setup>
const slider = useHeroSlider(containerRef, slides, {
  swiperOptions: { autoplay: { delay: 5000 } },
})
</script>

<template>
  <div>
    <HeroSlider ref="containerRef" :slider="slider" :slides="slides" class="h-screen" />

    <!-- External autoplay controls -->
    <div class="fixed bottom-4 right-4 flex gap-2">
      <button @click="slider.autoplayPause()">Pause</button>
      <button @click="slider.autoplayResume()">Resume</button>
      <span>{{ Math.round(slider.autoplayProgress.value * 100) }}%</span>
    </div>
  </div>
</template>
```

## Custom Navigation & Pagination

```vue
<HeroSlider ref="containerRef" :slider="slider" :slides="slides">
  <template #navigation="{ prev, next, vertical }">
    <div :class="vertical ? 'flex-col' : 'flex-row'" class="absolute inset-0 flex justify-between items-center p-4">
      <button @click="prev" class="btn">Prev</button>
      <button @click="next" class="btn">Next</button>
    </div>
  </template>

  <template #pagination="{ activeIndex, total, goTo }">
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
      <button
        v-for="i in total"
        :key="i"
        :class="activeIndex === i - 1 ? 'bg-white' : 'bg-white/40'"
        class="size-3 rounded-full transition"
        @click="goTo(i - 1)"
      />
    </div>
  </template>
</HeroSlider>
```
