"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, Info, Lock, Unlock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SecurityOverlayProps {
  code: string
  payload: string
  message: string
  hint?: string
  penaltyTime?: number
}

export function SecurityOverlay({ 
  code, 
  payload, 
  message, 
  hint, 
  penaltyTime = 10 
}: SecurityOverlayProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(penaltyTime)
  const [glitch, setGlitch] = useState(false)
  const [terminalId, setTerminalId] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTerminalId(Math.random().toString(36).substring(7).toUpperCase())

    // Интенсивный глитч при входе
    setGlitch(true)
    const timeout = setTimeout(() => setGlitch(false), 800) 
    
    // Периодический легкий сбой
    const interval = setInterval(() => {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 100)
    }, 4000)

    return () => { clearInterval(interval); clearTimeout(timeout); }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  if (!mounted) return null

  const isLocked = timeLeft > 0

  // Уголки вынесены в отдельный компонент для чистоты
  const Corners = () => (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute top-0 left-0 size-8 border-t-2 border-l-2 border-red-600/60" />
      <div className="absolute top-0 right-0 size-8 border-t-2 border-r-2 border-red-600/60" />
      <div className="absolute bottom-0 left-0 size-8 border-b-2 border-l-2 border-red-600/60" />
      <div className="absolute bottom-0 right-0 size-8 border-b-2 border-r-2 border-red-600/60" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 font-mono select-none overflow-hidden text-red-100">
      {/* CSS Анимации */}
      <style jsx global>{`
        @keyframes glitch-anim {
          0% { clip-path: inset(50% 0 30% 0); transform: translate(-5px, 5px); }
          20% { clip-path: inset(10% 0 70% 0); transform: translate(5px, -5px); }
          40% { clip-path: inset(80% 0 5% 0); transform: translate(-5px, -5px); }
          60% { clip-path: inset(20% 0 50% 0); transform: translate(5px, 5px); }
          80% { clip-path: inset(60% 0 20% 0); transform: translate(-5px, -5px); }
          100% { clip-path: inset(30% 0 60% 0); transform: translate(5px, 5px); }
        }
        .glitch-active {
          animation: glitch-anim 0.2s infinite linear alternate-reverse;
          filter: hue-rotate(90deg) contrast(150%);
          opacity: 0.8;
        }
      `}</style>

      {/* Фоновая сетка */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Основной контейнер. ИСПРАВЛЕНО: Убраны border-x */}
      <div className={`relative max-w-3xl w-full bg-black/80 backdrop-blur-sm p-1 transition-transform duration-100 ${glitch ? 'glitch-active' : ''}`}>
        
        {/* ИСПРАВЛЕНО: Уголки теперь здесь, поверх всего */}
        <Corners />

        {/* Внутренняя граница */}
        <div className="relative border border-red-950/50 w-full h-full z-0">
          
          {/* Верхняя техническая панель */}
          <div className="flex justify-between items-center bg-red-950/20 border-b border-red-900/50 px-4 py-2">
            <div className="flex gap-2 items-center">
              <div className="size-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
              <span className="text-[10px] text-red-500 font-bold tracking-[0.2em]">SEC_PROTOCOL_V.4.0</span>
            </div>
            <div className="text-[10px] text-red-900 uppercase tracking-tighter">
              Terminal_ID: {terminalId}
            </div>
          </div>

          {/* Центральный блок контента */}
          <div className="flex flex-col items-center text-center space-y-8 px-4 md:px-12 py-12">
            
            {/* Статусная иконка */}
            <div className={`relative p-6 rounded-full border-2 transition-colors duration-700 ${isLocked ? 'border-red-600/50 bg-red-600/5' : 'border-green-600/50 bg-green-600/5'}`}>
              {isLocked ? (
                <Lock className="size-12 text-red-600 animate-pulse" />
              ) : (
                <Unlock className="size-12 text-green-500" />
              )}
              {/* Декоративные вращающиеся кольца */}
              <div className="absolute inset-[-8px] border border-dashed border-red-900/30 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-16px] border border-dotted border-red-900/15 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-red-600 tracking-tighter uppercase leading-none shadow-red-900 text-shadow-lg">
                Access_Denied
              </h1>
              <div className="h-0.5 w-24 bg-red-600 mx-auto shadow-[0_0_10px_#dc2626]" />
              <p className="text-red-400/80 text-xs uppercase tracking-[0.3em] font-bold">
                Intrusion detected in module: <span className="text-white bg-red-950 px-1">{code}</span>
              </p>
            </div>

            {/* Блок данных */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-red-950/10 border border-red-900/20 p-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="text-[9px] text-red-600 uppercase block mb-2 relative z-10 font-bold">Detected_Vector:</span>
                <code className="text-xs text-red-200 block truncate font-bold relative z-10 bg-black/50 p-1">{payload}</code>
              </div>
              <div className="bg-red-950/10 border border-red-900/20 p-4 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-red-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="text-[9px] text-red-600 uppercase block mb-2 relative z-10 font-bold">System_Message:</span>
                <p className="text-[11px] text-red-200/70 leading-tight italic relative z-10">"{message}"</p>
              </div>
            </div>

            {/* Хинт */}
            {hint && (
              <div className="flex items-center gap-3 text-blue-300/70 text-[10px] uppercase tracking-widest border-t border-red-900/30 pt-4 w-full justify-center font-bold">
                <Info className="size-3" />
                <span>Hint: {hint}</span>
              </div>
            )}

            {/* Кнопка наказания */}
            <div className="w-full pt-4 space-y-4">
              <Button 
                disabled={isLocked}
                onClick={() => router.push("/challenges")}
                className={`w-full max-w-sm mx-auto rounded-none h-14 font-black uppercase tracking-[0.2em] transition-all duration-300 relative group overflow-hidden ${
                  isLocked 
                  ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800' 
                  : 'bg-red-600 hover:bg-white hover:text-black text-black shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                }`}
              >
                {isLocked ? (
                  <span className="relative z-10 flex items-center gap-2">
                    <Lock className="size-4" /> Locked: {timeLeft}s
                  </span>
                ) : (
                  <span className="relative z-10">I'm sorry, I won't do it again</span>
                )}
                
                {/* Эффект прогресс-бара */}
                {isLocked && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-red-500/50 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / penaltyTime) * 100}%` }}
                  />
                )}
                
                {/* Scanline эффект на кнопке */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-30"></div>
              </Button>
              
              <p className="text-[8px] text-red-950 uppercase font-black tracking-[0.4em]">
                Unauthorized manipulation is a violation of protocol 42-B
              </p>
            </div>
          </div>

          {/* Нижняя декоративная панель */}
          <div className="flex justify-between items-center border-t border-red-900/50 px-4 py-2 bg-red-950/10">
            <div className="text-[9px] text-red-900 font-bold">SYS_STATUS: {isLocked ? 'WAITING_FOR_TIMEOUT' : 'TERMINAL_READY'}</div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`size-1.5 rotate-45 ${isLocked ? 'bg-red-950 animate-pulse' : 'bg-green-500'}`} style={{animationDelay: `${i*150}ms`}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}