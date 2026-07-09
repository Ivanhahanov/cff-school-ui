"use client"
import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Bell, Terminal as TerminalIcon, ChevronRight, Activity, Power, ExternalLink, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInfra, useCountdownLabel, useCountdownLabelExact } from "@/context/session-context"
import { toast } from "sonner"
import { stopInstanceAction } from "@/lib/instance"

const SEGMENT_LABELS: Record<string, string> = {
  courses: "Курсы",
  challenges: "Задания",
  profile: "Профиль",
  settings: "Настройки",
  dashboard: "Главная",
  modules: "Модули",
  tasks: "Задачи",
  leaderboard: "Рейтинг",
  learn: "Обучение",
}

function segmentLabel(segment: string): string {
  const lower = segment.toLowerCase()
  if (SEGMENT_LABELS[lower]) return SEGMENT_LABELS[lower]
  return segment.replace(/-/g, " ")
}

// Ниже какого порога (сек) таймер подсвечивается красным
const WARN_THRESHOLD_SECS = 120

export function Navbar() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const { activeInfra, setActiveInfra, timeLeft } = useInfra()
  const countdownLabel = useCountdownLabel()
  const countdownLabelExact = useCountdownLabelExact()

  const isExpiringSoon = timeLeft !== null && timeLeft <= WARN_THRESHOLD_SECS

  const handleGlobalTerminate = async () => {
    if (!activeInfra) return
    const t = toast.loading("Завершение сессии...")
    const result = await stopInstanceAction(activeInfra.name!)
    if (result.success) {
      setActiveInfra(null)
      toast.success("Сессия завершена", { id: t })
    } else {
      toast.error("Ошибка завершения", { id: t })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur-sm font-mono tracking-tight">

      {/* ── Левая часть ── */}
      <div className="flex items-center gap-2 overflow-hidden mr-4 flex-1">
        <SidebarTrigger className="-ml-1 h-8 w-8 rounded-none border border-transparent hover:border-border hover:bg-muted/50 transition-all shrink-0" />
        <Separator orientation="vertical" className="mx-2 h-4 bg-border/60 shrink-0" />

        <Breadcrumb className="overflow-hidden">
          <BreadcrumbList className="text-[11px] font-medium flex-nowrap gap-1">
            <BreadcrumbItem className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-foreground shrink-0">
              <TerminalIcon className="size-3 text-primary/50" />
              <BreadcrumbLink asChild>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">~</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1
              const href = `/${segments.slice(0, index + 1).join("/")}`
              const label = segmentLabel(segment)
              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator className="hidden md:block opacity-30 shrink-0">
                    <ChevronRight className="size-3" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="overflow-hidden">
                    {isLast ? (
                      <BreadcrumbPage className="text-foreground font-semibold truncate max-w-[160px]">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="hidden md:block text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                      >
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Правая часть ── */}
      <div className="flex items-center gap-2 shrink-0">

        <div className="hidden lg:block w-[180px] xl:w-[220px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground/40" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="h-8 w-full bg-muted/10 pl-8 text-[11px] border-border/60 focus-visible:border-primary/40 focus-visible:ring-0 rounded-none placeholder:text-muted-foreground/30"
            />
          </div>
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-4 bg-border/40 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none border border-border/40 hover:bg-muted/50 group relative shrink-0"
        >
          <Bell className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-0 right-0 size-1 bg-primary" />
        </Button>

        <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />

        {/* ── Блок активной сессии ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2.5 h-8 px-3 border transition-colors outline-none",
              activeInfra && isExpiringSoon
                ? "border-red-500/40 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/60"
                : activeInfra
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                  : "border-border/40 bg-muted/5 hover:bg-muted/20 hover:border-border/70"
            )}>
              {/* Индикатор статуса */}
              {activeInfra ? (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isExpiringSoon ? "bg-red-400" : "bg-emerald-400"
                  )} />
                  <span className={cn(
                    "relative inline-flex rounded-full h-1.5 w-1.5",
                    isExpiringSoon ? "bg-red-500" : "bg-emerald-500"
                  )} />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25 shrink-0" />
              )}

              {/* Текст */}
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] text-muted-foreground/50 uppercase tracking-widest font-bold">
                  {activeInfra ? "Сессия" : "Нода"}
                </span>
                <span className={cn(
                  "text-[10px] font-bold truncate max-w-[100px]",
                  activeInfra && isExpiringSoon
                    ? "text-red-400"
                    : activeInfra
                      ? "text-emerald-400"
                      : "text-muted-foreground/40"
                )}>
                  {activeInfra ? activeInfra.name : "ОЖИДАНИЕ"}
                </span>
              </div>

              {/* Таймер (отображается только при активной сессии) */}
              {activeInfra && countdownLabel && (
                <div className={cn(
                  "flex items-center gap-1 text-[9px] font-black tabular-nums",
                  isExpiringSoon ? "text-red-400" : "text-muted-foreground/50"
                )}>
                  <Clock className="size-2.5 shrink-0" />
                  {countdownLabel}
                </div>
              )}

              <Activity className={cn(
                "size-3 shrink-0 transition-colors",
                activeInfra && isExpiringSoon
                  ? "text-red-500/50"
                  : activeInfra
                    ? "text-emerald-500/50"
                    : "text-muted-foreground/20"
              )} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 rounded-none border-border/40 bg-background font-mono p-0">
            {activeInfra ? (
              <>
                <div className={cn(
                  "px-4 py-3 border-b border-border/30",
                  isExpiringSoon ? "bg-red-500/5" : "bg-emerald-500/5"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          isExpiringSoon ? "bg-red-400" : "bg-emerald-400"
                        )} />
                        <span className={cn(
                          "relative inline-flex rounded-full h-1.5 w-1.5",
                          isExpiringSoon ? "bg-red-500" : "bg-emerald-500"
                        )} />
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isExpiringSoon ? "text-red-400" : "text-emerald-400"
                      )}>
                        {isExpiringSoon ? "Истекает скоро" : "Сессия активна"}
                      </span>
                    </div>

                    {/* Таймер в дропдауне */}
                    {countdownLabelExact && (
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black tabular-nums px-1.5 py-0.5 border",
                        isExpiringSoon
                          ? "text-red-400 border-red-500/30 bg-red-500/10"
                          : "text-muted-foreground/60 border-border/40"
                      )}>
                        <Clock className="size-2.5" />
                        {countdownLabelExact}
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-foreground truncate">{activeInfra.name}</p>
                  <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                    ID: {activeInfra.name!.slice(0, 12)}...
                  </p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer py-2 px-3 focus:bg-primary/10">
                    <Link href={`/challenges/${activeInfra.name}`} className="flex items-center gap-2">
                      <ExternalLink className="size-3 text-primary/70" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Перейти к заданию</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/30" />

                  <DropdownMenuItem
                    onClick={handleGlobalTerminate}
                    className="rounded-none cursor-pointer py-2 px-3 text-red-500 focus:text-red-400 focus:bg-red-500/10 gap-2"
                  >
                    <Power className="size-3" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Остановить сессию</span>
                  </DropdownMenuItem>
                </div>
              </>
            ) : (
              <div className="px-4 py-4 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Нет активных сессий</p>
                <p className="text-[9px] text-muted-foreground/30">Запустите задание чтобы начать</p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}