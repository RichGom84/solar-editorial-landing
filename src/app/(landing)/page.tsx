import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import Problem from '@/components/sections/Problem'
import Solution from '@/components/sections/Solution'
import HowItWorks from '@/components/sections/HowItWorks'
import SolarNews from '@/components/sections/SolarNews'
import Benefits from '@/components/sections/Benefits'
import CaseStudy from '@/components/sections/CaseStudy'
import FAQ from '@/components/sections/FAQ'
import ConsultForm from '@/components/sections/ConsultForm'
import Footer from '@/components/sections/Footer'
import FloatingCTA from '@/components/sections/FloatingCTA'
import ChatBot3D from '@/components/chatbot/ChatBot3D'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <SolarNews />
      <Benefits />
      <CaseStudy />
      <FAQ />
      <ConsultForm />
      <Footer />
      <FloatingCTA />
      <ChatBot3D />
    </main>
  )
}
