<script setup lang="ts">
const colorMode = useColorMode()

const links = [
  { to: '/', label: 'Playground' },
  { to: '/simple', label: 'Drop-in' },
  { to: '/custom-animations', label: 'Animations' },
  { to: '/effects', label: 'Effects' },
  { to: '/multi-slide', label: 'Multi-slide' },
  { to: '/parallax', label: 'Parallax' },
  { to: '/video', label: 'Video' },
  { to: '/slots', label: 'Slots' },
  { to: '/theming', label: 'Theming' },
  { to: '/vertical', label: 'Vertical' },
  { to: '/i18n', label: 'RTL & i18n' },
  { to: '/lite-mode', label: 'Lite mode' },
]

const isDark = computed(() => colorMode.value === 'dark')

// Mobile browser chrome (status / address bar) follows the theme too —
// matches the <html> background in assets/css/main.css. Emitted only once the
// mode is resolved on the client (`unknown` during SSR); until then browsers
// tint from that background. (A same-name light/dark pair doesn't survive
// hydration — unhead dedupes meta by name.)
useHead({
  meta: computed(() => colorMode.unknown
    ? []
    : [{ name: 'theme-color', content: isDark.value ? '#0a0a0a' : '#f9fafb' }]),
})

// Theme classes swap atomically (`colorMode.disableTransition` in nuxt.config),
// so the fixed nav and the page change in the same frame — per-element color
// transitions finished at different times (the nav snapped while the page
// faded). Where supported, a View Transition cross-fades the two snapshots.
function toggle() {
  const apply = () => { colorMode.preference = isDark.value ? 'light' : 'dark' }
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches)
    return apply()
  const transition = document.startViewTransition(async () => {
    apply()
    await nextTick() // color-mode applies the <html> class in a pre-flush watcher
  })
  // A skipped transition (rapid re-toggle, hidden tab) rejects `ready`; the
  // theme is still applied, so the rejection is expected.
  transition.ready.catch(() => {})
}
</script>

<template>
  <!-- Page background / text color / color-scheme live on <html> (see
       assets/css/main.css) so no white canvas shows around the app. -->
  <div>
    <nav
      class="fixed top-0 z-100 flex w-full items-center gap-2 px-4 py-3 border-b backdrop-blur-md dark:bg-neutral-950/80 dark:border-white/10 bg-gray-50/80 border-black/5">
      <!-- Links scroll horizontally on narrow screens (edge fade hints at more)
           so the color-mode toggle stays pinned and reachable. -->
      <div
        class="flex min-w-0 flex-1 items-center gap-1 sm:gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)]">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
          class="shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium transition-colors dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 text-black/60 hover:text-black hover:bg-black/5 aria-[current=page]:text-black aria-[current=page]:bg-black/5 dark:aria-[current=page]:text-white dark:aria-[current=page]:bg-white/10">
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- The resolved mode is only known on the client (it can follow the OS),
           so color-mode's <ColorScheme> renders the toggle after hydration; the
           placeholder reserves its space (no pop-in). -->
      <ColorScheme>
        <button
          class="flex shrink-0 items-center justify-center size-8 rounded-lg transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
          <Icon v-if="isDark" name="lucide:sun" class="size-4" />
          <Icon v-else name="lucide:moon" class="size-4" />
        </button>
        <template #placeholder>
          <span class="size-8 shrink-0" />
        </template>
      </ColorScheme>
    </nav>

    <NuxtPage />
  </div>
</template>
