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

                <button v-if="isVideo" class="btn btn-primary z-1 pointer-events-auto" @click="videoToggle">
                  {{ videoPlaying ? 'Pause' : 'Play' }}
                </button>

              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex size-full flex-col items-center justify-center">
          <div class="flex gap-4">
            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-300">
              <!-- content -->
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-1.webp?x" alt="Tailwind CSS 3D card" />
              </figure>
              <!-- 8 empty divs needed for the 3D effect -->
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-200">
              <!-- content -->
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-2.webp?x" alt="Tailwind CSS 3D hover" />
              </figure>
              <!-- 8 empty divs needed for the 3D effect -->
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div class="hover-3d hover-cursor-pointer" data-swiper-parallax="-100">
              <!-- content -->
              <figure class="w-45 rounded-sm">
                <img src="https://img.daisyui.com/images/stock/card-3.webp?x" alt="Tailwind CSS 3D hover" />
              </figure>
              <!-- 8 empty divs needed for the 3D effect -->
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </template>
    </HeroSlider>

    <!-- External controls demo using composable API -->
    <div class="fixed bottom-4 left-4 z-100 flex gap-2 items-center">
      <button class="btn btn-sm" @click="slider.autoplayPause()">Pause</button>
      <button class="btn btn-sm" @click="slider.autoplayResume()">Resume</button>
      <button v-if="slider.isActiveSlideVideo.value" class="btn btn-sm" @click="slider.videoToggle">
        video {{ slider.videoPlaying.value ? 'Pause' : 'Play' }}
      </button>
      <span class="badge">{{ Math.round(slider.autoplayProgress.value * 100) }}%</span>
    </div>
    <pre>{{ slider }}</pre>
    <div class="h-800 flex items-center justify-center">scroll</div>
  </div>
</template>
