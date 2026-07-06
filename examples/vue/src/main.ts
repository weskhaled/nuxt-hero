import { createApp } from 'vue'
import { HeroPlugin } from 'nuxt-hero/vue'
import { A11y, EffectFade, Keyboard } from 'swiper/modules'

// Styles: Swiper core + the effect you use + the hero chrome. All plain CSS —
// no Tailwind or any other tooling required.
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'nuxt-hero/hero.css'
import './style.css'

import App from './App.vue'

createApp(App)
  .use(HeroPlugin, {
    // Swiper modules every slider receives — pass only what you use.
    swiperModules: [A11y, Keyboard, EffectFade],

    // Scroll parallax needs the optional `gsap` peer. This example deliberately
    // runs WITHOUT it — to enable:  pnpm add gsap  and uncomment:
    // parallaxComponent: () => import('nuxt-hero/vue/parallax'),
  })
  .mount('#app')
