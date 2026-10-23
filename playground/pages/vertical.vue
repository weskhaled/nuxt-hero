<script setup lang="ts">
import type { HeroSlide, HeroSlideChange, HeroSliderUI, OverlayPattern, UseHeroSliderOptions } from '#hero/types'

// Stable references (inline literals would be new objects every render).
const NO_PATTERNS: OverlayPattern[] = []
const ROUNDED: HeroSliderUI = { root: 'rounded-2xl overflow-hidden' }
const pad = (n: number) => String(n).padStart(2, '0')
const FEATURES = ['direction: vertical', 'mousewheel', 'keyboard', 'thumbSrc', 'data-hero-animate="slide"', 'v-model:active-index', '@change']

// ═══ 1. Full-height hero ═══
// `thumbSrc` feeds the side pagination's thumbnail tooltips and the previews
// the top / bottom arrows reveal on hover.
const heroSlides: HeroSlide[] = [
  { bgSrc: IMAGES.earth, thumbSrc: thumb(IMAGES.earth), title: 'Orbit', eyebrow: 'direction: vertical',
    text: 'One Swiper option and the chrome follows: pagination on the side, arrows top and bottom, the autoplay bar along the edge.' },
  { bgSrc: IMAGES.nebula, thumbSrc: thumb(IMAGES.nebula), title: 'Deep field', eyebrow: 'data-hero-animate="slide"',
    text: 'Direction-aware content travels on the y axis here: it rises when you go forward and drops when you go back.' },
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains), title: 'Summit', eyebrow: 'thumbSrc',
    text: 'Hover a dot for its thumbnail, or an arrow for a preview of the slide it leads to.' },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall), title: 'Cascade', eyebrow: 'mousewheel + keyboard',
    text: 'One slide per wheel gesture; ↑ and ↓ work while the slider is on screen. At either end the wheel scrolls the page again.' },
  { bgSrc: IMAGES.forest, thumbSrc: thumb(IMAGES.forest), title: 'Canopy', eyebrow: 'RTL',
    text: 'Under dir="rtl" the pagination moves to the left edge: logical properties, no extra option.' },
]

const HERO_OPTIONS: UseHeroSliderOptions = {
  swiperOptions: {
    direction: 'vertical',
    // releaseOnEdges: past the first / last slide the wheel scrolls the page,
    // so a full-height hero never traps it.
    mousewheel: { releaseOnEdges: true },
    keyboard: { enabled: true },
    speed: 800,
    autoplay: { delay: 7000 },
  },
  animate: { distance: '3rem' },
}

// ═══ 2. Synced thumbnails ═══
const syncSlides: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains), title: 'Mountains' },
  { bgSrc: IMAGES.valley, thumbSrc: thumb(IMAGES.valley), title: 'Valley' },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall), title: 'Waterfall' },
  { bgSrc: IMAGES.woods, thumbSrc: thumb(IMAGES.woods), title: 'Woods' },
  { bgSrc: IMAGES.landscape, thumbSrc: thumb(IMAGES.landscape), title: 'Landscape' },
]
const SYNC_OPTIONS: UseHeroSliderOptions = {
  swiperOptions: { direction: 'vertical', speed: 650, mousewheel: { releaseOnEdges: true }, autoplay: { delay: 5000 } },
}

const active = ref(0)
const lastChange = shallowRef<HeroSlideChange | null>(null)
function onChange(change: HeroSlideChange) {
  lastChange.value = change
}

// ═══ 3. Options ═══
// (A literal closing script tag would end this block.)
const CLOSE_SCRIPT = '<' + '/script>'
const heroCode = `<HeroSlider
  :slides="slides"
  :options="{
    swiperOptions: {
      direction: 'vertical',
      mousewheel: { releaseOnEdges: true }, // or true: keeps the wheel at the ends too
      keyboard: { enabled: true },
      speed: 800,
      autoplay: { delay: 7000 },
    },
    animate: { distance: '3rem' },
  }"
  class="h-[calc(100svh-3.5rem)] min-h-[480px]"
>
  <template #slide="{ slide }">
    <!-- inline-end padding keeps text clear of the side pagination -->
    <div class="bg-linear-to-r from-black/75 to-transparent ps-6 pe-20">
      <p data-hero-animate="fade">{{ slide.eyebrow }}</p>
      <p data-hero-animate="slide">{{ slide.title }}</p>
    </div>
  </template>
</HeroSlider>

// thumbSrc → pagination tooltips + arrow previews
const slides = [{ bgSrc, thumbSrc: thumb(bgSrc), title: 'Orbit' }, …]`

const syncCode = `<script setup lang="ts">
const active = ref(0)
const direction = ref<HeroSlideDirection>('next')
${CLOSE_SCRIPT}

<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
  <!-- min-w-0: a Swiper in a grid item with min-width: auto grows without bound -->
  <div class="min-w-0">
    <HeroSlider
      v-model:active-index="active"
      :slides="slides"
      :options="{ swiperOptions: { direction: 'vertical', autoplay: { delay: 5000 } } }"
      class="h-[26rem]"
      @change="c => (direction = c.direction)"
    />
  </div>
  <ol>
    <li v-for="(slide, i) in slides" :key="i">
      <button type="button" :aria-current="active === i || undefined" @click="active = i">
        <img :src="slide.thumbSrc" alt=""> {{ slide.title }}
      </button>
    </li>
  </ol>
</div>`
</script>

