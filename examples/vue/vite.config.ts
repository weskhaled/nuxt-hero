import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Nothing special needed — nuxt-hero/vue ships compiled JS + plain CSS.
// (Note what is NOT here: no Tailwind, no gsap, no extra plugins.)
export default defineConfig({
  plugins: [vue()],
})
