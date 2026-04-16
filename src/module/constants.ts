import type { SwiperEffect } from './types'

/** Maps boolean feature flags to their Swiper module import name */
export const SWIPER_MODULE_MAP: Record<string, { module: string; css?: string }> = {
  navigation: { module: 'Navigation', css: 'swiper/css/navigation' },
  pagination: { module: 'Pagination', css: 'swiper/css/pagination' },
  mousewheel: { module: 'Mousewheel' },
  keyboard: { module: 'Keyboard' },
  a11y: { module: 'A11y' },
  freeMode: { module: 'FreeMode', css: 'swiper/css/free-mode' },
  thumbs: { module: 'Thumbs', css: 'swiper/css/thumbs' },
  grid: { module: 'Grid', css: 'swiper/css/grid' },
  zoom: { module: 'Zoom', css: 'swiper/css/zoom' },
  scrollbar: { module: 'Scrollbar', css: 'swiper/css/scrollbar' },
  controller: { module: 'Controller' },
  virtual: { module: 'Virtual', css: 'swiper/css/virtual' },
  hashNavigation: { module: 'HashNavigation' },
  history: { module: 'History' },
  swiperParallax: { module: 'Parallax' },
}

/** Maps effect names to their Swiper module import name and CSS */
export const EFFECT_MAP: Record<SwiperEffect, { module: string; css: string }> = {
  fade: { module: 'EffectFade', css: 'swiper/css/effect-fade' },
  cube: { module: 'EffectCube', css: 'swiper/css/effect-cube' },
  coverflow: { module: 'EffectCoverflow', css: 'swiper/css/effect-coverflow' },
  creative: { module: 'EffectCreative', css: 'swiper/css/effect-creative' },
  cards: { module: 'EffectCards', css: 'swiper/css/effect-cards' },
  flip: { module: 'EffectFlip', css: 'swiper/css/effect-flip' },
}

export const VALID_EFFECTS: SwiperEffect[] = ['fade', 'cube', 'coverflow', 'creative', 'cards', 'flip']
