<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    bgDarkSrc: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=200&q=60',
    title: 'Exclusive Pieces',
    animation: {
      enter: 'animate__animated animate__bounceIn',
      leave: 'animate__animated animate__fadeOut',
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=1920&q=80',
    thumbSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=200&q=60',
    title: 'Spring Summer',
    animation: {
      enter: 'animate__animated animate__fadeInRight',
      leave: 'animate__animated animate__fadeOutLeft',
    },
    config: { showNavigation: false },
  },
  {
    bgSrc: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    thumbSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=60',
    title: 'New Collection',
    animation: {
      enter: 'animate__animated animate__zoomIn',
      leave: 'animate__animated animate__zoomOut',
    },
    config: {
      showProgress: true,
      showVideoControls: true,
      showPagination: true,
      videoLoop: false,
    },
  },
]

const swiperOptions = {
  spaceBetween: 0,
  grabCursor: true,
  direction: 'horizontal' as const,
  slidesPerView: 1,
  mousewheel: false,
  effect: 'creative' as const,
  creativeEffect: {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      translate: ['100%', 0, 0],
    },
  },
  autoplay: { delay: 15500 },
  speed: 500,
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
  showPagination: true,
})

const progressPercent = computed(() => Math.round(slider.autoplayProgress.value * 100))

