<script setup lang="ts">
import type { HeroLabels, HeroSlide, HeroSlideChange, HeroSlideDirection, UseHeroSliderOptions } from '#hero/types'

type Lang = 'en' | 'fr' | 'ar'

interface Locale {
  code: Lang
  /** Endonym shown on the switcher */
  name: string
  dir: 'ltr' | 'rtl'
  /** Every HeroLabels key — `Required` makes the compiler flag a missing one */
  labels: Required<HeroLabels>
  /** Swiper's own A11y module labels each slide too (`swiperOptions.a11y`) */
  slideLabel: string
  eyebrow: string
  cta: string
  slides: Array<{ title: string, description: string }>
}

const LOCALES: Record<Lang, Locale> = {
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    labels: {
      carousel: 'Featured destinations',
      carouselRole: 'carousel',
      slideRole: 'slide',
      prev: 'Previous slide',
      next: 'Next slide',
      play: 'Play video',
      pause: 'Pause video',
      mute: 'Toggle mute',
      volume: 'Volume',
      seek: 'Seek',
      settings: 'Settings',
      speed: 'Playback speed',
      speedNormal: 'Normal',
      pagination: 'Slide pagination',
      goToSlide: 'Go to slide {n} of {total}: {title}',
      autoplayProgress: 'Autoplay progress',
      pauseAutoplay: 'Pause autoplay',
      playAutoplay: 'Play autoplay',
      fullscreenEnter: 'Enter fullscreen',
      fullscreenExit: 'Exit fullscreen',
      videoProgress: 'Video progress',
    },
    slideLabel: '{{index}} of {{slidesLength}}',
    eyebrow: 'Destination',
    cta: 'Explore',
    slides: [
      { title: 'Into the peaks', description: 'Ridge lines above the clouds, best reached at first light.' },
      { title: 'Quiet forests', description: 'Old trees, soft ground and trails that stay cool in summer.' },
      { title: 'Falling water', description: 'A short hike to the falls — bring a jacket for the spray.' },
      { title: 'Motion study', description: 'A looping video slide — its controls are localized too.' },
    ],
  },
  fr: {
    code: 'fr',
    name: 'Français',
    dir: 'ltr',
    labels: {
      carousel: 'Destinations à la une',
      carouselRole: 'carrousel',
      slideRole: 'diapositive',
      prev: 'Diapositive précédente',
      next: 'Diapositive suivante',
      play: 'Lire la vidéo',
      pause: 'Mettre la vidéo en pause',
      mute: 'Activer ou couper le son',
      volume: 'Volume',
      seek: 'Position de lecture',
      settings: 'Paramètres',
      speed: 'Vitesse de lecture',
      speedNormal: 'Normale',
      pagination: 'Pagination des diapositives',
      goToSlide: 'Aller à la diapositive {n} sur {total} : {title}',
      autoplayProgress: 'Progression du défilement automatique',
      pauseAutoplay: 'Mettre en pause le défilement automatique',
      playAutoplay: 'Reprendre le défilement automatique',
      fullscreenEnter: 'Passer en plein écran',
      fullscreenExit: 'Quitter le plein écran',
      videoProgress: 'Progression de la vidéo',
    },
    slideLabel: '{{index}} sur {{slidesLength}}',
    eyebrow: 'Destination',
    cta: 'Découvrir',
    slides: [
      { title: 'Vers les sommets', description: 'Des crêtes au-dessus des nuages, à rejoindre dès l’aube.' },
      { title: 'Forêts paisibles', description: 'De vieux arbres, un sol moelleux et des sentiers frais en été.' },
      { title: 'Chutes d’eau', description: 'Une courte randonnée jusqu’aux chutes — prévoyez une veste.' },
      { title: 'Étude en mouvement', description: 'Une diapositive vidéo en boucle — ses commandes sont traduites aussi.' },
    ],
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    labels: {
      carousel: 'وجهات مميزة',
      carouselRole: 'عارض شرائح',
      slideRole: 'شريحة',
      prev: 'الشريحة السابقة',
      next: 'الشريحة التالية',
      play: 'تشغيل الفيديو',
      pause: 'إيقاف الفيديو مؤقتًا',
      mute: 'كتم الصوت أو إلغاء كتمه',
      volume: 'مستوى الصوت',
      seek: 'موضع التشغيل',
      settings: 'الإعدادات',
      speed: 'سرعة التشغيل',
      speedNormal: 'عادية',
      pagination: 'التنقل بين الشرائح',
      goToSlide: 'الانتقال إلى الشريحة {n} من {total}: {title}',
      autoplayProgress: 'تقدّم التشغيل التلقائي',
      pauseAutoplay: 'إيقاف التشغيل التلقائي مؤقتًا',
      playAutoplay: 'استئناف التشغيل التلقائي',
      fullscreenEnter: 'ملء الشاشة',
      fullscreenExit: 'الخروج من ملء الشاشة',
      videoProgress: 'تقدّم الفيديو',
    },
    slideLabel: '{{index}} من {{slidesLength}}',
    eyebrow: 'الوجهة',
    cta: 'استكشف',
    slides: [
      { title: 'نحو القمم', description: 'خطوط التلال فوق السحاب، وأجمل ما تكون عند أول ضوء.' },
      { title: 'غابات هادئة', description: 'أشجار عتيقة وأرض ناعمة ومسارات تبقى باردة في الصيف.' },
      { title: 'شلالات', description: 'نزهة قصيرة حتى الشلال — لا تنسَ سترة تقيك الرذاذ.' },
      { title: 'دراسة حركة', description: 'شريحة فيديو متكررة — أزرار التحكم فيها مترجمة أيضًا.' },
    ],
  },
}

