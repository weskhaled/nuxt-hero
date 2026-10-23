<script setup lang="ts">
import type { HeroSlide } from '#hero/types'

const cards: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains), title: 'Mountains' },
  { bgSrc: IMAGES.nature, thumbSrc: thumb(IMAGES.nature), title: 'Nature' },
  { bgSrc: IMAGES.forest, thumbSrc: thumb(IMAGES.forest), title: 'Forest' },
  { bgSrc: IMAGES.valley, thumbSrc: thumb(IMAGES.valley), title: 'Valley' },
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, title: 'Glass', config: { videoLoop: true } },
  { bgSrc: IMAGES.woods, thumbSrc: thumb(IMAGES.woods), title: 'Woods' },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall), title: 'Waterfall' },
  { bgSrc: IMAGES.landscape, thumbSrc: thumb(IMAGES.landscape), title: 'Landscape' },
]

const freeModeOptions = {
  showProgress: false,
  swiperOptions: {
    freeMode: { enabled: true, sticky: false },
    autoplay: { delay: 30000 },
    mousewheel: { forceToAxis: true, releaseOnEdges: true, sensitivity: 1.25 },
    breakpoints: {
      0: { slidesPerView: 1.5, spaceBetween: 8 },
      640: { slidesPerView: 2.5, spaceBetween: 12 },
      1024: { slidesPerView: 4, spaceBetween: 16 },
    },
  },
}

// `ui.slide: 'w-auto'` lets each slide shrink to its content, which sets the
// card width. Swiper's own `.swiper-slide { width: 100% }` would beat the
// class without `cssLayer` (on in this playground).
const autoWidths = ['w-64', 'w-96', 'w-72', 'w-80', 'w-60', 'w-96', 'w-72', 'w-64']
const autoOptions = { showProgress: false, swiperOptions: { slidesPerView: 'auto' as const, spaceBetween: 16, centeredSlides: true } }

const groupedOptions = { swiperOptions: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12, autoplay: { delay: 4000 } } }

const freeModeCode = `<HeroSlider :slides="slides" :overlay-patterns="[]" :options="{
  showProgress: false,
  swiperOptions: {
    freeMode: { enabled: true },
    mousewheel: { forceToAxis: true, releaseOnEdges: true },
    breakpoints: {
      0: { slidesPerView: 1.5, spaceBetween: 8 },
      640: { slidesPerView: 2.5, spaceBetween: 12 },
      1024: { slidesPerView: 4, spaceBetween: 16 },
    },
  },
}" />

// nuxt.config.ts
hero: { features: { freeMode: true, mousewheel: true } }`

const autoCode = `<HeroSlider
  :slides="slides"
  :options="{ swiperOptions: { slidesPerView: 'auto', centeredSlides: true, spaceBetween: 16 } }"
  :ui="{ slide: 'w-auto' }"
>
  <template #slide="{ slide }">
    <div :class="slide.width">…</div>  <!-- content sets each card's width -->
  </template>
</HeroSlider>

// nuxt.config.ts — lets your classes beat Swiper's .swiper-slide { width: 100% }
hero: { cssLayer: true }`

const groupedCode = `<HeroSlider :slides="slides" :options="{
  swiperOptions: { slidesPerView: 2, slidesPerGroup: 2 },
}" />
<!-- dots step by group; a custom #pagination calls goToSnap(i) -->`
</script>

<template>
  <DemoPage title="Multi-slide"
    description="Several slides in view at once. Content animations switch off here (every visible card shows its content), and the pagination stays below the cards instead of lifting for a video controls bar."
    :features="['slidesPerView', 'freeMode', 'breakpoints', 'slidesPerGroup', 'ui.slide', 'cssLayer']">
    <DemoSection title="Free mode" hint="Drag or scroll with momentum; slides per view change with the breakpoints. Includes a looping video card."
      :code="freeModeCode">
      <HeroSlider :slides="cards" :options="freeModeOptions" :overlay-patterns="[]"
        :parallax="false" :ui="{ root: 'pb-10', slide: 'rounded-xl overflow-hidden' }" class="h-96">
        <template #slide="{ slide, isVideo }">
          <div class="flex size-full items-end p-4" :class="isVideo ? 'pb-20' : 'pb-4'">
            <span class="rounded-lg bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">{{ slide.title }}</span>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>

    <DemoSection title="Auto widths" hint="slidesPerView: 'auto' with each card sized by its own class, centered." :code="autoCode">
      <HeroSlider :slides="cards.filter(s => s.thumbSrc)" :options="autoOptions" :overlay-patterns="[]" :parallax="false"
        class="h-80" :ui="{ root: 'pb-10', slide: 'w-auto rounded-xl overflow-hidden' }">
        <template #slide="{ slide, index }">
          <div class="flex h-full items-end p-4" :class="autoWidths[index]">
            <span class="rounded-lg bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">{{ slide.title }}</span>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>

    <DemoSection title="Grouped paging" hint="slidesPerGroup: 2 — each dot is a pair; dots and thumbnails jump to the first slide of their group."
      :code="groupedCode">
      <HeroSlider :slides="cards.filter(s => s.thumbSrc)" :options="groupedOptions" :overlay-patterns="[]" :parallax="false"
        class="h-72" :ui="{ root: 'pb-10', slide: 'rounded-xl overflow-hidden' }">
        <template #slide="{ slide, index }">
          <div class="flex size-full items-end p-4">
            <span class="rounded-lg bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">{{ index + 1 }} · {{ slide.title }}</span>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>
  </DemoPage>
</template>
