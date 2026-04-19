'use client'

import { useEffect, useState, useCallback } from 'react'

interface NewsItem {
  title: string
  link: string
  description: string
  thumbnail: string
  pubDate: string
  source: string
}

export default function SolarNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      if (data.articles) {
        setNews(data.articles.slice(0, 9))
        setLastUpdated(data.lastUpdated)
      }
    } catch (e) {
      console.error('뉴스 로드 실패:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()

    // 1시간마다 자동 갱신
    const interval = setInterval(fetchNews, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNews])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours < 1) return '방금 전'
      if (hours < 24) return `${hours}시간 전`
      const days = Math.floor(hours / 24)
      if (days < 7) return `${days}일 전`
      return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">Solar News</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">태양광 업계 소식</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-surface-container-highest rounded-2xl border border-outline-variant/10 overflow-hidden animate-pulse">
                <div className="h-44 bg-surface-container-high" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded w-full" />
                  <div className="h-3 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (news.length === 0) return null

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="uppercase tracking-wider text-[10px] text-solar-primary font-bold mb-4 block">Solar News</span>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-white">태양광 업계 소식</h2>
            <p className="text-on-surface-variant mt-2 text-sm">실시간 태양광·에너지 뉴스를 확인하세요</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-solar-primary">update</span>
              마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
            </div>
          )}
        </div>

        {/* Featured (1st article large) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <a
            href={news[0].link}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-2 group bg-surface-container-highest rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-solar-primary/30 transition-all flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 h-56 md:h-auto relative overflow-hidden">
              <img
                src={news[0].thumbnail}
                alt={news[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/600x400/10b981/ffffff?text=Solar+News&font=inter` }}
              />
              <div className="absolute top-3 left-3">
                <span className="bg-solar-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Featured</span>
              </div>
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-solar-primary transition-colors line-clamp-3 leading-relaxed">
                  {news[0].title}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed">{news[0].description}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-on-surface-variant">{news[0].source}</span>
                <span className="text-[10px] text-on-surface-variant">{formatDate(news[0].pubDate)}</span>
              </div>
            </div>
          </a>

          {/* 2nd article */}
          {news[1] && (
            <a
              href={news[1].link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface-container-highest rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-solar-primary/30 transition-all"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src={news[1].thumbnail}
                  alt={news[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x250/059669/ffffff?text=Solar&font=inter` }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-solar-primary transition-colors line-clamp-2">{news[1].title}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-2">{news[1].description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-on-surface-variant">{news[1].source}</span>
                  <span className="text-[10px] text-on-surface-variant">{formatDate(news[1].pubDate)}</span>
                </div>
              </div>
            </a>
          )}
        </div>

        {/* Grid (3rd-9th) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.slice(2, 9).map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-surface-container-highest rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-solar-primary/30 transition-all ${
                i === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className={`relative overflow-hidden ${i === 0 ? 'h-48' : 'h-36'}`}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x250/047857/ffffff?text=Solar&font=inter` }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-solar-primary transition-colors line-clamp-2">{item.title}</h3>
                {i === 0 && <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{item.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-on-surface-variant">{item.source}</span>
                  <span className="text-[10px] text-on-surface-variant">{formatDate(item.pubDate)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