// Media is shared; only the words change per locale. `thumbSrc` feeds the
// pagination tooltips — and `{title}` in `goToSlide` names the destination.
const MEDIA: HeroSlide[] = [
  { bgSrc: IMAGES.mountains, thumbSrc: thumb(IMAGES.mountains) },
  { bgSrc: IMAGES.forest, thumbSrc: thumb(IMAGES.forest) },
  { bgSrc: IMAGES.waterfall, thumbSrc: thumb(IMAGES.waterfall) },
  { bgSrc: VIDEOS.glass.src, poster: VIDEOS.glass.poster, thumbSrc: thumb(VIDEOS.glass.poster), config: { videoLoop: true } },
]

const FEATURES = ['labels', 'dir="rtl"', 'lang', 'showAutoplayToggle', 'goToSlide {title}', 'data-hero-animate="slide"', 'swiperOptions.a11y']
const SWITCH_HINT = 'Labels and slide content are reactive; direction is not — Swiper reads it once, at init. HeroSlider re-syncs it live when <html dir> changes, but a dir on a local wrapper (used here so the playground itself doesn\'t flip) isn\'t observed, so the slider is remounted with :key on every locale change.'

const lang = ref<Lang>('en')
const locale = computed(() => LOCALES[lang.value])
const slides = computed<HeroSlide[]>(() => MEDIA.map((m, i) => ({ ...m, ...locale.value.slides[i] })))
const options = computed<UseHeroSliderOptions>(() => ({
  showAutoplayToggle: true,
  animate: { distance: '3rem', stagger: 80 },
  swiperOptions: { speed: 700, autoplay: { delay: 6000 }, a11y: { slideLabelMessage: locale.value.slideLabel } },
}))

// What Swiper actually picked up — `rtl` is read once, when it initializes.
const swiperRtl = ref<boolean | null>(null)
const lastDirection = ref<HeroSlideDirection>('next')
function onSwiper(s: { rtl: boolean }) {
  swiperRtl.value = s.rtl
}
function onChange(change: HeroSlideChange) {
  lastDirection.value = change.direction
}
function setLang(code: Lang) {
  if (code === lang.value) return
  swiperRtl.value = null
  lastDirection.value = 'next'
  lang.value = code
}

// ─── Accessible names, read back from the live DOM ───
interface NameRow {
  key: number
  tag: string
  role: string
  roleDescription: string
  label: string
  inert: boolean
}

const IMPLICIT_ROLES: Record<string, string> = { button: 'button', nav: 'navigation', a: 'link', img: 'img', ul: 'list', li: 'listitem' }
function roleOf(el: Element): string {
  const explicit = el.getAttribute('role')
  if (explicit) return explicit
  const tag = el.tagName.toLowerCase()
  if (tag === 'input') return (el as HTMLInputElement).type === 'range' ? 'slider' : 'textbox'
  return IMPLICIT_ROLES[tag] ?? '—'
}

