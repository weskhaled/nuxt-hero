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
    // Swap theme classes with transitions suppressed, so every element (incl.
    // the fixed nav) switches in the same frame — see toggle() in app.vue.
    disableTransition: true,
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
