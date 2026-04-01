<script setup lang="ts">
const builtInContainerRef = useTemplateRef<HTMLElement>('builtInContainerRef')
const animateCssContainerRef = useTemplateRef<HTMLElement>('animateCssContainerRef')

const builtInSlides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    title: 'Built-in: slideInUp',
    animation: { enter: 'hero-animated hero-slideInUp', leave: 'hero-animated hero-slideOutDown' },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1485673634125-0f3ae8fd3209?w=1920&q=80',
    title: 'Built-in: zoomIn',
    animation: { enter: 'hero-animated hero-zoomIn', leave: 'hero-animated hero-zoomOut' },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    title: 'Built-in: slideInLeft',
    animation: { enter: 'hero-animated hero-slideInLeft', leave: 'hero-animated hero-fadeOut' },
  },
]

const builtInSwiperOptions = { autoplay: false as const }

const builtInSlider = useHeroSlider(builtInContainerRef, builtInSlides, {
  swiperOptions: builtInSwiperOptions,
})

const animateCssSlides = [
  {
    bgSrc: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
    title: 'animate.css: bounceIn',
    animation: { enter: 'animate__animated animate__bounceIn', leave: 'animate__animated animate__fadeOut' },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=1920&q=80',
    title: 'animate.css: fadeInRight',
    animation: { enter: 'animate__animated animate__fadeInRight', leave: 'animate__animated animate__fadeOutLeft' },
  },
  {
    bgSrc: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
    title: 'animate.css: zoomIn',
    animation: { enter: 'animate__animated animate__zoomIn', leave: 'animate__animated animate__zoomOut' },
  },
]

const animateCssSwiperOptions = { autoplay: { delay: 3000 }, speed: 600 }

const animateCssSlider = useHeroSlider(animateCssContainerRef, animateCssSlides, {
  swiperOptions: animateCssSwiperOptions,
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 p-4 pt-16 lg:grid-cols-2">
    <div>
      <h2 class="mb-2 text-xl font-semibold">Built-in Animations (zero deps)</h2>
      <div class="h-[50vh]">
        <HeroSlider
          ref="builtInContainerRef"
          :slider="builtInSlider"
          :slides="builtInSlides"
          :overlay-patterns="[]"
        >
          <template #slide="{ slide }">
            <div class="flex size-full items-end justify-center pb-12">
              <h3 class="text-2xl font-bold text-white drop-shadow-lg">{{ slide.title }}</h3>
            </div>
          </template>
        </HeroSlider>
      </div>
    </div>
    <div>
      <h2 class="mb-2 text-xl font-semibold">animate.css Override</h2>
      <div class="h-[50vh]">
        <HeroSlider
          ref="animateCssContainerRef"
          :slider="animateCssSlider"
          :slides="animateCssSlides"
          :overlay-patterns="[{ type: 'gradient', opacity: 0.1 }]"
        >
          <template #slide="{ slide }">
            <div class="flex size-full items-end justify-center pb-12">
              <h3 class="text-2xl font-bold text-white drop-shadow-lg">{{ slide.title }}</h3>
            </div>
          </template>
        </HeroSlider>
      </div>
    </div>
  </div>
</template>
