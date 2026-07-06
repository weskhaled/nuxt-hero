<script setup lang="ts">
import { ref } from 'vue'
import type { HeroSlideData } from 'nuxt-hero/vue'

// The <HeroSlider> component is registered globally by HeroPlugin (main.ts).
// Prefer direct imports? `import { HeroSlider } from 'nuxt-hero/vue'` works too.

const slides: HeroSlideData[] = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=200&q=60',
    title: 'Plain Vue, full hero',
    eyebrow: 'nuxt-hero / vue',
    description: 'The same slider that powers the Nuxt module — installed with app.use(HeroPlugin).',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=200&q=60',
    title: 'Zero styling toolchain',
    eyebrow: 'plain CSS',
    description: 'Two CSS imports. No Tailwind, no color-mode module, no icon packages.',
  },
  {
    bgSrc: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumbSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=60',
    title: 'Video backgrounds',
    eyebrow: 'mp4 / webm / hls',
    description: 'Media controls, scrubber, playback speed — tap to play on data-saver clients.',
    config: { showVideoControls: true, videoLoop: true },
  },
]

// Drop-in (uncontrolled) mode: configure through :options. The slider instance
// stays reachable via the template ref (heroRef.value?.slider.next()).
const heroRef = ref()

const options = {
  swiperOptions: {
    effect: 'fade' as const,
    keyboard: true,
    autoplay: { delay: 6000 },
    speed: 700,
  },
}
</script>

<template>
  <main>
    <HeroSlider ref="heroRef" :slides="slides" :options="options" class="demo-hero">
      <template #slide="{ slide, isVideo, videoPlaying, videoToggle }">
        <div class="slide-content">
          <span class="eyebrow">{{ slide.eyebrow }}</span>
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.description }}</p>
          <button v-if="isVideo" type="button" class="cta" @click="videoToggle">
            {{ videoPlaying ? 'Pause' : 'Play' }} video
          </button>
        </div>
      </template>
    </HeroSlider>

    <section class="below">
      <h2>Drive it from outside</h2>
      <p>The internally-created slider is exposed on the template ref:</p>
      <div class="row">
        <button type="button" @click="heroRef?.slider.prev()">← Prev</button>
        <button type="button" @click="heroRef?.slider.next()">Next →</button>
        <button type="button" @click="heroRef?.slider.autoplayPause()">Pause autoplay</button>
        <button type="button" @click="heroRef?.slider.autoplayResume()">Resume</button>
      </div>
      <p class="hint">
        Scroll parallax is off in this example — it needs the optional
        <code>gsap</code> peer. Install it and pass
        <code>parallaxComponent: () => import('nuxt-hero/vue/parallax')</code>
        to the plugin (see <code>src/main.ts</code>).
      </p>
    </section>
  </main>
</template>
