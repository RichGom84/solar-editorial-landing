export default function Footer() {
  return (
    <footer className="bg-[#020617] w-full border-t border-slate-800/50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto">
        <div className="col-span-1">
          <div className="text-xl font-bold text-emerald-500 mb-6 font-headline">Solar Editorial</div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Precision Energy Systems.<br />
            우리는 기술로 지속 가능한 미래를 설계합니다.
          </p>
        </div>
        <div>
          <span className="uppercase text-slate-500 text-[10px] font-bold tracking-widest mb-6 block">
            Company
          </span>
          <ul className="space-y-3">
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">About Us</a></li>
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a></li>
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <span className="uppercase text-slate-500 text-[10px] font-bold tracking-widest mb-6 block">
            Services
          </span>
          <ul className="space-y-3">
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Installation</a></li>
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Maintenance</a></li>
            <li><a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors text-sm">Consultation</a></li>
          </ul>
        </div>
        <div>
          <span className="uppercase text-slate-500 text-[10px] font-bold tracking-widest mb-6 block">
            Contact
          </span>
          <p className="text-slate-500 text-sm mb-2">서울특별시 강남구 테헤란로 123</p>
          <p className="text-emerald-400 font-bold text-lg">1588-0000</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-slate-900">
        <p className="text-center text-slate-600 text-xs">
          © 2026 Solar Editorial. Precision Energy Systems.
        </p>
      </div>
    </footer>
  )
}
