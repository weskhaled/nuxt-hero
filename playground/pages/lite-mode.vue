<script setup lang="ts">
import type { HeroEnvironment, HeroSlide, UseHeroSliderOptions } from '#hero/types'

const env = useHeroEnvironment()

const FEATURES = ['dataSaver', 'useHeroEnvironment()', 'imageSizes', 'imagePreset', '--hero-ctrl-size', '@media (pointer: coarse)']

// ─── 1. Data saver ───
type SaverMode = 'auto' | 'on' | 'off'
const SAVER_MODES: Array<{ value: SaverMode, prop: 'auto' | boolean, label: string, hint: string }> = [
  { value: 'auto', prop: 'auto', label: '\'auto\'', hint: 'follow the environment' },
  { value: 'on', prop: true, label: 'true', hint: 'always lite' },
  { value: 'off', prop: false, label: 'false', hint: 'never lite' },
]
const saverMode = ref<SaverMode>('auto')
const saverProp = computed(() => SAVER_MODES.find(m => m.value === saverMode.value)!.prop)
const liteActive = computed(() => saverProp.value === 'auto' ? env.prefersDataSaver.value : saverProp.value)

const SAVER_HINT = 'In lite mode video backgrounds don\'t autoplay or preload — the poster shows, tap to play — and scroll parallax is skipped. The prop is reactive (the parallax layer and the next video slide to activate follow it live), but a video already on screen keeps its playback state: autoplay is decided when a slide becomes active. So this demo remounts the slider (:key) per mode, to start each one clean.'

const saverSlides: HeroSlide[] = [
  { bgSrc: VIDEOS.oceans.src, poster: VIDEOS.oceans.poster, thumbSrc: thumb(VIDEOS.oceans.poster), title: 'Oceans', eyebrow: 'Video background' },
  { bgSrc: IMAGES.earth, thumbSrc: thumb(IMAGES.earth), title: 'Earth', eyebrow: 'Image' },
  { bgSrc: IMAGES.nebula, thumbSrc: thumb(IMAGES.nebula), title: 'Nebula', eyebrow: 'Image' },
]
// No autoplay: the video slide stays put while you compare modes.
const saverOptions: UseHeroSliderOptions = { swiperOptions: { autoplay: false } }

const READY_STATES = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA']
const saverStage = useTemplateRef<HTMLElement>('saverStage')
const saverProbe = reactive({
  video: false,
  preload: '',
  readyState: 0,
  playing: false,
  buffered: 0,
  /** Inline offset the parallax layer writes on the first background (null = untouched) */
  parallaxY: null as number | null,
})

