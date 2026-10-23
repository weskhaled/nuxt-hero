<script setup lang="ts">
import type { HeroSlide, HeroSlideChange, HeroSliderUI, HeroVideoControlsConfig, OverlayPattern, UseHeroSliderOptions } from '#hero/types'
import { formatTime } from '#hero/utils'

// Objects handed to the sliders live here, not inline in the template: this
// page re-renders a few times a second (live readout), and a fresh literal on
// every render would re-render the sliders with it.
const NO_PATTERNS: OverlayPattern[] = []
const UI: HeroSliderUI = { root: 'rounded-2xl overflow-hidden' }

/** Pretty-print an options object as JS for the code samples. */
const toJs = (value: unknown) => JSON.stringify(value, null, 2)
  .replace(/"(\w+)":/g, '$1:')
  .replace(/\[\s*([^\]]*?)\s*\]/g, (_, items: string) => `[${items.split(/,\s*/).join(', ')}]`)

// ─── 1. Video backgrounds — controlled, with a live readout ───
const bgRef = useTemplateRef<HTMLElement>('bgRef')
const bgSlides: HeroSlide[] = [
  {
    bgSrc: VIDEOS.oceans.src, poster: VIDEOS.oceans.poster,
    eyebrow: 'mp4 · pauseUntilVideoEnds',
    title: 'Plays to the end',
    description: 'Autoplay holds while this clip plays. When it ends the timer restarts, so the slide still gets its full delay before moving on.',
    config: { pauseUntilVideoEnds: true },
  },
  {
    bgSrc: VIDEOS.bunny.src, poster: VIDEOS.bunny.poster,
    eyebrow: 'HLS · .m3u8',
    title: 'Adaptive streaming',
    description: 'Streams through hls.js, which loads only when an HLS slide renders (Safari plays it natively). The autoplay timer keeps ticking while it plays.',
  },
  {
    bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster,
    eyebrow: 'mp4 · videoLoop',
    title: 'Seamless loop',
    description: 'A looping video never ends, so pauseUntilVideoEnds has no effect here. The slide advances on its autoplay delay.',
    config: { videoLoop: true },
  },
]
const bg = useHeroSlider(bgRef, bgSlides, {
  swiperOptions: { effect: 'fade', speed: 800, autoplay: { delay: 8000 } },
})

// Rounded so the readout re-renders once per percent, not every frame.
const autoplayPct = computed(() => Math.round(bg.autoplayProgress.value * 100))
const autoplayState = computed(() => {
  if (bg.autoplayPaused.value) return 'paused (API)'
  return bg.autoplayRunning.value ? 'running' : 'held (hover, focus, video or offscreen)'
})

type LogEntry = { id: number, kind: 'change' | 'ended', text: string }
const log = ref<LogEntry[]>([])
let logId = 0
function pushLog(kind: LogEntry['kind'], text: string) {
  log.value = [{ id: ++logId, kind, text }, ...log.value].slice(0, 6)
}
function onBgChange({ index, previousIndex, direction }: HeroSlideChange) {
  pushLog('change', `slide ${previousIndex + 1} → ${index + 1} (${direction})`)
}
function onBgEnded(index: number) {
  pushLog('ended', `slide ${index + 1}: video ended`)
}

const bgCode = `// nuxt.config.ts
hero: { features: { video: true, hls: true } }

const slides: HeroSlide[] = [
  { bgSrc: '/oceans.mp4', poster: '/oceans.jpg', config: { pauseUntilVideoEnds: true } },
  { bgSrc: 'https://…/stream.m3u8', poster: '/stream.jpg' }, // HLS — hls.js loads lazily
  { bgSrc: '/loop.mp4', poster: '/loop.jpg', config: { videoLoop: true } },
]
const hero = useTemplateRef('hero')
const slider = useHeroSlider(hero, slides, {
  swiperOptions: { effect: 'fade', autoplay: { delay: 8000 } },
})
// Live state: slider.videoPlaying, videoCurrentTime, videoDuration, videoEnded,
// autoplayRunning, autoplayPaused, autoplayProgress (0–1)

<HeroSlider ref="hero" :slider="slider" :slides="slides"
  @change="({ index, previousIndex, direction }) => …"
  @video-ended="(index) => …" />`

