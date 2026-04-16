<script lang="ts" setup>
import type { HeroSlide } from '#hero/types'

interface PaginationProps {
  slides: HeroSlide[]
  activeIndex: number
  /** Snap-based active index (accounts for slidesPerView) */
  snapIndex: number
  /** Total number of snap points (pagination dots to show) */
  totalSnaps: number
  /** Autoplay progress 0-1 */
  progress: number
  /** When true, renders vertically on the side (RTL/LTR aware) */
  vertical?: boolean
}

const props = withDefaults(defineProps<PaginationProps>(), {
  vertical: false,
})
const emit = defineEmits<{ slideTo: [index: number] }>()
</script>

<template>
  <!--
    Horizontal (default): centered at bottom
    Vertical: on the side — ltr:right, rtl:left — centered vertically
  -->
  <nav role="navigation" aria-label="Slide pagination"
    class="hero-pagination swiper-pagination pointer-events-auto absolute z-10 flex items-center gap-1 rounded-full p-1 px-1.5 ring-2 ring-white bg-black/35 backdrop-blur-sm"
    :class="vertical
      ? 'flex-col top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4'
      : 'bottom-4 left-1/2 -translate-x-1/2'">
    <button v-for="i in totalSnaps" :key="i - 1" type="button"
      class="group relative flex size-4 shrink-0 items-center justify-center rounded-full"
      :class="{ active: snapIndex === i - 1 }" :aria-label="`Go to slide ${i}`"
      :aria-current="snapIndex === i - 1 ? 'step' : undefined" @click="emit('slideTo', i - 1)">
      <!-- Inactive dot -->
      <span v-if="snapIndex !== i - 1"
        class="hero-dot bg-white size-2.5 cursor-pointer rounded-full transition-colors" />

      <!-- Active: progress circle -->
      <template v-else>
        <div class="hero-radial-progress text-white "
          :style="{ '--hero-progress-value': Math.round(progress * 100), '--hero-progress-size': '0.75rem', '--hero-progress-thickness': '0.15rem' }"
          :aria-valuenow="Math.round(progress * 100)" role="progressbar" />
        <div class="hero-radial-progress absolute text-white  opacity-25"
          :style="{ '--hero-progress-value': 100, '--hero-progress-size': '0.75rem', '--hero-progress-thickness': '0.15rem' }"
          aria-valuenow="100" role="progressbar" />
      </template>

      <!-- Thumbnail tooltip on hover (show first slide of the snap group) -->
      <div v-if="slides[i - 1]?.thumbSrc" class="tooltip-content border-white">
        <div class="tooltip-text border-inherit">
          <div class="tooltip-inner overflow-hidden rounded-sm bg-black">
            <img :src="slides[i - 1]?.thumbSrc" :alt="slides[i - 1]?.title ?? `Slide ${i}`"
              class="size-full object-cover opacity-65" loading="lazy" />
          </div>
        </div>
      </div>
    </button>
  </nav>
</template>

<style scoped>
@reference "tailwindcss";

/* ─── Pagination tooltip ─── */
.swiper-pagination > button > .tooltip-content {
  @apply pointer-events-none absolute bottom-full mb-1 left-1/2 z-90 w-30 -ml-[60px] cursor-default opacity-0 transition-opacity duration-300 delay-300;
}

.swiper-pagination > button > .tooltip-content::after {
  @apply pointer-events-none absolute -bottom-2.5 left-1/2 -ml-1.25 size-0 border-5 border-transparent border-t-inherit!;
  content: '';
}

.swiper-pagination > button > .tooltip-content .tooltip-text {
  @apply overflow-hidden border-b-2 origin-left scale-x-0 scale-y-100 transition-transform duration-300 delay-300;
}

.swiper-pagination > button > .tooltip-content .tooltip-text .tooltip-inner {
  @apply max-w-[inherit] rounded-none p-0 translate-y-full transition-transform duration-300;
}

.swiper-pagination > button > .tooltip-content .tooltip-text .tooltip-inner img {
  @apply opacity-65;
}

/* Tooltip hover states */
.swiper-pagination > button:hover > .tooltip-content {
  @apply z-99 opacity-100 delay-0;
}

.swiper-pagination > button:hover > .tooltip-content .tooltip-text {
  @apply scale-x-100 delay-0;
}

.swiper-pagination > button:hover > .tooltip-content .tooltip-text .tooltip-inner {
  @apply translate-y-0 delay-300;
}

/* ─── SVG progress circle ─── */
.progress-circle-svg {
  @apply -rotate-90;
}

.progress-circle-bar {
  stroke: var(--hero-primary);
}

.progress-circle-bg {
  stroke: var(--hero-progress-bg);
}
</style>
