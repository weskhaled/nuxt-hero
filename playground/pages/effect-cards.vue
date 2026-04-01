<script setup lang="ts">
const containerRef = useTemplateRef<HTMLElement>('containerRef')

const slides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    title: 'Concert',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'DJ Set',
  },
  {
    bgSrc: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    title: 'Glass Motion',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
    title: 'Festival',
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    title: 'Stage Lights',
  },
]

const swiperOptions = {
  effect: 'cards' as const,
  cardsEffect: {
    perSlideOffset: 8,
    perSlideRotate: 2,
    rotate: true,
  },
  speed: 500,
  autoplay: { delay: 4000 },
}

const slider = useHeroSlider(containerRef, slides, {
  swiperOptions,
})
</script>

<template>
  <div>
    <div class="h-14" />
    <div class="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-base-200">
      <HeroSlider ref="containerRef" :slider="slider" :slides="slides" :parallax="false"
        :ui="{ slide: 'rounded-sm overflow-hidden bg-black', root: 'rounded-sm' }"
        :overlay-patterns="[{ type: 'dots', opacity: 0.08, color: 'black' }]" class="h-96 w-72 rounded-2xl shadow-2xl">
        <template #slide="{ slide }">
          <div class="flex size-full items-center p-6">
            <div class="w-full rounded-lg bg-black/40 px-4 py-3 backdrop-blur-sm">
              <h3 class="text-xl font-bold text-white">{{ slide.title }}</h3>
            </div>
          </div>
        </template>
      </HeroSlider>
    </div>
  </div>
</template>
