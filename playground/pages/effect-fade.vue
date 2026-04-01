<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    title: 'Tropical Beach',
    animation: {
      enter: 'animate__animated animate__fadeIn',
      leave: 'animate__animated animate__fadeOut',
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    title: 'Starry Night',
    animation: {
      enter: 'animate__animated animate__fadeInDown',
      leave: 'animate__animated animate__fadeOutUp',
    },
  },
  {
    bgSrc: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    title: 'Glass Motion',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    animation: {
      enter: 'animate__animated animate__fadeIn',
      leave: 'animate__animated animate__fadeOut',
    },
    config: {
      showProgress: true,
      showVideoControls: false,
      showPagination: true,
      videoLoop: false,
    },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1920&q=80',
    title: 'Northern Lights',
    animation: {
      enter: 'animate__animated animate__fadeInUp',
      leave: 'animate__animated animate__fadeOutDown',
    },
  },
]

const swiperOptions = {
  effect: 'fade' as const,
  speed: 800,
  autoplay: { delay: 6000 },
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
})
</script>

<template>
  <div>
    <div class="h-14" />
    <HeroSlider ref="containerRef" :slider="slider" :slides="slides"
      :parallax="{ bg: true, content: true, speed: 0.5, minOpacity: 0 }"
      :overlay-patterns="[{ type: 'gradient', opacity: 0.15 }]" class="h-[calc(100vh-3.5rem)]">
      <template #slide="{ slide }">
        <div class="flex size-full items-center justify-center">
          <div class="text-center text-white">
            <h1 class="text-6xl font-bold drop-shadow-lg">{{ slide.title }}</h1>
            <p class="mt-4 text-lg opacity-80">Fade effect transition</p>
          </div>
        </div>
      </template>
    </HeroSlider>
    <div class="h-120 flex items-center justify-center text-base-content/30">scroll area</div>
  </div>
</template>
