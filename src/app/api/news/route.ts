import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DATA_PATH = path.join(process.cwd(), 'data', 'news.json')

interface NewsItem {
  title: string
  link: string
  description: string
  thumbnail: string
  pubDate: string
  source: string
}

const SOLAR_KEYWORDS = [
  '태양광', '태양에너지', '태양전지', '솔라', 'solar',
  '재생에너지', '신재생', '태양열', '패널',
  'REC', '발전사업', 'ESS', '에너지저장', '그린에너지',
  '탄소중립', '분산전원', '자가발전',
]

function isSolarRelated(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase()
  return SOLAR_KEYWORDS.some(kw => text.includes(kw.toLowerCase()))
}

function getDefaultThumbnail(index: number): string {
  const colors = ['4edea3', '10b981', '059669', '047857', '065f46']
  return `https://placehold.co/400x250/${colors[index % colors.length]}/ffffff?text=Solar+News&font=inter`
}

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// 실제 기사 페이지에서 og:image 추출
async function fetchOgImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    const html = (await res.text()).slice(0, 50000)

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch?.[1] && !ogMatch[1].includes('logo') && !ogMatch[1].includes('favicon')) return ogMatch[1]

    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twMatch?.[1] && !twMatch[1].includes('logo')) return twMatch[1]

    return ''
  } catch {
    return ''
  }
}

// RSS 피드에서 기사 추출
async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    })
    const text = await res.text()
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(text)) !== null) {
      const xml = match[1]

      const getTag = (tag: string): string => {
        const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
        if (cdataMatch) return cdataMatch[1].trim()
        const normalMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
        return normalMatch ? cleanHtml(normalMatch[1]) : ''
      }

      const title = getTag('title')
      let link = getTag('link').replace(/\s/g, '')
      const description = getTag('description').slice(0, 200)
      const pubDate = getTag('pubDate')

      // Google News 링크 스킵 (리디렉트 불가)
      if (link.includes('news.google.com/rss/articles')) continue

      // 이미지 추출
      const mediaUrl = xml.match(/<media:content[^>]+url="([^"]+)"/i)
      const mediaThumb = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i)
      const enclosure = xml.match(/<enclosure[^>]+url="([^"]+\.(jpg|jpeg|png|webp|gif))/i)
      const imgTag = xml.match(/<img[^>]+src="([^"]+\.(jpg|jpeg|png|webp|gif))/i)

      let thumbnail = mediaUrl?.[1] || mediaThumb?.[1] || enclosure?.[1] || imgTag?.[1] || ''

      if (title && link) {
        items.push({ title, link, description, thumbnail, pubDate, source: sourceName })
      }
    }

    return items
  } catch (e) {
    console.error(`[News] ${sourceName} RSS 실패:`, e)
    return []
  }
}

// Google News 검색 — description HTML에서 원본 URL 추출
async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    })
    const text = await res.text()
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(text)) !== null) {
      const xml = match[1]

      // title
      const titleMatch = xml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const title = titleMatch ? cleanHtml(titleMatch[1]) : ''

      // Google News link (리디렉트용)
      const linkMatch = xml.match(/<link>([\s\S]*?)<\/link>/)
      const googleLink = linkMatch ? linkMatch[1].trim() : ''

      // source
      const sourceMatch = xml.match(/<source[^>]+url="([^"]+)"[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/source>/)
      const sourceUrl = sourceMatch?.[1] || ''
      const sourceName = sourceMatch ? cleanHtml(sourceMatch[2]) : 'Google 뉴스'

      // pubDate
      const dateMatch = xml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
      const pubDate = dateMatch ? dateMatch[1].trim() : ''

      // description에서 텍스트 추출
      const descMatch = xml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)
      const description = descMatch ? cleanHtml(descMatch[1]).slice(0, 200) : ''

      if (title) {
        items.push({
          title,
          link: googleLink,
          description,
          thumbnail: '', // 나중에 og:image로 채움
          pubDate,
          source: sourceName,
        })
      }
    }

    return items
  } catch (e) {
    console.error('[News] Google News 실패:', e)
    return []
  }
}

