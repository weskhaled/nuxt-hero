<script setup lang="ts">
import type { HeroSlide, ParallaxConfig } from '#hero/types'

const slides: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, title: 'Scroll the page', description: 'The background drifts and the content fades as the hero leaves the viewport.' },
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, title: 'Video too', description: 'Video backgrounds take part in the scroll parallax like images.', config: { videoLoop: true, showVideoControls: false } },
  { bgSrc: IMAGES.valley, title: 'Swipe the slides', description: 'Title and text move at different speeds during the transition.' },
]

// Scroll parallax (GSAP ScrollTrigger) — the `parallax` prop is reactive.
const parallax = reactive<Required<ParallaxConfig>>({ bg: true, content: true, speed: 0.5, minOpacity: 0.15 })

const scrollCode = computed(() => `<HeroSlider
  :slides="slides"
  :parallax="${JSON.stringify(parallax).replaceAll('"', '').replaceAll(',', ', ').replaceAll(':', ': ')}"
/>

// nuxt.config.ts — needs the optional gsap peer (pnpm add gsap);
// on by default when gsap is installed
hero: { features: { parallax: true } }`)

const swiperCode = `<!-- Swiper's transition parallax: offsets while a slide moves -->
<h1 data-swiper-parallax="-300">{{ slide.title }}</h1>
<p data-swiper-parallax="-150">{{ slide.description }}</p>

// nuxt.config.ts
hero: { features: { swiperParallax: true } }`
</script>

<template>
  <DemoPage title="Parallax"
    description="Two independent kinds of parallax. Scroll parallax (GSAP ScrollTrigger) drifts the background and fades the content as the page scrolls; Swiper's transition parallax offsets content elements while a slide moves. Both are skipped for reduced motion and in lite mode."
    :features="[':parallax', 'features.parallax', 'features.swiperParallax', 'data-swiper-parallax']">
    <template #hero>
      <HeroSlider :slides="slides" :parallax="parallax" :overlay-patterns="[{ type: 'gradient', opacity: 0.2 }]"
        :options="{ swiperOptions: { speed: 900, autoplay: { delay: 6000 } } }"
        class="h-[calc(100svh-3.5rem)] min-h-[480px]">
        <template #slide="{ slide }">
          <div class="flex size-full flex-col items-center justify-center px-14 text-center text-white">
            <h2 data-swiper-parallax="-300" class="text-4xl font-bold drop-shadow-lg sm:text-6xl">{{ slide.title }}</h2>
            <p data-swiper-parallax="-150" class="mt-4 max-w-xl text-white/85 drop-shadow sm:text-lg">{{ slide.description }}</p>
          </div>
        </template>
      </HeroSlider>
    </template>

    <DemoSection title="Scroll parallax"
      hint="Tune it, then scroll back up past the hero. The prop is reactive — no remount needed."
      :code="scrollCode">
      <div class="demo-card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label class="demo-check"><input v-model="parallax.bg" type="checkbox"> Background drift (<code class="demo-code">bg</code>)</label>
        <label class="demo-check"><input v-model="parallax.content" type="checkbox"> Content fade (<code class="demo-code">content</code>)</label>
        <label class="block">
          <span class="demo-label flex justify-between"><span>Speed</span><span class="tabular-nums">{{ parallax.speed }}</span></span>
          <input v-model.number="parallax.speed" type="range" min="0.1" max="1" step="0.05" class="w-full">
        </label>
        <label class="block">
          <span class="demo-label flex justify-between"><span>Min opacity</span><span class="tabular-nums">{{ parallax.minOpacity }}</span></span>
          <input v-model.number="parallax.minOpacity" type="range" min="0" max="1" step="0.05" class="w-full">
        </label>
      </div>
    </DemoSection>

    <DemoSection title="Transition parallax"
      hint="Swiper's own parallax module: elements marked with data-swiper-parallax shift by their offset while the slide moves — swipe the hero to see the title lead the text. Don't combine it with data-hero-animate on the same element (wrap one in the other)."
      :code="swiperCode" />

    <!-- Room to scroll the hero out of view. -->
    <div class="h-[60vh]" aria-hidden="true" />
  </DemoPage>
</template>
