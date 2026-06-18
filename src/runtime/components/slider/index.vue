<script lang="ts" setup>
import { computed, defineAsyncComponent, shallowRef, useTemplateRef } from 'vue'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { useMutationObserver } from '@vueuse/core'
import { useRuntimeConfig } from '#imports'
import { swiperModules } from '#hero/swiper-modules'
import type { HeroSliderProps } from '#hero/types'
import { isVideoUrl, patternCSS, patternSize, getHeroConfig } from '#hero/utils'
import { useWatchMode } from '#hero/composables/_watchMode'
import { useHeroSlider } from '#hero/composables/useHeroSlider'
import { useHeroEnvironment } from '#hero/composables/_environment'
import { setupMousewheelGestureLock } from '#hero/composables/_mousewheelLock'

// Parallax (GSAP + scroll listeners) lives in a separate async chunk so it only
// downloads when `features.parallax` is enabled — keeps GSAP out of the base
// slider bundle entirely.
const HeroParallax = defineAsyncComponent(() => import('./HeroParallax.client.vue'))

// Pagination + navigation are lazy-imported (local bindings) rather than resolved
// by global name. The module only *registers* them when the matching feature is
// enabled, but Vue hoists `resolveComponent(...)` to the top of every render — so
// a slider with e.g. pagination on but navigation off would log "Failed to
// resolve component: HeroNavigation" on every render even though the v-if never
// renders it. A local binding skips name resolution; the chunk still only loads
// when the control is actually shown.
const HeroPagination = defineAsyncComponent(() => import('../navigation/HeroPagination.vue'))
const HeroNavigation = defineAsyncComponent(() => import('../navigation/HeroNavigation.vue'))

const props = withDefaults(defineProps<HeroSliderProps>(), {
  enterAnimation: '',
  leaveAnimation: '',
  overlayPatterns: () => [{ type: 'lines' as const, opacity: 0.1 }],
  parallax: true,
  imagePreset: '',
  imageSizes: '',
  as: 'div',
  ui: () => ({}),
  dataSaver: 'auto',
})

const heroConfig = getHeroConfig(useRuntimeConfig())
const features = heroConfig.features ?? {}

// ─── Adaptive lite mode (mobile / PWA data + battery saving) ───
// Resolve the `dataSaver` prop: 'auto' follows the client environment
// (Save-Data / reduced-data / slow connection); a boolean forces it. In lite
// mode video backgrounds don't autoplay or preload and scroll parallax is
// skipped. The environment flag is mount-gated, so SSR/first-render = false.
const env = useHeroEnvironment()
const liteMode = computed(() =>
  props.dataSaver === 'auto' ? env.prefersDataSaver.value : props.dataSaver,
)

const containerRef = useTemplateRef<HTMLElement>('containerRef')

// ─── Controlled vs. uncontrolled (drop-in) ───
// Controlled: the consumer creates the composable and passes `:slider`.
// Uncontrolled: no `:slider` — we create one here, scoped to our own root
// element, configured via the `options` prop. The internally-created instance
// is exposed (see defineExpose) so a template ref can still drive it.
// `useHeroSlider` registers no lifecycle hooks, so calling it inside this setup
// is safe; the controlled/uncontrolled choice is fixed for the component's life.
if (import.meta.dev && props.slider && props.options) {
  // eslint-disable-next-line no-console
  console.warn('[nuxt-hero] <HeroSlider> received both `slider` and `options`; `options` is ignored in controlled mode (configure via useHeroSlider() instead).')
}
const slider = props.slider ?? useHeroSlider(containerRef, () => props.slides, props.options ?? {})

const {
  activeIndex,
  snapIndex,
  totalSnaps,
  next,
  prev,
  goTo,
  onSwiper,
  onSlideChange,
  animationClass,
  registerSlideVideo,
  unregisterSlideVideo,
  activeSlideConfig,
  autoplayEnabled,
  autoplayProgress,
  videoPlaying,
  videoCurrentTime,
  videoDuration,
  videoVolume,
  videoMuted,
  videoWaiting,
  videoEnded,
  videoToggle,
  videoSeek,
  videoScrubStart,
  videoScrubEnd,
  videoSetVolume,
  videoToggleMute,
  mergedSwiperOptions,
  isMultiSlide,
  isActiveSlideVideo,
} = slider

// Expose the resolved slider so an uncontrolled consumer can still reach the
// controls via a template ref: `heroRef.value?.slider.next()`. `$el` stays
// available through the expose proxy, so controlled-mode element resolution
// (the consumer's own ref → useHeroSlider) is unaffected.
defineExpose({ slider })

