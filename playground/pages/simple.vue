<script setup lang="ts">
import type { HeroSlide, UseHeroSliderOptions } from '#hero/types'

// ─── Drop-in / uncontrolled usage ───
// No `useHeroSlider()`, no `containerRef` — just `:slides` + `:options`.
// <HeroSlider> creates and owns the composable internally.
const slides: HeroSlide[] = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    title: 'Drop-in Simple',
    animation: {
      enter: 'animate__animated animate__fadeIn',
      leave: 'animate__animated animate__fadeOut',
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    title: 'No Composable',
    animation: {
      enter: 'animate__animated animate__fadeInDown',
      leave: 'animate__animated animate__fadeOutUp',
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1920&q=80',
    title: 'Just Slides + Options',
    animation: {
      enter: 'animate__animated animate__fadeInUp',
      leave: 'animate__animated animate__fadeOutDown',
    },
  },
]

const options: UseHeroSliderOptions = {
  swiperOptions: { effect: 'fade', speed: 800, autoplay: { delay: 5000 } },
}

// Optional: reach the internally-created slider for external controls.
// `<HeroSlider>` exposes it via defineExpose, so a plain template ref works —
// you still don't have to call useHeroSlider() yourself.
const heroRef = useTemplateRef<{ slider: import('#hero/types').UseHeroSliderReturn }>('heroRef')
</script>

<template>
  <div>
    <div class="h-14" />
    <HeroSlider ref="heroRef" :slides="slides" :options="options"
      :parallax="{ bg: true, content: true, speed: 0.5, minOpacity: 0 }"
      :overlay-patterns="[{ type: 'gradient', opacity: 0.15 }]" class="h-[calc(100vh-3.5rem)]">
      <template #slide="{ slide }">
        <div class="flex size-full items-center justify-center">
          <div class="text-center text-white">
            <h1 class="text-6xl font-bold drop-shadow-lg">{{ slide.title }}</h1>
            <p class="mt-4 text-lg opacity-80">No <code>useHeroSlider()</code> — just props</p>
          </div>
        </div>
      </template>
    </HeroSlider>

    <!-- External controls driving the *internally-created* slider via the ref -->
    <div class="mx-auto flex max-w-md items-center justify-center gap-3 py-8">
      <button class="rounded-lg px-4 py-2 text-sm font-medium transition-colors dark:bg-white/10 dark:hover:bg-white/20 bg-black/5 hover:bg-black/10"
        @click="heroRef?.slider.prev()">
        Prev
      </button>
      <button class="rounded-lg px-4 py-2 text-sm font-medium transition-colors dark:bg-white/10 dark:hover:bg-white/20 bg-black/5 hover:bg-black/10"
        @click="heroRef?.slider.next()">
        Next
      </button>
    </div>

    <div class="h-120 flex items-center justify-center text-base-content/30">scroll area</div>
  </div>
</template>
