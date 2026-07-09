"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Terminal, Globe, Cpu, Shield, Layers, Lock, ChevronRight, Play, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
// Импортируем оба экшена из файла конфигурации
import { unlockCourseAction, getCoursePreviewAction } from "../actions"
import { ModelsCourseWithAccessResponse } from "@/api/generated" 

const DIFFICULTY_CONFIG: Record<string, { label: string; className: string }> = {
  easy:   { label: "Начальный",   className: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"  },
  medium: { label: "Средний",     className: "border-yellow-500/30  text-yellow-400  bg-yellow-500/5"   },
  hard:   { label: "Продвинутый", className: "border-orange-500/30  text-orange-400  bg-orange-500/5"   },
  expert: { label: "Эксперт",     className: "border-red-500/30     text-red-400     bg-red-500/5"      },
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  web:     Globe,
  system:  Cpu,
  network: Shield,
  reverse: Layers,
}

export function CourseRowClient({ course }: { course: ModelsCourseWithAccessResponse }) {
  const router = useRouter()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [previewData, setPreviewData] = useState<any>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  
  const diff = DIFFICULTY_CONFIG[course.difficulty ?? ""] ?? { label: course.difficulty ?? "—", className: "border-border/40 text-muted-foreground" }
  const Icon = CATEGORY_ICONS[course.category?.toLowerCase() ?? ""] ?? Terminal
  
  const isLocked = !course.is_unlocked

  useEffect(() => {
    if (isPreviewOpen && course.slug && !previewData) {
      const fetchPreview = async () => {
        setIsPreviewLoading(true)
        // Вызываем безопасный Server Action вместо прямого запроса
        const result = await getCoursePreviewAction(course.slug!)
        
        if (result.success) {
          setPreviewData(result.data)
        } else {
          setError(result.error)
        }
        setIsPreviewLoading(false)
      }
      fetchPreview()
    }
  }, [isPreviewOpen, course.slug, previewData])

  const handleRowClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      setError(null)
      setIsPreviewOpen(true)
    }
  }

  const handleUnlock = async () => {
    if (!course.slug) return
    setIsUnlocking(true)
    setError(null)
    
    const result = await unlockCourseAction(course.slug)
    
    if (result.success) {
      setIsPreviewOpen(false)
      router.refresh() 
      router.push(`/courses/${course.slug}`)
    } else {
      setError(result.error || "Не удалось активировать курс.")
      setIsUnlocking(false)
    }
  }

  const modules = previewData?.modules || []

  return (
    <>
      <Link href={`/courses/${course.slug}`} onClick={handleRowClick} className="block group">
        <div className={`flex items-center gap-5 px-5 py-4 border-b border-border/20 transition-colors duration-150 ${isLocked ? "bg-card/5 hover:bg-primary/[0.01] border-border/30" : "hover:bg-primary/[0.03] hover:border-primary/20"}`}>
          <div className="shrink-0 hidden sm:flex items-center justify-center w-8 h-8 border border-border/40 bg-card/60 group-hover:border-primary/30 transition-colors">
            <Icon className="size-4 text-muted-foreground/60 group-hover:text-primary/70 transition-colors" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {course.category && <span className="text-[9px] text-primary/50 uppercase tracking-widest">{course.category}</span>}
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{course.title}</h3>
            {course.summary && <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-1 hidden sm:block">{course.summary}</p>}
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider rounded-none hidden sm:flex ${diff.className}`}>{diff.label}</Badge>
            {isLocked ? (
              <div className="flex items-center gap-1 text-[10px] uppercase font-mono border border-border px-2 py-0.5 bg-background/10">
                <Lock className="size-2.5" /> Preview
              </div>
            ) : (
              <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            )}
          </div>
        </div>
      </Link>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[500px] border-border/60 bg-background font-mono rounded-none flex flex-col max-h-[90vh]">
          <DialogHeader className="space-y-3 shrink-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/60">
              <Terminal className="size-3" /> Доступ ограничен (Превью)
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">{course.title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/80 leading-relaxed pt-1">
              {course.summary || "Ниже представлена структура программы подготовки на киберполигоне."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2.5 space-y-2 text-xs border-t border-b border-border/20 my-1 shrink-0">
            <div className="flex justify-between">
              <span className="text-muted-foreground/50">Сложность:</span>
              <span className="text-foreground font-bold uppercase">{diff.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground/50">Категория:</span>
              <span className="text-primary font-bold uppercase">{course.category || "General"}</span>
            </div>
          </div>

          {/* Структура курса */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-[180px] my-2">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2 block font-bold">Программа курса:</span>
            
            <ScrollArea className="flex-1 pr-3 border border-border/20 bg-card/20 p-3">
              {isPreviewLoading ? (
                <div className="flex items-center justify-center h-full py-8 text-xs text-muted-foreground/60 gap-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" /> Получение структуры модулей...
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.map((mod: any, index: number) => (
                    <div key={mod.slug || index} className="space-y-1">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-primary/60 font-bold">[{index + 1}]</span>
                        <span className="text-foreground font-bold leading-tight">{mod.title}</span>
                      </div>
                      
                      {mod.tasks && mod.tasks.length > 0 && (
                        <div className="pl-6 space-y-1 border-l border-border/20 ml-2.5 mt-1">
                          {mod.tasks.map((task: any, tIndex: number) => (
                            <div key={task.slug || tIndex} className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5">
                              <div className="w-1.5 h-0.5 bg-primary/40" />
                              <span className="truncate">{task.slug}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground/40 italic py-4 text-center">Структура программы пуста или недоступна.</div>
              )}
            </ScrollArea>
          </div>

          {error && <div className="p-2 border border-red-500/30 bg-red-500/5 text-red-400 text-[11px] shrink-0 font-mono">[ERROR]: {error}</div>}

          <DialogFooter className="flex sm:justify-between gap-2 pt-2 shrink-0">
            <Button variant="outline" className="rounded-none text-xs h-9 font-mono w-full sm:w-auto" onClick={() => setIsPreviewOpen(false)} disabled={isUnlocking}>Отмена</Button>
            <Button className="rounded-none text-xs h-9 bg-primary text-primary-foreground font-mono hover:bg-primary/90 w-full sm:w-auto gap-1.5" onClick={handleUnlock} disabled={isUnlocking || isPreviewLoading}>
              {isUnlocking ? <><Loader2 className="size-3 animate-spin" /> Подключение...</> : <><Play className="size-3 fill-current" /> Начать</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}