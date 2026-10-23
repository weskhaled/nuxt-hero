<script setup lang="ts">
import type { HeroSlide, HeroSliderUI, OverlayPattern, OverlayPatternType, UseHeroSliderOptions } from '#hero/types'

// Stable references: inline literals in the template would be new objects on
// every render, and every control below re-renders this page.
const NO_PATTERNS: OverlayPattern[] = []
const ROUNDED: HeroSliderUI = { root: 'rounded-2xl overflow-hidden' }

const valueOf = (e: Event) => (e.target as HTMLInputElement).value
const numberOf = (e: Event) => (e.target as HTMLInputElement).valueAsNumber

// ═══ 1. Design tokens ═══

const tokenSlides: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains), title: 'Mountains',
    text: 'Hover a dot for its thumbnail, or an arrow for a preview of the next slide.' },
  { bgSrc: IMAGES.landscape, thumbSrc: thumb(IMAGES.landscape), title: 'Landscape',
    text: 'Accent, surfaces and rings repaint live. Nothing remounts.' },
  { bgSrc: IMAGES.nebula, thumbSrc: thumb(IMAGES.nebula), title: 'Nebula',
    text: 'The pause button in the corner is sized by --hero-ctrl-size.' },
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, thumbSrc: thumb(VIDEOS.glass.poster), title: 'Video',
    text: 'While a video controls bar shows, the pill rises by --hero-pagination-lift.', config: { videoLoop: true } },
]
const TOKEN_OPTIONS: UseHeroSliderOptions = {
  swiperOptions: { speed: 700, autoplay: { delay: 6000 } },
  showAutoplayToggle: true,
}

type ColorKey = 'primary' | 'onMedia' | 'surface' | 'ring' | 'progressBg' | 'ctrlBg' | 'navColor' | 'navBg' | 'navRing'
type SizeKey = 'dotSize' | 'dotHit' | 'dotRingSize' | 'paginationOffset' | 'paginationLift' | 'ctrlSize' | 'autoplayBarSize' | 'navPreviewWidth'
type ScrimKey = 'default' | 'strong' | 'none'
type TokenName = `--hero-${string}`

interface Rgba { hex: string, alpha: number }
interface ColorField {
  name: TokenName
  /** Offer an opacity slider next to the swatch */
  alpha: boolean
  light: Rgba
  /** Default under `.dark` (only the navigation tokens change) */
  dark?: Rgba
  note: string
}
interface SizeField { name: TokenName, min: number, max: number, step: number, value: number, note: string }

const rgba = (hex: string, alpha = 1): Rgba => ({ hex, alpha })

// Defaults mirror hero.css (`:where(:root)` / `:where(.dark)`). The playground
// has no Nuxt UI, so `--hero-primary` falls back to white.
const COLOR_FIELDS: Record<ColorKey, ColorField> = {
  primary: { name: '--hero-primary', alpha: false, light: rgba('#ffffff'), note: 'Active dot ring, autoplay fill, scrubber, focus rings' },
  onMedia: { name: '--hero-on-media', alpha: false, light: rgba('#ffffff'), note: 'Inactive dots, control icons, time label' },
  surface: { name: '--hero-surface', alpha: true, light: rgba('#000000', 0.35), note: 'Pagination pill background' },
  ring: { name: '--hero-ring', alpha: true, light: rgba('#ffffff', 0.9), note: 'Pill outline and its thumbnail tooltips' },
  progressBg: { name: '--hero-progress-bg', alpha: true, light: rgba('#ffffff', 0.2), note: 'Track behind the autoplay bar and scrubber' },
  ctrlBg: { name: '--hero-ctrl-bg', alpha: true, light: rgba('#ffffff', 0.25), note: 'Filled buttons: autoplay toggle, video bar' },
  navColor: { name: '--hero-nav-color', alpha: false, light: rgba('#000000'), dark: rgba('#ffffff'), note: 'Arrow icon' },
  navBg: { name: '--hero-nav-bg', alpha: true, light: rgba('#ffffff', 0.4), dark: rgba('#000000', 0.4), note: 'Arrow background' },
  navRing: { name: '--hero-nav-ring', alpha: true, light: rgba('#ffffff'), dark: rgba('#000000'), note: 'Arrow outline' },
}

