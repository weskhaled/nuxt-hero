<script lang="ts" setup>
import { computed } from 'vue'
import type { HeroSlide } from '../../types'
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
    All styling lives in assets/hero.css under `.nav-slit-*` (plain CSS —
    direction & RTL via semantic classes + logical `inset-inline-*` +
    `[dir=rtl]` overrides). `.has-preview` toggles the "slide the arrow fully
    out" hover when a thumb exists. Horizontal: prev=inline-start,
    next=inline-end. Vertical: prev=top, next=bottom.
  -->
  <nav class="hero-nav nav-slit" :class="{ 'nav-slit--vertical': vertical }">
    <!-- Prev -->
    <button type="button" :aria-label="prevLabel" class="nav-slit-btn nav-slit-prev"
      :class="{ 'has-preview': !!prevSlide?.thumbSrc }" @click="emit('prev')">
      <span class="nav-slit-arrow">
        <HeroIcon :name="vertical ? 'chevron-up' : 'chevron-left'" />
      </span>
      <div v-if="prevSlide?.thumbSrc" class="nav-slit-preview">
        <h3 class="nav-slit-preview-title">{{ prevSlide?.title }}</h3>
        <img :src="prevSlide.thumbSrc" :alt="prevSlide?.title ?? ''" loading="lazy" />
      </div>
    </button>

    <!-- Next -->
    <button type="button" :aria-label="nextLabel" class="nav-slit-btn nav-slit-next"
      :class="{ 'has-preview': !!nextSlide?.thumbSrc }" @click="emit('next')">
      <span class="nav-slit-arrow">
        <HeroIcon :name="vertical ? 'chevron-down' : 'chevron-right'" />
      </span>
      <div v-if="nextSlide?.thumbSrc" class="nav-slit-preview">
        <h3 class="nav-slit-preview-title">{{ nextSlide?.title }}</h3>
        <img :src="nextSlide.thumbSrc" :alt="nextSlide?.title ?? ''" loading="lazy" />
      </div>
    </button>
  </nav>
</template>