function sampleSaver() {
  const root = saverStage.value
  const video = root?.querySelector('video')
  saverProbe.video = !!video
  if (video) {
    saverProbe.preload = video.getAttribute('preload') ?? ''
    saverProbe.readyState = video.readyState
    saverProbe.playing = !video.paused
    saverProbe.buffered = video.buffered.length ? Math.round(video.buffered.end(video.buffered.length - 1)) : 0
  }
  const bg = root?.querySelector<HTMLElement>('.hero-slide-bg')
  const match = bg?.style.transform.match(/translate3d\([^,]+,\s*(-?[\d.]+)px/)
  saverProbe.parallaxY = match ? Math.round(Number(match[1])) : null
}

const saverCode = computed(() => `<!-- 'auto' (default) follows useHeroEnvironment().prefersDataSaver -->
<HeroSlider :slides="slides" :data-saver="${saverProp.value === 'auto' ? '\'auto\'' : saverProp.value}" />`)

// ─── 2. Environment ───
const ENV_FIELDS: Array<{ key: keyof HeroEnvironment, source: string, meaning: string }> = [
  { key: 'mounted', source: 'onMounted', meaning: 'True once mounted on the client. Every other signal reads false / \'\' on the server and during the first client render, so driving markup with them never causes a hydration mismatch.' },
  { key: 'reducedMotion', source: '(prefers-reduced-motion: reduce)', meaning: 'The OS "reduce motion" setting. Also skips scroll parallax and shortens content animations.' },
  { key: 'reducedData', source: '(prefers-reduced-data: reduce)', meaning: 'The user asked sites to use less data. Experimental media feature — few browsers support it yet.' },
  { key: 'coarsePointer', source: '(pointer: coarse)', meaning: 'The primary input is touch — the slider\'s controls grow (see Touch targets).' },
  { key: 'saveData', source: 'navigator.connection.saveData', meaning: 'The browser\'s data-saver mode is on (sent as the Save-Data header too).' },
  { key: 'slowConnection', source: 'effectiveType is \'2g\' / \'slow-2g\'', meaning: 'The browser estimates a slow connection.' },
  { key: 'effectiveType', source: 'navigator.connection.effectiveType', meaning: 'Raw estimate (\'4g\', \'3g\', …). \'\' where the Network Information API is unavailable — it is Chromium-only.' },
  { key: 'prefersDataSaver', source: 'saveData || reducedData || slowConnection', meaning: 'Data- or battery-constrained client: what dataSaver: \'auto\' follows to switch lite mode on.' },
]
const envRows = computed(() => ENV_FIELDS.map(f => ({ ...f, value: env[f.key].value })))

const envCode = `const env = useHeroEnvironment()

// Same signals the slider uses — adapt your own slot content with them
<HeavyEmbed v-if="!env.prefersDataSaver.value" />
<img v-else :src="staticPreview" alt="">`

// ─── 3. Responsive images ───
// @nuxt/image's default screens: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
const KEYED_SIZES = 'sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw'
const SIZES_MODES = [
  { value: '', label: '\'\' (default)' },
  { value: '100vw', label: '\'100vw\'' },
  { value: KEYED_SIZES, label: '\'sm:100vw … 2xl:100vw\'' },
]
const imageSizes = ref('100vw')
const imageSlides: HeroSlide[] = [
  { bgSrc: IMAGES.landscape, title: 'Landscape' },
  { bgSrc: IMAGES.valley, title: 'Valley' },
  { bgSrc: IMAGES.woods, title: 'Woods' },
]

const imageStage = useTemplateRef<HTMLElement>('imageStage')
const imgProbe = reactive({ src: '', sizes: '', srcset: '', currentSrc: '' })
function sampleImage() {
  const img = imageStage.value?.querySelector<HTMLImageElement>('img.hero-slide-img')
  imgProbe.src = img?.getAttribute('src') ?? ''
  imgProbe.sizes = img?.getAttribute('sizes') ?? ''
  imgProbe.srcset = img?.getAttribute('srcset') ?? ''
  imgProbe.currentSrc = img?.currentSrc ?? ''
}
const candidates = computed(() => imgProbe.srcset
  ? imgProbe.srcset.split(/,\s+/).map((c) => {
      const [url = '', descriptor = ''] = c.trim().split(/\s+/)
      return { url, descriptor }
    })
  : [])
const distinctUrls = computed(() => new Set(candidates.value.map(c => c.url)).size)
const degenerateSrcset = computed(() => candidates.value.length > 1 && distinctUrls.value === 1)
/** Width descriptors of a few pixels — what a bare '100vw' produces */
const tinyWidths = computed(() => {
  const widths = candidates.value.filter(c => c.descriptor.endsWith('w')).map(c => Number.parseInt(c.descriptor))
  return widths.length > 0 && Math.max(...widths) < 100
})

const imageCode = `// nuxt.config.ts
image: {
  // IPX only transforms remote images from listed hosts
  domains: ['images.unsplash.com'],
  // imagePreset needs a matching entry — unknown names throw
  presets: { hero: { modifiers: { format: 'webp', quality: 70 } } },
}

<!-- @nuxt/image's sizes DSL, not CSS sizes. Key it per breakpoint: a bare
     '100vw' is read as the size for a 1px screen (srcset 1w, 2w). -->
<HeroSlider
  :slides="slides"
  image-sizes="sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
  image-preset="hero"
/>`

// ─── 4. Touch targets ───
const COARSE_TOKENS = {
  '--hero-ctrl-size': '2.5rem',
  '--hero-play-size': '3.5rem',
  '--hero-dot-size': '0.75rem',
  '--hero-dot-hit': '2rem',
}
type TouchProbeKey = 'toggle' | 'play' | 'dot' | 'dotHit'
const TOKENS: Array<{ name: keyof typeof COARSE_TOKENS, fine: string, target: string, probe: TouchProbeKey }> = [
  { name: '--hero-ctrl-size', fine: '2rem', target: 'Autoplay toggle, video-bar buttons', probe: 'toggle' },
  { name: '--hero-play-size', fine: '3rem', target: 'Center play button (video slide)', probe: 'play' },
  { name: '--hero-dot-size', fine: '0.625rem', target: 'Pagination dot', probe: 'dot' },
  { name: '--hero-dot-hit', fine: '1rem', target: 'Dot button (hit area)', probe: 'dotHit' },
]
const simulateCoarse = ref(false)

const touchSlides: HeroSlide[] = [
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, thumbSrc: thumb(VIDEOS.glass.poster), title: 'Glass' },
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains), title: 'Mountains' },
  { bgSrc: IMAGES.forest, thumbSrc: thumb(IMAGES.forest), title: 'Forest' },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall), title: 'Waterfall' },
]
const touchOptions: UseHeroSliderOptions = { showAutoplayToggle: true, swiperOptions: { autoplay: { delay: 10000 } } }