const SIZE_FIELDS: Record<SizeKey, SizeField> = {
  dotSize: { name: '--hero-dot-size', min: 0.25, max: 1.25, step: 0.0625, value: 0.625, note: 'Inactive dot (touch default 0.75rem)' },
  dotHit: { name: '--hero-dot-hit', min: 0.75, max: 2.5, step: 0.125, value: 1, note: 'Clickable area per dot (touch default 2rem)' },
  dotRingSize: { name: '--hero-dot-ring-size', min: 0.5, max: 1.5, step: 0.0625, value: 0.75, note: 'The active dot\'s progress ring' },
  paginationOffset: { name: '--hero-pagination-offset', min: 0, max: 3, step: 0.125, value: 1, note: 'Pill and pause button distance from the edge' },
  paginationLift: { name: '--hero-pagination-lift', min: 3, max: 8, step: 0.25, value: 4.75, note: 'Only while video controls show: go to slide 4' },
  ctrlSize: { name: '--hero-ctrl-size', min: 1.5, max: 3.5, step: 0.125, value: 2, note: 'Pause button, video bar buttons (touch default 2.5rem)' },
  autoplayBarSize: { name: '--hero-autoplay-bar-size', min: 0.0625, max: 1, step: 0.0625, value: 0.25, note: 'Autoplay bar thickness' },
  navPreviewWidth: { name: '--hero-nav-preview-width', min: 5, max: 16, step: 0.5, value: 9, note: 'Thumbnail an arrow reveals on hover (horizontal sliders)' },
}

const SCRIM_KEYS: ScrimKey[] = ['default', 'strong', 'none']
const SCRIMS: Record<ScrimKey, string> = {
  default: '0rem -8rem 8rem -6rem rgb(0 0 0) inset',
  strong: '0 -14rem 12rem -8rem rgb(0 0 0 / 0.9) inset',
  none: 'none',
}

const CARDS: Array<{ title: string, colors: ColorKey[], sizes: SizeKey[], scrim?: boolean }> = [
  { title: 'Colors', colors: ['primary', 'onMedia', 'surface', 'ring', 'progressBg'], sizes: [] },
  { title: 'Pagination', colors: [], sizes: ['dotSize', 'dotHit', 'dotRingSize', 'paginationOffset', 'paginationLift'] },
  { title: 'Navigation', colors: ['navColor', 'navBg', 'navRing'], sizes: ['navPreviewWidth'] },
  { title: 'Controls & scrim', colors: ['ctrlBg'], sizes: ['ctrlSize', 'autoplayBarSize'], scrim: true },
]

// Only overridden tokens live here; everything else shows its default.
const colors = ref<Partial<Record<ColorKey, Rgba>>>({})
const sizes = ref<Partial<Record<SizeKey, number>>>({})
const scrim = ref<ScrimKey>('default')
const activeTheme = ref<string | null>(null)

// `unknown` until color-mode resolves on the client, so SSR and hydration
// agree on the light defaults.
const colorMode = useColorMode()
const isDark = computed(() => !colorMode.unknown && colorMode.value === 'dark')

function colorOf(key: ColorKey): Rgba {
  const field = COLOR_FIELDS[key]
  return colors.value[key] ?? (isDark.value && field.dark ? field.dark : field.light)
}
function sizeOf(key: SizeKey): number {
  return sizes.value[key] ?? SIZE_FIELDS[key].value
}
function setColor(key: ColorKey, patch: Partial<Rgba>) {
  colors.value = { ...colors.value, [key]: { ...colorOf(key), ...patch } }
  activeTheme.value = null
}
function setSize(key: SizeKey, value: number) {
  sizes.value = { ...sizes.value, [key]: value }
  activeTheme.value = null
}
function setScrim(value: ScrimKey) {
  scrim.value = value
  activeTheme.value = null
}