// ─── 2. Controls — drop-in slider fed a reactive `options` object ───
const controlSlides: HeroSlide[] = [
  {
    bgSrc: VIDEOS.oceans.src, poster: VIDEOS.oceans.poster,
    title: 'Pick your controls',
    description: 'Toggle the parts on the right. The options object is reactive, so the bar updates in place without a remount.',
    config: { pauseUntilVideoEnds: true },
  },
  {
    bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster,
    title: 'Per slide, too',
    description: 'The same videoControls shape is accepted in slide.config to override a single slide.',
    config: { videoLoop: true },
  },
]

const PARTS = [
  { key: 'playButton', label: 'Center play button' },
  { key: 'scrubber', label: 'Scrubber' },
  { key: 'volume', label: 'Volume' },
  { key: 'time', label: 'Time' },
  { key: 'settings', label: 'Speed menu' },
  { key: 'fullscreen', label: 'Fullscreen' },
] as const
type PartKey = typeof PARTS[number]['key']

const RATE_PRESETS: Array<{ label: string, rates: number[] | null }> = [
  { label: 'Default (0.5× – 2×)', rates: null },
  { label: '0.5× · 1× · 2×', rates: [0.5, 1, 2] },
  { label: '1× – 2× in 0.25 steps', rates: [1, 1.25, 1.5, 1.75, 2] },
]

const parts = reactive<Record<PartKey, boolean>>({
  playButton: true, scrubber: true, volume: true, time: true, settings: true, fullscreen: true,
})
const ratePreset = ref(0)
const showVideoControls = ref(true)
const showAutoplayToggle = ref(true)

const videoControls = computed<HeroVideoControlsConfig>(() => {
  const rates = RATE_PRESETS[ratePreset.value]?.rates
  return { ...parts, settings: parts.settings && rates ? { rates } : parts.settings }
})
const controlOptions = computed<UseHeroSliderOptions>(() => ({
  swiperOptions: { autoplay: { delay: 8000 } },
  showVideoControls: showVideoControls.value,
  showAutoplayToggle: showAutoplayToggle.value,
  videoControls: videoControls.value,
}))

const controlsCode = computed(() => `// Pass a computed / reactive object — changes apply live.
const options = computed(() => (${toJs({
  showVideoControls: showVideoControls.value,
  showAutoplayToggle: showAutoplayToggle.value,
  videoControls: videoControls.value,
})}))

<HeroSlider :slides="slides" :options="options" />

// Or per slide:
{ bgSrc: '/clip.mp4', config: { videoControls: { volume: false } } }`)

// ─── 3. Watch mode ───
const IDLE_CHOICES = [2000, 5000, 10000]
const idleMs = ref(5000)
const watchSlides: HeroSlide[] = [
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, title: 'Lean back', config: { videoLoop: true } },
  { bgSrc: VIDEOS.oceans.src, poster: VIDEOS.oceans.poster, title: 'Just the picture' },
]
const watchOptions = computed<UseHeroSliderOptions>(() => ({
  // No autoplay — this one is for watching.
  swiperOptions: { effect: 'fade', speed: 700, autoplay: false },
  watchMode: true,
  watchIdleMs: idleMs.value,
}))
const watchCode = computed(() => `<HeroSlider :slides="slides"
  :options="{ watchMode: true, watchIdleMs: ${idleMs.value} }" />

// Or only on some slides:
{ bgSrc: '/film.mp4', config: { watchMode: true, watchIdleMs: ${idleMs.value} } }`)
</script>

