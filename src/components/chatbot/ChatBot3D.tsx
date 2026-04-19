'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* ─── 3D Robot Avatar ─── */
function RobotAvatar({ mood, size = 60 }: { mood: 'idle' | 'thinking' | 'happy'; size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const leftEyeRef = useRef<HTMLDivElement>(null)
  const rightEyeRef = useRef<HTMLDivElement>(null)
  const leftPupilRef = useRef<HTMLDivElement>(null)
  const rightPupilRef = useRef<HTMLDivElement>(null)
  const leftEarRef = useRef<HTMLDivElement>(null)
  const rightEarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      const head = headRef.current
      if (!container || !head) return

      const rect = container.getBoundingClientRect()
      const botCenterX = rect.left + rect.width / 2
      const botCenterY = rect.top + rect.height / 2

      const angleX = (e.clientX - botCenterX) / (window.innerWidth / 2) * 20
      const angleY = (e.clientY - botCenterY) / (window.innerHeight / 2) * 15

      head.style.transform = `rotateY(${-angleX * 0.15}deg) rotateX(${angleY * 0.1}deg)`

      const maxMove = 8
      const eyeX = (e.clientX - botCenterX) / window.innerWidth * maxMove * 3
      const eyeY = (e.clientY - botCenterY) / window.innerHeight * maxMove * 3

      if (leftEyeRef.current) leftEyeRef.current.style.transform = `translate(${eyeX * 0.7}px, ${eyeY * 0.7}px)`
      if (rightEyeRef.current) rightEyeRef.current.style.transform = `translate(${eyeX * 0.7}px, ${eyeY * 0.7}px)`
      if (leftPupilRef.current) leftPupilRef.current.style.transform = `translate(${eyeX * 0.5}px, ${eyeY * 0.5}px)`
      if (rightPupilRef.current) rightPupilRef.current.style.transform = `translate(${eyeX * 0.5}px, ${eyeY * 0.5}px)`

      if (leftEarRef.current && rightEarRef.current) {
        if (angleX > 0) {
          leftEarRef.current.style.transform = `translateY(-50%) translateX(${-angleX * 0.5}px)`
          rightEarRef.current.style.transform = `translateY(-50%) translateX(${-angleX * 0.2}px)`
          leftEarRef.current.style.opacity = '1'
          rightEarRef.current.style.opacity = `${Math.max(0.2, 0.5 - angleX / 40)}`
        } else {
          leftEarRef.current.style.transform = `translateY(-50%) translateX(${-angleX * 0.2}px)`
          rightEarRef.current.style.transform = `translateY(-50%) translateX(${-angleX * 0.5}px)`
          leftEarRef.current.style.opacity = `${Math.max(0.2, 0.5 + angleX / 40)}`
          rightEarRef.current.style.opacity = '1'
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const scale = size / 150

  return (
    <div ref={containerRef} className="relative" style={{ width: size, height: size, perspective: '700px' }}>
      <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
        <div
          ref={headRef}
          className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-visible"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f0f0f0, #e8e8e8)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.18), inset 3px 3px 15px rgba(255,255,255,0.8), inset -3px -3px 15px rgba(0,0,0,0.1)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Ears */}
          <div
            ref={leftEarRef}
            className="absolute rounded-full"
            style={{
              width: 24 * scale, height: 24 * scale,
              backgroundColor: mood === 'happy' ? '#a8e6cf' : '#e0e0e0',
              left: -8 * scale, top: '50%', transform: 'translateY(-50%)',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.2)',
              transition: 'all 0.1s ease-out, background-color 0.3s',
              zIndex: -1,
            }}
          />
          <div
            ref={rightEarRef}
            className="absolute rounded-full"
            style={{
              width: 24 * scale, height: 24 * scale,
              backgroundColor: mood === 'happy' ? '#a8e6cf' : '#e0e0e0',
              right: -8 * scale, top: '50%', transform: 'translateY(-50%)',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.2)',
              transition: 'all 0.1s ease-out, background-color 0.3s',
              zIndex: -1,
            }}
          />

          {/* Highlight */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '20%', left: '25%', width: '30%', height: '15%',
              background: 'rgba(255,255,255,0.7)', borderRadius: '50%', transform: 'rotate(-30deg)',
            }}
          />

          {/* Blush (happy mood) */}
          {mood === 'happy' && (
            <>
              <div className="absolute rounded-full" style={{ width: 12 * scale, height: 8 * scale, background: 'rgba(255,150,150,0.4)', left: '12%', top: '58%' }} />
              <div className="absolute rounded-full" style={{ width: 12 * scale, height: 8 * scale, background: 'rgba(255,150,150,0.4)', right: '12%', top: '58%' }} />
            </>
          )}

          {/* Eyes */}
          <div className="relative flex justify-between items-center" style={{ width: '60%', height: 40 * scale, transformStyle: 'preserve-3d' }}>
            <div
              ref={leftEyeRef}
              className="rounded-full relative overflow-hidden"
              style={{
                width: 32 * scale, height: mood === 'happy' ? 20 * scale : 32 * scale,
                backgroundColor: 'black',
                transition: 'all 0.12s ease-out',
                borderRadius: mood === 'happy' ? '50% 50% 50% 50% / 30% 30% 70% 70%' : '50%',
              }}
            >
              <div
                ref={leftPupilRef}
                className="absolute rounded-full bg-white"
                style={{ width: 12 * scale, height: 12 * scale, top: '25%', left: '25%', transition: 'all 0.05s ease-out' }}
              />
              <div
                className="absolute w-full bg-[#f0f0f0]"
                style={{
                  height: '100%', top: '-100%', left: 0,
                  borderRadius: '0 0 50% 50%',
                  animation: 'robotBlink 4s infinite ease-in-out',
                  zIndex: 10,
                }}
              />
            </div>
            <div
              ref={rightEyeRef}
              className="rounded-full relative overflow-hidden"
              style={{
                width: 32 * scale, height: mood === 'happy' ? 20 * scale : 32 * scale,
                backgroundColor: 'black',
                transition: 'all 0.12s ease-out',
                borderRadius: mood === 'happy' ? '50% 50% 50% 50% / 30% 30% 70% 70%' : '50%',
              }}
            >
              <div
                ref={rightPupilRef}
                className="absolute rounded-full bg-white"
                style={{ width: 12 * scale, height: 12 * scale, top: '25%', left: '25%', transition: 'all 0.05s ease-out' }}
              />
              <div
                className="absolute w-full bg-[#f0f0f0]"
                style={{
                  height: '100%', top: '-100%', left: 0,
                  borderRadius: '0 0 50% 50%',
                  animation: 'robotBlink 4.2s infinite ease-in-out',
                  animationDelay: '0.1s',
                  zIndex: 10,
                }}
              />
            </div>
          </div>

          {/* Thinking indicator */}
          {mood === 'thinking' && (
            <div className="absolute -top-2 -right-1 flex gap-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          )}
        </div>
      </div>
      {/* Shadow */}
      <div
        className="absolute"
        style={{
          bottom: -8 * scale, left: '15%', width: '70%', height: 10 * scale,
          background: 'rgba(0,0,0,0.15)', borderRadius: '50%', filter: `blur(${5 * scale}px)`,
          zIndex: -1,
        }}
      />
    </div>
  )
}

/* ─── Main ChatBot Component ─── */
export default function ChatBot3D() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 🌞\nSolar Editorial AI 상담사입니다.\n태양광 설치, 보조금, 요금 절감 등 무엇이든 물어보세요!' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [botMood, setBotMood] = useState<'idle' | 'thinking' | 'happy'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('gemini-api-key')
    if (saved) setApiKey(saved)
  }, [])

  const saveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('gemini-api-key', key)
    setShowSettings(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setBotMood('thinking')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-10), apiKey: apiKey || undefined }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      setBotMood('happy')
      setTimeout(() => setBotMood('idle'), 2500)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }])
      setBotMood('idle')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, apiKey])

  return (
    <>
      {/* 3D Robot Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 z-50 group"
        aria-label="AI 챗봇"
      >
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-[-8px] bg-emerald-400/20 rounded-full blur-xl group-hover:bg-emerald-400/30 transition-all" />
          <div className={`relative transition-transform duration-300 ${isOpen ? 'scale-90' : 'group-hover:scale-110'}`}>
            {isOpen ? (
              <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_30px_rgba(78,222,163,0.4)]">
                <span className="material-symbols-outlined text-white text-2xl">close</span>
              </div>
            ) : (
              <RobotAvatar mood={botMood} size={60} />
            )}
          </div>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-surface animate-bounce" />
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          style={{ height: '580px', animation: 'chatSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Header with Robot */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-full p-1">
                <RobotAvatar mood={botMood} size={36} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Solar AI 상담사</h3>
                <p className="text-emerald-100 text-[10px]">
                  {loading ? '생각하는 중...' : 'Powered by Gemini'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSettings(!showSettings)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="API 키 설정">
                <span className="material-symbols-outlined text-lg">settings</span>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="bg-surface-container-high px-5 py-4 border-b border-outline-variant/10 shrink-0">
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mb-2">Gemini API Key</label>
              <div className="flex gap-2">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..."
                  className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:outline-none" />
                <button onClick={() => saveApiKey(apiKey)} className="bg-solar-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:scale-95 transition-transform">저장</button>
              </div>
              <a href="/chatbot-guide" target="_blank" className="text-solar-primary text-[10px] hover:underline mt-2 inline-block">API 키 발급 가이드 →</a>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="mr-2 shrink-0 mt-1">
                    <RobotAvatar mood={i === messages.length - 1 ? botMood : 'idle'} size={28} />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-solar-primary text-on-primary rounded-br-md'
                    : 'bg-surface-container-high text-on-surface rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="mr-2 shrink-0">
                  <RobotAvatar mood="thinking" size={28} />
                </div>
                <div className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-5 pb-2 flex gap-2 flex-wrap shrink-0">
              {['보조금 얼마?', '설치 비용은?', '설치 기간은?'].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-[11px] px-3 py-1.5 bg-surface-container-high border border-outline-variant/10 text-on-surface-variant rounded-full hover:border-solar-primary/30 hover:text-solar-primary transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-outline-variant/10 shrink-0">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..." disabled={loading}
                className="flex-1 bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-on-surface-variant/50 focus:border-solar-primary focus:outline-none disabled:opacity-50" />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="bg-solar-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center hover:scale-95 transition-transform disabled:opacity-50">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes robotBlink {
          0%, 96%, 98% { transform: translateY(0%); }
          97%, 99% { transform: translateY(100%); }
        }
      `}</style>
    </>
  )
}