const touchStage = useTemplateRef<HTMLElement>('touchStage')
const touchProbe = reactive<Record<TouchProbeKey, string>>({ toggle: '—', play: '—', dot: '—', dotHit: '—' })
function sizeOf(el: Element | null | undefined): string {
  if (!el) return '—'
  const r = el.getBoundingClientRect()
  return `${Math.round(r.width)} × ${Math.round(r.height)} px`
}
function sampleTouch() {
  const root = touchStage.value
  touchProbe.toggle = sizeOf(root?.querySelector('.hero-autoplay-toggle'))
  touchProbe.play = sizeOf(root?.querySelector('.swiper-slide-active .hero-play-center-btn'))
  touchProbe.dot = sizeOf(root?.querySelector('.hero-dot'))
  touchProbe.dotHit = sizeOf(root?.querySelector('.hero-page-btn'))
}

const TOUCH_HINT = 'On touch-primary devices hero.css bumps the control tokens under @media (pointer: coarse) — bigger buttons, and pagination dots on a 2rem hit area (WCAG 2.5.8). The toggle applies the same four values inline, so you can compare on a mouse. (The media query also widens the nav-slit arrows, the dot gap and the scrubber\'s hit area; those aren\'t tokens, so they aren\'t simulated.)'

const touchCode = `/* hero.css — applied automatically on touch-primary devices.
   :where() keeps it zero-specificity: your own .hero-slider { --hero-… } wins. */
@media (pointer: coarse) {
  :where(.hero-slider) {
    --hero-ctrl-size: 2.5rem;
    --hero-play-size: 3.5rem;
    --hero-dot-size: 0.75rem;
    --hero-dot-hit: 2rem;
  }
}

<!-- This demo: the same tokens, inline -->
<HeroSlider :slides="slides" :style="simulate ? coarseTokens : undefined" />`

// ─── Live readouts ───
// The video, the controls and the parallax offsets live inside the sliders
// (async components, remounts, scroll), so a light poll keeps the readouts honest.
function sample() {
  sampleSaver()
  sampleImage()
  sampleTouch()
}
let poll: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  sample()
  poll = setInterval(sample, 500)
})
onBeforeUnmount(() => clearInterval(poll))
watch([saverMode, imageSizes, simulateCoarse], sample, { flush: 'post' })
</script>