<template>
  <DemoPage title="Video"
    description="Video backgrounds are just slides whose bgSrc is a video (mp4, webm, mov, ogg) or an HLS stream (.m3u8). They autoplay muted, pause when their slide leaves, and come with a default controls bar you can trim, retune or hide."
    :features="['features.video', 'features.hls', 'pauseUntilVideoEnds', 'videoLoop', 'videoControls', 'showVideoControls', 'showAutoplayToggle', 'watchMode', '@video-ended']">
    <!-- ─── 1. Video backgrounds ─── -->
    <DemoSection title="Video backgrounds"
      hint="Three behaviours side by side: wait for the end, adaptive HLS, and a loop. The readout reads the composable's live state; the log is fed by @change and @video-ended. Hovering the slider holds the autoplay timer."
      :code="bgCode">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <HeroSlider ref="bgRef" :slider="bg" :slides="bgSlides" :overlay-patterns="NO_PATTERNS" :ui="UI"
          class="h-[30rem]" @change="onBgChange" @video-ended="onBgEnded">
          <template #slide="{ slide }">
            <div class="flex size-full items-end bg-linear-to-t from-black/75 via-black/25 to-transparent px-14 pb-28 pt-10 text-white sm:px-20">
              <div class="max-w-lg">
                <p data-hero-animate="fade-down" class="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                  {{ slide.eyebrow }}
                </p>
                <h3 data-hero-animate="clip-up" class="mt-2 text-3xl font-bold sm:text-4xl">{{ slide.title }}</h3>
                <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/85 sm:text-base">{{ slide.description }}</p>
              </div>
            </div>
          </template>
        </HeroSlider>

        <div class="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div class="demo-card">
            <p class="demo-card-title">Live state</p>
            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt class="text-black/60 dark:text-white/60">Active</dt>
              <dd class="truncate font-medium">{{ bg.activeIndex.value + 1 }} / {{ bgSlides.length }} · {{ bg.activeSlide.value.title }}</dd>
              <dt class="text-black/60 dark:text-white/60">Playing</dt>
              <dd class="font-medium">{{ bg.videoPlaying.value ? 'yes' : 'no' }}{{ bg.videoWaiting.value ? ' (buffering)' : '' }}</dd>
              <dt class="text-black/60 dark:text-white/60">Time</dt>
              <dd class="font-mono tabular-nums">{{ formatTime(bg.videoCurrentTime.value) }} / {{ formatTime(bg.videoDuration.value) }}</dd>
              <dt class="text-black/60 dark:text-white/60">Ended</dt>
              <dd class="font-medium">{{ bg.videoEnded.value ? 'yes' : 'no' }}</dd>
              <dt class="text-black/60 dark:text-white/60">Autoplay</dt>
              <dd class="font-medium">{{ autoplayState }}</dd>
              <dt class="text-black/60 dark:text-white/60">Progress</dt>
              <dd class="flex items-center gap-2">
                <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                  <span class="block h-full rounded-full bg-black dark:bg-white" :style="{ width: `${autoplayPct}%` }" />
                </span>
                <span class="w-8 text-right font-mono tabular-nums">{{ autoplayPct }}%</span>
              </dd>
            </dl>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <button type="button" class="demo-btn demo-btn--tiny" @click="bg.prev()">Prev</button>
              <button type="button" class="demo-btn demo-btn--tiny" @click="bg.videoToggle()">
                {{ bg.videoPlaying.value ? 'Pause video' : 'Play video' }}
              </button>
              <button type="button" class="demo-btn demo-btn--tiny" @click="bg.next()">Next</button>
              <button type="button" class="demo-btn demo-btn--tiny"
                @click="bg.autoplayPaused.value ? bg.autoplayResume() : bg.autoplayPause()">
                {{ bg.autoplayPaused.value ? 'Resume autoplay' : 'Pause autoplay' }}
              </button>
            </div>
          </div>

          <div class="demo-card">
            <p class="demo-card-title">Event log</p>
            <ol v-if="log.length" class="space-y-1 font-mono text-[11px]">
              <li v-for="entry in log" :key="entry.id" class="flex items-center gap-2">
                <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                  :class="entry.kind === 'ended'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'">
                  {{ entry.kind }}
                </span>
                <span class="truncate">{{ entry.text }}</span>
              </li>
            </ol>
            <p v-else class="text-xs text-black/50 dark:text-white/50">
              Change slides or let a video finish — events appear here, newest first.
            </p>
          </div>
        </div>
      </div>
    </DemoSection>

    <!-- ─── 2. Controls ─── -->
    <DemoSection title="Controls"
      hint="Each part of the default controls bar can be switched off, and the speed menu takes your own rates. This is a drop-in <HeroSlider> fed a computed options object: options are reactive, so every toggle applies live without remounting."
      :code="controlsCode">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <HeroSlider :slides="controlSlides" :options="controlOptions" :overlay-patterns="NO_PATTERNS" :ui="UI"
          class="h-[26rem]">
          <template #slide="{ slide }">
            <div class="flex size-full items-end bg-linear-to-t from-black/70 to-transparent px-14 pb-28 text-white sm:px-20">
              <div class="max-w-md">
                <h3 data-hero-animate="fade-up" class="text-2xl font-bold sm:text-3xl">{{ slide.title }}</h3>
                <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/85">{{ slide.description }}</p>
              </div>
            </div>
          </template>
        </HeroSlider>

        <div class="demo-card space-y-4">
          <fieldset>
            <legend class="demo-card-title">videoControls</legend>
            <div class="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <label v-for="p in PARTS" :key="p.key" class="demo-check">
                <input v-model="parts[p.key]" type="checkbox" :disabled="!showVideoControls">
                {{ p.label }}
              </label>
            </div>
          </fieldset>
          <div>
            <label class="demo-label" for="video-rates">Speed menu rates</label>
            <select id="video-rates" v-model="ratePreset" class="demo-field" :disabled="!showVideoControls || !parts.settings">
              <option v-for="(preset, i) in RATE_PRESETS" :key="preset.label" :value="i">{{ preset.label }}</option>
            </select>
          </div>
          <fieldset>
            <legend class="demo-card-title">Slider</legend>
            <div class="space-y-2">
              <label class="demo-check">
                <input v-model="showVideoControls" type="checkbox">
                showVideoControls
              </label>
              <label class="demo-check">
                <input v-model="showAutoplayToggle" type="checkbox">
                showAutoplayToggle
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </DemoSection>

    <!-- ─── 3. Watch mode ─── -->
    <DemoSection title="Watch mode"
      hint="While a video plays, stop moving the mouse: after watchIdleMs the content, arrows and pagination fade and the controls bar slides away. Any mouse move, key press or touch on the page brings them back. Nothing hides while the video is paused."
      :code="watchCode">
      <template #actions>
        <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="watchIdleMs">
          <span class="demo-label mb-0 mr-1">watchIdleMs</span>
          <button v-for="ms in IDLE_CHOICES" :key="ms" type="button" class="demo-btn" :aria-pressed="idleMs === ms"
            @click="idleMs = ms">
            {{ ms / 1000 }}s
          </button>
        </div>
      </template>

      <HeroSlider :slides="watchSlides" :options="watchOptions" :overlay-patterns="NO_PATTERNS" :ui="UI"
        class="h-[28rem]">
        <template #slide="{ slide, videoPlaying }">
          <div class="flex size-full items-center justify-center bg-black/30 px-14 pb-24 text-center text-white sm:px-20">
            <div class="max-w-md">
              <h3 data-hero-animate="clip-up" class="text-3xl font-bold sm:text-4xl">{{ slide.title }}</h3>
              <p data-hero-animate="fade-up" class="mt-3 text-sm text-white/85 sm:text-base">
                {{ videoPlaying
                  ? `Keep still for ${idleMs / 1000}s — this text, the arrows and the controls fade out.`
                  : 'Play the video, then keep still to see watch mode kick in.' }}
              </p>
            </div>
          </div>
        </template>
      </HeroSlider>
    </DemoSection>
  </DemoPage>
</template>
