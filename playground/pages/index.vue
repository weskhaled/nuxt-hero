<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { KeyboardOptions, MousewheelOptions } from 'swiper/types'
import type { HeroSlide, SwiperEffect } from '#hero/types'

const containerRef = useTemplateRef<HTMLElement>('containerRef')

// ─── Reactive slide data (config is hot-editable per slide) ───
const slides = reactive<HeroSlide[]>([
  {
    bgSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    bgDarkSrc: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=200&q=60',
    title: 'Exclusive Pieces',
    eyebrow: 'Curated · Spring 2026',
    description: 'Handpicked silhouettes built to last. Limited runs, ethically sourced materials.',
    animation: {
      enter: 'animate__animated animate__bounceIn',
      leave: 'animate__animated animate__fadeOut',
    },
    config: {},
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=200&q=60',
    title: 'Spring Summer',
    eyebrow: 'New Season',
    description: 'Lightweight layers, softer palettes, sharper lines.',
    animation: {
      enter: 'animate__animated animate__fadeInRight',
      leave: 'animate__animated animate__fadeOutLeft',
    },
    config: { showNavigation: false },
  },
  {
    bgSrc: 'https://vjs.zencdn.net/v/oceans.mp4',
    thumbSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=60',
    title: 'New Collection',
    eyebrow: 'Live now',
    description: 'An immersive look at the pieces defining our latest drop.',
    animation: {
      enter: 'animate__animated animate__zoomIn',
      leave: 'animate__animated animate__zoomOut',
    },
    config: {
      showProgress: true,
      showVideoControls: true,
      pauseUntilVideoEnds: false,
      showPagination: true,
      videoLoop: true,
      watchMode: true,
      watchIdleMs: 3000,
    },
  },
])

// ─── Reactive swiper / parallax config ───
const swiperOptions = reactive({
  spaceBetween: 0,
  grabCursor: true,
  direction: 'horizontal' as 'horizontal' | 'vertical',
  slidesPerView: 1 as number | 'auto',
  centeredSlides: false,
  loop: false,
  rewind: false,
  mousewheel: { forceToAxis: true, sensitivity: 1 } as boolean | MousewheelOptions,
  keyboard: true as boolean | KeyboardOptions,
  effect: 'creative' as SwiperEffect | 'slide',
  creativeEffect: {
    prev: { shadow: true, translate: [0, 0, -400] as [number | string, number | string, number] },
    next: { translate: ['100%', 0, 0] as [number | string, number | string, number] },
  },
  autoplay: { delay: 15500 },
  speed: 500,
})

const parallaxCfg = reactive({
  bg: true,
  content: true,
  speed: 0.55,
  minOpacity: 0.35,
})

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
  showPagination: true,
})

// Re-mount the slider whenever a structural swiper option changes so the
// underlying Swiper instance re-initializes with the new modules/behaviour.
const sliderKey = computed(() => [
  swiperOptions.effect,
  swiperOptions.direction,
  swiperOptions.speed,
  swiperOptions.slidesPerView,
  swiperOptions.spaceBetween,
  swiperOptions.centeredSlides,
  swiperOptions.loop,
  swiperOptions.rewind,
  swiperOptions.grabCursor,
  !!swiperOptions.mousewheel,
  !!swiperOptions.keyboard,
].join('|'))

// Push autoplay delay edits into the composable (it owns the timer).
watch(() => swiperOptions.autoplay.delay, v => slider.autoplaySetDelay(v))

// Keep creative-effect next-slide translate axis aligned with the slider
// direction — vertical = enter from bottom, horizontal = enter from right.
watch(() => swiperOptions.direction, (dir) => {
  swiperOptions.creativeEffect.next.translate
    = dir === 'vertical' ? [0, '100%', 0] : ['100%', 0, 0]
}, { immediate: true })

