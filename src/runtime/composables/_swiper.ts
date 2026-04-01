import type { MaybeRefOrGetter } from 'vue'
import { ref, shallowRef, toValue } from 'vue'
import type { Swiper } from 'swiper'
import type { HeroSlide } from '#hero/types'

/**
 * Creates the Swiper instance state — tracks active/snap indices,
 * provides navigation methods, and handles slide change events.
 *
 * @param slides - Reactive array of slide definitions (for total count)
 * @returns Swiper state refs and navigation functions
 */
export function createSwiperState(
  slides: MaybeRefOrGetter<HeroSlide[]>,
) {
  const swiperInstance = shallowRef<Swiper>()
  const activeIndex = ref(0)
  const previousIndex = ref(-1)
  const snapIndex = ref(0)
  const totalSnaps = ref(1)

  function updateSnapInfo(swiper: Swiper) {
    snapIndex.value = swiper.snapIndex ?? 0
    totalSnaps.value = swiper.snapGrid?.length ?? toValue(slides).length
  }

  function onSwiper(swiper: Swiper) {
    swiperInstance.value = swiper
    updateSnapInfo(swiper)
  }

  function onSlideChange() {
    if (!swiperInstance.value) return
    previousIndex.value = activeIndex.value
    activeIndex.value = swiperInstance.value.activeIndex
    updateSnapInfo(swiperInstance.value)
  }

  function advanceSlide() {
    if (!swiperInstance.value) return
    if (snapIndex.value + 1 >= totalSnaps.value) swiperInstance.value.slideTo(0)
    else swiperInstance.value.slideNext()
  }

  function next() { advanceSlide() }

  function prev() {
    if (!swiperInstance.value) return
    const total = toValue(slides).length
    if (snapIndex.value <= 0) swiperInstance.value.slideTo(total - 1)
    else swiperInstance.value.slidePrev()
  }

  function goTo(index: number) {
    swiperInstance.value?.slideTo(index)
  }

  return {
    swiperInstance,
    activeIndex,
    previousIndex,
    snapIndex,
    totalSnaps,
    onSwiper,
    onSlideChange,
    advanceSlide,
    next,
    prev,
    goTo,
  }
}
