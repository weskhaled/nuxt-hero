<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    title: 'Nebula',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80',
    title: 'Earth from Space',
  },
  {
    bgSrc: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    title: 'Glass Animation',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1920&q=80',
    title: 'Astronaut',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1920&q=80',
    title: 'Galaxy',
  },
]

const swiperOptions = {
  effect: 'cube' as const,
  cubeEffect: {
    shadow: true,
    slideShadows: true,
    shadowOffset: 20,
    shadowScale: 0.94,
  },
  speed: 600,
  autoplay: { delay: 5000 },
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
})
</script>

<template>
  <div>
    <div class="h-20" />
    <div class="flex items-center justify-center h-[calc(100vh-5rem)]">
      <HeroSlider ref="containerRef" :slider="slider" :slides="slides" :parallax="false" class="size-96! m-auto"
        :overlay-patterns="[{ type: 'lines', opacity: 0.06, color: 'white' }]"
        :ui="{ slide: 'rounded-sm bg-black', container: 'p-6', root: 'm-auto rounded-lg' }">
        <template #slide="{ slide }">
          <div class="flex size-full items-end p-6">
            <h2 class="text-3xl font-bold text-white drop-shadow-lg">{{ slide.title }}</h2>
          </div>
        </template>
      </HeroSlider>
    </div>
  </div>
</template>
