<script lang="ts" setup>
import { computed } from 'vue'
import type { HeroSlide } from '#hero/types'
import HeroIcon from '../HeroIcon.vue'

interface NavigationProps {
  slides: HeroSlide[]
  activeIndex: number
  /** When true, prev is on top and next is on bottom */
  vertical?: boolean
  /** Accessible label for the previous-slide button (localizable) */
  prevLabel?: string
  /** Accessible label for the next-slide button (localizable) */
  nextLabel?: string
}

const props = withDefaults(defineProps<NavigationProps>(), {
  vertical: false,
  prevLabel: 'Previous slide',
  nextLabel: 'Next slide',
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
</script>

<template>
  <!--
    Direction & RTL are handled entirely in CSS below (semantic classes +
    logical `inset-inline-*` + `[dir=rtl]` overrides) instead of class ternaries.
    `.has-preview` toggles the "slide the arrow fully out" hover when a thumb exists.
    Horizontal: prev=inline-start, next=inline-end. Vertical: prev=top, next=bottom.
  -->
  <nav class="hero-nav nav-slit" :class="{ 'nav-slit--vertical': vertical }">
    <!-- Prev -->
    <button type="button" :aria-label="prevLabel" class="nav-slit-btn nav-slit-prev group/prev"
      :class="{ 'has-preview': !!prevSlide?.thumbSrc }" @click="emit('prev')">
      <span class="nav-slit-arrow">
        <HeroIcon :name="vertical ? 'chevron-up' : 'chevron-left'" class="block text-base" />
      </span>
      <div v-if="prevSlide?.thumbSrc" class="nav-slit-preview">
        <h3 class="nav-slit-preview-title">{{ prevSlide?.title }}</h3>
        <img :src="prevSlide.thumbSrc" :alt="prevSlide?.title ?? ''" class="absolute inset-0 size-full object-cover"
          loading="lazy" />
      </div>
    </button>

    <!-- Next -->
    <button type="button" :aria-label="nextLabel" class="nav-slit-btn nav-slit-next group/next"
      :class="{ 'has-preview': !!nextSlide?.thumbSrc }" @click="emit('next')">
      <span class="nav-slit-arrow">
        <HeroIcon :name="vertical ? 'chevron-down' : 'chevron-right'" class="block text-base" />
      </span>
      <div v-if="nextSlide?.thumbSrc" class="nav-slit-preview">
        <h3 class="nav-slit-preview-title">{{ nextSlide?.title }}</h3>
        <img :src="nextSlide.thumbSrc" :alt="nextSlide?.title ?? ''" class="absolute inset-0 size-full object-cover"
          loading="lazy" />
      </div>
    </button>
  </nav>
</template>

<style scoped>
@reference "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* ─── Shared chrome ─── */
.hero-nav {
  @apply min-h-0;
}

.nav-slit-btn {
  @apply pointer-events-auto absolute z-10 block cursor-pointer outline-none;
}

.nav-slit-arrow {
  @apply relative block bg-white/40 ring ring-white backdrop-blur-sm text-black transition-transform duration-300;
  @apply dark:bg-black/40 dark:ring-black dark:text-white;
}

.nav-slit-preview {
  @apply absolute ring ring-white transition-transform duration-300 delay-300;
  @apply bg-white dark:bg-black dark:ring-black;
}

.nav-slit-preview-title {
  @apply absolute m-0 truncate px-2 py-0.5 text-sm font-light capitalize leading-5 backface-hidden transition-transform duration-300;
  @apply bg-white/70 ring ring-white backdrop-blur-sm text-black;
  @apply dark:bg-black/70 dark:ring-black dark:text-white;
}

.nav-slit-btn:hover .nav-slit-preview-title {
  transform: rotateX(0deg) scaleY(1);
  transition-delay: 0.6s;
}

/* ─── Horizontal (default) ─── prev = inline-start, next = inline-end ─── */
.nav-slit:not(.nav-slit--vertical) .nav-slit-prev {
  inset-inline-start: 0;
  top: 50%;
  translate: 0 -50%;
}
.nav-slit:not(.nav-slit--vertical) .nav-slit-next {
  inset-inline-end: 0;
  top: 50%;
  translate: 0 -50%;
}

.nav-slit:not(.nav-slit--vertical) .nav-slit-arrow {
  @apply py-10 px-1;
}

/* Arrow slides out toward the screen edge on hover (full travel when a preview
   exists, a small nudge otherwise). `[dir=rtl]` mirrors the travel direction. */
.nav-slit:not(.nav-slit--vertical) .nav-slit-prev.has-preview:hover .nav-slit-arrow { translate: -100% 0; }
.nav-slit:not(.nav-slit--vertical) .nav-slit-prev:not(.has-preview):hover .nav-slit-arrow { translate: -10% 0; }
.nav-slit:not(.nav-slit--vertical) .nav-slit-next.has-preview:hover .nav-slit-arrow { translate: 100% 0; }
.nav-slit:not(.nav-slit--vertical) .nav-slit-next:not(.has-preview):hover .nav-slit-arrow { translate: 10% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-prev.has-preview:hover .nav-slit-arrow { translate: 100% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-prev:not(.has-preview):hover .nav-slit-arrow { translate: 10% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-next.has-preview:hover .nav-slit-arrow { translate: -100% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-next:not(.has-preview):hover .nav-slit-arrow { translate: -10% 0; }

/* Chevrons point "back"/"forward" — flip horizontally under RTL. */
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-arrow .hero-icon { scale: -1 1; }

/* Horizontal preview: a tall thumb strip hidden off the adjacent edge. */
.nav-slit:not(.nav-slit--vertical) .nav-slit-preview {
  top: 0;
  height: 100%;
  width: 9rem;
}
.nav-slit:not(.nav-slit--vertical) .nav-slit-prev .nav-slit-preview { inset-inline-start: 0; translate: -100% 0; }
.nav-slit:not(.nav-slit--vertical) .nav-slit-next .nav-slit-preview { inset-inline-end: 0; translate: 100% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-prev .nav-slit-preview { translate: 100% 0; }
[dir='rtl'] .nav-slit:not(.nav-slit--vertical) .nav-slit-next .nav-slit-preview { translate: -100% 0; }
.nav-slit:not(.nav-slit--vertical) .nav-slit-preview-title {
  top: 100%;
  width: 100%;
  transform-origin: top;
  transform: rotateX(-90deg);
}
.nav-slit:not(.nav-slit--vertical) .nav-slit-prev:hover .nav-slit-preview,
.nav-slit:not(.nav-slit--vertical) .nav-slit-next:hover .nav-slit-preview { translate: 0 0; }

/* ─── Vertical ─── prev = top, next = bottom (RTL-agnostic) ─── */
.nav-slit--vertical .nav-slit-prev { top: 0; left: 50%; translate: -50% 0; }
.nav-slit--vertical .nav-slit-next { bottom: 0; left: 50%; translate: -50% 0; }

.nav-slit--vertical .nav-slit-arrow {
  @apply px-10 py-1;
}
/* Arrow slides out toward its own edge on hover: top button up, bottom button
   down (full travel when a preview exists, a small nudge otherwise). */
.nav-slit--vertical .nav-slit-prev.has-preview:hover .nav-slit-arrow { translate: 0 -100%; }
.nav-slit--vertical .nav-slit-prev:not(.has-preview):hover .nav-slit-arrow { translate: 0 -10%; }
.nav-slit--vertical .nav-slit-next.has-preview:hover .nav-slit-arrow { translate: 0 100%; }
.nav-slit--vertical .nav-slit-next:not(.has-preview):hover .nav-slit-arrow { translate: 0 10%; }

.nav-slit--vertical .nav-slit-preview {
  left: 50%;
  width: 6rem;
  height: 5rem;
}
.nav-slit--vertical .nav-slit-prev .nav-slit-preview { top: 0; translate: -50% -100%; }
.nav-slit--vertical .nav-slit-next .nav-slit-preview { bottom: 0; translate: -50% 100%; }
.nav-slit--vertical .nav-slit-prev:hover .nav-slit-preview,
.nav-slit--vertical .nav-slit-next:hover .nav-slit-preview { translate: -50% 0; }

.nav-slit--vertical .nav-slit-prev .nav-slit-preview-title { bottom: 0; left: 0; width: 100%; transform-origin: bottom; transform: scaleY(0); }
.nav-slit--vertical .nav-slit-next .nav-slit-preview-title { top: 0; left: 0; width: 100%; transform-origin: top; transform: scaleY(0); }
</style>
