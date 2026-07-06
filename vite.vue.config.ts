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
      // Two entries: `parallax` is the ONLY graph that imports gsap, so
      // consumers who skip the optional dep never resolve it at build time.
      entry: {
        index: 'src/vue/index.ts',
        parallax: 'src/vue/parallax.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
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
