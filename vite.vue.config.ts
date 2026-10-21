import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

/**
 * Module → chunk for the layers the slider lazy-loads via `defineAsyncComponent`
 * (each component plus its private deps). `config` is shared by the entry and
 * the video chunk, so it gets its own chunk — otherwise the video chunk would
 * import back from index.mjs (a circular chunk graph).
 */
const CHUNKS: [RegExp, string][] = [
  [/\/HeroPagination\.vue/, 'HeroPagination'],
  [/\/HeroNavigation\.vue/, 'HeroNavigation'],
  [/\/HeroSlideVideo\.vue|\/composables\/_hls\.ts/, 'HeroSlideVideo'],
  [/\/HeroVideo(Controls|Scrubber)\.vue/, 'HeroVideoControls'],
  [/\/runtime\/config\.ts/, 'config'],
]

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
      outDirs: 'dist/vue/types',
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
    rolldownOptions: {
      // Required by `includeDependenciesRecursively: false` below.
      preserveEntrySignatures: 'allow-extension',
      external: [
        /^vue$/,
        /^swiper(\/|$)/,
        /^@vueuse\//,
        /^gsap(\/|$)/,
        /^hls\.js$/,
      ],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        // The entry also re-exports the lazy components statically — without
        // explicit groups they'd be inlined into index.mjs and the on-demand
        // loading lost. As separate chunks, the consumer's bundler tree-shakes
        // the unused static export and keeps the dynamic import lazy.
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [{
            debugName: 'lazy-layers',
            name: id => CHUNKS.find(([re]) => re.test(id))?.[1] ?? null,
          }],
        },
      },
    },
  },
})
