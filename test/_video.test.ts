import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { createVideoState } from '../src/runtime/composables/_video'
import type { VideoMediaControls } from '../src/runtime/types'

function makeMockControls(overrides: Partial<Record<keyof VideoMediaControls, any>> = {}): VideoMediaControls {
  return {
    playing: ref(false),
    currentTime: ref(0),
    duration: ref(100),
    buffered: ref([[0, 50]] as [number, number][]),
    volume: ref(0.5),
    muted: ref(false),
    waiting: ref(false),
    ended: ref(false),
    ...overrides,
  }
}

describe('createVideoState', () => {
  describe('with video enabled', () => {
    it('videoPlaying is false when no video registered', () => {
      const activeIndex = ref(0)
      const { videoPlaying } = createVideoState(activeIndex, true)
      expect(videoPlaying.value).toBe(false)
    })

    it('videoPlaying reflects active video state', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoPlaying } = createVideoState(activeIndex, true)
      const controls = makeMockControls({ playing: ref(true) })
      registerSlideVideo(0, controls)
      expect(videoPlaying.value).toBe(true)
    })

    it('videoDuration returns 0 when no video', () => {
      const activeIndex = ref(0)
      const { videoDuration } = createVideoState(activeIndex, true)
      expect(videoDuration.value).toBe(0)
    })

    it('videoDuration reflects active video duration', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoDuration } = createVideoState(activeIndex, true)
      registerSlideVideo(0, makeMockControls({ duration: ref(120) }))
      expect(videoDuration.value).toBe(120)
    })

    it('videoCurrentTime reflects active video', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoCurrentTime } = createVideoState(activeIndex, true)
      registerSlideVideo(0, makeMockControls({ currentTime: ref(42) }))
      expect(videoCurrentTime.value).toBe(42)
    })

    it('videoBuffered returns end of last buffer range', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoBuffered } = createVideoState(activeIndex, true)
      registerSlideVideo(0, makeMockControls({ buffered: ref([[0, 75]]) }))
      expect(videoBuffered.value).toBe(75)
    })

    it('videoBuffered is 0 when no video', () => {
      const activeIndex = ref(0)
      const { videoBuffered } = createVideoState(activeIndex, true)
      expect(videoBuffered.value).toBe(0)
    })

    it('videoToggle toggles playing state', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoToggle } = createVideoState(activeIndex, true)
      const controls = makeMockControls()
      registerSlideVideo(0, controls)
      videoToggle()
      expect(controls.playing.value).toBe(true)
      videoToggle()
      expect(controls.playing.value).toBe(false)
    })

    it('videoToggle is no-op without active video', () => {
      const activeIndex = ref(0)
      const { videoToggle } = createVideoState(activeIndex, true)
      expect(() => videoToggle()).not.toThrow()
    })

    it('videoSeek sets currentTime', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoSeek } = createVideoState(activeIndex, true)
      const controls = makeMockControls()
      registerSlideVideo(0, controls)
      videoSeek(30)
      expect(controls.currentTime.value).toBe(30)
    })

    it('videoSetVolume sets volume', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoSetVolume } = createVideoState(activeIndex, true)
      const controls = makeMockControls()
      registerSlideVideo(0, controls)
      videoSetVolume(0.8)
      expect(controls.volume.value).toBe(0.8)
    })

    it('videoToggleMute toggles muted', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoToggleMute } = createVideoState(activeIndex, true)
      const controls = makeMockControls()
      registerSlideVideo(0, controls)
      videoToggleMute()
      expect(controls.muted.value).toBe(true)
      videoToggleMute()
      expect(controls.muted.value).toBe(false)
    })

    it('unregisterSlideVideo clears controls', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, unregisterSlideVideo, videoPlaying } = createVideoState(activeIndex, true)
      registerSlideVideo(0, makeMockControls({ playing: ref(true) }))
      unregisterSlideVideo(0)
      expect(videoPlaying.value).toBe(false)
    })

    it('returns controls for correct activeIndex', () => {
      const activeIndex = ref(1)
      const { registerSlideVideo, videoPlaying } = createVideoState(activeIndex, true)
      registerSlideVideo(0, makeMockControls({ playing: ref(true) }))
      registerSlideVideo(1, makeMockControls({ playing: ref(false) }))
      expect(videoPlaying.value).toBe(false)
    })
  })

  describe('with video disabled', () => {
    it('all video refs return defaults', () => {
      const activeIndex = ref(0)
      const { videoPlaying, videoDuration, videoCurrentTime, videoBuffered, videoVolume, videoMuted, videoWaiting, videoEnded } = createVideoState(activeIndex, false)
      expect(videoPlaying.value).toBe(false)
      expect(videoDuration.value).toBe(0)
      expect(videoCurrentTime.value).toBe(0)
      expect(videoBuffered.value).toBe(0)
      expect(videoVolume.value).toBe(0)
      expect(videoMuted.value).toBe(false)
      expect(videoWaiting.value).toBe(false)
      expect(videoEnded.value).toBe(false)
    })

    it('registerSlideVideo is no-op', () => {
      const activeIndex = ref(0)
      const { registerSlideVideo, videoPlaying } = createVideoState(activeIndex, false)
      registerSlideVideo(0, makeMockControls({ playing: ref(true) }))
      expect(videoPlaying.value).toBe(false)
    })

    it('mutation functions are no-ops', () => {
      const activeIndex = ref(0)
      const { videoToggle, videoSeek, videoSetVolume, videoToggleMute } = createVideoState(activeIndex, false)
      expect(() => {
        videoToggle()
        videoSeek(10)
        videoSetVolume(0.5)
        videoToggleMute()
      }).not.toThrow()
    })
  })
})
