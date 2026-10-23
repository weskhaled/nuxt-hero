/**
 * Shared demo media — every image / video URL the playground uses, in one
 * place (auto-imported by Nuxt from `utils/`).
 */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1920&q=80`

export const IMAGES = {
  store: unsplash('1441986300917-64674bd600d8'),
  shelves: unsplash('1534312527009-56c7016453e6'),
  suits: unsplash('1490114538077-0a7f8cb49891'),
  shoes: unsplash('1485673634125-0f3ae8fd3209'),
  mountains: unsplash('1506905925346-21bda4d32df4'),
  nature: unsplash('1469474968028-56623f02e42e'),
  forest: unsplash('1447752875215-b2761acb3c5d'),
  valley: unsplash('1470071459604-3b5ec3a7fe05'),
  woods: unsplash('1441974231531-c6227db76b6e'),
  waterfall: unsplash('1433086966358-54859d0ed716'),
  landscape: unsplash('1472214103451-9374bd1c798e'),
  space: unsplash('1462331940025-496dfbfc7564'),
  earth: unsplash('1446776811953-b23d57bd21aa'),
  nebula: unsplash('1454789548928-9efd52dc4031'),
  circuit: unsplash('1451187580459-43490279c0fa'),
} as const

/** Small variant of an image for thumbnails (pagination tooltips, nav previews). */
export function thumb(url: string): string {
  return url.replace('w=1920', 'w=320')
}

export const VIDEOS = {
  /** Short abstract loop (mp4) */
  glass: {
    src: 'https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4',
    poster: IMAGES.circuit,
  },
  /** Longer clip with a real ending (mp4) — for end-of-video behaviour */
  oceans: {
    src: 'https://vjs.zencdn.net/v/oceans.mp4',
    poster: IMAGES.waterfall,
  },
  /** Adaptive HLS stream (Big Buck Bunny) — hls.js outside Safari */
  bunny: {
    src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    poster: IMAGES.valley,
  },
} as const