<template>
  <DemoPage title="Lite mode"
    description="Adapting to constrained phones and PWAs: skip video autoplay, preload and parallax on data-saver clients, read the same environment signals yourself, serve right-sized images, and give touch users bigger targets."
    :features="FEATURES">
    <!-- ─── 1. Data saver ─── -->
    <DemoSection title="Data saver" :hint="SAVER_HINT" :code="saverCode">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="dataSaver">
          <button v-for="m in SAVER_MODES" :key="m.value" type="button" class="demo-btn font-mono"
            :aria-pressed="saverMode === m.value" :title="m.hint" @click="saverMode = m.value">
            {{ m.label }}
          </button>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div ref="saverStage" class="min-w-0">
          <HeroSlider :key="saverMode" :slides="saverSlides" :options="saverOptions" :data-saver="saverProp"
            :overlay-patterns="[]" :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-80 sm:h-96">
            <template #slide="{ slide }">
              <div class="flex size-full items-start bg-linear-to-b from-black/55 to-transparent p-6 text-white sm:p-8">
                <div>
                  <p data-hero-animate="fade-down" class="text-xs uppercase tracking-[0.25em] text-white/70">{{ slide.eyebrow }}</p>
                  <h3 data-hero-animate="fade-down" class="mt-1 text-3xl font-bold">{{ slide.title }}</h3>
                </div>
              </div>
            </template>
          </HeroSlider>
        </div>

        <div class="demo-card">
          <h3 class="demo-card-title">Live readout</h3>
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
            <dt class="text-black/60 dark:text-white/60">Lite mode</dt>
            <dd class="font-semibold">
              {{ liteActive ? 'on' : 'off' }}
              <span v-if="saverMode === 'auto'" class="font-normal text-black/50 dark:text-white/50">
                (auto → prefersDataSaver: {{ env.prefersDataSaver.value }})
              </span>
            </dd>
            <dt class="text-black/60 dark:text-white/60">&lt;video preload&gt;</dt>
            <dd class="font-mono">{{ saverProbe.video ? `"${saverProbe.preload}"` : '…' }}</dd>
            <dt class="text-black/60 dark:text-white/60">readyState</dt>
            <dd class="font-mono">{{ saverProbe.video ? `${saverProbe.readyState} · ${READY_STATES[saverProbe.readyState]}` : '…' }}</dd>
            <dt class="text-black/60 dark:text-white/60">Buffered</dt>
            <dd class="font-mono">{{ saverProbe.buffered }} s</dd>
            <dt class="text-black/60 dark:text-white/60">Playing</dt>
            <dd class="font-mono">{{ saverProbe.playing ? 'yes' : 'no' }}</dd>
            <dt class="text-black/60 dark:text-white/60">Scroll parallax</dt>
            <dd class="font-mono">
              {{ saverProbe.parallaxY === null ? 'not running' : `running · bg ${saverProbe.parallaxY} px` }}
            </dd>
          </dl>
          <p class="mt-4 text-xs text-black/50 dark:text-white/50">
            Lite: <code class="demo-code">preload="none"</code> and readyState stays at HAVE_NOTHING — only the poster
            downloads until you tap play. Parallax also stays off under reduced motion; scroll to watch its offset.
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- ─── 2. Environment ─── -->
    <DemoSection title="Environment"
      hint="useHeroEnvironment() — the reactive, SSR-safe signals dataSaver: 'auto' reads, available to your own components too. Values settle after mount and media queries update live (e.g. toggle reduced motion in your OS, or emulate it in DevTools → Rendering)."
      :code="envCode">
      <div class="demo-card overflow-x-auto p-0">
        <table class="w-full min-w-[40rem] text-left text-xs">
          <thead class="text-black/60 dark:text-white/60">
            <tr class="border-b border-black/5 dark:border-white/10">
              <th scope="col" class="px-4 py-2.5 font-medium">Field</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Value</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Source</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in envRows" :key="row.key" class="border-b border-black/5 align-top last:border-0 dark:border-white/5">
              <td class="whitespace-nowrap px-4 py-2.5 font-mono font-semibold">{{ row.key }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <span class="inline-flex items-center gap-1.5 font-mono">
                  <span class="size-1.5 rounded-full"
                    :class="row.value ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/25'" />
                  {{ typeof row.value === 'string' ? `'${row.value}'` : row.value }}
                </span>
              </td>
              <td class="px-4 py-2.5 font-mono text-black/60 dark:text-white/60">{{ row.source }}</td>
              <td class="px-4 py-2.5 text-black/70 dark:text-white/70">{{ row.meaning }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoSection>

    <!-- ─── 3. Responsive images ─── -->
    <DemoSection title="Responsive images"
      hint="Slide backgrounds render through <NuxtImg> when @nuxt/image is installed. image-sizes hands it a sizes value, and NuxtImg generates the srcset from your screen breakpoints so phones can download a smaller file. Below: the first slide's <img>, read from the DOM."
      :code="imageCode">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="image-sizes">
          <button v-for="m in SIZES_MODES" :key="m.value" type="button" class="demo-btn font-mono"
            :aria-pressed="imageSizes === m.value" @click="imageSizes = m.value">
            {{ m.label }}
          </button>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-2">
        <div ref="imageStage" class="min-w-0">
          <HeroSlider :slides="imageSlides" :image-sizes="imageSizes" :options="{ swiperOptions: { autoplay: { delay: 6000 } } }"
            :overlay-patterns="[]" :parallax="false" :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-72">
            <template #slide="{ slide }">
              <div class="flex size-full items-end p-6 pb-14 text-white">
                <h3 data-hero-animate="fade-up" class="text-2xl font-bold">{{ slide.title }}</h3>
              </div>
            </template>
          </HeroSlider>
        </div>

        <div class="demo-card min-w-0 space-y-3 text-xs">
          <div>
            <span class="demo-label">sizes</span>
            <p class="break-words font-mono text-[11px]">{{ imgProbe.sizes ? `"${imgProbe.sizes}"` : '(none — density srcset: 1x, 2x)' }}</p>
          </div>
          <div>
            <span class="demo-label">srcset — {{ candidates.length }} candidates, {{ distinctUrls }} distinct URL{{ distinctUrls === 1 ? '' : 's' }}</span>
            <ul v-if="candidates.length" class="space-y-1">
              <li v-for="(c, i) in candidates" :key="i" class="flex gap-2 font-mono text-[11px]">
                <span class="w-12 shrink-0 font-semibold">{{ c.descriptor }}</span>
                <span class="min-w-0 break-all text-black/60 dark:text-white/60">{{ c.url }}</span>
              </li>
            </ul>
            <p v-else class="text-black/50 dark:text-white/50">…</p>
          </div>
          <div>
            <span class="demo-label">currentSrc (what the browser picked)</span>
            <p class="break-all font-mono text-[11px] text-black/60 dark:text-white/60">{{ imgProbe.currentSrc || '…' }}</p>
          </div>
          <p v-if="tinyWidths"
            class="rounded-lg bg-amber-500/10 p-2.5 text-amber-900 ring-1 ring-amber-500/25 dark:text-amber-200">
            The widths are a few pixels. With no breakpoint key, @nuxt/image reads a bare
            <code class="demo-code">'100vw'</code> as the size for a 1px-wide screen. It's harmless here only because every
            candidate is the same full-size URL; with a provider that resizes, the browser would download a 2px-wide image.
            Key the size per breakpoint (third option) to get real widths.
          </p>
          <p v-if="degenerateSrcset"
            class="rounded-lg bg-amber-500/10 p-2.5 text-amber-900 ring-1 ring-amber-500/25 dark:text-amber-200">
            Every candidate is the same URL. @nuxt/image's default IPX provider only transforms remote images whose host
            is listed in <code class="demo-code">image.domains</code> — this playground lists none, so the Unsplash URLs
            pass through untouched. Allow the host (or use a provider that resizes, e.g. Cloudinary or imgix) and each
            width gets its own URL.
          </p>
          <p class="text-black/50 dark:text-white/50">
            <code class="demo-code">image-preset</code> isn't set here: this playground's nuxt.config has no
            <code class="demo-code">image.presets</code>, and @nuxt/image throws "Unknown preset" for a name it
            doesn't know. Define one first (see the code).
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- ─── 4. Touch targets ─── -->
    <DemoSection title="Touch targets" :hint="TOUCH_HINT" :code="touchCode">
      <template #actions>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="demo-chip">this device: {{ env.coarsePointer.value ? 'coarse' : 'fine' }} pointer</span>
          <button type="button" class="demo-btn" :aria-pressed="simulateCoarse" @click="simulateCoarse = !simulateCoarse">
            Simulate coarse pointer
          </button>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <!-- Lite mode keeps the video paused, so its play button stays in view. -->
        <div ref="touchStage" class="min-w-0">
          <HeroSlider :slides="touchSlides" :options="touchOptions" :data-saver="true" :parallax="false"
            :overlay-patterns="[]" :ui="{ root: 'rounded-2xl overflow-hidden' }" class="h-80 sm:h-96"
            :style="simulateCoarse ? COARSE_TOKENS : undefined" />
        </div>

        <div class="demo-card overflow-x-auto p-0">
          <table class="w-full text-left text-xs">
            <thead class="text-black/60 dark:text-white/60">
              <tr class="border-b border-black/5 dark:border-white/10">
                <th scope="col" class="px-3 py-2.5 font-medium">Token</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Fine</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Coarse</th>
                <th scope="col" class="px-3 py-2.5 font-medium">Measured</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in TOKENS" :key="t.name" class="border-b border-black/5 align-top last:border-0 dark:border-white/5">
                <td class="px-3 py-2">
                  <code class="font-mono text-[11px]">{{ t.name }}</code>
                  <span class="block text-[10px] text-black/50 dark:text-white/50">{{ t.target }}</span>
                </td>
                <td class="whitespace-nowrap px-3 py-2 font-mono" :class="{ 'font-semibold': !simulateCoarse }">{{ t.fine }}</td>
                <td class="whitespace-nowrap px-3 py-2 font-mono" :class="{ 'font-semibold': simulateCoarse }">{{ COARSE_TOKENS[t.name] }}</td>
                <td class="whitespace-nowrap px-3 py-2 font-mono">{{ touchProbe[t.probe] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>