// ─── Mousewheel control (boolean | object) ───
// `mousewheel` accepts `true` or a `MousewheelOptions` object. The checkbox
// toggles it on (as an object so the sub-options are live) / off; the sub-
// controls edit `forceToAxis` + `sensitivity` on that object.
const mwEnabled = computed({
  get: () => !!swiperOptions.mousewheel,
  set: on => (swiperOptions.mousewheel = on ? { forceToAxis: true, sensitivity: 1 } : false),
})
const mwOpts = computed(() => (typeof swiperOptions.mousewheel === 'object' ? swiperOptions.mousewheel : null))
const mwForceToAxis = computed({
  get: () => !!mwOpts.value?.forceToAxis,
  set: (v) => { if (mwOpts.value) mwOpts.value.forceToAxis = v },
})
const mwSensitivity = computed({
  get: () => mwOpts.value?.sensitivity ?? 1,
  set: (v) => { if (mwOpts.value) mwOpts.value.sensitivity = v },
})

// ─── Helpers ───
const progressPercent = computed(() => Math.round(slider.autoplayProgress.value * 100))
const remainingSec = computed(() => (slider.autoplayRemaining.value / 1000).toFixed(1))
const volumePercent = computed(() => Math.round((slider.videoVolume.value ?? 0) * 100))

const activeCfg = computed(() => slides[slider.activeIndex.value]?.config ?? {})

// `videoBuffered` already returns the end-of-last-range number.
const bufferedEnd = computed(() => slider.videoBuffered.value)

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const EFFECTS: Array<{ value: SwiperEffect | 'slide', label: string, hint?: string }> = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'creative', label: 'Creative' },
  { value: 'cards', label: 'Cards' },
  { value: 'flip', label: 'Flip' },
  { value: 'coverflow', label: 'Coverflow' },
]

/** Effects that actually render multiple slides side-by-side. Fade / cards /
 *  flip / creative / cube force `slidesPerView: 1` internally, so the
 *  slidesPerView / spaceBetween / centeredSlides controls are inert. */
const MULTI_SLIDE_EFFECTS = new Set(['slide', 'coverflow'])
const supportsMultiSlide = computed(() => MULTI_SLIDE_EFFECTS.has(swiperOptions.effect))

/** Bumping slidesPerView from a single-slide effect? Hop to `slide` so the
 *  change is actually visible. */
function setSlidesPerView(v: number | 'auto') {
  if ((v === 'auto' || v > 1) && !supportsMultiSlide.value) {
    swiperOptions.effect = 'slide'
  }
  swiperOptions.slidesPerView = v
}

function resetSlideConfig() {
  const slide = slides[slider.activeIndex.value]
  if (slide) slide.config = {}
}

/** Patch the active slide's `config` with a partial update (safe against undefined). */
function patchActiveConfig(patch: Record<string, unknown>) {
  const slide = slides[slider.activeIndex.value]
  if (!slide) return
  slide.config = { ...slide.config, ...patch }
}
</script>