const stage = useTemplateRef<HTMLElement>('stage')
const names = ref<NameRow[]>([])
const inertCount = computed(() => names.value.filter(r => r.inert).length)

function scan() {
  const root = stage.value?.querySelector<HTMLElement>('.hero-slider')
  if (!root) {
    names.value = []
    return
  }
  const els = [root, ...root.querySelectorAll('[aria-label], [aria-roledescription]')]
    .filter(el => el.hasAttribute('aria-label') || el.hasAttribute('aria-roledescription'))
  names.value = els.map((el, key) => ({
    key,
    tag: el.tagName.toLowerCase(),
    role: roleOf(el),
    roleDescription: el.getAttribute('aria-roledescription') ?? '',
    label: el.getAttribute('aria-label') ?? '',
    inert: !!el.closest('[inert]'),
  }))
}

// Re-scan whenever names, roles or inertness change below the stage — the
// remount on a language switch, async controls arriving, slide changes, the
// video controls appearing. (Per-frame progress updates touch none of these.)
let observer: MutationObserver | undefined
let scanTimer: ReturnType<typeof setTimeout> | undefined
function scheduleScan() {
  clearTimeout(scanTimer)
  scanTimer = setTimeout(scan, 60)
}
onMounted(() => {
  scheduleScan()
  if (!stage.value) return
  observer = new MutationObserver(scheduleScan)
  observer.observe(stage.value, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['aria-label', 'aria-roledescription', 'role', 'inert'],
  })
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(scanTimer)
})

// ─── Code samples ───
const labelsCode = computed(() => {
  const l = locale.value.labels
  return `import type { HeroLabels } from '#hero/types'

// One object per locale — any key you omit falls back to English.
const labels: Record<Locale, HeroLabels> = {
  ${lang.value}: {
    carousel: '${l.carousel}',
    carouselRole: '${l.carouselRole}',
    slideRole: '${l.slideRole}',
    prev: '${l.prev}',
    next: '${l.next}',
    goToSlide: '${l.goToSlide}',
    pauseAutoplay: '${l.pauseAutoplay}',
    playAutoplay: '${l.playAutoplay}',
    // …play, pause, mute, volume, seek, settings, speed, speedNormal,
    // pagination, autoplayProgress, fullscreenEnter/Exit, videoProgress
  },
}

<HeroSlider
  :slides="slides"
  :labels="labels[locale]"
  :options="{
    showAutoplayToggle: true,
    // Swiper's A11y module labels each slide as well
    swiperOptions: { a11y: { slideLabelMessage: '${locale.value.slideLabel}' } },
  }"
/>`
})

const dirCode = `<!-- A direction scoped to one part of the page: put dir + lang on a
     wrapper, and remount the slider when they change — Swiper reads the
     direction once, at init. -->
<div :dir="locale === 'ar' ? 'rtl' : 'ltr'" :lang="locale">
  <HeroSlider :key="locale" :slides="slides" :labels="labels[locale]" />
</div>

<!-- App-wide: flip <html dir> instead. HeroSlider watches it and re-syncs
     Swiper live — no remount needed. -->
useHead({ htmlAttrs: { dir: locale === 'ar' ? 'rtl' : 'ltr', lang: locale } })`
</script>

