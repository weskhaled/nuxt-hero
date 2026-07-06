/**
 * nuxt-hero/vue/parallax — the optional scroll-parallax layer.
 *
 * Split from `nuxt-hero/vue` on purpose: this entry (and only this entry)
 * imports `gsap`, so consumers who don't want parallax never have gsap in
 * their module graph — no install, no build error, no bytes.
 *
 * Enable it via the plugin:
 * ```ts
 * app.use(HeroPlugin, {
 *   parallaxComponent: () => import('nuxt-hero/vue/parallax'),
 * })
 * ```
 * (requires `gsap` to be installed — `pnpm add gsap`)
 */
import HeroParallax from '../runtime/components/slider/HeroParallax.vue'

export { HeroParallax }
export default HeroParallax
