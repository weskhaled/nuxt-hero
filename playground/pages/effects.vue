<script setup lang="ts">
import type { HeroSlide, SwiperEffect, UseHeroSliderOptions } from '#hero/types'

type EffectDemo = {
  value: SwiperEffect | 'slide'
  label: string
  hint: string
  /** Box the slider sits in — some effects read best at specific shapes */
  frame: string
  options: UseHeroSliderOptions
  /** Per-slide class (`ui.slide`) — e.g. card widths for coverflow */
  slideClass?: string
}

const EFFECTS: EffectDemo[] = [
  { value: 'slide', label: 'Slide', hint: 'Swiper\'s default — slides move side by side.', frame: 'h-96 w-full',
    options: { swiperOptions: { speed: 700 } } },
  { value: 'fade', label: 'Fade', hint: 'Cross-fade in place; pairs well with content animations.', frame: 'h-96 w-full',
    options: { swiperOptions: { effect: 'fade', speed: 900 } } },
  { value: 'creative', label: 'Creative', hint: 'Custom prev/next transforms — here a parallax push.', frame: 'h-96 w-full',
    options: { swiperOptions: { effect: 'creative', speed: 900, creativeEffect: { prev: { translate: ['-20%', 0, -1] }, next: { translate: ['100%', 0, 0] } } } } },
  { value: 'cube', label: 'Cube', hint: 'A 3D cube — designed for exactly 4 slides.', frame: 'size-80 sm:size-96',
    options: { swiperOptions: { effect: 'cube', speed: 800, cubeEffect: { shadow: true, slideShadows: true, shadowOffset: 24, shadowScale: 0.9 } } } },
  { value: 'cards', label: 'Cards', hint: 'A stacked deck — swipe the top card away.', frame: 'h-96 w-72',
    options: { swiperOptions: { effect: 'cards', speed: 600, cardsEffect: { slideShadows: false } } } },
  { value: 'coverflow', label: 'Coverflow', hint: 'Several slides in 3D perspective; widths come from `ui.slide`.', frame: 'h-96 w-full',
    slideClass: 'w-72 sm:w-80',
    options: { swiperOptions: { effect: 'coverflow', speed: 700, slidesPerView: 'auto', centeredSlides: true, coverflowEffect: { rotate: 30, depth: 120, slideShadows: false } } } },
  { value: 'flip', label: 'Flip', hint: 'Each slide flips over like a card.', frame: 'size-80 sm:size-96',
    options: { swiperOptions: { effect: 'flip', speed: 700, flipEffect: { slideShadows: false } } } },
]

const slides: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, title: 'Mountains' },
  { bgSrc: IMAGES.nature, title: 'Nature' },
  { bgSrc: IMAGES.forest, title: 'Forest' },
  { bgSrc: IMAGES.valley, title: 'Valley' },
]

// shallowRef: the effect configs are static data — no deep reactivity needed.
const current = shallowRef<EffectDemo>(EFFECTS[1]!)

const code = computed(() => `// nuxt.config.ts — each effect ships only when enabled
hero: { features: { effects: ['${current.value.value === 'slide' ? 'fade' : current.value.value}'] } }

<HeroSlider
  :slides="slides"
  :options='${JSON.stringify(current.value.options)}'${current.value.slideClass ? `\n  :ui="{ slide: '${current.value.slideClass}' }"` : ''}
/>`)
</script>

<template>
  <DemoPage title="Effects"
    description="How slides replace each other — Swiper's transition effects. They're independent of content animations (see Animations), so any effect pairs with any preset."
    :features="['swiperOptions.effect', 'features.effects', 'speed', 'ui.slide']">
    <DemoSection :title="current.label" :hint="current.hint" :code="code">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Effect">
          <button v-for="e in EFFECTS" :key="e.value" type="button" class="demo-btn"
            :aria-pressed="current.value === e.value" @click="current = e">
            {{ e.label }}
          </button>
        </div>
      </template>

      <div class="flex justify-center rounded-2xl bg-black/[0.03] p-4 sm:p-8 dark:bg-white/[0.03]">
        <!-- Swiper can't swap effects on a live instance — the key remounts it. -->
        <HeroSlider :key="current.value" :slides="slides" :options="current.options" :parallax="false"
          :overlay-patterns="[]" :class="current.frame"
          :ui="{ root: 'rounded-2xl', slide: [current.slideClass, 'rounded-2xl overflow-hidden'].join(' ') }">
          <template #slide="{ slide, index }">
            <div class="flex size-full items-end bg-linear-to-t from-black/60 to-transparent p-6 pb-14 text-white">
              <div>
                <p data-hero-animate="fade-up" class="text-xs uppercase tracking-[0.25em] text-white/70">0{{ index + 1 }}</p>
                <h3 data-hero-animate="fade-up" class="text-3xl font-bold">{{ slide.title }}</h3>
              </div>
            </div>
          </template>
        </HeroSlider>
      </div>
    </DemoSection>
  </DemoPage>
</template>
