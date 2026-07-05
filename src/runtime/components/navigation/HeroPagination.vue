<script lang="ts" setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
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

// Scroll mode is OPT-IN per state: overflow is only enabled (`.is-scrollable`)
// once the dots actually exceed the pill's max size. A scroll container clips
// absolutely-positioned descendants, so leaving overflow on by default would
// cut off the hover thumbnail tooltips — the common few-dots case must stay
// overflow-visible. Detection re-runs on resize and on dot-count changes.
const isScrollable = ref(false)
function measureOverflow() {
  const el = rootEl.value
  if (!el) return
  // Measure the DOTS' span, not scrollWidth: the (opacity-0) hover tooltips
  // bleed outside the pill and inflate scrollWidth even when nothing needs to
  // scroll — scroll mode would flip on permanently and hide the tooltips.
  // offsetLeft/Top is relative to the pill (its offsetParent), RTL-safe via
  // min/max extents.
  let min = Infinity
  let max = -Infinity
  for (const child of el.children) {
    const c = child as HTMLElement
    const start = props.vertical ? c.offsetTop : c.offsetLeft
    const end = start + (props.vertical ? c.offsetHeight : c.offsetWidth)
    if (start < min) min = start
    if (end > max) max = end
  }
  if (!Number.isFinite(min)) {
    isScrollable.value = false
    return
  }
  const cs = getComputedStyle(el)
  const pad = props.vertical
    ? parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
    : parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
  const avail = (props.vertical ? el.clientHeight : el.clientWidth) - pad
  isScrollable.value = max - min > avail + 1
}
useResizeObserver(rootEl, measureOverflow)
watch([() => props.totalSnaps, () => props.vertical], async () => {
  await nextTick()
  measureOverflow()
}, { immediate: true })

// In scroll mode, keep the active dot in view. `scrollIntoView({ nearest })`
// only moves ancestors where the target is actually clipped — the page doesn't
// jump, and it's RTL-safe (no scrollLeft sign math).
watch(() => props.snapIndex, async (i) => {
  await nextTick()
  if (!isScrollable.value) return
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
    :class="[vertical ? 'hero-pagination--vertical' : 'hero-pagination--horizontal', { 'is-scrollable': isScrollable }]">
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
