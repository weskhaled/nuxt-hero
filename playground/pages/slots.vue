<script setup lang="ts">
import type { HeroSlide, HeroSlideChange, HeroSliderUI, OverlayPattern, UseHeroSliderOptions } from '#hero/types'
import { formatTime } from '#hero/utils'

// Objects handed to the sliders live here, not inline in the template, so a
// page re-render (v-model, event log) doesn't hand the sliders new props.
const NO_PATTERNS: OverlayPattern[] = []
const UI: HeroSliderUI = { root: 'rounded-2xl overflow-hidden' }

// ─── 1. Custom pagination & navigation ───
const tabSlides: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, title: 'Summit', description: 'Numbered tabs replace the pill; each fills with the autoplay timer.' },
  { bgSrc: IMAGES.forest, title: 'Forest', description: 'Click a tab to jump — goToSnap() respects slidesPerGroup.' },
  { bgSrc: IMAGES.waterfall, title: 'Waterfall', description: 'Round buttons bottom-right replace the edge arrows.' },
  { bgSrc: IMAGES.valley, title: 'Valley', description: 'Both live in the controls layer, above every slide.' },
]
const tabOptions: UseHeroSliderOptions = { swiperOptions: { effect: 'fade', speed: 700, autoplay: { delay: 5000 } } }

/** Story-style fill: done tabs full, the active one follows the timer, the rest empty. */
function tabFill(tab: number, active: number, progress: number) {
  if (tab < active) return 1
  return tab === active ? progress : 0
}

const tabsCode = `<HeroSlider :slides="slides">
  <template #pagination="{ snapIndex, totalSnaps, progress, goToSnap }">
    <nav aria-label="Slides" class="absolute bottom-6 left-6 flex gap-2">
      <button v-for="i in totalSnaps" :key="i" type="button" class="pointer-events-auto"
        :aria-current="snapIndex === i - 1 ? 'true' : undefined" @click="goToSnap(i - 1)">
        <span class="track">
          <span class="fill" :style="{ transform: \`scaleX(\${fill(i - 1, snapIndex, progress)})\` }" />
        </span>
        0{{ i }}
      </button>
    </nav>
  </template>

  <template #navigation="{ prev, next }">
    <div class="absolute bottom-6 right-6 flex gap-2">
      <button type="button" class="pointer-events-auto" aria-label="Previous slide" @click="prev">←</button>
      <button type="button" class="pointer-events-auto" aria-label="Next slide" @click="next">→</button>
    </div>
  </template>
</HeroSlider>`

// ─── 2. Custom progress ───
const progressSlides: HeroSlide[] = [
  { bgSrc: IMAGES.earth, title: 'A hairline timer', description: 'The #progress slot swaps the bottom bar for this one at the top.' },
  { bgSrc: IMAGES.nebula, title: 'Pause from the slot', description: 'pause() / resume() come with it — no composable needed.' },
  { bgSrc: IMAGES.space, title: 'Hover holds it too', description: 'Hover and focus hold the timer without flipping paused.' },
]
const progressOptions: UseHeroSliderOptions = { swiperOptions: { speed: 700, autoplay: { delay: 4000 } } }

const progressCode = `<HeroSlider :slides="slides">
  <template #progress="{ progress, paused, pause, resume }">
    <div class="absolute inset-x-0 top-0 h-1 bg-white/20">
      <div class="h-full origin-left bg-amber-400" :style="{ transform: \`scaleX(\${progress})\` }" />
    </div>
    <button type="button" class="pointer-events-auto absolute right-3 top-4"
      :aria-label="paused ? 'Resume autoplay' : 'Pause autoplay'"
      @click="paused ? resume() : pause()">
      {{ paused ? 'Resume' : 'Pause' }}
    </button>
  </template>
</HeroSlider>`

