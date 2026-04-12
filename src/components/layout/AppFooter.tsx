import Link from 'next/link'

export default function AppFooter() {
  return (
    <footer className="bg-[#020617] border-t border-slate-800/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="text-lg font-bold text-emerald-500 font-headline mb-3">Solar Editorial</div>
            <p className="text-slate-500 text-sm">Precision Energy Systems.</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-2">
              <Link href="/products" className="block text-slate-500 hover:text-emerald-400 transition-colors text-sm">상품</Link>
              <Link href="/" className="block text-slate-500 hover:text-emerald-400 transition-colors text-sm">상담 신청</Link>
            </div>
            <div className="space-y-2">
              <Link href="/login" className="block text-slate-500 hover:text-emerald-400 transition-colors text-sm">로그인</Link>
              <Link href="/register" className="block text-slate-500 hover:text-emerald-400 transition-colors text-sm">회원가입</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-slate-600 text-xs">
          © 2026 Solar Editorial. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
