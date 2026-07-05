import { existsSync } from 'node:fs'
import { join } from 'pathe'
import type { Nuxt } from '@nuxt/schema'
import type { HeroFeatures } from '../runtime/types'
import { swiperModuleNames } from './plugin'

export function setupVite(nuxt: Nuxt, runtimeDir: string, features: HeroFeatures): void {
  // ─── Deduplicate shared deps ───
  // When this module is consumed from source (e.g. `../nuxt-hero/src/module`)
  // or linked via pnpm, the runtime code may resolve @vueuse/core, gsap, etc.
  // from the module's own node_modules — a separate instance from the host app.
  // This breaks shared Vue reactivity. Force these deps to resolve from the
  // host project's node_modules so there's a single instance.
  const hostNodeModules = join(nuxt.options.rootDir, 'node_modules')
  const sharedDeps = ['@vueuse/core']
  if (features.parallax) sharedDeps.push('gsap')

  for (const dep of sharedDeps) {
    const hostPath = join(hostNodeModules, dep)
    if (existsSync(hostPath)) {
      nuxt.options.alias[dep] = hostPath
    }
  }

  // ─── File watching ───
  nuxt.options.vite.server ??= {}
  nuxt.options.vite.server.watch ??= {}
  nuxt.options.vite.server.watch.ignored ??= []
  if (Array.isArray(nuxt.options.vite.server.watch.ignored)) {
    nuxt.options.vite.server.watch.ignored.push(`!${runtimeDir}/**`)
  }

  // ─── Vite pre-bundling ───
  nuxt.options.vite.optimizeDeps ??= {}
  nuxt.options.vite.optimizeDeps.include ??= []
  nuxt.options.vite.optimizeDeps.include.push('swiper/vue', '@vueuse/core')

  if (features.parallax) {
    nuxt.options.vite.optimizeDeps.include.push('gsap', 'gsap/ScrollTrigger')
  }

  // Only pre-bundle swiper/modules if any Swiper modules are enabled
  if (swiperModuleNames(features).length > 0) {
    nuxt.options.vite.optimizeDeps.include.push('swiper/modules')
  }

  nuxt.options.build.transpile.push('swiper')
}