function formatColor({ hex, alpha }: Rgba): string {
  if (alpha >= 1) return hex
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${Math.round(alpha * 100) / 100})`
}
const rem = (value: number) => `${Math.round(value * 10000) / 10000}rem`

const tokenEntries = computed(() => {
  const out: Array<[TokenName, string]> = []
  for (const key of Object.keys(COLOR_FIELDS) as ColorKey[]) {
    const value = colors.value[key]
    if (value) out.push([COLOR_FIELDS[key].name, formatColor(value)])
  }
  for (const key of Object.keys(SIZE_FIELDS) as SizeKey[]) {
    const value = sizes.value[key]
    if (value !== undefined) out.push([SIZE_FIELDS[key].name, rem(value)])
  }
  if (scrim.value !== 'default') out.push(['--hero-scrim', SCRIMS[scrim.value]])
  return out
})
// Bound to the slider's `:style` — custom properties on the element itself,
// so they also beat the touch-size defaults hero.css sets on `.hero-slider`.
const tokenStyle = computed(() => Object.fromEntries(tokenEntries.value) as Record<TokenName, string>)
const tokenCss = computed(() => {
  const body = tokenEntries.value.length
    ? tokenEntries.value.map(([name, value]) => `  ${name}: ${value};`).join('\n')
    : '  /* all defaults: pick a preset or move a control */'
  return `/* <HeroSlider class="my-hero" … /> */\n.my-hero {\n${body}\n}`
})

interface Theme {
  label: string
  swatch: string
  colors: Partial<Record<ColorKey, Rgba>>
  sizes: Partial<Record<SizeKey, number>>
  scrim?: ScrimKey
}
const THEMES: Theme[] = [
  {
    label: 'Brand indigo',
    swatch: '#6366f1',
    colors: {
      primary: rgba('#818cf8'), surface: rgba('#1e1b4b', 0.6), ring: rgba('#a5b4fc', 0.9), progressBg: rgba('#c7d2fe', 0.25),
      ctrlBg: rgba('#4f46e5', 0.6), navColor: rgba('#ffffff'), navBg: rgba('#4f46e5', 0.75), navRing: rgba('#a5b4fc'),
    },
    sizes: { dotRingSize: 0.875, autoplayBarSize: 0.375 },
  },
  {
    label: 'Minimal light',
    swatch: '#f4f4f5',
    colors: {
      primary: rgba('#111827'), onMedia: rgba('#111827'), surface: rgba('#ffffff', 0.85), ring: rgba('#ffffff', 0),
      progressBg: rgba('#ffffff', 0.4), ctrlBg: rgba('#ffffff', 0.85), navColor: rgba('#111827'), navBg: rgba('#ffffff', 0.9),
      navRing: rgba('#ffffff', 0),
    },
    sizes: { dotSize: 0.5, paginationOffset: 1.5, autoplayBarSize: 0.125 },
    scrim: 'none',
  },
  {
    label: 'Bold amber',
    swatch: '#f59e0b',
    colors: {
      primary: rgba('#f59e0b'), surface: rgba('#000000', 0.65), ring: rgba('#f59e0b'), progressBg: rgba('#000000', 0.4),
      ctrlBg: rgba('#f59e0b', 0.9), navColor: rgba('#000000'), navBg: rgba('#f59e0b', 0.95), navRing: rgba('#fbbf24'),
    },
    sizes: { dotSize: 0.75, dotHit: 1.25, dotRingSize: 1.125, ctrlSize: 2.5, paginationOffset: 1.5, autoplayBarSize: 0.5, navPreviewWidth: 12 },
    scrim: 'strong',
  },
  {
    label: 'Frosted glass',
    swatch: '#e0f2fe',
    colors: {
      primary: rgba('#ffffff'), surface: rgba('#ffffff', 0.15), ring: rgba('#ffffff', 0.35), progressBg: rgba('#ffffff', 0.15),
      ctrlBg: rgba('#ffffff', 0.15), navColor: rgba('#ffffff'), navBg: rgba('#ffffff', 0.15), navRing: rgba('#ffffff', 0.35),
    },
    sizes: { dotSize: 0.5, dotRingSize: 0.875 },
  },
]

function applyTheme(theme: Theme) {
  colors.value = { ...theme.colors }
  sizes.value = { ...theme.sizes }
  scrim.value = theme.scrim ?? 'default'
  activeTheme.value = theme.label
}
function resetTokens() {
  colors.value = {}
  sizes.value = {}
  scrim.value = 'default'
  activeTheme.value = null
}

// ═══ 2. `ui` classes ═══

const uiSlides: HeroSlide[] = [
  { bgSrc: IMAGES.valley, title: 'Valley' },
  { bgSrc: IMAGES.waterfall, title: 'Waterfall' },
  { bgSrc: IMAGES.woods, title: 'Woods' },
]

interface UiToggle { key: keyof HeroSliderUI, classes: string, label: string }
// Full class strings so Tailwind's scanner picks them up.
const UI_TOGGLES: UiToggle[] = [
  { key: 'root', classes: 'rounded-3xl overflow-hidden', label: 'Rounded root' },
  { key: 'slide', classes: 'scale-[0.94] rounded-2xl', label: 'Inset card slides (watch a transition)' },
  { key: 'bg', classes: 'grayscale', label: 'Grayscale background layer' },
  { key: 'scrim', classes: 'bg-indigo-950/40', label: 'Tinted scrim' },
  { key: 'content', classes: 'p-6 sm:p-12', label: 'Padded content layer' },
  { key: 'pagination', classes: 'ring-4 ring-amber-400/80 bg-black/60', label: 'Thick amber pill ring' },
  { key: 'navigation', classes: 'opacity-60 hover:opacity-100 [&_.nav-slit-arrow]:rounded-full', label: 'Faded, rounded arrows' },
  { key: 'progress', classes: 'h-1.5 bg-white/10', label: 'Thicker autoplay track' },
  { key: 'progressFill', classes: 'bg-amber-400', label: 'Amber autoplay fill' },
]
const uiOn = reactive<Partial<Record<keyof HeroSliderUI, boolean>>>({ root: true, pagination: true, progress: true, progressFill: true })
const uiClasses = computed<HeroSliderUI>(() => {
  const out: HeroSliderUI = {}
  for (const t of UI_TOGGLES) if (uiOn[t.key]) out[t.key] = t.classes
  return out
})
const uiCode = computed(() => {
  const entries = Object.entries(uiClasses.value)
  if (!entries.length) return '<HeroSlider :slides="slides" />'
  return `<HeroSlider\n  :slides="slides"\n  :ui="{\n${entries.map(([k, v]) => `    ${k}: '${v}',`).join('\n')}\n  }"\n/>`
})

// ═══ 3. Overlay patterns ═══

const patternSlides: HeroSlide[] = [
  { bgSrc: IMAGES.landscape, title: 'Landscape' },
  { bgSrc: IMAGES.store, title: 'Store' },
  { bgSrc: IMAGES.earth, title: 'Earth' },
]
const PATTERN_TYPES: OverlayPatternType[] = ['lines', 'dots', 'gradient', 'custom']
const CUSTOM_CSS = 'linear-gradient(to top right, rgb(245 158 11 / 0.7), transparent 55%)'
const PATTERN_DEFAULTS: Record<OverlayPatternType, { opacity: number, color: string }> = {
  lines: { opacity: 0.15, color: '#000000' },
  dots: { opacity: 0.35, color: '#ffffff' },
  gradient: { opacity: 0.3, color: '#000000' },
  custom: { opacity: 0.8, color: '#000000' },
}

interface PatternRow { id: number, type: OverlayPatternType, opacity: number, color: string, css: string }
let nextPatternId = 0
const makePattern = (type: OverlayPatternType): PatternRow => ({ id: nextPatternId++, type, css: CUSTOM_CSS, ...PATTERN_DEFAULTS[type] })
const patterns = ref<PatternRow[]>([makePattern('dots'), makePattern('custom')])

// What the slider gets — only the keys each type reads.
const overlayPatterns = computed<OverlayPattern[]>(() => patterns.value.map(({ type, opacity, color, css }) => {
  if (type === 'custom') return { type, opacity, css }
  return { type, opacity, color }
}))
const patternCode = computed(() => {
  if (!overlayPatterns.value.length) return '<!-- [] = no patterns; omit the prop for the default (one faint \'lines\' layer) -->\n<HeroSlider :slides="slides" :overlay-patterns="[]" />'
  const items = overlayPatterns.value.map(p => `    { ${Object.entries(p).map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`).join(', ')} },`)
  return `<HeroSlider\n  :slides="slides"\n  :overlay-patterns="[\n${items.join('\n')}\n  ]"\n/>`
})