<template>
  <DemoPage title="RTL & i18n"
    description="Every built-in accessible name is a label you can translate, and the slider follows the text direction it renders in — drag, transitions, navigation, pagination, the progress bar and direction-aware content animations all mirror under RTL."
    :features="FEATURES">
    <DemoSection title="Language switch"
      :hint="SWITCH_HINT">
      <template #actions>
        <div class="flex flex-wrap gap-1.5" role="group" aria-label="Language">
          <button v-for="l in LOCALES" :key="l.code" type="button" class="demo-btn" :lang="l.code"
            :aria-pressed="lang === l.code" @click="setLang(l.code)">
            {{ l.name }}
          </button>
        </div>
      </template>

      <div class="flex flex-wrap gap-1.5">
        <span class="demo-chip">dir="{{ locale.dir }}"</span>
        <span class="demo-chip">lang="{{ lang }}"</span>
        <span class="demo-chip">swiper.rtl: {{ swiperRtl ?? '…' }}</span>
        <span class="demo-chip">direction: {{ lastDirection }}</span>
      </div>

      <!-- dir + lang scoped to this wrapper; the key remounts Swiper so it
           initializes in the new direction. -->
      <div ref="stage" :dir="locale.dir" :lang="lang">
        <HeroSlider :key="lang" :slides="slides" :labels="locale.labels" :options="options"
          :overlay-patterns="[]" :parallax="false" :ui="{ root: 'rounded-2xl overflow-hidden' }"
          class="h-[26rem] sm:h-[30rem]" @swiper="onSwiper" @change="onChange">
          <template #slide="{ slide, index }">
            <div
              class="flex size-full items-center bg-linear-to-r from-black/70 via-black/30 to-transparent px-14 pb-10 rtl:bg-linear-to-l sm:px-20">
              <div class="max-w-lg text-white">
                <!-- Letter-spacing breaks Arabic joining, so tracking is LTR-only. -->
                <span data-hero-animate="slide"
                  class="inline-block text-xs font-medium uppercase tracking-[0.25em] text-white/70 rtl:text-sm rtl:tracking-normal">
                  {{ locale.eyebrow }} 0{{ index + 1 }}
                </span>
                <h3 data-hero-animate="slide" class="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                  {{ slide.title }}
                </h3>
                <p data-hero-animate="slide" class="mt-3 text-sm text-white/80 sm:text-base">
                  {{ slide.description }}
                </p>
                <span data-hero-animate="slide"
                  class="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">
                  {{ locale.cta }}
                  <Icon name="lucide:arrow-right" class="size-4 rtl:-scale-x-100" />
                </span>
              </div>
            </div>
          </template>
        </HeroSlider>
      </div>
      <p class="text-xs text-black/50 dark:text-white/50">
        Use the arrows in both directions: the <code class="demo-code">slide</code> preset enters from the side you
        travel toward, and RTL flips that axis — compare English and العربية.
      </p>
    </DemoSection>

    <DemoSection title="Accessible names"
      hint="Read back from the live DOM: every element in the slider root with an aria-label or aria-roledescription, re-scanned after each switch and slide change. Rows inside non-active slides are inert, so assistive tech skips them. Go to slide 4 (video) for the video-control labels.">
      <template #actions>
        <div class="flex flex-wrap gap-1.5">
          <span class="demo-chip">{{ names.length }} names</span>
          <span class="demo-chip">{{ inertCount }} inert</span>
        </div>
      </template>

      <div class="demo-card overflow-x-auto p-0">
        <table class="w-full min-w-[36rem] text-left text-xs">
          <thead class="text-black/60 dark:text-white/60">
            <tr class="border-b border-black/5 dark:border-white/10">
              <th scope="col" class="px-4 py-2.5 font-medium">Element</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Role</th>
              <th scope="col" class="px-4 py-2.5 font-medium">aria-roledescription</th>
              <th scope="col" class="px-4 py-2.5 font-medium">aria-label</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!names.length">
              <td colspan="4" class="px-4 py-6 text-center text-black/50 dark:text-white/50">Scanning the slider…</td>
            </tr>
            <tr v-for="row in names" :key="row.key"
              class="border-b border-black/5 last:border-0 dark:border-white/5"
              :class="{ 'opacity-45': row.inert }">
              <td class="whitespace-nowrap px-4 py-2 font-mono">
                &lt;{{ row.tag }}&gt;
                <span v-if="row.inert" class="ms-1 rounded bg-black/5 px-1 py-0.5 text-[10px] dark:bg-white/10">inert</span>
              </td>
              <td class="whitespace-nowrap px-4 py-2 font-mono">{{ row.role }}</td>
              <td class="px-4 py-2" dir="auto" :lang="lang">{{ row.roleDescription || '—' }}</td>
              <td class="px-4 py-2" dir="auto" :lang="lang">{{ row.label || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoSection>

    <DemoSection title="Wiring it up"
      hint="Pass one labels object per locale (shown abbreviated for the current one), and scope dir + lang to the slider's wrapper — or set them on <html> app-wide.">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="min-w-0">
          <h3 class="demo-card-title">Labels</h3>
          <DemoCode :code="labelsCode" />
        </div>
        <div class="min-w-0">
          <h3 class="demo-card-title">Direction</h3>
          <DemoCode :code="dirCode" />
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>
