<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Sintel_movie_4K.webm',
    bgDarkSrc: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    title: 'HLS Video',
    animation: { enter: 'hero-animated hero-fadeIn', leave: 'animate__animated animate__fadeOut', },
  },
  {
    bgSrc: 'https://www.videobacks.net/static/preview/stock-video-free-road-stock-footage--hd-royalty-free-archive-100661.mp4',
    bgDarkSrc: 'https://www.videobacks.net/static/preview/stock-video-free-vfx-stock-video-footage--backgrounds-stock-footage-no-copyright-royalty-free-archive-hd-100658.mp4',
    title: 'Parallax Demo',
    animation: { enter: 'hero-animated hero-fadeIn', leave: 'animate__animated animate__fadeOut', },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=1920&q=80',
    bgDarkSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    title: 'Scroll Down',
    animation: { enter: 'hero-animated hero-slideInUp', leave: 'animate__animated animate__fadeOut', },
    config: { showPagination: true },
  },
]

const swiperOptions = {
  autoplay: { delay: 6000 },
  speed: 800,
  swiperParallax: true
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
  showPagination: false,
})
</script>

<template>
  <div>
    <div class="h-[calc(100vh-4rem)] flex items-center justify-center">
      <HeroSlider ref="containerRef" :slider="slider" :slides="slides"
        :parallax="{ bg: true, content: true, speed: 0.55, minOpacity: 0.15 }"
        :overlay-patterns="[{ type: 'gradient', opacity: 0.15 }]">
        <template #slide="{ slide }">
          <div class="flex flex-col size-full items-center justify-center">
            <h1 data-swiper-parallax="-300" class="text-5xl font-bold text-white drop-shadow-lg">{{ slide.title }}</h1>
            <p data-swiper-parallax="300" class="text-xl font-light text-white drop-shadow-lg">
              This is a simple parallax effect example.
            </p>
          </div>
        </template>
      </HeroSlider>
    </div>
    <div class="flex min-h-screen items-center justify-center bg-white p-12">
      <p class="text-2xl text-gray-800">Scroll back up to see the parallax effect.</p>
    </div>
  </div>
</template>