// ═══ 4. Styling hooks ═══

const hookSlides: HeroSlide[] = [
  { bgSrc: IMAGES.space, title: 'One' },
  { bgSrc: IMAGES.circuit, title: 'Two' },
  { bgSrc: IMAGES.nebula, title: 'Three' },
  { bgSrc: IMAGES.earth, title: 'Four' },
]
const HOOK_OPTIONS: UseHeroSliderOptions = {
  // `data-idle` flips after this long without input — short, so the demo shows it.
  watchIdleMs: 3000,
  swiperOptions: { speed: 650, autoplay: { delay: 5000 } },
  animate: { distance: '2.5rem' },
}

const HOOK_ATTRS = ['data-direction', 'data-idle', 'data-watch-mode', 'data-video-active', 'data-multi-slide'] as const
const HOOKS = [
  { hook: '[data-direction]', values: 'next · prev', when: 'Direction of the latest slide change' },
  { hook: '[data-idle]', values: 'true · false', when: 'No mouse, key or touch input for watchIdleMs (default 10 s)' },
  { hook: '[data-watch-mode]', values: 'true · false', when: 'The active slide has watch mode on' },
  { hook: '[data-video-active]', values: 'true · false', when: 'The active slide has a video background' },
  { hook: '[data-multi-slide]', values: 'present · absent', when: 'More than one slide per view' },
  { hook: '.hero-watch-idle', values: 'class', when: 'Watch mode is hiding the chrome (video playing, user idle)' },
  { hook: '.hero-fs-idle', values: 'class', when: 'Fullscreen and idle (cursor hidden)' },
  { hook: '[data-hero-anim]', values: 'in · out · idle', when: 'On each slide\'s content wrapper: choreography state' },
]

