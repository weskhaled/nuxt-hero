import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

/**
 * Library build for the `nuxt-hero/vue` entry (plain Vue 3, no Nuxt).
 *
 * Ships compiled JS (templates precompiled) so any consumer bundler works —
 * no vue-loader/SFC tooling required. All real dependencies are externalized;
 * the lazy layers (parallax/GSAP, video stack, hls.js) stay separate chunks so
 * the on-demand loading behavior matches the Nuxt module exactly.
 *
 * Runs after `nuxt-module-build build` (see the `build` script) — it only
 * touches `dist/vue`.
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.vue-dist.json',
      entryRoot: 'src',
      outDir: 'dist/vue/types',
    }),
  ],
  build: {
    outDir: 'dist/vue',
    emptyOutDir: true,
    lib: {
      entry: 'src/vue/index.ts',
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external: [
        /^vue$/,
        /^swiper(\/|$)/,
        /^@vueuse\//,
        /^gsap(\/|$)/,
        /^hls\.js$/,
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].mjs',
      },
    },
  },
})
