"use client"

import React from "react"
import { Lock, CheckCircle2, Circle, ChevronRight, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { ModelsUserCourseDetailsResponse } from "@/api/generated"

interface ModuleTreeProps {
  course: ModelsUserCourseDetailsResponse
}

export default function ModuleTree({ course }: ModuleTreeProps) {
  if (!course.modules || course.modules.length === 0) {
    return (
      <div className="p-10 border border-dashed border-border/40 text-center font-mono text-xs text-muted-foreground tracking-widest">
        <span className="text-primary/40">$</span> Учебный план пуст или находится в процессе развертывания...
      </div>
    )
  }

  const modules = course.modules

  return (
    <div className="font-mono pl-4 border-l-2 border-border/20">
      {modules.map((module, moduleIndex) => {
        const moduleNumber = String(module.order ?? moduleIndex + 1).padStart(2, "0")
        const solved = module.solved_tasks ?? 0
        const total = module.total_tasks ?? 0
        const percent = total > 0 ? Math.round((solved / total) * 100) : 0
        const isCompleted = percent === 100
        const isLast = moduleIndex === modules.length - 1

        // Модуль считается закрытым, если все задачи LOCKED
        const isModuleLocked = module.tasks?.every((task: any) => task.status === "LOCKED") ?? true

        return (
          <div key={module.slug ?? moduleIndex} className="relative">
            {/* горизонтальный коннектор */}
            <div className="absolute -left-4 top-[22px] w-4 h-px bg-border/40" />

            <div className={isLast ? "pb-0" : "pb-3"}>
              <ModuleBlock
                module={module}
                moduleNumber={moduleNumber}
                solved={solved}
                total={total}
                percent={percent}
                isCompleted={isCompleted}
                isModuleLocked={isModuleLocked}
                courseSlug={course.slug!}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Модуль ─── */
function ModuleBlock({
  module,
  moduleNumber,
  solved,
  total,
  percent,
  isCompleted,
  isModuleLocked,
  courseSlug,
}: {
  module: any
  moduleNumber: string
  solved: number
  total: number
  percent: number
  isCompleted: boolean
  isModuleLocked: boolean
  courseSlug: string
}) {
  return (
    // Убрали общий opacity-50 отсюда, чтобы не размывать вложенные таски до нечитаемости
    <div className="group/module">
      {/* Заголовок модуля */}
      <div className={`flex items-center justify-between gap-4 px-4 py-2.5 border border-border/40 bg-muted/10 transition-colors duration-200 ${isModuleLocked ? "bg-background opacity-60" : "hover:border-border/60"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] text-primary/40 shrink-0 tabular-nums select-none w-5 text-right">
            {moduleNumber}
          </span>
          <span className="w-px h-3 bg-border/40 shrink-0" />
          <span className={`text-xs font-bold uppercase tracking-wide truncate ${isModuleLocked ? "text-muted-foreground" : "text-foreground"}`}>
            {module.title}
          </span>
          {isCompleted && (
            <Badge
              variant="outline"
              className="text-[9px] font-bold uppercase tracking-widest border-primary/30 text-primary bg-primary/5 shrink-0"
            >
              завершён
            </Badge>
          )}
          {isModuleLocked && (
            <Lock className="size-3 text-muted-foreground/60 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {total > 0 && !isModuleLocked && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-20">
                <Progress
                  value={percent}
                  className="h-[2px] bg-border/30 [&>div]:bg-primary [&>div]:transition-all"
                />
              </div>
              <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                {solved}/{total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Список заданий */}
      <div className="mt-2 pl-6 border-l-2 border-border/[0.15] ml-4 space-y-0">
        {module.tasks?.map((task: any, taskIndex: number) => {
          const status = task.status ?? "LOCKED"
          const isSolved = status === "SOLVED"
          const isLocked = status === "LOCKED" || isModuleLocked 

          return (
            <div key={task.slug ?? taskIndex} className="relative">
              <div className="absolute -left-6 top-[18px] w-5 h-px bg-border/30" />
              <TaskRow
                task={task}
                taskIndex={taskIndex}
                status={status}
                isSolved={isSolved}
                isLocked={isLocked}
                courseSlug={courseSlug}
                moduleSlug={module.slug}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Задание ─── */
function TaskRow({
  task,
  taskIndex,
  isSolved,
  isLocked,
  courseSlug,
  moduleSlug,
}: {
  task: any
  taskIndex: number
  status: string
  isSolved: boolean
  isLocked: boolean
  courseSlug: string
  moduleSlug: string
}) {
  const displayName = task.title ?? task.slug ?? `Задание ${taskIndex + 1}`

  return (
    <div
      className={`
        flex items-center justify-between gap-4 px-3 py-2.5
        transition-colors duration-150
        ${isLocked 
          ? "pointer-events-none select-none bg-muted/[0.02]" // Убрали opacity-30, добавили легкий темный фон для заблокированных
          : "hover:bg-primary/[0.04] group/row cursor-pointer"
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <StatusIcon isSolved={isSolved} isLocked={isLocked} />
        <div className="min-w-0">
          <span
            className={`text-sm font-medium truncate block transition-colors ${
              isSolved
                ? "text-muted-foreground/60 line-through decoration-primary/40"
                : isLocked
                ? "text-muted-foreground/80" // Поставили /80 вместо былой прозрачности. Теперь текст яркий и отлично читается!
                : "text-foreground group-hover/row:text-primary"
            }`}
          >
            {displayName}
          </span>
          <span className={`text-[9px] uppercase tracking-wider font-mono ${isLocked ? "text-muted-foreground/30" : "text-muted-foreground/40"}`}>
            {(task.slug ?? `task-${taskIndex}`).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {isLocked ? (
          // Сделали замок чуть более заметным на конце строки
          <Lock className="size-3.5 text-muted-foreground/50 mr-2" />
        ) : (
          <Link href={`/courses/${courseSlug}/${moduleSlug}/${task.slug}`}>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-3 text-[11px] font-bold uppercase tracking-wider rounded-none gap-1.5 ${
                isSolved
                  ? "text-primary/60 hover:bg-primary/5 hover:text-primary/80"
                  : "text-primary hover:bg-primary/10 hover:text-primary"
              }`}
            >
               {isSolved ? (
                <>Заново <RotateCcw className="size-3" /></>
              ) : (
                <>Начать <ChevronRight className="size-3.5" /></>
              )}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

function StatusIcon({ isSolved, isLocked }: { isSolved: boolean; isLocked: boolean }) {
  if (isSolved) return <CheckCircle2 className="size-4 text-primary shrink-0" />
  // Иконка замка в начале строки теперь тоже видна отчетливее
  if (isLocked) return <Lock className="size-4 text-muted-foreground/40 shrink-0" />
  return <Circle className="size-4 text-muted-foreground/40 shrink-0" />
}