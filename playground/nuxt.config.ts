import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['../src/module', '@nuxt/image', '@nuxtjs/color-mode', '@nuxt/icon'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', 'animate.css'],
  compatibilityDate: '2025-01-01',
  // The playground styles itself with Tailwind (see assets/css/main.css) and
  // toggles dark via the `.dark` class — the hero module needs neither.
  colorMode: {
    classSuffix: '',
  },
  hero: {
    features: {
      navigation: true,
      pagination: true,
      mousewheel: true,
      keyboard: true,
      freeMode: true,
      effects: ['creative', 'fade', 'cube', 'cards'],
      parallax: true,
      swiperParallax: true,
      video: true,
      hls: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'swiper/vue',
        '@vueuse/core',
        'gsap',
        'gsap/ScrollTrigger',
        'hls.js',
      ],
    },
  },
})
