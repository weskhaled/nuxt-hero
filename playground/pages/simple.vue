<script setup lang="ts">
import type { HeroSlide } from '#hero/types'

// ─── Drop-in / uncontrolled usage ───
// No `useHeroSlider()`, no container ref — just `:slides` (+ optional
// `:options`). <HeroSlider> creates and owns the composable internally.
const slides: HeroSlide[] = [
  { bgSrc: IMAGES.landscape, thumbSrc: thumb(IMAGES.landscape), title: 'Drop-in', description: 'One component, no composable, no config.' },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall), title: 'Sensible defaults', description: 'Arrows, dots, autoplay and video work out of the box.' },
  { bgSrc: IMAGES.earth, thumbSrc: thumb(IMAGES.earth), title: 'Grows with you', description: 'Add options, slots or the composable only when you need them.' },
]

// Driving the internally-created slider from outside: a template ref…
const heroRef = useTemplateRef<{ slider: { prev: () => void, next: () => void } }>('heroRef')
// …or v-model on the active index.
const active = ref(0)

const minimalCode = `<script setup>
const slides = [
  { bgSrc: '/hero-1.jpg', title: 'Welcome' },
  { bgSrc: '/hero-2.mp4', title: 'Video works too' },
]
</${'script'}>

<template>
  <!-- the slider fills its box — give it a height -->
  <HeroSlider :slides="slides" style="height: 100vh">
    <template #slide="{ slide }">
      <h1 data-hero-animate="fade-up">{{ slide.title }}</h1>
    </template>
  </HeroSlider>
</template>`

const controlCode = `<!-- a template ref reaches the internal slider -->
<HeroSlider ref="hero" :slides="slides" />
<button @click="hero.slider.next()">Next</button>

<!-- or bind the active index -->
<HeroSlider v-model:active-index="active" :slides="slides" />
<button v-for="(s, i) in slides" @click="active = i">{{ s.title }}</button>`
</script>

<template>
  <DemoPage title="Drop-in"
    description="The shortest path: one <HeroSlider> with your slides. Navigation, pagination, autoplay and video are on by default — no composable and no module config needed."
    :features="[':slides', ':options', 'ref → slider', 'v-model:active-index']">
    <template #hero>
      <HeroSlider ref="heroRef" v-model:active-index="active" :slides="slides"
        :options="{ swiperOptions: { effect: 'fade', speed: 900 } }"
        :overlay-patterns="[{ type: 'gradient', opacity: 0.15 }]" class="h-[calc(100svh-3.5rem)] min-h-[480px]">
        <template #slide="{ slide }">
          <div class="flex size-full items-center justify-center px-14 text-center text-white">
            <div>
              <h2 data-hero-animate="clip-up" class="text-4xl font-bold drop-shadow-lg sm:text-6xl">{{ slide.title }}</h2>
              <p data-hero-animate="fade-up" class="mt-4 text-lg text-white/85 drop-shadow">{{ slide.description }}</p>
            </div>
          </div>
        </template>
      </HeroSlider>
    </template>

    <DemoSection title="Minimal setup" hint="Everything above is this — plus a fade effect." :code="minimalCode" />

    <DemoSection title="Driving it from outside"
      hint="Both controls below drive the slider above: the buttons through its template ref, the chips through v-model:active-index."
      :code="controlCode">
      <div class="demo-card flex flex-wrap items-center gap-2">
        <button type="button" class="demo-btn" @click="heroRef?.slider.prev()">← Prev</button>
        <button type="button" class="demo-btn" @click="heroRef?.slider.next()">Next →</button>
        <span class="mx-2 h-5 w-px bg-black/10 dark:bg-white/15" aria-hidden="true" />
        <button v-for="(s, i) in slides" :key="i" type="button" class="demo-btn" :aria-pressed="active === i"
          @click="active = i">
          {{ s.title }}
        </button>
      </div>
    </DemoSection>
  </DemoPage>
</template>