// ─── Idle coordination (watch mode + fullscreen) ───
const { idle, isWatchIdle, isFullscreenIdle } = useWatchMode(
  activeSlideConfig,
  isActiveSlideVideo,
  videoPlaying,
)

// ─── RTL sync ───
// Swiper only reads text direction once, at init. This keeps its slide direction
// (drag, transitions, 3D effects) aligned with the element's *rendered* direction
// — including runtime locale switches in a bilingual app (e.g. samsar AR↔EN).
// Nav, pagination and the progress bar flip independently via CSS [dir=rtl] / rtl:.
const swiperRef = shallowRef<{ rtl?: boolean; destroyed?: boolean; changeLanguageDirection?: (d: 'ltr' | 'rtl') => void } | null>(null)

function syncDirection() {
  const el = containerRef.value
  const rtl = !!el && getComputedStyle(el).direction === 'rtl'
  const s = swiperRef.value
  if (s && !s.destroyed && !!s.rtl !== rtl) s.changeLanguageDirection?.(rtl ? 'rtl' : 'ltr')
}

function handleSwiper(s: any) {
  swiperRef.value = s
  onSwiper(s)
  syncDirection()
  setupMousewheelGestureLock(s)
}

// Mousewheel one-slide-per-gesture lock lives in #hero/composables/_mousewheelLock
// (extracted so it's unit-testable — it has regressed twice).

// Re-sync when the document direction flips at runtime (locale toggle).
if (import.meta.client) {
  useMutationObserver(document.documentElement, syncDirection, { attributes: true, attributeFilter: ['dir'] })
}

/** Whether the slider runs in vertical direction */
const isVertical = computed(() => mergedSwiperOptions.value.direction === 'vertical')

// ─── Carousel ARIA (WAI-ARIA APG) ───
// Layer the APG carousel pattern on top of Swiper's A11y module: the root becomes
// a labelled `role="region"` + `aria-roledescription="carousel"`, slides are
// described as "slide", and non-active slides are `inert` (removed from the a11y
// tree AND made non-focusable — avoids the focusable-inside-aria-hidden trap).
// Only when there's more than one slide and we're in single-slide-per-view mode.
const isCarousel = computed(() => props.slides.length > 1)
const carouselLabel = computed(() => props.labels?.carousel ?? 'Carousel')
function isSlideInert(index: number): boolean {
  return isCarousel.value && !isMultiSlide.value && index !== activeIndex.value
}

/** Check if a slide at the given index has a video background */
function isVideo(index: number): boolean {
  const slide = props.slides[index]
  if (!slide) return false
  return isVideoUrl(slide.bgSrc) || (!!slide.bgDarkSrc && isVideoUrl(slide.bgDarkSrc))
}

/** Whether pagination dots should be visible */
const shouldShowPagination = computed(() =>
  features.pagination && totalSnaps.value > 1 && activeSlideConfig.value.showPagination,
)

/** Whether navigation arrows should be visible */
const shouldShowNavigation = computed(() =>
  features.navigation && props.slides.length > 1 && activeSlideConfig.value.showNavigation,
)

/**
 * Whether the autoplay progress bar should be visible.
 * Always reflects the autoplay timer — video progress is surfaced by the
 * video scrubber (media-controls) independently.
 */
const shouldShowAutoplayProgress = computed(() =>
  autoplayEnabled
  && activeSlideConfig.value.showProgress,
)

// Parallax is rendered as a lazy client component (see <HeroParallax> in the
// template) — all scroll/GSAP work is scoped there and gated on visibility +
// reduced-motion.
</script>

