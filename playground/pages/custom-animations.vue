<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { gsap } from 'gsap'
import type { HeroAnimatePreset, HeroAnimationHook, HeroSlide } from '#hero/types'

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=1920&q=80`

const PRESETS: Array<{ value: HeroAnimatePreset, hint: string }> = [
  { value: 'fade', hint: 'opacity only' },
  { value: 'fade-up', hint: 'rises into place' },
  { value: 'fade-down', hint: 'drops into place' },
  { value: 'fade-left', hint: 'enters from the right' },
  { value: 'fade-right', hint: 'enters from the left' },
  { value: 'slide', hint: 'follows prev / next' },
  { value: 'zoom-in', hint: 'grows in' },
  { value: 'zoom-out', hint: 'settles from large' },
  { value: 'blur-in', hint: 'focus pull' },
  { value: 'clip-up', hint: 'mask reveal upward' },
  { value: 'clip-left', hint: 'wipe from the right' },
  { value: 'clip-right', hint: 'wipe from the left' },
  { value: 'flip-up', hint: '3D hinge' },
  { value: 'rotate-in', hint: 'tilted rise' },
]

const EASINGS = [
  { label: 'Smooth out', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  { label: 'Spring (overshoot)', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { label: 'Ease in-out', value: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  { label: 'Linear', value: 'linear' },
]

// ─── 1. Choreography — live-tunable ───
// `animate` accepts a getter, so the controls below retune the slider live.
const timing = reactive({ duration: 700, stagger: 90, delay: 0, easing: EASINGS[0]!.value, distance: 24, leaveDuration: 300 })
const roles = reactive<Record<'eyebrow' | 'title' | 'text' | 'cta', HeroAnimatePreset>>({
  eyebrow: 'fade-down',
  title: 'clip-up',
  text: 'blur-in',
  cta: 'zoom-in',
})

const ROLE_FIELDS = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'title', label: 'Title' },
  { key: 'text', label: 'Text' },
  { key: 'cta', label: 'Actions' },
] as const
const TIMING_FIELDS = [
  { key: 'duration', label: 'Duration', min: 200, max: 1600, step: 50, unit: 'ms' },
  { key: 'stagger', label: 'Stagger', min: 0, max: 300, step: 10, unit: 'ms' },
  { key: 'delay', label: 'Delay', min: 0, max: 800, step: 50, unit: 'ms' },
  { key: 'distance', label: 'Distance', min: 0, max: 96, step: 4, unit: 'px' },
  { key: 'leaveDuration', label: 'Leave', min: 100, max: 800, step: 50, unit: 'ms' },
] as const

const choreoRef = useTemplateRef<HTMLElement>('choreoRef')
const choreoSlides: HeroSlide[] = [
  { bgSrc: IMG('1490114538077-0a7f8cb49891'), eyebrow: 'Collection 01', title: 'Made to move', description: 'Every element enters on its own beat — eyebrow, title, copy, actions.' },
  { bgSrc: IMG('1485673634125-0f3ae8fd3209'), eyebrow: 'Collection 02', title: 'Staggered by default', description: 'Siblings are sequenced in document order; tune the gap with stagger.' },
  { bgSrc: IMG('1441986300917-64674bd600d8'), eyebrow: 'Collection 03', title: 'Zero dependencies', description: 'Pure CSS presets, SSR-rendered state, reduced-motion aware.' },
]
const choreo = useHeroSlider(choreoRef, choreoSlides, {
  swiperOptions: { effect: 'fade', speed: 700, autoplay: { delay: 7000 } },
  animate: () => ({ ...timing, distance: `${timing.distance}px` }),
})

const snippet = computed(() => `useHeroSlider(el, slides, {
  animate: {
    duration: ${timing.duration}, stagger: ${timing.stagger}, delay: ${timing.delay},
    easing: '${timing.easing}',
    distance: '${timing.distance}px', leaveDuration: ${timing.leaveDuration},
  },
})

