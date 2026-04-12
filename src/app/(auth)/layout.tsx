import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-2xl font-bold text-emerald-400 font-headline mb-8 tracking-tighter">
        Solar Editorial
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
