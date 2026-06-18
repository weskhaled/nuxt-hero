<script lang="ts" setup>
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, watchEffect } from 'vue'
import { useElementBounding, useElementVisibility, useMediaQuery, useWindowSize } from '@vueuse/core'
import type { ParallaxConfig } from '#hero/types'
import { resolveParallaxConfig } from '#hero/utils'
import { useGSAP } from '#hero/composables/_gsap'

/**
 * Logic-only parallax layer. Rendered by `<HeroSlider>` via `defineAsyncComponent`
 * and only when `features.parallax` is enabled, so GSAP lands in a separate async
 * chunk and never weighs down the base slider bundle.
 *
 * Renders nothing — it reaches into the host slider's `.hero-slide-bg` /
 * `.hero-slide-content` elements and animates them. Both effects are skipped when
 * the slider is offscreen or the user prefers reduced motion.
 */
const props = defineProps<{
  /** The slider root element (`.hero-slider`). */
  root: HTMLElement | null
  /**
   * Parallax prop forwarded verbatim from `<HeroSlider>` — `false`, `true`, a
   * config object, or a ref/getter to any of those. Resolved with `toValue`.
   */
  parallax: MaybeRefOrGetter<boolean | ParallaxConfig>
}>()

const rootGetter = (() => props.root) as MaybeRefOrGetter<HTMLElement | null>
const config = computed(() => resolveParallaxConfig(toValue(props.parallax)))

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const isVisible = useElementVisibility(rootGetter)

const { top: elTop, height: elHeight } = useElementBounding(rootGetter)
const { height: winHeight } = useWindowSize()

// ─── Background parallax ───
// Reactive bg parallax — uses element bounding for pixel-perfect offset
// regardless of where the slider sits on the page. Skipped while offscreen or
// when the user prefers reduced motion (read those first so the effect
// re-subscribes correctly when either flips).
watchEffect(() => {
  if (prefersReducedMotion.value || !isVisible.value) return

  const cfg = config.value
  if (!cfg.bg) return
  const el = props.root
  if (!el) return

  const wh = winHeight.value
  const eh = elHeight.value
  if (!wh || !eh) return

  const bgs = el.querySelectorAll<HTMLElement>('.hero-slide-bg')
  // Scroll progress: 0 = element top at viewport bottom, 1 = element bottom at viewport top
  const totalScroll = wh + eh
  const progress = Math.min(Math.max((wh - elTop.value) / totalScroll, 0), 1)

  // Max pixel travel based on container height and speed
  const maxTravel = eh * cfg.speed * 0.4
  // Offset centered at progress 0.5 — no gap at any scroll position
  const offset = (progress - 0.5) * 2 * maxTravel

  for (const bg of bgs) {
    bg.style.height = `calc(100% + ${maxTravel * 2}px)`
    bg.style.top = `${-maxTravel}px`
    bg.style.transform = `translate3d(0, ${offset}px, 0)`
  }
})

// ─── Content parallax (GSAP ScrollTrigger) ───
// `useGSAP` already SSR-no-ops and honours prefers-reduced-motion internally.
useGSAP(({ gsap }) => {
  const cfg = config.value
  if (!cfg.content) return
  const el = props.root
  if (!el) return

  gsap.to(el.querySelectorAll('.hero-slide-content'), {
    yPercent: 35 * cfg.speed,
    opacity: cfg.minOpacity,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}, { scope: rootGetter, watchSources: [() => props.root] })
</script>

<template>
  <span hidden aria-hidden="true" />
</template>
