import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'nuxt-hero',
  description: 'A full-featured hero slider for Nuxt and plain Vue 3 — parallax, video backgrounds, overlay patterns, and customizable animations.',
  base: '/nuxt-hero/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/nuxt-hero/logo.svg' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/composable' },
      { text: 'Examples', link: '/examples' },
      { text: 'Demo', link: '/demo' },
      { text: 'GitHub', link: 'https://github.com/weskhaled/nuxt-hero' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation & Setup', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Plain Vue (no Nuxt)', link: '/vue' },
        ],
      },
      {
        text: 'Core',
        items: [
          { text: 'Components', link: '/components' },
          { text: 'useHeroSlider', link: '/composable' },
          { text: 'Types', link: '/types' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Animations', link: '/animations' },
          { text: 'Video Backgrounds', link: '/video' },
        ],
      },
      {
        text: 'Resources',
        items: [
          { text: 'Examples', link: '/examples' },
          { text: 'Live Demo', link: '/demo' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/weskhaled/nuxt-hero' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2025-present weskhaled',
    },
  },
})