<template>
  <div class="pb-20">
    <!-- ═══ Slider ═══ -->
    <HeroSlider :key="sliderKey" ref="containerRef" :slider="slider" :slides="slides" :parallax="parallaxCfg"
      :overlay-patterns="[
        { type: 'lines', opacity: 0.125, color: 'black' },
        { type: 'gradient', opacity: 0.125 },
      ]" class="h-[60svh] min-h-[420px] sm:h-[calc(100svh-10rem)] overflow-hidden bg-black">
      <template #slide="{ slide, isVideo, videoPlaying, videoToggle }">
        <div v-if="isVideo" class="flex size-full items-end sm:items-center">
          <div class="w-full max-w-3xl px-6 pb-24 sm:pb-16 sm:px-12 lg:px-20 text-white">
            <span data-swiper-parallax="-100"
              class="inline-block text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-3 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
              {{ slide.eyebrow }}
            </span>
            <h1 data-swiper-parallax="-200"
              class="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] drop-shadow-lg">
              {{ slide.title }}
            </h1>
            <p data-swiper-parallax="-150" class="mt-3 sm:mt-4 max-w-lg text-sm sm:text-base text-white/80 drop-shadow">
              {{ slide.description }}
            </p>
            <button data-swiper-parallax="-100" type="button"
              class="mt-5 sm:mt-6 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-white text-black hover:bg-white/90"
              @click="videoToggle">
              <Icon :name="videoPlaying ? 'lucide:pause' : 'lucide:play'" class="size-4" />
              {{ videoPlaying ? 'Pause' : 'Play' }}
            </button>
          </div>
        </div>
        <div v-else class="flex size-full flex-col items-center justify-end pb-10 sm:pb-16 px-4">
          <div class="text-center max-w-xl mb-6 sm:mb-10 text-white">
            <span data-swiper-parallax="-100"
              class="inline-block text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/70 mb-2 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
              {{ slide.eyebrow }}
            </span>
            <h1 data-swiper-parallax="-200"
              class="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg">
              {{ slide.title }}
            </h1>
            <p data-swiper-parallax="-150" class="mt-2 sm:mt-3 text-xs sm:text-sm text-white/80 drop-shadow">
              {{ slide.description }}
            </p>
          </div>
        </div>
      </template>
    </HeroSlider>

    <!-- ═══ Storybook controls ═══ -->
    <div class="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <!-- Live state strip -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="sb-chip">
          <Icon name="lucide:layers" class="size-3" />
          Slide <b class="ml-1 tabular-nums">{{ slider.activeIndex.value + 1 }}/{{ slides.length }}</b>
        </span>
        <span class="sb-chip" :class="slider.autoplayPaused.value ? 'sb-chip--amber' : 'sb-chip--emerald'">
          <span class="size-1.5 rounded-full"
            :class="slider.autoplayPaused.value ? 'bg-amber-400' : 'bg-emerald-400'" />
          {{ slider.autoplayPaused.value ? 'Paused' : 'Running' }}
          <span class="opacity-60">· {{ remainingSec }}s</span>
        </span>
        <span v-if="slider.isActiveSlideVideo.value" class="sb-chip sb-chip--blue">
          <Icon name="lucide:film" class="size-3" />
          Video {{ slider.videoPlaying.value ? '▶' : '❚❚' }}
        </span>
        <span v-if="slider.isHovered.value" class="sb-chip">
          <Icon name="lucide:mouse-pointer-2" class="size-3" /> Hovered
        </span>
        <span v-if="slider.videoWaiting.value" class="sb-chip">
          <Icon name="lucide:loader" class="size-3 animate-spin" /> Buffering
        </span>
        <span v-if="slider.videoEnded.value" class="sb-chip">Ended</span>
      </div>

      <!-- Controls grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- ── A · Navigation ── -->
        <section class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:navigation" class="size-4" /> Navigation
          </h3>
          <div class="flex flex-wrap gap-2">
            <button class="sb-btn" @click="slider.prev()">
              <Icon name="lucide:chevron-left" class="size-3.5" /> Prev
            </button>
            <button class="sb-btn" @click="slider.next()">
              Next
              <Icon name="lucide:chevron-right" class="size-3.5" />
            </button>
          </div>
          <div class="sb-row mt-2">
            <span class="sb-label">Jump to</span>
            <div class="flex gap-1">
              <button v-for="(s, i) in slides" :key="i" class="sb-dot"
                :class="{ 'sb-dot--active': slider.activeIndex.value === i }" :title="s.title" @click="slider.goTo(i)">
                {{ i + 1 }}
              </button>
            </div>
          </div>
        </section>

        <!-- ── B · Autoplay ── -->
        <section class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:timer" class="size-4" /> Autoplay
          </h3>
          <div class="flex flex-wrap gap-2">
            <button class="sb-btn" :class="slider.autoplayPaused.value ? 'sb-btn--emerald' : 'sb-btn--amber'"
              @click="slider.autoplayPaused.value ? slider.autoplayResume() : slider.autoplayPause()">
              <Icon :name="slider.autoplayPaused.value ? 'lucide:play' : 'lucide:pause'" class="size-3.5" />
              {{ slider.autoplayPaused.value ? 'Resume' : 'Pause' }}
            </button>
            <button class="sb-btn" @click="slider.autoplayReset()">
              <Icon name="lucide:rotate-ccw" class="size-3.5" /> Reset
            </button>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Delay · {{ (swiperOptions.autoplay.delay / 1000).toFixed(1) }}s</label>
            <input v-model.number="swiperOptions.autoplay.delay" type="range" min="1000" max="30000" step="500"
              class="sb-range" />
          </div>
          <div class="sb-row mt-2">
            <span class="sb-label">Progress · {{ progressPercent }}%</span>
            <div class="h-1.5 w-full overflow-hidden rounded-full dark:bg-white/10 bg-black/10">
              <div class="h-full w-full origin-left rounded-full will-change-transform dark:bg-white/60 bg-black/40"
                :style="{ transform: `scaleX(${slider.autoplayProgress.value})` }" />
            </div>
          </div>
        </section>

        <!-- ── C · Video (conditional) ── -->
        <section v-if="slider.isActiveSlideVideo.value" class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:film" class="size-4" /> Video playback
          </h3>
          <div class="flex flex-wrap gap-2">
            <button class="sb-btn sb-btn--blue" @click="slider.videoToggle">
              <Icon :name="slider.videoPlaying.value ? 'lucide:pause' : 'lucide:play'" class="size-3.5" />
              {{ slider.videoPlaying.value ? 'Pause' : 'Play' }}
            </button>
            <button class="sb-btn" @click="slider.videoToggleMute">
              <Icon :name="slider.videoMuted.value ? 'lucide:volume-x' : 'lucide:volume-2'" class="size-3.5" />
              {{ slider.videoMuted.value ? 'Unmute' : 'Mute' }}
            </button>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Volume · {{ volumePercent }}%</label>
            <input :value="volumePercent" type="range" min="0" max="100" step="1" class="sb-range"
              @input="slider.videoSetVolume(Number(($event.target as HTMLInputElement).value) / 100)" />
          </div>
          <div class="sb-row mt-2">
            <div class="flex items-center justify-between">
              <span class="sb-label">Timeline</span>
              <span class="text-xs tabular-nums opacity-70">
                {{ fmt(slider.videoCurrentTime.value) }} / {{ fmt(slider.videoDuration.value) }}
              </span>
            </div>
            <div class="py-2 dark:text-white text-black">
              <HeroVideoScrubber :model-value="slider.videoCurrentTime.value" :max="slider.videoDuration.value"
                :secondary="bufferedEnd" @update:model-value="slider.videoSeek"
                @scrubber-mousedown="slider.videoScrubStart" @scrubber-mouseup="slider.videoScrubEnd" />
            </div>
          </div>
        </section>

        <!-- ── D · Effect & speed ── -->
        <section class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:sparkles" class="size-4" /> Effect & speed
            <span class="sb-hint">re-mounts slider</span>
          </h3>
          <div class="sb-row">
            <label class="sb-label">Effect</label>
            <select v-model="swiperOptions.effect" class="sb-select">
              <option v-for="e in EFFECTS" :key="e.value" :value="e.value">{{ e.label }}</option>
            </select>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Direction</label>
            <div class="flex gap-2">
              <button class="sb-toggle" :class="{ 'sb-toggle--on': swiperOptions.direction === 'horizontal' }"
                @click="swiperOptions.direction = 'horizontal'">Horizontal</button>
              <button class="sb-toggle" :class="{ 'sb-toggle--on': swiperOptions.direction === 'vertical' }"
                @click="swiperOptions.direction = 'vertical'">Vertical</button>
            </div>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Transition · {{ swiperOptions.speed }}ms</label>
            <input v-model.number="swiperOptions.speed" type="range" min="100" max="2000" step="50" class="sb-range" />
          </div>
        </section>

        <!-- ── D2 · Swiper modules & behaviour ── -->
        <section class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:puzzle" class="size-4" /> Modules & behaviour
            <span class="sb-hint">re-mounts slider</span>
          </h3>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <label class="sb-check">
              <input v-model="mwEnabled" type="checkbox" />
              <Icon name="lucide:mouse" class="size-3.5" /> Mousewheel
            </label>
            <label class="sb-check">
              <input v-model="swiperOptions.keyboard" type="checkbox" />
              <Icon name="lucide:keyboard" class="size-3.5" /> Keyboard
            </label>
            <label class="sb-check">
              <input v-model="swiperOptions.grabCursor" type="checkbox" />
              <Icon name="lucide:hand" class="size-3.5" /> Grab cursor
            </label>
            <label class="sb-check">
              <input v-model="swiperOptions.centeredSlides" type="checkbox" />
              <Icon name="lucide:align-center" class="size-3.5" /> Centered
            </label>
            <label class="sb-check">
              <input v-model="swiperOptions.loop" type="checkbox"
                @change="swiperOptions.loop && (swiperOptions.rewind = false)" />
              <Icon name="lucide:repeat" class="size-3.5" /> Loop
            </label>
            <label class="sb-check">
              <input v-model="swiperOptions.rewind" type="checkbox"
                @change="swiperOptions.rewind && (swiperOptions.loop = false)" />
              <Icon name="lucide:rewind" class="size-3.5" /> Rewind
            </label>
          </div>

          <!-- Mousewheel as an object: forceToAxis + sensitivity (shown when enabled) -->
          <div v-if="mwEnabled" class="mt-2 space-y-2 border-l-2 pl-3 dark:border-white/15 border-black/10">
            <div class="sb-hint normal-case">mousewheel: object</div>
            <label class="sb-check">
              <input v-model="mwForceToAxis" type="checkbox" /> Force to axis
            </label>
            <div>
              <label class="sb-label">Sensitivity · {{ mwSensitivity.toFixed(1) }}</label>
              <input v-model.number="mwSensitivity" type="range" min="0.5" max="3" step="0.1" class="sb-range" />
            </div>
          </div>

          <div class="sb-row mt-2">
            <label class="sb-label flex items-center justify-between">
              <span>Slides per view · {{ swiperOptions.slidesPerView === 'auto' ? 'auto' : swiperOptions.slidesPerView
              }}</span>
              <span v-if="!supportsMultiSlide" class="sb-hint normal-case">
                will switch to <b>slide</b>
              </span>
            </label>
            <div class="flex items-center gap-2">
              <input :value="swiperOptions.slidesPerView === 'auto' ? 1 : swiperOptions.slidesPerView" type="range"
                min="1" max="6" step="1" class="sb-range"
                @input="setSlidesPerView(Number(($event.target as HTMLInputElement).value))" />
              <button class="sb-toggle shrink-0" :class="{ 'sb-toggle--on': swiperOptions.slidesPerView === 'auto' }"
                @click="setSlidesPerView(swiperOptions.slidesPerView === 'auto' ? 1 : 'auto')">auto</button>
            </div>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Space between · {{ swiperOptions.spaceBetween }}px</label>
            <input v-model.number="swiperOptions.spaceBetween" type="range" min="0" max="64" step="2" class="sb-range"
              :disabled="!supportsMultiSlide" :class="{ 'opacity-40': !supportsMultiSlide }" />
          </div>
          <label class="sb-check mt-2" :class="{ 'opacity-40': !supportsMultiSlide }">
            <input v-model="swiperOptions.centeredSlides" type="checkbox" :disabled="!supportsMultiSlide" />
            <Icon name="lucide:align-center" class="size-3.5" /> Centered slides
            <span v-if="!supportsMultiSlide" class="sb-hint normal-case ml-auto">needs slide / coverflow</span>
          </label>
        </section>

        <!-- ── E · Parallax (live) ── -->
        <section class="sb-card">
          <h3 class="sb-title">
            <Icon name="lucide:mountain-snow" class="size-4" /> Parallax
            <span class="sb-hint">live</span>
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <label class="sb-check">
              <input v-model="parallaxCfg.bg" type="checkbox" /> Background
            </label>
            <label class="sb-check">
              <input v-model="parallaxCfg.content" type="checkbox" /> Content
            </label>
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Speed · {{ parallaxCfg.speed.toFixed(2) }}</label>
            <input v-model.number="parallaxCfg.speed" type="range" min="0" max="1" step="0.05" class="sb-range" />
          </div>
          <div class="sb-row mt-2">
            <label class="sb-label">Min opacity · {{ parallaxCfg.minOpacity.toFixed(2) }}</label>
            <input v-model.number="parallaxCfg.minOpacity" type="range" min="0" max="1" step="0.05" class="sb-range" />
          </div>
        </section>

        <!-- ── F · Active slide config (live per-slide) ── -->
        <section class="sb-card md:col-span-2 lg:col-span-3">
          <h3 class="sb-title">
            <Icon name="lucide:sliders-horizontal" class="size-4" /> Slide #{{ slider.activeIndex.value + 1 }} config
            <span class="sb-hint">{{ slides[slider.activeIndex.value]?.title }}</span>
            <button class="sb-btn sb-btn--tiny ml-auto" @click="resetSlideConfig">
              <Icon name="lucide:rotate-ccw" class="size-3" /> Reset
            </button>
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <label class="sb-check">
              <input :checked="activeCfg.showNavigation ?? true" type="checkbox"
                @change="patchActiveConfig({ showNavigation: ($event.target as HTMLInputElement).checked })" />
              Navigation
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.showPagination ?? true" type="checkbox"
                @change="patchActiveConfig({ showPagination: ($event.target as HTMLInputElement).checked })" />
              Pagination
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.showProgress ?? true" type="checkbox"
                @change="patchActiveConfig({ showProgress: ($event.target as HTMLInputElement).checked })" />
              Progress
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.showVideoControls ?? true" type="checkbox"
                @change="patchActiveConfig({ showVideoControls: ($event.target as HTMLInputElement).checked })" />
              Video ctrls
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.videoLoop ?? false" type="checkbox"
                @change="patchActiveConfig({ videoLoop: ($event.target as HTMLInputElement).checked })" />
              Video loop
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.pauseUntilVideoEnds ?? false" type="checkbox"
                @change="patchActiveConfig({ pauseUntilVideoEnds: ($event.target as HTMLInputElement).checked })" />
              Pause until end
            </label>
            <label class="sb-check">
              <input :checked="activeCfg.watchMode ?? false" type="checkbox"
                @change="patchActiveConfig({ watchMode: ($event.target as HTMLInputElement).checked })" />
              Watch mode
            </label>
          </div>
        </section>

        <!-- ── G · Live state readout ── -->
        <section class="sb-card md:col-span-2 lg:col-span-3">
          <h3 class="sb-title">
            <Icon name="lucide:terminal" class="size-4" /> Live state
          </h3>
          <pre class="text-[11px] leading-5 tabular-nums overflow-x-auto dark:text-white/70 text-black/70">{{ {
            activeIndex: slider.activeIndex.value,
            snapIndex: slider.snapIndex.value,
            totalSnaps: slider.totalSnaps.value,
            isHovered: slider.isHovered.value,
            isActiveSlideVideo: slider.isActiveSlideVideo.value,
            isMultiSlide: slider.isMultiSlide.value,
            swiper: {
              effect: swiperOptions.effect,
              direction: swiperOptions.direction,
              speed: swiperOptions.speed,
              slidesPerView: swiperOptions.slidesPerView,
              spaceBetween: swiperOptions.spaceBetween,
              centeredSlides: swiperOptions.centeredSlides,
              loop: swiperOptions.loop,
              rewind: swiperOptions.rewind,
              grabCursor: swiperOptions.grabCursor,
              mousewheel: !!swiperOptions.mousewheel,
              keyboard: !!swiperOptions.keyboard,
            },
            autoplay: {
              paused: slider.autoplayPaused.value,
              delayMs: slider.autoplayDelay.value,
              remainingMs: Math.round(slider.autoplayRemaining.value),
              progress: Number(slider.autoplayProgress.value.toFixed(3)),
            },
            video: slider.isActiveSlideVideo.value ? {
              playing: slider.videoPlaying.value,
              waiting: slider.videoWaiting.value,
              ended: slider.videoEnded.value,
              muted: slider.videoMuted.value,
              volume: slider.videoVolume.value,
              currentTime: Number(slider.videoCurrentTime.value.toFixed(2)),
              duration: Number(slider.videoDuration.value.toFixed(2)),
            } : null,
          } }}</pre>
        </section>
      </div>
    </div>

    <div class="h-[50vh] flex items-center justify-center dark:text-white/20 text-black/20 text-sm">
      Scroll area for parallax testing
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* ─── Storybook control kit ─── */
.sb-card {
  @apply rounded-xl p-4 ring-1 dark:bg-white/5 bg-black/[0.02] dark:ring-white/10 ring-black/5;
}