/** Format seconds as m:ss */
function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<template>
  <div>
    <HeroSlider ref="containerRef" :slider="slider" :slides="slides"
      :parallax="{ bg: true, content: true, speed: 0.55, minOpacity: 0.35 }" :overlay-patterns="[
        { type: 'lines', opacity: 0.125, color: 'black' },
        { type: 'gradient', opacity: 0.125 },
      ]" class="h-[calc(100vh-8.5rem)] overflow-hidden bg-black">
      <template #slide="{ index, slide, videoPlaying, videoToggle, isVideo }">
        <div v-if="index === 2" class="flex size-full flex-col items-center justify-end pb-24">
          <div class="hero text-white">
            <div class="hero-content text-center">
              <div class="max-w-md">
                <h1 class="text-5xl font-bold">{{ slide.title }}</h1>
                <p class="py-2 pb-4">
                  Provident cupiditate voluptatem et in.
                </p>
                <button v-if="isVideo"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black"
                  @click="videoToggle">
                  <Icon :name="videoPlaying ? 'lucide:pause' : 'lucide:play'" class="size-4" />
                  {{ videoPlaying ? 'Pause' : 'Play' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex size-full flex-col items-center justify-center">
          <div class="flex gap-4">
            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-300">
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-1.webp?x" alt="Card 1" />
              </figure>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-200">
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-2.webp?x" alt="Card 2" />
              </figure>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-100">
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-3.webp?x" alt="Card 3" />
              </figure>
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </template>
    </HeroSlider>

    <!-- Slider status panel -->
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black"
          @click="slider.prev()">
          <Icon name="lucide:chevron-left" class="size-3.5" />
          Prev
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black"
          @click="slider.next()">
          Next
          <Icon name="lucide:chevron-right" class="size-3.5" />
        </button>

        <span class="mx-1 h-5 w-px dark:bg-white/20 bg-black/10" />

        <button v-if="slider.isActiveSlideVideo.value"
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 bg-blue-100 text-blue-700 hover:bg-blue-200"
          @click="slider.videoToggle">
          <Icon :name="slider.videoPlaying.value ? 'lucide:pause' : 'lucide:play'" class="size-3.5" />
          Video {{ slider.videoPlaying.value ? 'Pause' : 'Play' }}
        </button>

        <button v-else
          class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="slider.autoplayPaused.value
            ? 'dark:bg-emerald-500/20 dark:text-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
            : 'dark:bg-amber-500/20 dark:text-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:hover:bg-amber-500/30'" @click="slider.autoplayPaused.value ? slider.autoplayResume() : slider.autoplayPause()">
          <Icon :name="slider.autoplayPaused.value ? 'lucide:play' : 'lucide:pause'" class="size-3.5" />
          {{ slider.autoplayPaused.value ? 'Resume' : 'Pause' }}
        </button>

        <!-- Progress badge -->
        <div class="ml-auto flex items-center gap-2">
          <div class="h-1.5 w-24 overflow-hidden rounded-full dark:bg-white/10 bg-black/10">
            <div class="h-full rounded-full transition-all duration-100 dark:bg-white/60 bg-black/40"
              :style="{ width: `${progressPercent}%` }" />
          </div>
          <span class="text-xs tabular-nums dark:text-white/50 text-black/50">{{ progressPercent }}%</span>
        </div>
      </div>

      <!-- Status grid -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <!-- Slide info -->
        <div class="rounded-xl p-3 dark:bg-white/5 bg-black/[0.03] dark:ring-white/10 ring-black/5 ring-1">
          <div class="text-xs font-medium uppercase tracking-wider dark:text-white/40 text-black/40 mb-1">Slide</div>
          <div class="text-lg font-semibold tabular-nums dark:text-white text-black">
            {{ slider.activeIndex.value + 1 }}
            <span class="text-sm font-normal dark:text-white/40 text-black/40">/ {{ slides.length }}</span>
          </div>
          <div class="mt-1 truncate text-xs dark:text-white/50 text-black/50">
            {{ slides[slider.activeIndex.value]?.title }}
          </div>
        </div>

        <!-- Autoplay -->
        <div class="rounded-xl p-3 dark:bg-white/5 bg-black/[0.03] dark:ring-white/10 ring-black/5 ring-1">
          <div class="text-xs font-medium uppercase tracking-wider dark:text-white/40 text-black/40 mb-1">Autoplay</div>
          <div class="flex items-center gap-1.5">
            <span class="size-2 rounded-full"
              :class="slider.autoplayPaused.value ? 'bg-amber-400' : 'bg-emerald-400'" />
            <span class="text-sm dark:text-white text-black">
              {{ slider.autoplayPaused.value ? 'Paused' : 'Running' }}
            </span>
          </div>
          <div class="mt-1 text-xs tabular-nums dark:text-white/50 text-black/50">
            {{ (slider.autoplayDelay.value / 1000).toFixed(1) }}s delay
          </div>
        </div>

        <!-- Video (shown when active slide is video) -->
        <div class="rounded-xl p-3 dark:bg-white/5 bg-black/[0.03] dark:ring-white/10 ring-black/5 ring-1">
          <div class="text-xs font-medium uppercase tracking-wider dark:text-white/40 text-black/40 mb-1">Video</div>
          <template v-if="slider.isActiveSlideVideo.value">
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full" :class="slider.videoPlaying.value ? 'bg-blue-400' : 'bg-white/30'" />
              <span class="text-sm dark:text-white text-black">
                {{ slider.videoPlaying.value ? 'Playing' : 'Stopped' }}
              </span>
            </div>
            <div class="mt-1 text-xs tabular-nums dark:text-white/50 text-black/50">
              {{ fmt(slider.videoCurrentTime.value) }} / {{ fmt(slider.videoDuration.value) }}
            </div>
          </template>
          <div v-else class="text-sm dark:text-white/30 text-black/30">N/A</div>
        </div>

        <!-- State -->
        <div class="rounded-xl p-3 dark:bg-white/5 bg-black/[0.03] dark:ring-white/10 ring-black/5 ring-1">
          <div class="text-xs font-medium uppercase tracking-wider dark:text-white/40 text-black/40 mb-1">State</div>
          <div class="flex flex-wrap gap-1">
            <span v-if="slider.isHovered.value"
              class="inline-block rounded px-1.5 py-0.5 text-xs dark:bg-white/10 dark:text-white/70 bg-black/5 text-black/60">
              Hovered
            </span>
            <span v-if="slider.isActiveSlideVideo.value"
              class="inline-block rounded px-1.5 py-0.5 text-xs dark:bg-blue-500/20 dark:text-blue-300 bg-blue-100 text-blue-700">
              Video
            </span>
            <span v-if="slider.videoMuted.value && slider.isActiveSlideVideo.value"
              class="inline-block rounded px-1.5 py-0.5 text-xs dark:bg-white/10 dark:text-white/70 bg-black/5 text-black/60">
              Muted
            </span>
            <span v-if="!slider.isHovered.value && !slider.isActiveSlideVideo.value"
              class="text-sm dark:text-white/30 text-black/30">Idle</span>
          </div>
        </div>
      </div>
    </div>

    <div class="h-[50vh] flex items-center justify-center dark:text-white/20 text-black/20 text-sm">
      Scroll area for parallax testing
    </div>
  </div>
</template>
