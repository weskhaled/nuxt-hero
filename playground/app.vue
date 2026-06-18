<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div
    class="group min-h-screen transition-colors duration-300 dark:bg-neutral-950 bg-gray-50 dark:text-white text-black">
    <nav
      class="fixed top-0 z-100 flex w-full items-center gap-1 sm:gap-3 px-4 py-3 border-b backdrop-blur-md dark:bg-neutral-950/80 dark:border-white/10 bg-gray-50/80 border-black/5">
      <NuxtLink v-for="link in [
        { to: '/', label: 'Basic' },
        { to: '/simple', label: 'Drop-in' },
        { to: '/parallax', label: 'Parallax' },
        { to: '/custom-animations', label: 'Animations' },
        { to: '/freemode', label: 'FreeMode' },
        { to: '/effect-fade', label: 'Fade' },
        { to: '/effect-cube', label: 'Cube' },
        { to: '/effect-cards', label: 'Cards' },
      ]" :key="link.to" :to="link.to"
        class="rounded-md px-2 py-1 text-sm font-medium transition-colors dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 text-black/60 hover:text-black hover:bg-black/5">
        {{ link.label }}
      </NuxtLink>

      <ClientOnly>
        <button
          class="ml-auto flex items-center justify-center size-8 rounded-lg transition-colors dark:bg-white/10 dark:hover:bg-white/20 dark:text-white bg-black/5 hover:bg-black/10 text-black"
          aria-label="Toggle color mode" @click="toggle">
          <Icon v-if="isDark" name="lucide:sun" class="size-4" />
          <Icon v-else name="lucide:moon" class="size-4" />
        </button>
      </ClientOnly>
    </nav>

    <NuxtPage />
  </div>
</template>
