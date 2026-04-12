'use client'

import { useEffect, useRef, useState } from 'react'

const TOTAL_FRAMES = 40

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Preload all frame images
  useEffect(() => {
    let loadedCount = 0
    const images: HTMLImageElement[] = []

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `/frames/frame_${String(i).padStart(3, '0')}.jpg`
      img.onload = () => {
        loadedCount++
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images
          setImagesLoaded(true)
        }
      }
      images.push(img)
    }
  }, [])

  // Draw frame on canvas based on scroll
  useEffect(() => {
    if (!imagesLoaded) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawFrame = (index: number) => {
      const img = imagesRef.current[index]
      if (!img) return

      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const canvasW = canvas.offsetWidth
      const canvasH = canvas.offsetHeight
      const imgRatio = img.width / img.height
      const canvasRatio = canvasW / canvasH

      let drawW, drawH, drawX, drawY
      if (imgRatio > canvasRatio) {
        drawH = canvasH
        drawW = canvasH * imgRatio
        drawX = (canvasW - drawW) / 2
        drawY = 0
      } else {
        drawW = canvasW
        drawH = canvasW / imgRatio
        drawX = 0
        drawY = (canvasH - drawH) / 2
      }

      ctx.clearRect(0, 0, canvasW, canvasH)
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    }

    // Draw first frame immediately
    drawFrame(0)

    const handleScroll = () => {
      const rect = container.getBoundingClientRect()
      const scrollableHeight = container.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight))
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES))

      // Reset scale before drawing
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      drawFrame(frameIndex)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [imagesLoaded])

  const scrollToForm = () => {
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={containerRef} className="relative" style={{ height: '300vh' }}>
      <section className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Frame animation canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: imagesLoaded ? 0.4 : 0 }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-start justify-center h-full max-w-7xl mx-auto px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-solar-primary-container/20 text-solar-primary text-[10px] font-bold tracking-wider uppercase mb-6 rounded">
              Premium Energy Solutions
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight text-white mb-8 leading-[1.1]">
              전기요금 걱정,<br />
              이제 <span className="text-solar-primary text-glow">태양광</span>으로 끝내세요
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
              솔라 에디토리얼은 주거용 프리미엄 태양광 시스템의 표준을 제시합니다.
              디자인과 성능을 모두 잡은 완벽한 시공을 경험하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToForm}
                className="bg-solar-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:scale-95 transition-transform shadow-[0_0_15px_rgba(78,222,163,0.3)]"
              >
                무료 견적 받기
              </button>
              <button
                onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-surface-container-high text-white px-8 py-4 rounded-xl font-bold text-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-colors"
              >
                설치 사례 보기
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