// ─── 3. Background & overlay ───
const mediaSlides: HeroSlide[] = [
  { bgSrc: IMAGES.landscape, title: 'Ken Burns', description: 'This slide\'s #background is an <img> with a slow CSS zoom that runs while it is active.', kenBurns: true, tint: '14 165 233' },
  { bgSrc: IMAGES.woods, title: 'Plain image', description: 'Same slot, no motion. The overlay picks its tint from slide data.', tint: '16 185 129' },
  { bgSrc: IMAGES.store, title: 'Your own markup', description: 'Use <picture>, a canvas or a Lottie player here; parallax still moves the wrapper.', tint: '244 63 94' },
]
const mediaOptions: UseHeroSliderOptions = { swiperOptions: { effect: 'fade', speed: 900, autoplay: { delay: 6000 } } }
const MEDIA_PATTERNS: OverlayPattern[] = [{ type: 'dots', opacity: 0.12 }]

/** Vignette + a bottom wash in the slide's own tint (an "R G B" string on the slide). */
function overlayStyle(slide: HeroSlide) {
  const tint = typeof slide.tint === 'string' ? slide.tint : '0 0 0'
  return {
    background: [
      'radial-gradient(120% 90% at 50% 40%, transparent 45%, rgb(0 0 0 / 0.7) 100%)',
      `linear-gradient(to top, rgb(${tint} / 0.6), transparent 60%)`,
    ].join(', '),
  }
}

const mediaCode = `const slides = [
  { bgSrc: '/landscape.jpg', kenBurns: true, tint: '14 165 233' },
  { bgSrc: '/woods.jpg', tint: '16 185 129' },
]

<HeroSlider :slides="slides" :overlay-patterns="[{ type: 'dots', opacity: 0.12 }]">
  <template #background="{ src, slide, isActive, eager }">
    <img :src="src" alt="" :loading="eager ? 'eager' : 'lazy'" class="size-full object-cover"
      :class="slide.kenBurns && ['ken-burns', { 'is-active': isActive }]">
  </template>

  <template #overlay="{ slide, patterns, patternCSS, patternSize }">
    <div class="pointer-events-none absolute inset-0 z-[2]" :style="vignette(slide.tint)" />
    <!-- keep the :overlay-patterns, rendered with the slot's helpers -->
    <div v-for="(p, i) in patterns" :key="i" class="pointer-events-none absolute inset-0 z-[2]"
      :style="{ backgroundImage: patternCSS(p), backgroundSize: patternSize(p), opacity: p.opacity }" />
  </template>
</HeroSlider>

<style>
.ken-burns { animation: ken-burns 16s ease-in-out infinite alternate paused; }
.ken-burns.is-active { animation-play-state: running; }
@keyframes ken-burns { to { transform: scale(1.18) translate(-2%, 1%); } }
@media (prefers-reduced-motion: reduce) { .ken-burns { animation: none; } }
</style>`

// ─── 4. Video controls ───
type ControlsMode = 'bar' | 'button'
const CONTROL_MODES: Array<{ value: ControlsMode, label: string }> = [
  { value: 'bar', label: '#video-controls' },
  { value: 'button', label: '#play-button' },
]
const controlsMode = ref<ControlsMode>('bar')
const videoSlides: HeroSlide[] = [
  { bgSrc: VIDEOS.oceans.src, poster: VIDEOS.oceans.poster, title: 'Your controls, your markup' },
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, title: 'Applies to every video slide', config: { videoLoop: true } },
]
// No autoplay. The custom bar carries `data-hero-video-controls`, so the
// pagination pill lifts clear of it like it does for the default bar.
const videoOptions: UseHeroSliderOptions = { swiperOptions: { autoplay: false } }
// `group/hero` lets the custom play button reveal itself on slider hover.
const VIDEO_UI: HeroSliderUI = { root: 'group/hero rounded-2xl overflow-hidden' }
const RING = 2 * Math.PI * 37

