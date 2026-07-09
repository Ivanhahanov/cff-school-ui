import { Terminal, Shield, ChevronRight, Clock, Layers, Lock } from "lucide-react"
import ModuleTree from "@/features/courses/components/ModuleTree"
import { getApiV1CoursesBySlug } from "@/api/generated"
import { getServerClient } from "@/api/client"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

async function getCourseData(slug: string) {
    try {
        await getServerClient()
        const { data: course } = await getApiV1CoursesBySlug({
            path: { slug },
        })
        return course!
    } catch {
        return null
    }
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
    easy:   { label: "Начальный",     color: "text-emerald-400" },
    medium: { label: "Средний",       color: "text-yellow-400"  },
    hard:   { label: "Продвинутый",   color: "text-orange-400"  },
    expert: { label: "Эксперт",       color: "text-red-400"     },
}

export default async function CourseOverviewPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const course = await getCourseData(id)

    if (!course) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 font-mono">
                <div className="flex items-center gap-3 text-red-500">
                    <span className="text-red-500/60 select-none">▶</span>
                    <span className="text-sm">[ERR_404]: Данные курса не найдены в репозитории.</span>
                </div>
            </div>
        )
    }

    const difficulty = DIFFICULTY_MAP[course.difficulty ?? ""] ?? { label: course.difficulty ?? "—", color: "text-muted-foreground" }
    const moduleCount = course.modules?.length ?? 0
    const taskCount = course.modules?.reduce((acc, m) => acc + (m.tasks?.length ?? 0), 0) ?? 0

    return (
        <div className="min-h-screen bg-background">
            
            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

                {/* ── Герой ── */}
                <section className="space-y-6">
                    {/* Бейдж */}
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className="font-mono text-[10px] tracking-widest uppercase gap-1.5 border-primary/30 text-primary bg-primary/5"
                        >
                            <Terminal className="size-3" />
                            Программа подготовки
                        </Badge>
                    </div>

                    {/* Заголовок */}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1] font-mono">
                        {course.title}
                    </h1>

                    {/* Описание */}
                    <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                        {course.summary}
                    </p>

                    {/* Метрики */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        <StatPill icon={<Layers className="size-3.5" />} label={`${moduleCount} модулей`} />
                        <StatPill icon={<Clock  className="size-3.5" />} label={`${taskCount} заданий`} />
                        <StatPill
                            icon={<Shield className="size-3.5" />}
                            label={difficulty.label}
                            valueClassName={difficulty.color}
                        />
                    </div>
                </section>

                <Separator className="border-border/40" />

                {/* ── Основная сетка ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

                    {/* Учебный план */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold font-mono tracking-tight">Учебный план</h2>
                            <div className="flex-1 h-px bg-border/40" />
                            <span className="text-xs font-mono text-muted-foreground">{moduleCount} mod</span>
                        </div>
                        <ModuleTree course={course} />
                    </div>

                    {/* Боковая панель */}
                    <aside className="space-y-4">

                        {/* Требования */}
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardHeader className="pb-3 pt-4 px-4">
                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                    Требования
                                </p>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-3">
                                {[
                                    "Командная строка Linux",
                                    "Понимание модели OSI",
                                    "Базовый Python / Bash",
                                ].map((req, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <span className="font-mono text-primary/60 text-xs mt-0.5 tabular-nums">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-muted-foreground leading-snug">{req}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Доступ */}
                        {!course.is_unlocked && (
                            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center gap-3 text-sm text-muted-foreground">
                                    <Lock className="size-4 shrink-0 text-primary/50" />
                                    <span className="font-mono text-xs leading-snug">
                                        Курс закрыт. Для доступа необходимо прохождение предыдущих модулей.
                                    </span>
                                </CardContent>
                            </Card>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    )
}

/* ── Вспомогательный компонент ── */
function StatPill({
    icon,
    label,
    valueClassName,
}: {
    icon: React.ReactNode
    label: string
    valueClassName?: string
}) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-card/60 text-xs font-mono text-muted-foreground">
            <span className="text-primary/70">{icon}</span>
            <span className={valueClassName}>{label}</span>
        </div>
    )
}