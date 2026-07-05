<script lang="ts" setup>
import { nextTick, useTemplateRef, watch } from 'vue'
import type { HeroSlide } from '../../types'

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
  /** Accessible label for the pagination nav (localizable) */
  label?: string
  /** Accessible label template for each dot — `{n}` is the 1-based slide number */
  goToLabel?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  vertical: false,
  label: 'Slide pagination',
  goToLabel: 'Go to slide {n}',
})
const emit = defineEmits<{ slideTo: [index: number] }>()

const rootEl = useTemplateRef<HTMLElement>('rootEl')

function dotLabel(n: number): string {
  return props.goToLabel.replace('{n}', String(n))
}

// The pill scrolls when many dots overflow (see .hero-pagination--* CSS).
// Keep the active dot in view. `scrollIntoView({ nearest })` only moves
// ancestors where the target is actually clipped — the page doesn't jump, and
// it's RTL-safe (no scrollLeft sign math).
watch(() => props.snapIndex, async (i) => {
  await nextTick()
  const btn = rootEl.value?.children[i] as HTMLElement | undefined
  btn?.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
})
</script>

<template>
  <!--
    Horizontal (default): centered at bottom. Vertical: on the side —
    ltr:right, rtl:left — centered vertically. Styling in assets/hero.css.
  -->
  <nav ref="rootEl" role="navigation" :aria-label="label" class="hero-pagination swiper-pagination"
    :class="vertical ? 'hero-pagination--vertical' : 'hero-pagination--horizontal'">
    <button v-for="i in totalSnaps" :key="i - 1" type="button" class="hero-page-btn"
      :class="{ active: snapIndex === i - 1 }" :aria-label="dotLabel(i)"
      :aria-current="snapIndex === i - 1 ? 'step' : undefined" @click="emit('slideTo', i - 1)">
      <!-- Inactive dot -->
      <span v-if="snapIndex !== i - 1" class="hero-dot" />

      <!-- Active: progress ring over a faint full track -->
      <template v-else>
        <div class="hero-radial-progress"
          :style="{ '--hero-progress-value': Math.round(progress * 100), '--hero-progress-size': '0.75rem', '--hero-progress-thickness': '0.15rem' }"
          role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100" />
        <div class="hero-radial-progress hero-radial-progress--track" aria-hidden="true"
          :style="{ '--hero-progress-value': 100, '--hero-progress-size': '0.75rem', '--hero-progress-thickness': '0.15rem' }" />
      </template>

      <!-- Thumbnail tooltip on hover (show first slide of the snap group) -->
      <div v-if="slides[i - 1]?.thumbSrc" class="tooltip-content">
        <div class="tooltip-text">
          <div class="tooltip-inner">
            <img :src="slides[i - 1]?.thumbSrc" :alt="slides[i - 1]?.title ?? dotLabel(i)" loading="lazy" />
          </div>
        </div>
      </div>
    </button>
  </nav>
</template>
