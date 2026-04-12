'use client'

export default function KakaoChat() {
  return (
    <a
      href="https://pf.kakao.com/_placeholder"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FEE500] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="카카오톡 상담"
    >
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#191919">
        <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.63 1.74 4.94 4.36 6.26l-1.1 4.08c-.1.35.3.64.6.44l4.87-3.23c.42.04.85.07 1.27.07 5.52 0 10-3.36 10-7.62C22 6.36 17.52 3 12 3z" />
      </svg>
    </a>
  )
}