async function crawlAllNews(): Promise<NewsItem[]> {
  // 1. 에너지 전문 매체 RSS (이미지 포함율 높음)
  const rssFeeds = [
    { url: 'https://www.electimes.com/rss/S1N2.xml', name: '전기신문' },
    { url: 'http://www.energydaily.co.kr/rss/allArticle.xml', name: '에너지데일리' },
    { url: 'http://www.energy-news.co.kr/rss/allArticle.xml', name: '에너지신문' },
    { url: 'http://www.e2news.com/rss/allArticle.xml', name: '이투뉴스' },
    { url: 'https://www.newspim.com/rss/S003.xml', name: '뉴스핌' },
    { url: 'http://www.todayenergy.kr/rss/allArticle.xml', name: '투데이에너지' },
    { url: 'http://www.koenergy.co.kr/rss/allArticle.xml', name: '한국에너지' },
    { url: 'http://www.greenpostkorea.co.kr/rss/allArticle.xml', name: '그린포스트코리아' },
    { url: 'https://www.segye.com/newsSectionRss/0101.xml', name: '세계일보' },
    { url: 'https://rss.hankyung.com/feed/industry.xml', name: '한국경제' },
  ]

  // 2. Google News 검색 (다양한 키워드)
  const googleQueries = ['태양광 설치', '태양광 보조금', '태양광 에너지 2026', '신재생에너지']

  const [rssResults, ...googleResults] = await Promise.allSettled([
    Promise.allSettled(rssFeeds.map(f => fetchRSSFeed(f.url, f.name))),
    ...googleQueries.map(q => fetchGoogleNews(q)),
  ])

  const allItems: NewsItem[] = []
  const seenTitles = new Set<string>()

  // RSS 결과 추가 (이미지 있는 것 우선)
  if (rssResults.status === 'fulfilled') {
    for (const result of rssResults.value) {
      if (result.status === 'fulfilled') {
        for (const item of result.value) {
          const key = item.title.slice(0, 30)
          if (!seenTitles.has(key) && isSolarRelated(item.title, item.description)) {
            seenTitles.add(key)
            allItems.push(item)
          }
        }
      }
    }
  }

  // Google News 결과 추가
  for (const result of googleResults) {
    if (result.status === 'fulfilled') {
      for (const item of result.value) {
        const key = item.title.slice(0, 30)
        if (!seenTitles.has(key) && isSolarRelated(item.title, item.description)) {
          seenTitles.add(key)
          allItems.push(item)
        }
      }
    }
  }

  // 날짜순 정렬
  allItems.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())

  const top50 = allItems.slice(0, 50)

  // 썸네일 없는 기사 → og:image 추출
  console.log('[News] og:image 추출 중...')
  const noThumb = top50.filter(item => !item.thumbnail)

  for (let i = 0; i < noThumb.length; i += 5) {
    await Promise.allSettled(
      noThumb.slice(i, i + 5).map(async (item) => {
        // Google News 링크는 스킵 (리디렉트 불가)
        if (item.link.includes('news.google.com')) return
        const img = await fetchOgImage(item.link)
        if (img) item.thumbnail = img
      })
    )
  }

  // 기본 이미지 적용
  top50.forEach((item, i) => {
    if (!item.thumbnail) item.thumbnail = getDefaultThumbnail(i)
  })

  // 이미지 있는 기사를 상위 9개 안에 우선 배치
  const withImg = top50.filter(item => !item.thumbnail.includes('placehold'))
  const withoutImg = top50.filter(item => item.thumbnail.includes('placehold'))
  const sorted = [...withImg, ...withoutImg].slice(0, 50)

  // 기본 이미지 인덱스 재할당
  sorted.forEach((item, i) => {
    if (item.thumbnail.includes('placehold')) item.thumbnail = getDefaultThumbnail(i)
  })

  console.log(`[News] 완료: ${sorted.length}개 기사, ${withImg.length}개 실제 이미지`)
  return sorted
}

function saveToFile(news: NewsItem[]) {
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_PATH, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    count: news.length,
    articles: news,
  }, null, 2), 'utf-8')
}

function loadFromFile(): { lastUpdated: string; articles: NewsItem[] } | null {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  } catch {}
  return null
}

export async function GET() {
  let cached = loadFromFile()
  const oneHour = 60 * 60 * 1000
  const isStale = !cached || (Date.now() - new Date(cached.lastUpdated).getTime()) > oneHour

  if (isStale) {
    console.log('[News] 크롤링 시작...')
    const news = await crawlAllNews()
    if (news.length > 0) {
      saveToFile(news)
      cached = { lastUpdated: new Date().toISOString(), articles: news }
    } else if (!cached) {
      cached = { lastUpdated: new Date().toISOString(), articles: [] }
    }
  }

  return NextResponse.json(cached, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}

export async function POST() {
  const news = await crawlAllNews()
  saveToFile(news)
  return NextResponse.json({ success: true, count: news.length, lastUpdated: new Date().toISOString() })
}
