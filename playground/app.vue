<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <div>
    <nav
      class="fixed top-0 z-100 flex w-full items-center gap-4 dark:bg-black/50 bg-gray-100/50 shadow-lg/5 p-4 border-b border-base-300/25 backdrop-blur-sm">
      <NuxtLink to="/" class="dark:text-white text-black hover:underline">Basic</NuxtLink>
      <NuxtLink to="/parallax" class="dark:text-white text-black hover:underline">Parallax</NuxtLink>
      <NuxtLink to="/custom-animations" class="dark:text-white text-black hover:underline">Animations</NuxtLink>
      <NuxtLink to="/freemode" class="dark:text-white text-black hover:underline">FreeMode</NuxtLink>
      <NuxtLink to="/effect-fade" class="dark:text-white text-black hover:underline">Fade</NuxtLink>
      <NuxtLink to="/effect-cube" class="dark:text-white text-black hover:underline">Cube</NuxtLink>
      <NuxtLink to="/effect-cards" class="dark:text-white text-black hover:underline">Cards</NuxtLink>

      <ClientOnly>

        <label for="theme-toggle" class="ml-auto toggle text-base-content">
          <input @change="toggle" type="checkbox" :checked="isDark" id="theme-toggle" class="theme-controller" />
          <Icon name="lucide:moon" aria-label="moon" />
          <Icon name="lucide:sun" aria-label="sun" />
        </label>
      </ClientOnly>

    </nav>
    <NuxtPage />
  </div>
</template>
