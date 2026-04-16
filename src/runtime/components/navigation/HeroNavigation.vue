<script lang="ts" setup>
import { computed } from 'vue'
import type { HeroSlide } from '#hero/types'

interface NavigationProps {
  slides: HeroSlide[]
  activeIndex: number
  /** When true, prev is on top and next is on bottom */
  vertical?: boolean
}

const props = withDefaults(defineProps<NavigationProps>(), {
  vertical: false,
})
const emit = defineEmits<{ prev: []; next: [] }>()

const prevSlide = computed(() => {
  const idx = props.activeIndex < 1 ? props.slides.length - 1 : props.activeIndex - 1
  return props.slides[idx]
})

const nextSlide = computed(() => {
  const idx = props.activeIndex + 1 >= props.slides.length ? 0 : props.activeIndex + 1
  return props.slides[idx]
})

/** CSS class for the prev button arrow translation on hover */
const prevHoverClass = computed(() =>
  props.vertical
    ? 'px-10 py-1 group-hover:-translate-y-full'
    : `py-10 px-1 ${prevSlide.value?.thumbSrc ? 'group-hover:-translate-x-full' : 'group-hover:-translate-x-1/10'}`,
)

/** CSS class for the next button arrow translation on hover */
const nextHoverClass = computed(() =>
  props.vertical
    ? 'px-10 py-1 group-hover:translate-y-full'
    : `py-10 px-1 ${nextSlide.value?.thumbSrc ? 'group-hover:translate-x-full' : 'group-hover:translate-x-1/10'}`,
)
</script>

<template>
  <nav class="hero-nav nav-slit" :class="{ 'nav-slit--vertical': vertical }">
    <!--
      Horizontal: prev=left, next=right
      Vertical:   prev=top,  next=bottom
    -->

    <!-- Prev -->
    <button type="button" aria-label="Previous slide" class="nav-slit-btn nav-slit-prev group"
      :class="vertical
        ? 'top-0 left-1/2 -translate-x-1/2'
        : 'left-0 top-1/2 -translate-y-1/2'" @click="emit('prev')">
      <span :class="prevHoverClass">
        <Icon :name="vertical ? 'lucide:chevron-up' : 'lucide:chevron-left'" class="block text-base" />
      </span>
      <div v-if="prevSlide?.thumbSrc" class="nav-slit-preview"
        :class="vertical
          ? 'top-0 left-0 w-full h-24 -translate-y-full'
          : 'left-0 top-0 h-full w-36 -translate-x-full'">
        <h3 :class="vertical
          ? 'bottom-0 left-0 w-full origin-bottom scale-y-0'
          : 'top-full w-full origin-top -rotate-x-90'">
          {{ prevSlide?.title }}
        </h3>
        <img :src="prevSlide.thumbSrc" :alt="prevSlide?.title ?? 'Previous'"
          class="absolute inset-0 size-full object-cover" loading="lazy" />
      </div>
    </button>

    <!-- Next -->
    <button type="button" aria-label="Next slide" class="nav-slit-btn nav-slit-next group"
      :class="vertical
        ? 'bottom-0 left-1/2 -translate-x-1/2'
        : 'right-0 top-1/2 -translate-y-1/2 text-right'" @click="emit('next')">
      <span :class="nextHoverClass">
        <Icon :name="vertical ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="block text-base" />
      </span>
      <div v-if="nextSlide?.thumbSrc" class="nav-slit-preview"
        :class="vertical
          ? 'bottom-0 left-0 w-full h-24 translate-y-full'
          : 'right-0 top-0 h-full w-36 translate-x-full'">
        <h3 :class="vertical
          ? 'top-0 left-0 w-full origin-top scale-y-0'
          : 'top-full text-left w-full origin-top -rotate-x-90'">
          {{ nextSlide?.title }}
        </h3>
        <img :src="nextSlide.thumbSrc" :alt="nextSlide?.title ?? 'Next'" class="absolute inset-0 size-full object-cover"
          loading="lazy" />
      </div>
    </button>
  </nav>
</template>

<style scoped>
@reference "tailwindcss";

/* ─── Navigation: nav-slit ─── */
.hero-nav {
  @apply min-h-0;
}

.nav-slit-btn {
  @apply pointer-events-auto absolute z-10 block cursor-pointer outline-none;
}

.nav-slit-btn > span {
  @apply relative block bg-white/40 ring ring-white backdrop-blur-sm text-black transition-transform duration-300;
  @apply dark:bg-black/40 dark:ring-black dark:text-white;
}

.nav-slit-preview {
  @apply absolute ring ring-white transition-transform duration-300 delay-300;
  @apply bg-white dark:bg-black dark:ring-black;
}

.nav-slit-preview h3 {
  @apply absolute m-0 truncate px-2 py-0.5 text-sm font-light capitalize leading-5 backface-hidden transition-transform duration-300;
  @apply bg-white/70 ring ring-white backdrop-blur-sm text-black;
  @apply dark:bg-black/70 dark:ring-black dark:text-white;
}

.nav-slit-prev .nav-slit-preview {
  @apply left-0 -translate-x-full;
}

.nav-slit-next .nav-slit-preview {
  @apply right-0 translate-x-full text-right;
}

/* ─── Hover states ─── */
.nav-slit-btn:hover .nav-slit-preview {
  transform: translate(0);
}

.nav-slit-btn:hover h3 {
  transform: rotateX(0deg) scaleY(1);
  transition-delay: 0.6s;
}

/* ─── Vertical mode ─── */
.nav-slit--vertical .nav-slit-prev:hover .hero-icon {
  transform: translateY(-150%);
  transition-delay: 0s;
}

.nav-slit--vertical .nav-slit-next:hover .hero-icon {
  transform: translateY(150%);
  transition-delay: 0s;
}
</style>
