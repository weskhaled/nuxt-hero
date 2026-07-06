# nuxt-hero × plain Vue 3

Minimal Vite app consuming **`nuxt-hero/vue`** — no Nuxt, no Tailwind, no gsap.
This is also the package's consumer-grade smoke test: it must build with only
`vue + swiper + @vueuse/core` installed.

```bash
# from the repo root — the example links the workspace package, so build it first
pnpm build

# then
pnpm --filter nuxt-hero-example-vue dev      # or: cd examples/vue && pnpm dev
pnpm --filter nuxt-hero-example-vue build
```

What to look at:

- [`src/main.ts`](./src/main.ts) — `app.use(HeroPlugin, { swiperModules })` + the
  two CSS imports (`swiper/css`, `nuxt-hero/hero.css`).
- [`src/App.vue`](./src/App.vue) — drop-in `<HeroSlider :slides :options>` with a
  content slot, plus external controls through the template ref.
- Scroll parallax is opt-in: `pnpm add gsap` and pass
  `parallaxComponent: () => import('nuxt-hero/vue/parallax')` to the plugin.

In a real app you'd install from npm instead of the workspace link:

```bash
pnpm add nuxt-hero swiper @vueuse/core
```
