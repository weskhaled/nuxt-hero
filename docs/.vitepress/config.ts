import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'nuxt-hero',
  description: 'A full-featured hero slider Nuxt module with parallax, video backgrounds, overlay patterns, and customizable animations.',
  base: '/nuxt-hero/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/nuxt-hero/logo.svg' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Demo', link: '/demo' },
      { text: 'GitHub', link: 'https://github.com/weskhaled/nuxt-hero' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Demo', link: '/demo' },
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