.sb-title {
  @apply flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3;
  @apply dark:text-white/70 text-black/70;
}

.sb-hint {
  @apply ml-1 text-[10px] font-normal normal-case tracking-normal;
  @apply dark:text-white/40 text-black/40;
}

.sb-label {
  @apply block text-[11px] font-medium mb-1.5 dark:text-white/50 text-black/60;
}

.sb-row {
  @apply block;
}

.sb-btn {
  @apply inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium;
  @apply transition-colors cursor-pointer;
  @apply dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black;
}

.sb-btn--tiny {
  @apply px-2 py-1 text-[11px];
}

.sb-btn--blue {
  @apply dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.sb-btn--emerald {
  @apply dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 bg-emerald-100 text-emerald-700 hover:bg-emerald-200;
}

.sb-btn--amber {
  @apply dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30 bg-amber-100 text-amber-700 hover:bg-amber-200;
}

.sb-dot {
  @apply inline-flex items-center justify-center size-7 rounded-full text-xs font-medium tabular-nums;
  @apply transition-colors cursor-pointer;
  @apply dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black;
}

.sb-dot--active {
  @apply dark:bg-white dark:text-black bg-black text-white;
}

.sb-toggle {
  @apply inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors;
  @apply dark:bg-white/10 dark:text-white/70 bg-black/5 text-black/70;
}

.sb-toggle--on {
  @apply dark:bg-white dark:text-black bg-black text-white;
}

.sb-chip {
  @apply inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium;
  @apply dark:bg-white/10 dark:text-white/70 bg-black/5 text-black/70;
}

.sb-chip--blue {
  @apply dark:bg-blue-500/20 dark:text-blue-300 bg-blue-100 text-blue-700;
}

.sb-chip--emerald {
  @apply dark:bg-emerald-500/20 dark:text-emerald-300 bg-emerald-100 text-emerald-700;
}

.sb-chip--amber {
  @apply dark:bg-amber-500/20 dark:text-amber-300 bg-amber-100 text-amber-700;
}

.sb-check {
  @apply inline-flex items-center gap-2 text-xs cursor-pointer dark:text-white/70 text-black/70;
}

.sb-check>input[type="checkbox"] {
  @apply size-3.5 rounded accent-black dark:accent-white cursor-pointer;
}

.sb-select {
  @apply w-full rounded-md px-2 py-1 text-xs cursor-pointer;
  @apply dark:bg-white/10 dark:text-white bg-black/5 text-black border-0 outline-none;
}

.sb-range {
  @apply w-full appearance-none h-1 rounded-full cursor-pointer outline-none;
  @apply dark:bg-white/15 bg-black/10;
}

.sb-range::-webkit-slider-thumb {
  @apply appearance-none size-3 rounded-full cursor-pointer;
  @apply dark:bg-white bg-black;
}

.sb-range::-moz-range-thumb {
  @apply size-3 rounded-full cursor-pointer border-none;
  @apply dark:bg-white bg-black;
}
</style>