function percent(time: number, duration: number) {
  return duration > 0 ? `${Math.min((time / duration) * 100, 100)}%` : '0%'
}
function seekFromClick(e: MouseEvent, duration: number, seek: (time: number) => void) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
  seek(ratio * duration)
}
const SEEK_KEYS: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, Home: -Infinity, End: Infinity }
function seekFromKey(e: KeyboardEvent, current: number, duration: number, seek: (time: number) => void) {
  const step = SEEK_KEYS[e.key]
  if (step === undefined) return
  // Keep the arrows away from Swiper's keyboard navigation (document listener).
  e.preventDefault()
  e.stopPropagation()
  seek(Math.min(Math.max(current + step, 0), duration))
}

const videoCode = computed(() => controlsMode.value === 'bar'
  ? `<!-- Slot props playing, currentTime, duration, waiting, muted… are Vue refs: use .value -->
<HeroSlider :slides="slides">
  <template #video-controls="{ playing, waiting, currentTime, duration, muted, togglePlay, seek }">
    <!-- Renders in the slide's video-controls layer (above the content, click-through):
         pointer-events-auto to take clicks, swiper-no-swiping so a drag doesn't swipe,
         data-hero-video-controls to lift the pagination and fade it in watch mode. -->
    <div data-hero-video-controls class="pointer-events-auto swiper-no-swiping absolute inset-x-6 bottom-6 flex items-center gap-3">
      <button type="button" :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="togglePlay()">
        {{ playing.value ? 'Pause' : 'Play' }}
      </button>
      <div role="slider" tabindex="0" aria-label="Seek" class="h-1.5 flex-1 bg-white/25"
        :aria-valuenow="Math.round(currentTime.value)" :aria-valuemax="Math.round(duration.value)"
        @click="onSeekClick($event, duration.value, seek)">
        <div class="h-full bg-amber-400"
          :style="{ width: \`\${currentTime.value / duration.value * 100}%\` }" />
      </div>
      <span>{{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}</span>
      <button type="button" :aria-pressed="!muted.value" @click="muted.value = !muted.value">Sound</button>
    </div>
  </template>
</HeroSlider>

import { formatTime } from '#hero/utils'
function onSeekClick(e: MouseEvent, duration: number, seek: (t: number) => void) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  seek(Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1) * duration)
}`
  : `<!-- Plain values here (playing, waiting, progress 0–100): it swaps only the
     center button of the DEFAULT controls, so it has no effect next to #video-controls. -->
<HeroSlider :slides="slides" :ui="{ root: 'group/hero' }">
  <template #play-button="{ playing, waiting, progress, toggle }">
    <button type="button" class="relative size-20 rounded-full"
      :class="playing ? 'opacity-0 group-hover/hero:opacity-100' : ''"
      :aria-label="playing ? 'Pause video' : 'Play video'" @click="toggle()">
      <svg viewBox="0 0 80 80" class="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" stroke-width="3"
          :stroke-dasharray="RING" :stroke-dashoffset="RING * (1 - progress / 100)" />
      </svg>
      {{ waiting ? '…' : playing ? 'Pause' : 'Play' }}
    </button>
  </template>
</HeroSlider>`)

// ─── 5. v-model & events ───
const modelSlides: HeroSlide[] = [
  { bgSrc: IMAGES.store, thumbSrc: thumb(IMAGES.store), title: 'Store' },
  { bgSrc: IMAGES.shelves, thumbSrc: thumb(IMAGES.shelves), title: 'Shelves' },
  { bgSrc: IMAGES.suits, thumbSrc: thumb(IMAGES.suits), title: 'Suits' },
  { bgSrc: IMAGES.shoes, thumbSrc: thumb(IMAGES.shoes), title: 'Shoes' },
  { bgSrc: IMAGES.circuit, thumbSrc: thumb(IMAGES.circuit), title: 'Circuit' },
]
const modelOptions: UseHeroSliderOptions = { swiperOptions: { speed: 650, autoplay: { delay: 5000 } } }
const active = ref(0)