<template>
  <component :is="as" ref="containerRef" class="hero-slider group/slider relative size-full"
    :class="[ui.root, { 'hero-watch-idle': isWatchIdle, 'hero-fs-idle': isFullscreenIdle }]"
    :role="isCarousel ? 'region' : undefined" :aria-roledescription="isCarousel ? 'carousel' : undefined"
    :aria-label="isCarousel ? carouselLabel : undefined"
    :data-idle="idle" :data-watch-mode="activeSlideConfig.watchMode" :data-video-active="isActiveSlideVideo">
    <Swiper v-bind="mergedSwiperOptions" :parallax="true" :modules="swiperModules" class="size-full" :class="ui.swiper"
      @swiper="handleSwiper" @slide-change="onSlideChange">
      <SwiperSlide v-for="(slide, index) in slides" :key="index" class="size-full overflow-hidden" :class="ui.slide"
        :aria-roledescription="isCarousel ? 'slide' : undefined" :inert="isSlideInert(index) || undefined">
        <HeroSlide :bg-src="slide.bgSrc" :bg-dark-src="slide.bgDarkSrc" :poster="slide.poster"
          :image-preset="imagePreset" :image-sizes="imageSizes" :eager="index === 0"
          :is-active="index === activeIndex || isMultiSlide"
          :animation-class="animationClass(index)" :slide-index="index" :on-video-ready="registerSlideVideo"
          :on-video-removed="unregisterSlideVideo" :media-controls-options="slide.config?.mediaControlsOptions"
          :show-video-controls="(index === activeIndex || isMultiSlide) ? (slide.config?.showVideoControls ?? activeSlideConfig.showVideoControls) : false"
          :video-loop="slide.config?.videoLoop ?? false" :auto-play="!isMultiSlide" :data-saver="liteMode"
          :container-class="ui.container"
          :bg-class="ui.bg" :get-container-el="() => containerRef" :labels="labels"
          :on-seek="videoSeek" :on-scrub-start="videoScrubStart" :on-scrub-end="videoScrubEnd">
          <slot name="slide" v-bind="{
            slide, index,
            isActive: index === activeIndex,
            animationClass: animationClass(index),
            isVideo: isVideo(index),
            videoPlaying,
            videoDuration,
            videoCurrentTime,
            videoWaiting,
            videoEnded,
            videoMuted,
            videoVolume,
            videoToggle, videoSeek, videoSetVolume, videoToggleMute,
          }" />
          <template #video-controls="videoProps">
            <slot name="video-controls" v-bind="videoProps" />
          </template>
          <template #overlay>
            <slot name="overlay"
              v-bind="{ patterns: overlayPatterns, index, isActive: index === activeIndex, patternCSS, patternSize }">
              <!-- Default overlay rendering -->
              <div v-for="(pattern, i) in overlayPatterns" :key="i"
                class="hero-overlay-pattern pointer-events-none absolute inset-0 z-2"
                :style="{
                  backgroundImage: patternCSS(pattern),
                  backgroundSize: patternSize(pattern),
                  opacity: pattern.opacity ?? 0.15,
                }" />
            </slot>
          </template>
        </HeroSlide>
      </SwiperSlide>
    </Swiper>

    <!-- Parallax: lazy client-only logic layer (GSAP + scroll), feature-gated.
         Skipped in lite mode to save CPU / battery on constrained clients. -->
    <ClientOnly>
      <HeroParallax v-if="features.parallax && !liteMode" :root="containerRef" :parallax="parallax" />
    </ClientOnly>

    <!-- UI controls layer -->
    <div class="pointer-events-none absolute inset-0 z-50 overflow-hidden" :class="ui.controls">
      <slot v-if="shouldShowPagination" name="pagination"
        v-bind="{ activeIndex, snapIndex, totalSnaps, total: slides.length, progress: autoplayProgress, goTo, vertical: isVertical, autoplayEnabled }">
        <HeroPagination :slides="slides" :active-index="activeIndex" :snap-index="snapIndex" :total-snaps="totalSnaps"
          :progress="autoplayEnabled ? autoplayProgress : 1" :vertical="isVertical" @slide-to="goTo" />
      </slot>

      <slot v-if="shouldShowNavigation" name="navigation"
        v-bind="{ prev, next, activeIndex, slides, vertical: isVertical }">
        <HeroNavigation :slides="slides" :active-index="activeIndex" :vertical="isVertical"
          :prev-label="labels?.prev" :next-label="labels?.next" @prev="prev" @next="next" />
      </slot>

      <!-- Autoplay progress bar: horizontal edge-to-edge at the bottom,
           vertical on the side. Styling matches the video scrubber palette
           (bg-white/20 track, bg-white fill). -->
      <div v-if="shouldShowAutoplayProgress" class="hero-autoplay-progress pointer-events-none absolute z-4 bg-[var(--hero-progress-bg)] overflow-hidden" :class="[
        isVertical
          ? 'top-0 ltr:right-0 rtl:left-0 h-full w-1'
          : 'bottom-0 left-0 w-full h-1',
        ui.progress,
      ]">
        <div class="bg-[var(--hero-primary)] transition-all duration-50" :class="isVertical ? 'w-full' : 'h-full'" :style="isVertical
          ? { height: `${autoplayProgress * 100}%` }
          : { width: `${autoplayProgress * 100}%` }" />
      </div>
    </div>
  </component>
</template>
