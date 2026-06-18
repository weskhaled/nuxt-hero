import { join } from 'pathe'
import { addComponent, addImports } from '@nuxt/kit'
import type { HeroFeatures } from '../runtime/types'

export function registerComponents(runtimeDir: string, prefix: string, features: HeroFeatures): void {
  // Slider and Slide always registered
  addComponent({ name: `${prefix}Slider`, filePath: join(runtimeDir, 'components/slider/index.vue') })
  addComponent({ name: `${prefix}Slide`, filePath: join(runtimeDir, 'components/slider/HeroSlide.vue') })

  if (features.pagination) {
    addComponent({ name: `${prefix}Pagination`, filePath: join(runtimeDir, 'components/navigation/HeroPagination.vue') })
  }
  if (features.navigation) {
    addComponent({ name: `${prefix}Navigation`, filePath: join(runtimeDir, 'components/navigation/HeroNavigation.vue') })
  }
  if (features.video) {
    addComponent({ name: `${prefix}VideoControls`, filePath: join(runtimeDir, 'components/video/HeroVideoControls.vue') })
    addComponent({ name: `${prefix}VideoScrubber`, filePath: join(runtimeDir, 'components/video/HeroVideoScrubber.vue') })
    addComponent({ name: `${prefix}SlideVideo`, filePath: join(runtimeDir, 'components/video/HeroSlideVideo.vue') })
  }
}

export function registerComposables(runtimeDir: string): void {
  addImports({ name: 'useHeroSlider', from: join(runtimeDir, 'composables/useHeroSlider') })
  addImports({ name: 'useHeroEnvironment', from: join(runtimeDir, 'composables/_environment') })
}
