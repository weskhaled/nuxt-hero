import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { VideoMediaControls } from '#hero/types'

/**
 * Creates reactive video state management for the slider.
 * Maintains a registry of video controls keyed by slide index and
 * proxies the active slide's controls as computed refs with safe defaults.
 *
 * @param activeIndex - Currently active slide index
 * @param videoEnabled - Whether video features are enabled
 * @returns Video state refs and control functions
 */
export function createVideoState(
  activeIndex: Ref<number>,
  videoEnabled: boolean,
) {
  const controlsMap = videoEnabled ? new Map<number, VideoMediaControls>() : null
  const controlsVersion = ref(0)

  const activeControls = computed<VideoMediaControls | null>(() => {
    if (!controlsMap) return null
    void controlsVersion.value
    return controlsMap.get(activeIndex.value) ?? null
  })

  function registerSlideVideo(index: number, controls: VideoMediaControls) {
    if (!controlsMap) return
    controlsMap.set(index, controls)
    controlsVersion.value++
  }

  function unregisterSlideVideo(index: number) {
    if (!controlsMap) return
    controlsMap.delete(index)
    controlsVersion.value++
  }

  // ─── Proxy refs (safe defaults) ───

  const videoPlaying = computed(() => activeControls.value?.playing.value ?? false)
  const videoCurrentTime = computed(() => activeControls.value?.currentTime.value ?? 0)
  const videoDuration = computed(() => activeControls.value?.duration.value ?? 0)
  const videoVolume = computed(() => activeControls.value?.volume.value ?? 0)
  const videoMuted = computed(() => activeControls.value?.muted.value ?? false)
  const videoWaiting = computed(() => activeControls.value?.waiting.value ?? false)
  const videoEnded = computed(() => activeControls.value?.ended.value ?? false)

  const videoBuffered = computed(() => {
    const controls = activeControls.value
    if (!controls) return 0
    const buffered = controls.buffered.value
    if (!buffered.length) return 0
    return buffered[buffered.length - 1]?.[1] ?? 0
  })

  // ─── Scrub state: pause during drag, restore on release ───
  const wasPlayingBeforeScrub = ref(false)

  function videoScrubStart() {
    const c = activeControls.value
    if (!c) return
    wasPlayingBeforeScrub.value = c.playing.value
    if (c.playing.value) {
      c.playing.value = false
    }
  }

  function videoScrubEnd() {
    const c = activeControls.value
    if (!c) return
    if (wasPlayingBeforeScrub.value) {
      c.playing.value = true
    }
  }

  // ─── Mutation functions (no-ops without active video) ───

  function videoToggle() {
    const c = activeControls.value
    if (!c) return
    c.playing.value = !c.playing.value
  }

  function videoSeek(time: number) {
    const c = activeControls.value
    if (!c) return
    c.currentTime.value = time
  }

  function videoSetVolume(v: number) {
    const c = activeControls.value
    if (!c) return
    c.volume.value = v
  }

  function videoToggleMute() {
    const c = activeControls.value
    if (!c) return
    c.muted.value = !c.muted.value
  }

  return {
    activeControls,
    videoPlaying,
    videoCurrentTime,
    videoDuration,
    videoBuffered,
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
    registerSlideVideo,
    unregisterSlideVideo,
  }
}
