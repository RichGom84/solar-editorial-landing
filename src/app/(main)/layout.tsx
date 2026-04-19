import Header from '@/components/layout/Header'
import AppFooter from '@/components/layout/AppFooter'
import KakaoChat from '@/components/layout/KakaoChat'
import ChatBot3D from '@/components/chatbot/ChatBot3D'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-surface">
        {children}
      </main>
      <AppFooter />
      <KakaoChat />
      <ChatBot3D />
    </>
  )
}
