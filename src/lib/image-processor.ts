export interface WebpEncodeOptions {
  maxDimension?: number
  quality?: number
}

const DEFAULT_MAX_DIM = 1600
const DEFAULT_QUALITY = 0.82

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' as ImageBitmapOptions['imageOrientation'] })
    } catch {
      return createImageBitmap(file)
    }
  }
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

function getDims(source: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  if ('naturalWidth' in source) {
    return { w: source.naturalWidth, h: source.naturalHeight }
  }
  return { w: source.width, h: source.height }
}

async function drawToCanvas(source: ImageBitmap | HTMLImageElement, w: number, h: number): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.')
    ctx.drawImage(source as CanvasImageSource, 0, 0, w, h)
    return canvas.convertToBlob({ type: 'image/webp', quality: DEFAULT_QUALITY })
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.')
  ctx.drawImage(source as CanvasImageSource, 0, 0, w, h)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('WebP 변환에 실패했습니다.'))),
      'image/webp',
      DEFAULT_QUALITY
    )
  })
}

export async function compressToWebp(file: File, opts: WebpEncodeOptions = {}): Promise<Blob> {
  const maxDim = opts.maxDimension ?? DEFAULT_MAX_DIM
  const source = await loadBitmap(file)
  try {
    const { w, h } = getDims(source)
    const scale = Math.min(1, maxDim / Math.max(w, h))
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))
    return await drawToCanvas(source, outW, outH)
  } finally {
    if ('close' in source && typeof (source as ImageBitmap).close === 'function') {
      ;(source as ImageBitmap).close()
    }
  }
}

export function replaceExtension(filename: string, ext: string): string {
  const dot = filename.lastIndexOf('.')
  const base = dot > 0 ? filename.slice(0, dot) : filename
  return `${base}.${ext}`
}