<span data-hero-animate="${roles.eyebrow}">…</span>
<h1 data-hero-animate="${roles.title}">…</h1>
<p data-hero-animate="${roles.text}">…</p>
<div data-hero-animate="${roles.cta}">…</div>`)

function pickTitlePreset(preset: HeroAnimatePreset) {
  roles.title = preset
  choreo.replayAnimation()
}

// ─── 2. Preset gallery — remounting a tile replays it ───
const tileRuns = reactive<Record<string, number>>({})
const galleryRun = ref(0)
function replayTile(preset: string) {
  tileRuns[preset] = (tileRuns[preset] ?? 0) + 1
}

// ─── 3. Direction-aware ───
const directionRef = useTemplateRef<HTMLElement>('directionRef')
const directionSlides: HeroSlide[] = [
  { bgSrc: IMG('1506905925346-21bda4d32df4'), title: 'One' },
  { bgSrc: IMG('1469474968028-56623f02e42e'), title: 'Two' },
  { bgSrc: IMG('1447752875215-b2761acb3c5d'), title: 'Three' },
  { bgSrc: IMG('1470071459604-3b5ec3a7fe05'), title: 'Four' },
]
const direction = useHeroSlider(directionRef, directionSlides, {
  swiperOptions: { autoplay: false, speed: 650 },
  animate: { initial: 'visible', distance: '3rem', stagger: 70 },
})

// ─── 4. JS hooks — any engine; whatever a hook returns is stopped on change ───
// Web Animations API: per-word wave. The words are rendered by Vue (no DOM
// splitting), the hook only animates them.
const wordWave: HeroAnimationHook = (el, { reducedMotion }) => {
  if (reducedMotion) return
  const animations = [...el.querySelectorAll<HTMLElement>('.hook-word')].map((word, i) =>
    word.animate(
      [{ transform: 'translateY(110%) rotate(8deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 700, delay: 120 + i * 70, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
    ))
  return () => animations.forEach(a => a.cancel())
}

// GSAP: return the timeline — it's killed automatically on the next change.
const gsapTimeline: HeroAnimationHook = (el, { reducedMotion }) => {
  if (reducedMotion) return
  return gsap.timeline()
    .from(el.querySelectorAll('.hook-line'), { yPercent: 110, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'expo.out' })
    .from(el.querySelector('.hook-badge'), { scale: 0, rotate: -25, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.5')
}

// Cleanup function: a count-up driven by requestAnimationFrame.
const counter = ref(0)
const countUp: HeroAnimationHook = (_el, { reducedMotion }) => {
  const target = 128_000
  if (reducedMotion) {
    counter.value = target
    return
  }
  const start = performance.now()
  let frame = 0
  const tick = (now: number) => {
    const t = Math.min((now - start) / 1600, 1)
    counter.value = Math.round(target * (1 - (1 - t) ** 4))
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

const hooksRef = useTemplateRef<HTMLElement>('hooksRef')
const hookSlides: HeroSlide[] = [
  { bgSrc: IMG('1534312527009-56c7016453e6'), title: 'Words that wave in', eyebrow: 'Web Animations API', kind: 'waapi', animation: { onEnter: wordWave } },
  { bgSrc: IMG('1490114538077-0a7f8cb49891'), title: 'Timelines welcome', eyebrow: 'GSAP', kind: 'gsap', animation: { onEnter: gsapTimeline } },
  { bgSrc: IMG('1485673634125-0f3ae8fd3209'), title: 'Happy customers', eyebrow: 'Cleanup function', kind: 'counter', animation: { onEnter: countUp } },
]
const hooks = useHeroSlider(hooksRef, hookSlides, {
  swiperOptions: { effect: 'fade', speed: 600, autoplay: { delay: 5000 } },
  animate: { initial: 'visible' },
})

// ─── 5. Classic class-based (whole content block) ───
const classicRef = useTemplateRef<HTMLElement>('classicRef')
const classicSlides: HeroSlide[] = [
  { bgSrc: IMG('1490114538077-0a7f8cb49891'), title: 'hero-slideInUp', animation: { enter: 'hero-animated hero-slideInUp', leave: 'hero-animated hero-slideOutDown' } },
  { bgSrc: IMG('1485673634125-0f3ae8fd3209'), title: 'hero-zoomIn', animation: { enter: 'hero-animated hero-zoomIn', leave: 'hero-animated hero-zoomOut' } },
  { bgSrc: IMG('1441986300917-64674bd600d8'), title: 'hero-slideInLeft', animation: { enter: 'hero-animated hero-slideInLeft', leave: 'hero-animated hero-fadeOut' } },
]
const classic = useHeroSlider(classicRef, classicSlides, { swiperOptions: { autoplay: { delay: 3500 } } })

const animateCssRef = useTemplateRef<HTMLElement>('animateCssRef')
const animateCssSlides: HeroSlide[] = [
  { bgSrc: IMG('1441986300917-64674bd600d8'), title: 'animate__bounceIn', animation: { enter: 'animate__animated animate__bounceIn', leave: 'animate__animated animate__fadeOut' } },
  { bgSrc: IMG('1534312527009-56c7016453e6'), title: 'animate__fadeInRight', animation: { enter: 'animate__animated animate__fadeInRight', leave: 'animate__animated animate__fadeOutLeft' } },
  { bgSrc: IMG('1490114538077-0a7f8cb49891'), title: 'animate__zoomIn', animation: { enter: 'animate__animated animate__zoomIn', leave: 'animate__animated animate__zoomOut' } },
]
const animateCss = useHeroSlider(animateCssRef, animateCssSlides, { swiperOptions: { autoplay: { delay: 3500 }, speed: 600 } })
</script>

<template>
  <DemoPage title="Animations"
    description="Choreograph slide content element by element with data-hero-animate: 14 CSS presets, automatic stagger, direction awareness — no dependencies. Plug in any JS engine through hooks when you need more."
    :features="['data-hero-animate', 'animate option', 'onEnter / onLeave', 'replayAnimation()', 'enter / leave classes']">

    <!-- ─── 1. Choreography ─── -->
    <section class="space-y-4">
      <div>
        <h2 class="section-title">Choreography</h2>
        <p class="section-hint">Pick a preset per element and tune the timing — the slider updates live.</p>
      </div>

      <HeroSlider ref="choreoRef" :slider="choreo" :slides="choreoSlides" :overlay-patterns="[]"
        :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-[60svh] min-h-[440px]">
        <template #slide="{ slide }">
          <div class="flex size-full items-center bg-linear-to-r from-black/60 to-transparent px-14 sm:px-20">
            <div class="max-w-xl text-white">
              <span :data-hero-animate="roles.eyebrow"
                class="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ring-1 ring-white/20 backdrop-blur-sm">
                {{ slide.eyebrow }}
              </span>
              <h3 :data-hero-animate="roles.title" class="mt-4 text-4xl font-bold leading-tight sm:text-6xl">
                {{ slide.title }}
              </h3>
              <p :data-hero-animate="roles.text" class="mt-4 max-w-md text-sm text-white/80 sm:text-base">
                {{ slide.description }}
              </p>
              <div :data-hero-animate="roles.cta" class="mt-7 flex gap-3">
                <button type="button" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">Shop now</button>
                <button type="button" class="rounded-lg px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40">Learn more</button>
              </div>
            </div>
          </div>
        </template>
      </HeroSlider>

      <div class="grid gap-4 lg:grid-cols-3">
        <div class="demo-card">
          <h3 class="demo-card-title">Elements</h3>
          <label v-for="f in ROLE_FIELDS" :key="f.key" class="mb-3 block">
            <span class="demo-label">{{ f.label }}</span>
            <select v-model="roles[f.key]" class="demo-field" @change="choreo.replayAnimation()">
              <option v-for="p in PRESETS" :key="p.value" :value="p.value">{{ p.value }} — {{ p.hint }}</option>
            </select>
          </label>
        </div>

        <div class="demo-card">
          <h3 class="demo-card-title">Timing</h3>
          <label v-for="f in TIMING_FIELDS" :key="f.key" class="mb-2.5 block">
            <span class="demo-label flex justify-between"><span>{{ f.label }}</span><span class="tabular-nums">{{ timing[f.key] }}{{ f.unit }}</span></span>
            <input v-model.number="timing[f.key]" type="range" :min="f.min" :max="f.max" :step="f.step"
              class="w-full accent-current" @change="choreo.replayAnimation()">
          </label>
          <label class="block">
            <span class="demo-label">Easing</span>
            <select v-model="timing.easing" class="demo-field" @change="choreo.replayAnimation()">
              <option v-for="e in EASINGS" :key="e.value" :value="e.value">{{ e.label }}</option>
            </select>
          </label>
        </div>

        <div class="demo-card flex flex-col">
          <h3 class="demo-card-title">Code</h3>
          <pre class="demo-code-block flex-1">{{ snippet }}</pre>
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="demo-btn" @click="choreo.prev()">← Prev</button>
            <button type="button" class="demo-btn" @click="choreo.next()">Next →</button>
            <button type="button" class="demo-btn demo-btn--accent" @click="choreo.replayAnimation()">Replay</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 2. Preset gallery ─── -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="section-title">Presets</h2>
          <p class="section-hint">Hover to replay · click to use it for the title above.</p>
        </div>
        <button type="button" class="demo-btn" @click="galleryRun++">Replay all</button>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <button v-for="p in PRESETS" :key="p.value" type="button"
          class="tile group" :class="{ 'tile--active': roles.title === p.value }"
          @mouseenter="replayTile(p.value)" @click="pickTitlePreset(p.value)">
          <!-- Presets work on any container: `data-hero-anim="in"` plays them. -->
          <div :key="`${galleryRun}-${tileRuns[p.value] ?? 0}`" data-hero-anim="in"
            class="flex h-20 items-center justify-center overflow-hidden" style="--hero-anim-duration: 800ms">
            <span :data-hero-animate="p.value" class="inline-block text-2xl font-bold">Hero</span>
          </div>
          <span class="mt-2 block font-mono text-[11px]">{{ p.value }}</span>
          <span class="block text-[10px] text-black/45 dark:text-white/45">{{ p.hint }}</span>
        </button>
      </div>
    </section>

    <!-- ─── 3. Direction-aware ─── -->
    <section class="grid items-center gap-6 lg:grid-cols-[1fr_2fr]">
      <div>
        <h2 class="section-title">Direction-aware</h2>
        <p class="section-hint mb-4">
          <code class="demo-code">slide</code> enters from the side you travel toward and leaves the other way —
          vertical sliders and RTL included. The intro waits until the slider is on screen
          (<code class="demo-code">initial: 'visible'</code>).
        </p>
        <div class="flex items-center gap-2">
          <button type="button" class="demo-btn" @click="direction.prev()">← Prev</button>
          <button type="button" class="demo-btn" @click="direction.next()">Next →</button>
          <span class="demo-chip">direction: {{ direction.direction.value }}</span>
        </div>
      </div>
      <HeroSlider ref="directionRef" :slider="direction" :slides="directionSlides" :overlay-patterns="[]"
        :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-80">
        <template #slide="{ slide, index }">
          <div class="flex size-full flex-col items-center justify-center bg-black/30 px-14 text-white">
            <span data-hero-animate="slide" class="text-xs uppercase tracking-[0.3em] text-white/70">Slide {{ index + 1 }}</span>
            <h3 data-hero-animate="slide" class="mt-2 text-5xl font-bold">{{ slide.title }}</h3>
            <span data-hero-animate="slide" class="mt-4 h-1 w-16 rounded-full bg-white/80" />
          </div>
        </template>
      </HeroSlider>
    </section>

    <!-- ─── 4. JS hooks ─── -->
    <section class="grid items-center gap-6 lg:grid-cols-[2fr_1fr]">
      <HeroSlider ref="hooksRef" :slider="hooks" :slides="hookSlides" :overlay-patterns="[]"
        :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-96">
        <template #slide="{ slide }">
          <div class="flex size-full flex-col justify-center bg-linear-to-r from-black/70 to-black/10 px-14 text-white sm:px-16">
            <span class="hook-badge inline-block w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
              {{ slide.eyebrow }}
            </span>
            <h3 v-if="slide.kind === 'waapi'" class="mt-4 text-4xl font-bold sm:text-5xl">
              <span v-for="(word, i) in String(slide.title).split(' ')" :key="i" class="inline-block overflow-hidden pr-[0.25em] align-bottom">
                <span class="hook-word inline-block">{{ word }}</span>
              </span>
            </h3>
            <h3 v-else-if="slide.kind === 'gsap'" class="mt-4 text-4xl font-bold sm:text-5xl">
              <span class="block overflow-hidden"><span class="hook-line block">Timelines</span></span>
              <span class="block overflow-hidden"><span class="hook-line block">welcome.</span></span>
            </h3>
            <template v-else>
              <p class="mt-4 text-6xl font-bold tabular-nums sm:text-7xl">{{ counter.toLocaleString('en-US') }}</p>
              <p class="text-white/70">{{ slide.title }}</p>
            </template>
          </div>
        </template>
      </HeroSlider>
      <div>
        <h2 class="section-title">JS hooks</h2>
        <p class="section-hint mb-3">
          <code class="demo-code">onEnter</code> / <code class="demo-code">onLeave</code> get the slide's content element. Return a
          Web Animations <code class="demo-code">Animation</code>, a GSAP timeline, or a cleanup function — it's stopped
          automatically when the slide changes again.
        </p>
        <pre class="demo-code-block">{{ `{ animation: {
    onEnter: (el, { direction }) =>
      gsap.timeline().from(
        el.querySelectorAll('.line'),
        { yPercent: 110, stagger: 0.12 },
      ),
} }` }}</pre>
      </div>
    </section>

    <!-- ─── 5. Class-based ─── -->
    <section class="space-y-4">
      <div>
        <h2 class="section-title">Class-based</h2>
        <p class="section-hint">
          The classic API animates the whole content block with one class: the built-in
          <code class="demo-code">hero-*</code> keyframes or any animate.css class.
        </p>
      </div>
      <!-- min-w-0: a Swiper inside a grid item with `min-width: auto` grows without bound. -->
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="min-w-0">
          <h3 class="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">Built-in (zero deps)</h3>
          <HeroSlider ref="classicRef" :slider="classic" :slides="classicSlides" :overlay-patterns="[]"
            :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-72">
            <template #slide="{ slide }">
              <div class="flex size-full items-end justify-center pb-16">
                <code class="class-label">{{ slide.title }}</code>
              </div>
            </template>
          </HeroSlider>
        </div>
        <div class="min-w-0">
          <h3 class="mb-2 text-sm font-semibold text-black/70 dark:text-white/70">animate.css</h3>
          <HeroSlider ref="animateCssRef" :slider="animateCss" :slides="animateCssSlides" :overlay-patterns="[]"
            :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-72">
            <template #slide="{ slide }">
              <div class="flex size-full items-end justify-center pb-16">
                <code class="class-label">{{ slide.title }}</code>
              </div>
            </template>
          </HeroSlider>
        </div>
      </div>
    </section>
  </DemoPage>
</template>

<style scoped>
@reference "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

/* Page-specific bits only — controls use the shared demo-* kit (main.css). */
.section-title { @apply text-xl font-semibold tracking-tight; }
.section-hint { @apply mt-1 text-sm text-black/60 dark:text-white/60; }
.tile {
  @apply cursor-pointer rounded-xl p-3 text-center ring-1 transition-colors;
  @apply bg-black/[0.02] ring-black/5 hover:ring-black/20 dark:bg-white/5 dark:ring-white/10 dark:hover:ring-white/30;
}
.tile--active { @apply ring-2 ring-black dark:ring-white; }
.class-label { @apply rounded-md bg-black/50 px-3 py-1.5 text-lg font-semibold text-white backdrop-blur-sm; }
</style>