// Mirror the root's attributes into the page (read-only), to show them change.
const hooksWrap = useTemplateRef<HTMLElement>('hooksWrap')
const liveAttrs = ref<Partial<Record<(typeof HOOK_ATTRS)[number], string>>>({})
const liveClasses = ref('')
let observer: MutationObserver | undefined
onMounted(() => {
  const root = hooksWrap.value?.querySelector<HTMLElement>('.hero-slider')
  if (!root) return
  const read = () => {
    liveAttrs.value = Object.fromEntries(HOOK_ATTRS.map(name => [name, root.getAttribute(name) ?? '(absent)']))
    liveClasses.value = ['hero-watch-idle', 'hero-fs-idle'].filter(c => root.classList.contains(c)).join(' ')
  }
  read()
  observer = new MutationObserver(read)
  observer.observe(root, { attributes: true, attributeFilter: [...HOOK_ATTRS, 'class'] })
})
onBeforeUnmount(() => observer?.disconnect())

const hooksCode = `<HeroSlider class="hooks-demo" :slides="slides" :options="{ watchIdleMs: 3000 }">
  <template #slide="{ slide }">
    <div class="hooks-tint">
      <h3 data-hero-animate="slide">{{ slide.title }}</h3>
      <p class="hooks-dir" />
      <span class="hooks-idle">Idle</span>
    </div>
  </template>
</HeroSlider>

<style scoped>
/* The root reflects the slider's state as data attributes — plain CSS reacts. */
.hooks-tint { background-color: rgb(79 70 229 / 0.45); transition: background-color 0.6s ease; }
.hooks-demo[data-direction='prev'] .hooks-tint { background-color: rgb(217 119 6 / 0.45); }

.hooks-dir::after { content: 'data-direction="next"'; }
.hooks-demo[data-direction='prev'] .hooks-dir::after { content: 'data-direction="prev"'; }

.hooks-idle { opacity: 0; transition: opacity 0.3s ease; }
.hooks-demo[data-idle='true'] .hooks-idle { opacity: 1; }
</style>`
</script>