<template>
  <DemoPage title="Vertical"
    description="Set swiperOptions.direction to 'vertical' and the chrome adapts on its own: the pagination moves to the side (the right in LTR, the left in RTL), the arrows sit top and bottom, the autoplay bar runs along the edge, and direction-aware content travels on the y axis."
    :features="FEATURES">
    <template #hero>
      <HeroSlider :slides="heroSlides" :options="HERO_OPTIONS" :overlay-patterns="NO_PATTERNS"
        class="h-[calc(100svh-3.5rem)] min-h-[480px]">
        <template #slide="{ slide, index }">
          <!-- Gradient scrim behind the text; inline-end padding keeps it clear of
               the side pagination and autoplay bar (logical, so RTL flips it). -->
          <div class="flex size-full items-center bg-linear-to-r from-black/75 via-black/35 to-transparent ps-6 pe-20 text-white rtl:bg-linear-to-l sm:ps-16 sm:pe-28">
            <div class="max-w-xl">
              <p data-hero-animate="fade" class="font-mono text-xs tracking-[0.2em] text-white/70">
                {{ pad(index + 1) }} / {{ pad(heroSlides.length) }} · {{ slide.eyebrow }}
              </p>
              <p data-hero-animate="slide" class="mt-3 text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
                {{ slide.title }}
              </p>
              <p data-hero-animate="slide" class="mt-4 max-w-md text-sm text-white/85 sm:text-base">{{ slide.text }}</p>
              <p data-hero-animate="zoom-in" class="mt-7 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur-sm">Scroll or swipe</span>
                <span class="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur-sm">↑ ↓ keys</span>
                <span class="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur-sm">Hover the dots</span>
              </p>
            </div>
          </div>
        </template>
      </HeroSlider>
    </template>

    <p class="-mt-8 max-w-3xl text-sm text-black/60 dark:text-white/60">
      The hero above is the vertical slider: no layout options were needed for the side pagination or the
      top / bottom arrows. Wrap the page (or any ancestor) in <code class="demo-code">dir="rtl"</code> and the
      pagination, its tooltips and the progress bar move to the left edge.
    </p>

    <!-- ─── 2. Synced thumbnails ─── -->
    <DemoSection title="Synced thumbnails"
      hint="v-model:active-index keeps the list and the slider in step both ways: click a thumbnail, or let autoplay, the wheel or the arrows move the slider. @change reports the direction of every change.">
      <template #actions>
        <div class="flex flex-wrap gap-1.5">
          <span class="demo-chip">active-index: {{ active }}</span>
          <span class="demo-chip">
            @change: {{ lastChange ? `${lastChange.direction} (${lastChange.previousIndex + 1} → ${lastChange.index + 1})` : 'waiting' }}
          </span>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <!-- min-w-0: a Swiper inside a grid item with `min-width: auto` grows without bound. -->
        <div class="min-w-0">
          <HeroSlider v-model:active-index="active" :slides="syncSlides" :options="SYNC_OPTIONS"
            :overlay-patterns="NO_PATTERNS" :parallax="false" :ui="ROUNDED" class="h-[22rem] sm:h-[26rem]"
            @change="onChange">
            <template #slide="{ slide, index }">
              <div class="flex size-full items-center bg-linear-to-r from-black/70 via-black/25 to-transparent ps-6 pe-16 text-white rtl:bg-linear-to-l sm:ps-10 sm:pe-20">
                <div>
                  <p data-hero-animate="fade" class="font-mono text-xs tracking-[0.2em] text-white/70">
                    {{ pad(index + 1) }} / {{ pad(syncSlides.length) }}
                  </p>
                  <h3 data-hero-animate="slide" class="mt-1 text-3xl font-bold sm:text-5xl">{{ slide.title }}</h3>
                </div>
              </div>
            </template>
          </HeroSlider>
        </div>

        <ol class="grid grid-cols-5 gap-2 lg:grid-cols-1 lg:content-start" aria-label="Slides">
          <li v-for="(slide, i) in syncSlides" :key="i">
            <button type="button" :aria-label="slide.title" :aria-current="active === i || undefined"
              class="group flex w-full cursor-pointer items-center gap-3 rounded-xl p-1 text-start ring-1 ring-black/5 transition-shadow hover:ring-black/25 aria-[current=true]:ring-2 aria-[current=true]:ring-black dark:ring-white/10 dark:hover:ring-white/30 dark:aria-[current=true]:ring-white lg:p-1.5"
              @click="active = i">
              <img :src="slide.thumbSrc" alt="" loading="lazy"
                class="aspect-[4/3] w-full rounded-lg object-cover opacity-60 transition-opacity group-hover:opacity-100 group-aria-[current=true]:opacity-100 lg:w-20 lg:shrink-0">
              <span class="hidden min-w-0 lg:block">
                <span class="block font-mono text-[11px] text-black/50 dark:text-white/50">{{ pad(i + 1) }}</span>
                <span class="block truncate text-sm font-medium">{{ slide.title }}</span>
              </span>
            </button>
          </li>
        </ol>
      </div>
    </DemoSection>

    <!-- ─── 3. Options ─── -->
    <DemoSection title="Options"
      hint="Both sliders are plain <HeroSlider> with direction: 'vertical'. Nothing else is vertical-specific.">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="min-w-0">
          <h3 class="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">Full-height hero</h3>
          <DemoCode :code="heroCode" />
        </div>
        <div class="min-w-0">
          <h3 class="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">Synced thumbnails</h3>
          <DemoCode :code="syncCode" />
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>