type ChangeEntry = { id: number, from: number, to: number, direction: HeroSlideChange['direction'] }
const changes = ref<ChangeEntry[]>([])
let changeId = 0
function onModelChange({ index, previousIndex, direction }: HeroSlideChange) {
  changes.value = [{ id: ++changeId, from: previousIndex, to: index, direction }, ...changes.value].slice(0, 6)
}

const modelCode = `const active = ref(0)

<HeroSlider v-model:active-index="active" :slides="slides"
  @change="({ index, previousIndex, direction, slide }) => log(...)" />

<button v-for="(s, i) in slides" :key="i" type="button"
  :aria-current="active === i ? 'true' : undefined" @click="active = i">
  <img :src="s.thumbSrc" alt="">
</button>`
</script>

<template>
  <DemoPage title="Slots & events"
    description="Every visual part of the slider is a slot with the state and actions it needs: pagination, navigation, the autoplay progress bar, each slide's background and overlay, and the video controls. Events and v-model let the parent follow along and take over."
    :features="['#pagination', '#navigation', '#progress', '#background', '#overlay', '#video-controls', '#play-button', 'v-model:active-index', '@change']">
    <!-- ─── 1. Pagination & navigation ─── -->
    <DemoSection title="Custom pagination & navigation"
      hint="Both slots render in the slider's controls layer (.hero-controls): an absolutely positioned overlay with pointer-events: none, so it never blocks swiping. Position your chrome absolutely and put pointer-events: auto on anything clickable."
      :code="tabsCode">
      <HeroSlider :slides="tabSlides" :options="tabOptions" :overlay-patterns="NO_PATTERNS" :ui="UI"
        class="h-[26rem]">
        <template #slide="{ slide }">
          <div class="size-full bg-linear-to-b from-black/60 via-black/10 to-black/50 p-6 text-white sm:p-10">
            <div class="max-w-md">
              <h3 data-hero-animate="clip-up" class="text-3xl font-bold sm:text-4xl">{{ slide.title }}</h3>
              <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/85 sm:text-base">{{ slide.description }}</p>
            </div>
          </div>
        </template>

        <template #pagination="{ snapIndex, totalSnaps, progress, goToSnap, autoplayEnabled }">
          <nav aria-label="Slides" class="absolute bottom-4 left-4 right-28 sm:bottom-6 sm:left-6">
            <ol class="flex gap-2 sm:gap-3">
              <li v-for="i in totalSnaps" :key="i" class="min-w-0 flex-1 sm:max-w-36">
                <button type="button" class="pointer-events-auto block w-full cursor-pointer py-2 text-left text-white"
                  :aria-label="`Go to slide ${i}: ${tabSlides[i - 1]?.title}`"
                  :aria-current="snapIndex === i - 1 ? 'true' : undefined" @click="goToSnap(i - 1)">
                  <span class="relative block h-0.5 overflow-hidden rounded-full bg-white/30">
                    <span class="absolute inset-0 origin-left bg-white"
                      :style="{ transform: `scaleX(${tabFill(i - 1, snapIndex, autoplayEnabled ? progress : 1)})` }" />
                  </span>
                  <span class="mt-2 flex items-baseline gap-2 text-xs transition-opacity"
                    :class="snapIndex === i - 1 ? 'opacity-100' : 'opacity-60 hover:opacity-100'">
                    <span class="font-mono tabular-nums">0{{ i }}</span>
                    <span class="hidden truncate font-medium sm:inline">{{ tabSlides[i - 1]?.title }}</span>
                  </span>
                </button>
              </li>
            </ol>
          </nav>
        </template>

        <template #navigation="{ prev, next }">
          <div class="absolute bottom-5 right-4 flex gap-2 sm:bottom-7 sm:right-6">
            <button type="button" aria-label="Previous slide"
              class="pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 text-black shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              @click="prev()">
              <Icon name="lucide:arrow-left" class="size-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next slide"
              class="pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 text-black shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              @click="next()">
              <Icon name="lucide:arrow-right" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>

    <!-- ─── 2. Progress ─── -->
    <DemoSection title="Custom progress"
      hint="#progress gets the timer (0–1) plus paused / running / pause / resume. paused is the API pause only; running is whether the timer ticks right now (false while hovered or focused, too). Like pagination, it renders in the pointer-events: none controls layer."
      :code="progressCode">
      <HeroSlider :slides="progressSlides" :options="progressOptions" :overlay-patterns="NO_PATTERNS" :ui="UI"
        class="h-[22rem]">
        <template #slide="{ slide }">
          <div class="flex size-full items-end bg-linear-to-t from-black/70 to-transparent px-14 pb-14 text-white sm:px-20">
            <div class="max-w-md">
              <h3 data-hero-animate="fade-up" class="text-2xl font-bold sm:text-3xl">{{ slide.title }}</h3>
              <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/85">{{ slide.description }}</p>
            </div>
          </div>
        </template>

        <template #progress="{ progress, paused, pause, resume }">
          <div class="absolute inset-x-0 top-0 h-1 bg-white/20">
            <div class="h-full origin-left bg-amber-400" :style="{ transform: `scaleX(${progress})` }" />
          </div>
          <button type="button"
            class="pointer-events-auto absolute right-3 top-4 flex cursor-pointer items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/75"
            :aria-label="paused ? 'Resume autoplay' : 'Pause autoplay'" @click="paused ? resume() : pause()">
            <Icon :name="paused ? 'lucide:play' : 'lucide:pause'" class="size-3.5" aria-hidden="true" />
            {{ paused ? 'Resume' : 'Pause' }}
          </button>
        </template>
      </HeroSlider>
    </DemoSection>

    <!-- ─── 3. Background & overlay ─── -->
    <DemoSection title="Background & overlay"
      hint="#background replaces each slide's media (here: your own <img>, with a Ken Burns zoom on the first slide that stops under prefers-reduced-motion). #overlay replaces the pattern layer; it receives the slide, so the vignette takes each slide's tint, and the patterns with the helpers to render them."
      :code="mediaCode">
      <HeroSlider :slides="mediaSlides" :options="mediaOptions" :overlay-patterns="MEDIA_PATTERNS" :ui="UI"
        class="h-[26rem]">
        <template #background="{ src, slide, isActive, eager }">
          <img :src="src" alt="" :loading="eager ? 'eager' : 'lazy'" class="size-full object-cover"
            :class="slide.kenBurns ? ['ken-burns', { 'is-active': isActive }] : undefined">
        </template>

        <template #overlay="{ slide, patterns, patternCSS, patternSize }">
          <div class="pointer-events-none absolute inset-0 z-[2]" :style="overlayStyle(slide)" />
          <div v-for="(p, i) in patterns" :key="i" class="pointer-events-none absolute inset-0 z-[2]"
            :style="{ backgroundImage: patternCSS(p), backgroundSize: patternSize(p), opacity: p.opacity ?? 0.15 }" />
        </template>

        <template #slide="{ slide }">
          <div class="flex size-full items-end px-14 pb-14 text-white sm:px-20">
            <div class="max-w-md">
              <h3 data-hero-animate="clip-up" class="text-3xl font-bold sm:text-4xl">{{ slide.title }}</h3>
              <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/85 sm:text-base">{{ slide.description }}</p>
            </div>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>

    <!-- ─── 4. Video controls ─── -->
    <DemoSection title="Video controls"
      hint="#video-controls replaces the whole default video UI (bar and center button) on every video slide. Its playback props (playing, currentTime, duration, waiting, muted, volume, rate) are Vue refs: read and write .value. It renders in the slide's video-controls layer, above the content: add pointer-events: auto to it, and data-hero-video-controls to get the pagination lift and watch-mode fade the default bar has. #play-button swaps only the center button of the default controls; it does nothing once #video-controls is set, so switch to see each."
      :code="videoCode">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Slot to demo">
          <button v-for="m in CONTROL_MODES" :key="m.value" type="button" class="demo-btn font-mono"
            :aria-pressed="controlsMode === m.value" @click="controlsMode = m.value">
            {{ m.label }}
          </button>
        </div>
      </template>

      <HeroSlider v-if="controlsMode === 'bar'" key="bar" :slides="videoSlides" :options="videoOptions"
        :overlay-patterns="NO_PATTERNS" :ui="VIDEO_UI" class="h-[26rem]">
        <template #slide="{ slide }">
          <div class="flex size-full items-start bg-linear-to-b from-black/60 to-transparent px-14 pt-8 text-white sm:px-20">
            <h3 data-hero-animate="fade-down" class="text-2xl font-bold sm:text-3xl">{{ slide.title }}</h3>
          </div>
        </template>

        <template #video-controls="{ playing, waiting, currentTime, duration, muted, togglePlay, seek }">
          <div data-hero-video-controls class="pointer-events-auto swiper-no-swiping absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-full bg-black/55 py-1.5 pl-1.5 pr-2 text-white ring-1 ring-white/15 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:gap-3">
            <button type="button"
              class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-black transition hover:bg-white/85"
              :aria-label="playing.value ? 'Pause video' : 'Play video'" @click="togglePlay()">
              <Icon v-if="waiting.value" name="lucide:loader-circle" class="size-4 animate-spin" aria-hidden="true" />
              <Icon v-else :name="playing.value ? 'lucide:pause' : 'lucide:play'" class="size-4" aria-hidden="true" />
            </button>
            <div role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"
              :aria-valuemax="Math.round(duration.value)" :aria-valuenow="Math.round(currentTime.value)"
              :aria-valuetext="`${formatTime(currentTime.value)} of ${formatTime(duration.value)}`"
              class="group/seek relative h-6 min-w-0 flex-1 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              @click="seekFromClick($event, duration.value, seek)"
              @keydown="seekFromKey($event, currentTime.value, duration.value, seek)">
              <span class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5" />
              <span class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-400 transition-[height] group-hover/seek:h-1.5"
                :style="{ width: percent(currentTime.value, duration.value) }" />
            </div>
            <span class="hidden shrink-0 font-mono text-xs tabular-nums sm:inline">
              {{ formatTime(currentTime.value) }} / {{ formatTime(duration.value) }}
            </span>
            <button type="button"
              class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full transition hover:bg-white/15"
              aria-label="Sound" :aria-pressed="!muted.value" @click="muted.value = !muted.value">
              <Icon :name="muted.value ? 'lucide:volume-x' : 'lucide:volume-2'" class="size-4" aria-hidden="true" />
            </button>
          </div>
        </template>
      </HeroSlider>

      <HeroSlider v-else key="button" :slides="videoSlides" :options="videoOptions"
        :overlay-patterns="NO_PATTERNS" :ui="VIDEO_UI" class="h-[26rem]">
        <template #slide="{ slide }">
          <div class="flex size-full items-start bg-linear-to-b from-black/60 to-transparent px-14 pt-8 text-white sm:px-20">
            <h3 data-hero-animate="fade-down" class="text-2xl font-bold sm:text-3xl">{{ slide.title }}</h3>
          </div>
        </template>

        <template #play-button="{ playing, waiting, progress, toggle }">
          <button type="button"
            class="relative grid size-20 cursor-pointer place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:scale-105 focus-visible:opacity-100"
            :class="playing ? 'opacity-0 group-hover/hero:opacity-100' : 'opacity-100'"
            :aria-label="playing ? 'Pause video' : 'Play video'" @click="toggle()">
            <svg viewBox="0 0 80 80" class="absolute inset-0 size-full -rotate-90" aria-hidden="true">
              <circle cx="40" cy="40" r="37" fill="none" stroke="rgb(255 255 255 / 0.2)" stroke-width="3" />
              <circle cx="40" cy="40" r="37" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"
                :stroke-dasharray="RING" :stroke-dashoffset="RING * (1 - progress / 100)" />
            </svg>
            <Icon v-if="waiting" name="lucide:loader-circle" class="size-7 animate-spin" aria-hidden="true" />
            <Icon v-else :name="playing ? 'lucide:pause' : 'lucide:play'" class="size-7" aria-hidden="true" />
          </button>
        </template>
      </HeroSlider>
    </DemoSection>

    <!-- ─── 5. v-model & events ─── -->
    <DemoSection title="v-model & events"
      hint="v-model:active-index reads and drives the slide from the parent (it also picks the starting slide). @change fires after every change with the new and previous index, the direction and the slide."
      :code="modelCode">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div class="min-w-0 space-y-3">
          <HeroSlider v-model:active-index="active" :slides="modelSlides" :options="modelOptions"
            :overlay-patterns="NO_PATTERNS" :ui="UI" class="h-[22rem]" @change="onModelChange">
            <template #slide="{ slide, index }">
              <div class="flex size-full items-end bg-linear-to-t from-black/60 to-transparent px-14 pb-14 text-white sm:px-20">
                <div>
                  <p data-hero-animate="slide" class="font-mono text-xs text-white/70">0{{ index + 1 }}</p>
                  <h3 data-hero-animate="slide" class="text-3xl font-bold">{{ slide.title }}</h3>
                </div>
              </div>
            </template>
          </HeroSlider>

          <div class="flex gap-2 overflow-x-auto p-1" role="group" aria-label="Choose a slide">
            <button v-for="(s, i) in modelSlides" :key="i" type="button"
              class="shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 transition"
              :class="active === i
                ? 'ring-black dark:ring-white'
                : 'opacity-60 ring-transparent hover:opacity-100'"
              :aria-label="`Show ${s.title}`" :aria-current="active === i ? 'true' : undefined" @click="active = i">
              <img :src="s.thumbSrc" alt="" loading="lazy" class="h-14 w-20 object-cover sm:h-16 sm:w-24">
            </button>
          </div>
        </div>

        <div class="demo-card">
          <p class="demo-card-title">State</p>
          <p class="text-xs">
            <code class="demo-code">active</code> = <span class="font-mono font-semibold">{{ active }}</span>
            <span class="text-black/60 dark:text-white/60"> ({{ modelSlides[active]?.title }})</span>
          </p>
          <p class="demo-card-title mt-4">@change</p>
          <ol v-if="changes.length" class="space-y-1 font-mono text-[11px]">
            <li v-for="c in changes" :key="c.id" class="flex items-center gap-2">
              <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                :class="c.direction === 'next'
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                  : 'bg-violet-500/15 text-violet-700 dark:text-violet-300'">
                {{ c.direction }}
              </span>
              <span>{{ c.from + 1 }} → {{ c.to + 1 }}</span>
            </li>
          </ol>
          <p v-else class="text-xs text-black/50 dark:text-white/50">
            Click a thumbnail or swipe; changes appear here, newest first.
          </p>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
/* Ken Burns for the custom #background slot (slot content carries this page's
   scope, so scoped styles reach it). Paused while the slide is inactive, so a
   leaving slide freezes in place instead of snapping back. */
.ken-burns {
  transform-origin: 65% 35%;
  animation: ken-burns 16s ease-in-out infinite alternate;
  animation-play-state: paused;
}
.ken-burns.is-active {
  animation-play-state: running;
}
@keyframes ken-burns {
  from { transform: scale(1); }
  to { transform: scale(1.18) translate(-2%, 1%); }
}
@media (prefers-reduced-motion: reduce) {
  .ken-burns { animation: none; }
}
</style>
