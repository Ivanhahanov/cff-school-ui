import React from "react"
import Link from "next/link"
import {
  Terminal, Globe, Cpu, Lock, ChevronRight,
  Search, Shield, Layers, ArrowRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getApiV1CoursesList } from "@/api/generated"
import { getServerClient } from "@/api/client"
import { CourseRowClient } from "@/features/courses/components/CourseRow"
/* ─── Типы из бэка ─── */
interface CourseResponse {
  slug: string
  title: string
  summary?: string
  category?: string
  difficulty?: string
  is_published?: boolean
}

/* ─── Маппинги ─── */
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

/* ─── Серверный компонент ─── */
interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}

export default async function CourseListPage({ searchParams }: PageProps) {
  const { q, category, page } = await searchParams
  const currentPage = Math.max(1, Number(page ?? 1))

  // Инициализация серверного клиента (передает куки/токены авторизации на Go бэкенд)
  await getServerClient()

  let courses: any[] = []
  let total = 0
  let totalPages = 1

  try {
    const { data } = await getApiV1CoursesList({
      query: {
        q,
        category,
        page: currentPage,
      },
    })
    // Теперь здесь будут объекты, содержащие поле is_unlocked
    courses     = data?.data      ?? [] 
    total       = data?.total     ?? 0
    totalPages  = data?.totalPages ?? 1
  } catch {
    // показываем пустой список, не падаем
  }

  return (
    <div className="min-h-screen bg-background font-mono">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── Заголовок ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/60">
            <Terminal className="size-3" /> база знаний
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Курсы
          </h1>
          {total > 0 && (
            <p className="text-xs text-muted-foreground">
              найдено {total} {pluralize(total, "курс", "курса", "курсов")}
            </p>
          )}
        </div>

        {/* ── Панель поиска и фильтров ── */}
        <FilterBar q={q} category={category} />

        <Separator className="border-border/30" />

        {/* ── Список ── */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {courses.map((course) => (
              // Рендерим новый клиентский компонент строки со встроенной логикой Unlock
              <CourseRowClient key={course.slug} course={course} />
            ))}
          </div>
        )}

        {/* ── Пагинация ── */}
        {totalPages > 1 && (
          <Pagination current={currentPage} total={totalPages} q={q} category={category} />
        )}
      </div>
    </div>
  )
}

/* ─── Панель поиска ─── */
function FilterBar({ q, category }: { q?: string; category?: string }) {
  const CATEGORIES = [
    { value: "",        label: "Все" },
    { value: "web",     label: "Web" },
    { value: "system",  label: "System" },
    { value: "network", label: "Network" },
    { value: "reverse", label: "Reverse" },
  ]

  return (
    <form method="GET" className="flex flex-col sm:flex-row gap-3">
      {/* Поиск */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="поиск по названию..."
          className="pl-9 h-9 rounded-none border-border/50 bg-card/40 text-xs placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/40"
        />
      </div>

      {/* Категории */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = (category ?? "") === cat.value
          return (
            <Link
              key={cat.value}
              href={buildUrl({ q, category: cat.value || undefined, page: undefined })}
              className={`
                inline-flex items-center h-9 px-3 text-[10px] font-bold uppercase tracking-widest border transition-colors
                ${isActive
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/40 bg-card/20 text-muted-foreground hover:border-border/70 hover:text-foreground"
                }
              `}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>
    </form>
  )
}

/* ─── Строка курса ─── */
function CourseRow({ course }: { course: CourseResponse }) {
  const diff    = DIFFICULTY_CONFIG[course.difficulty ?? ""] ?? { label: course.difficulty ?? "—", className: "border-border/40 text-muted-foreground" }
  const Icon    = CATEGORY_ICONS[course.category?.toLowerCase() ?? ""] ?? Terminal
  const locked  = course.is_published

  return (
    <Link
      href={locked ? "#" : `/courses/${course.slug}`}
      className={`block ${locked ? "pointer-events-none" : "group"}`}
      aria-disabled={locked}
    >
      <div className={`
        flex items-center gap-5 px-5 py-4 border-b border-border/20
        transition-colors duration-150
        ${locked
          ? "opacity-40"
          : "hover:bg-primary/[0.03] hover:border-primary/20 cursor-pointer"
        }
      `}>

        {/* Иконка */}
        <div className="shrink-0 hidden sm:flex items-center justify-center w-8 h-8 border border-border/40 bg-card/60 group-hover:border-primary/30 transition-colors">
          <Icon className="size-4 text-muted-foreground/60 group-hover:text-primary/70 transition-colors" />
        </div>

        {/* Основная информация */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {course.category && (
              <span className="text-[9px] text-primary/50 uppercase tracking-widest">
                {course.category}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
            {course.title}
          </h3>
          {course.summary && (
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-1 hidden sm:block">
              {course.summary}
            </p>
          )}
        </div>

        {/* Бейджи */}
        <div className="shrink-0 flex items-center gap-3">
          <Badge
            variant="outline"
            className={`text-[9px] font-bold uppercase tracking-wider rounded-none hidden sm:flex ${diff.className}`}
          >
            {diff.label}
          </Badge>

          {locked ? (
            <Lock className="size-3.5 text-muted-foreground/30" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </Link>
  )
}

/* ─── Пагинация ─── */
function Pagination({ current, total, q, category }: { current: number; total: number; q?: string; category?: string }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-[10px] text-muted-foreground font-mono">
        стр. {current} / {total}
      </span>
      <div className="flex gap-2">
        {current > 1 && (
          <Link href={buildUrl({ q, category, page: current - 1 })}>
            <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] rounded-none font-mono">
              ← Назад
            </Button>
          </Link>
        )}
        {current < total && (
          <Link href={buildUrl({ q, category, page: current + 1 })}>
            <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] rounded-none font-mono">
              Вперёд →
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

/* ─── Пустое состояние ─── */
function EmptyState() {
  return (
    <div className="py-20 text-center space-y-3">
      <p className="text-xs text-muted-foreground font-mono">
        <span className="text-primary/40">$</span> курсы не найдены по заданным параметрам
      </p>
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="text-[10px] rounded-none font-mono text-primary gap-1">
          сбросить фильтры <ArrowRight className="size-3" />
        </Button>
      </Link>
    </div>
  )
}

/* ─── Хелперы ─── */
function buildUrl({ q, category, page }: { q?: string; category?: string; page?: number }) {
  const params = new URLSearchParams()
  if (q)        params.set("q", q)
  if (category) params.set("category", category)
  if (page && page > 1) params.set("page", String(page))
  const qs = params.toString()
  return `/courses${qs ? `?${qs}` : ""}`
}

function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}