<template>
  <DemoPage title="Theming"
    description="Restyle the chrome at three depths: design tokens (--hero-* custom properties), extra classes on internal elements (ui), and overlay patterns. State-driven CSS hooks onto data attributes on the root."
    :features="['--hero-* tokens', 'ui', 'overlayPatterns', 'cssLayer', 'data-direction', 'data-idle']">
    <!-- ─── 1. Design tokens ─── -->
    <DemoSection title="Design tokens"
      hint="Every color and size of the chrome is a --hero-* custom property. Here they're bound to this one slider's :style; the same pairs work in any stylesheet. The defaults are declared with zero specificity (:where(:root)), so any value you set wins, whatever loads first.">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Preset themes">
          <button v-for="t in THEMES" :key="t.label" type="button" class="demo-btn"
            :aria-pressed="activeTheme === t.label" @click="applyTheme(t)">
            <span class="size-2.5 rounded-full ring-1 ring-black/15 dark:ring-white/25" :style="{ background: t.swatch }" />
            {{ t.label }}
          </button>
          <button type="button" class="demo-btn" @click="resetTokens">Reset</button>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <!-- min-w-0: a Swiper inside a grid item with `min-width: auto` grows without bound. -->
        <div class="min-w-0">
          <HeroSlider class="my-hero h-[22rem] sm:h-[26rem]" :style="tokenStyle" :slides="tokenSlides"
            :options="TOKEN_OPTIONS" :overlay-patterns="NO_PATTERNS" :parallax="false" :ui="ROUNDED">
            <template #slide="{ slide, index, isVideo }">
              <div class="flex size-full items-end bg-linear-to-t from-black/60 via-black/10 to-transparent px-6 pt-6 text-white sm:px-14"
                :class="isVideo ? 'pb-28 sm:pb-32' : 'pb-16 sm:pb-20'">
                <div class="max-w-md">
                  <p data-hero-animate="fade-up" class="font-mono text-xs tracking-[0.2em] text-white/70">
                    0{{ index + 1 }} / 0{{ tokenSlides.length }}
                  </p>
                  <h3 data-hero-animate="fade-up" class="mt-1 text-3xl font-bold sm:text-4xl">{{ slide.title }}</h3>
                  <p data-hero-animate="fade-up" class="mt-2 text-sm text-white/80">{{ slide.text }}</p>
                </div>
              </div>
            </template>
          </HeroSlider>
        </div>
        <div class="min-w-0 space-y-2">
          <DemoCode :code="tokenCss" />
          <p class="text-xs text-black/60 dark:text-white/60">
            Updates as you edit. Bold token names below are overridden; the rest show their defaults
            (the navigation ones follow the color mode).
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in CARDS" :key="card.title" class="demo-card">
          <h3 class="demo-card-title">{{ card.title }}</h3>

          <div v-for="key in card.colors" :key="key" class="mb-3">
            <div class="demo-label flex flex-wrap items-baseline justify-between gap-x-2">
              <span class="font-mono" :class="{ 'font-bold text-black dark:text-white': colors[key] }">{{ COLOR_FIELDS[key].name }}</span>
              <span class="font-mono tabular-nums">{{ formatColor(colorOf(key)) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input type="color" :value="colorOf(key).hex"
                class="h-7 w-10 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                :aria-label="`${COLOR_FIELDS[key].name} color`" @input="setColor(key, { hex: valueOf($event) })">
              <input v-if="COLOR_FIELDS[key].alpha" type="range" min="0" max="1" step="0.05" :value="colorOf(key).alpha"
                class="w-full accent-current" :aria-label="`${COLOR_FIELDS[key].name} opacity`"
                @input="setColor(key, { alpha: numberOf($event) })">
            </div>
            <p class="mt-1 text-[10px] leading-snug text-black/45 dark:text-white/45">{{ COLOR_FIELDS[key].note }}</p>
          </div>

          <label v-for="key in card.sizes" :key="key" class="mb-3 block">
            <span class="demo-label flex flex-wrap items-baseline justify-between gap-x-2">
              <span class="font-mono" :class="{ 'font-bold text-black dark:text-white': sizes[key] !== undefined }">{{ SIZE_FIELDS[key].name }}</span>
              <span class="font-mono tabular-nums">{{ rem(sizeOf(key)) }}</span>
            </span>
            <input type="range" :min="SIZE_FIELDS[key].min" :max="SIZE_FIELDS[key].max" :step="SIZE_FIELDS[key].step"
              :value="sizeOf(key)" class="w-full accent-current" @input="setSize(key, numberOf($event))">
            <span class="mt-0.5 block text-[10px] leading-snug text-black/45 dark:text-white/45">{{ SIZE_FIELDS[key].note }}</span>
          </label>

          <div v-if="card.scrim">
            <span class="demo-label flex items-baseline justify-between gap-2">
              <span class="font-mono" :class="{ 'font-bold text-black dark:text-white': scrim !== 'default' }">--hero-scrim</span>
              <span>{{ scrim }}</span>
            </span>
            <div class="flex flex-wrap gap-1.5" role="group" aria-label="--hero-scrim">
              <button v-for="s in SCRIM_KEYS" :key="s" type="button"
                class="demo-btn demo-btn--tiny capitalize" :aria-pressed="scrim === s" @click="setScrim(s)">
                {{ s }}
              </button>
            </div>
            <span class="mt-1 block text-[10px] leading-snug text-black/45 dark:text-white/45">
              Bottom inset shadow on every slide (a box-shadow value)
            </span>
          </div>
        </div>
      </div>

      <p class="text-xs text-black/60 dark:text-white/60">
        Touch devices get larger control sizes by default — also at zero specificity, so a size you set (on
        <code class="demo-code">:root</code>, the slider or a class) wins everywhere. To keep the touch bump, set your
        own value inside <code class="demo-code">@media (pointer: coarse)</code> too.
      </p>
    </DemoSection>

    <!-- ─── 2. ui classes ─── -->
    <DemoSection title="ui classes"
      hint="The ui prop adds your classes to internal elements, next to the built-in ones. Toggle a key to see what it targets.">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="min-w-0">
          <HeroSlider class="h-80 sm:h-96" :slides="uiSlides" :ui="uiClasses" :overlay-patterns="NO_PATTERNS" :parallax="false">
            <template #slide="{ slide, index }">
              <div class="flex size-full items-end bg-linear-to-t from-black/60 to-transparent px-6 pb-16 pt-6 text-white sm:px-14">
                <div>
                  <p data-hero-animate="fade-up" class="font-mono text-xs tracking-[0.2em] text-white/70">0{{ index + 1 }}</p>
                  <h3 data-hero-animate="fade-up" class="text-3xl font-bold">{{ slide.title }}</h3>
                </div>
              </div>
            </template>
          </HeroSlider>
        </div>
        <div class="min-w-0 space-y-3">
          <div class="demo-card">
            <h3 class="demo-card-title">Keys</h3>
            <label v-for="t in UI_TOGGLES" :key="t.key" class="demo-check mb-2 items-start last:mb-0">
              <input v-model="uiOn[t.key]" type="checkbox" class="mt-0.5">
              <span class="min-w-0">
                <span class="font-mono font-semibold">{{ t.key }}</span>
                <span class="text-black/60 dark:text-white/60"> · {{ t.label }}</span>
                <span class="block break-all font-mono text-[10px] text-black/45 dark:text-white/45">{{ t.classes }}</span>
              </span>
            </label>
          </div>
          <DemoCode :code="uiCode" />
        </div>
      </div>
      <p class="max-w-3xl text-xs text-black/60 dark:text-white/60">
        Why the utilities win: the playground sets <code class="demo-code">hero: { cssLayer: true }</code>, which loads
        Swiper's CSS and hero.css into the cascade layers <code class="demo-code">hero-vendor</code> and
        <code class="demo-code">hero</code>, declared before Tailwind's. A later layer beats an earlier one, so
        <code class="demo-code">h-1.5</code> overrides the bar's token height and <code class="demo-code">ring-4</code>
        the pill's ring. Without layers, Tailwind v4 utilities (layered) lose to the unlayered shipped CSS wherever
        both set the same property. Details: docs/theming.md, "Cascade layers".
      </p>
    </DemoSection>

    <!-- ─── 3. Overlay patterns ─── -->
    <DemoSection title="Overlay patterns"
      hint="overlayPatterns stacks layers over the background, under the content, in order. gradient is a blue radial glow, or a vignette in its color when you set one; custom takes any CSS background-image. Omit the prop for the default (one faint lines layer); pass [] for none.">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Add a pattern">
          <button v-for="t in PATTERN_TYPES" :key="t" type="button" class="demo-btn" @click="patterns.push(makePattern(t))">
            + {{ t }}
          </button>
          <button type="button" class="demo-btn" :disabled="!patterns.length" @click="patterns = []">Clear</button>
        </div>
      </template>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="min-w-0">
          <HeroSlider class="h-80 sm:h-96" :slides="patternSlides" :overlay-patterns="overlayPatterns"
            :ui="ROUNDED" :parallax="false">
            <template #slide="{ slide }">
              <div class="flex size-full items-end px-6 pb-16 pt-6 text-white sm:px-14">
                <div class="rounded-lg bg-black/45 px-4 py-2 backdrop-blur-sm">
                  <p class="text-xs text-white/70">{{ overlayPatterns.length }} pattern{{ overlayPatterns.length === 1 ? '' : 's' }}</p>
                  <h3 class="text-2xl font-bold">{{ slide.title }}</h3>
                </div>
              </div>
            </template>
          </HeroSlider>
        </div>
        <div class="min-w-0 space-y-3">
          <ol v-if="patterns.length" class="space-y-2">
            <li v-for="(p, i) in patterns" :key="p.id" class="demo-card p-3">
              <div class="flex items-center gap-2">
                <span class="font-mono text-[11px] text-black/45 dark:text-white/45">{{ i + 1 }}</span>
                <select v-model="p.type" class="demo-field w-auto" :aria-label="`Pattern ${i + 1} type`">
                  <option v-for="t in PATTERN_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
                <input v-if="p.type !== 'custom'" v-model="p.color" type="color"
                  class="h-7 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" :aria-label="`Pattern ${i + 1} color`">
                <button type="button" class="demo-btn demo-btn--tiny ms-auto" :aria-label="`Remove pattern ${i + 1}`"
                  @click="patterns.splice(i, 1)">
                  Remove
                </button>
              </div>
              <label class="mt-2 block">
                <span class="demo-label flex justify-between"><span>opacity</span><span class="tabular-nums">{{ p.opacity }}</span></span>
                <input v-model.number="p.opacity" type="range" min="0" max="1" step="0.05" class="w-full accent-current">
              </label>
              <label v-if="p.type === 'custom'" class="mt-1 block">
                <span class="demo-label">css (a background-image value)</span>
                <input v-model="p.css" type="text" spellcheck="false" class="demo-field font-mono">
              </label>
              <p v-else-if="p.type === 'gradient'" class="mt-1 text-[10px] text-black/45 dark:text-white/45">
                A vignette in the chosen color (omit color for the default blue glow).
              </p>
            </li>
          </ol>
          <p v-else class="demo-card text-xs text-black/60 dark:text-white/60">No patterns. Add one above.</p>
          <DemoCode :code="patternCode" />
        </div>
      </div>
    </DemoSection>

    <!-- ─── 4. Styling hooks ─── -->
    <DemoSection title="Styling hooks" :code="hooksCode"
      hint="The root reflects the slider's state as data attributes and classes, so plain CSS can react to it. Here a scoped style tints the slides by data-direction and shows a badge once data-idle turns true (3 s without input).">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div ref="hooksWrap" class="min-w-0">
          <HeroSlider class="hooks-demo h-80" :slides="hookSlides" :options="HOOK_OPTIONS"
            :overlay-patterns="NO_PATTERNS" :parallax="false" :ui="ROUNDED">
            <template #slide="{ slide }">
              <div class="hooks-tint flex size-full flex-col items-center justify-center px-14 text-center text-white">
                <p class="text-xs uppercase tracking-[0.3em] text-white/70">Arrived going</p>
                <h3 data-hero-animate="slide" class="mt-2 text-5xl font-bold">{{ slide.title }}</h3>
                <p class="hooks-dir mt-3 rounded-md bg-black/30 px-2 py-1 font-mono text-xs" />
                <span class="hooks-idle mt-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                  data-idle="true": move the pointer
                </span>
              </div>
            </template>
          </HeroSlider>
        </div>
        <div class="demo-card min-w-0">
          <h3 class="demo-card-title">Root, live</h3>
          <dl class="space-y-1.5 font-mono text-[11px]">
            <div v-for="name in HOOK_ATTRS" :key="name" class="flex justify-between gap-3">
              <dt class="text-black/60 dark:text-white/60">{{ name }}</dt>
              <dd>{{ liveAttrs[name] ?? '…' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-black/60 dark:text-white/60">idle classes</dt>
              <dd>{{ liveClasses || 'none' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="demo-card overflow-x-auto">
        <table class="w-full min-w-[34rem] text-left text-xs">
          <thead class="text-black/60 dark:text-white/60">
            <tr>
              <th class="pb-2 pr-4 font-medium">Hook</th>
              <th class="pb-2 pr-4 font-medium">Values</th>
              <th class="pb-2 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in HOOKS" :key="h.hook" class="border-t border-black/5 dark:border-white/10">
              <td class="py-1.5 pr-4"><code class="demo-code whitespace-nowrap">{{ h.hook }}</code></td>
              <td class="py-1.5 pr-4 whitespace-nowrap font-mono text-[11px]">{{ h.values }}</td>
              <td class="py-1.5">{{ h.when }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
/* Section 4: styling driven only by the root's data attributes. Slot content
   is compiled here, so it carries this page's scope id. */
.hooks-tint {
  background-color: rgb(79 70 229 / 0.45);
  transition: background-color 0.6s ease;
}
.hooks-demo[data-direction='prev'] .hooks-tint {
  background-color: rgb(217 119 6 / 0.45);
}

.hooks-dir::after { content: 'data-direction="next"'; }
.hooks-demo[data-direction='prev'] .hooks-dir::after { content: 'data-direction="prev"'; }

.hooks-idle {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.hooks-demo[data-idle='true'] .hooks-idle {
  opacity: 1;
}
</style>
