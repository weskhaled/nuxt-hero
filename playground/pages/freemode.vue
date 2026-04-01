<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    title: 'Mountains',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    title: 'Nature',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
    title: 'Forest',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    title: 'Valley',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    title: 'Woods',
  },
  {
    bgSrc: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    title: 'Glass Animation',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    config: {
      showProgress: false,
      showVideoControls: true,
      videoLoop: true,
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
    title: 'Waterfall',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
    title: 'Landscape',
  },
]

const swiperOptions = {
  slidesPerView: 4,
  spaceBetween: 16,
  freeMode: {
    enabled: true,
    sticky: false,
  },
  grabCursor: true,
  autoplay: { delay: 30000 },
  mousewheel: {
    forceToAxis: true,
    releaseOnEdges: true,
    sensitivity: 1.25,
  },
  breakpoints: {
    0: { slidesPerView: 1.5, spaceBetween: 8 },
    640: { slidesPerView: 2.5, spaceBetween: 12 },
    1024: { slidesPerView: 4, spaceBetween: 16 },
  },
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
  showProgress: false,
})
</script>

<template>
  <div>
    <div class="h-20" />
    <div class="px-4">
      <h2 class="text-2xl font-bold mb-4">Free Mode — 4 Slides Per View</h2>
      <p class="text-base-content/60 mb-6">Drag freely through slides with momentum. Includes a video slide.</p>
    </div>
    <HeroSlider ref="containerRef" :slider="slider" :slides="slides" :showProgress="false"
      :parallax="{ bg: true, content: false, speed: 0.75, minOpacity: 1 }" :overlay-patterns="[]"
      :ui="{ root: 'pb-9', slide: 'rounded-sm overflow-hidden' }" class="h-120">
      <template #slide="{ slide, isActive }">
        <div class="flex size-full items-end p-4 pb-14">
          <div class="rounded-lg bg-black/50 px-4 py-2 backdrop-blur-sm">
            <h3 class="text-lg font-semibold text-white">{{ slide.title }}</h3>
          </div>
        </div>
      </template>
    </HeroSlider>
    <div class="h-screen flex items-center justify-center text-base-content/30">scroll area</div>
  </div>
</template>
<style>
.swiper-wrapper {
  @apply w-fit;
}
</style>