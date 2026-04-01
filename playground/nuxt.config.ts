export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/image', '@nuxtjs/color-mode', '@nuxt/icon'],
  devtools: { enabled: true },
  css: ['animate.css'],
  compatibilityDate: '2025-01-01',
  hero: {
    features: {
      navigation: true,
      pagination: true,
      mousewheel: true,
      freeMode: true,
      effects: ['creative', 'fade', 'cube', 'cards',],
      parallax: true,
      swiperParallax: true,
      video: true,
      hls: true,
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        'swiper/vue',
        '@vueuse/core',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'gsap/ScrollTrigger',
        'hls.js',
      ],
    },
  },
})
