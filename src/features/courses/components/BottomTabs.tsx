"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Flag, StickyNote, Lightbulb, ExternalLink,
    Eye, CheckCircle2, BookOpen, ArrowUpRight,
} from "lucide-react";

interface CourseDataForTabs {
    taskId?: string;
    title: string;
    category?: string;
    difficulty?: string;
    checkMode?: string;
    notesTitle?: string;
    objectives?: string[];
    hints?: string[];
    resources?: { title: string; url: string }[];
}

interface BottomTabsProps {
    courseData: CourseDataForTabs;
    taskStatus: string;
    progress: { current: number; total: number };
}

/* ─── Задание: цели ─── */
function MissionTab({ courseData, taskStatus }: {
    courseData: CourseDataForTabs;
    taskStatus: string;
}) {
    const isSolved = taskStatus === "SOLVED";
    const hasObjectives = courseData.objectives && courseData.objectives.length > 0;

    return (
        <div className="flex flex-col h-full font-mono">
            {/* Статус-баннер */}
            <div className={`px-4 py-3 border-b flex items-center gap-3 shrink-0 ${
                isSolved
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border/10 bg-transparent'
            }`}>
                {isSolved ? (
                    <>
                        <CheckCircle2 className="size-4 text-primary/70 shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Выполнено</p>
                            <p className="text-[9px] text-muted-foreground/40">{courseData.title}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="size-4 border border-muted-foreground/20 shrink-0 flex items-center justify-center">
                            <div className="size-1.5 bg-primary/50 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">В процессе</p>
                            <p className="text-[9px] text-muted-foreground/40 truncate max-w-[200px]">{courseData.title}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Цели */}
            <div className="flex-1 overflow-auto p-4">
                {hasObjectives ? (
                    <div className="space-y-1.5">
                        <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest mb-3">
                            Цели задания
                        </p>
                        {courseData.objectives!.map((obj, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 px-3 py-2.5 border border-border/10 hover:border-border/20 transition-colors"
                            >
                                <span className="text-[9px] text-primary/25 font-mono shrink-0 mt-0.5 tabular-nums w-4">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[11px] text-muted-foreground/60 leading-relaxed">{obj}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-muted-foreground/25 uppercase tracking-widest">
                        Цели не заданы
                    </p>
                )}
            </div>

            {/* Мета внизу */}
            {/* {(courseData.category || courseData.difficulty) && (
                <div className="border-t border-border/10 px-4 py-2.5 flex items-center gap-4 shrink-0">
                    {courseData.category && courseData.category !== "—" && (
                        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
                            {courseData.category}
                        </span>
                    )}
                    {courseData.category && courseData.difficulty && courseData.difficulty !== "—" && (
                        <span className="text-muted-foreground/15">·</span>
                    )}
                    {courseData.difficulty && courseData.difficulty !== "—" && (
                        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
                            {courseData.difficulty}
                        </span>
                    )}
                    {courseData.checkMode && (
                        <Badge variant="outline" className="ml-auto text-[8px] h-4 rounded-none border-primary/15 text-primary/40 px-1.5 uppercase">
                            {courseData.checkMode}
                        </Badge>
                    )}
                </div>
            )} */}
        </div>
    );
}

/* ─── Подсказки ─── */
function HintsTab({ hints }: { hints: string[] }) {
    const [revealed, setRevealed] = useState(0);

    if (!hints || hints.length === 0) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full gap-3 text-center">
                <Lightbulb className="size-8 text-muted-foreground/10" />
                <p className="text-[10px] text-muted-foreground/25 uppercase tracking-widest font-mono">
                    Автор не добавил подсказки
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full font-mono">
            {/* Прогресс подсказок */}
            <div className="px-4 py-2.5 border-b border-border/10 flex items-center justify-between shrink-0">
                <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
                    Подсказки
                </span>
                <span className="text-[9px] font-mono text-primary/30 tabular-nums">
                    {revealed}/{hints.length}
                </span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
                {hints.map((hint, i) => {
                    const isOpen = i < revealed;
                    const isNext = i === revealed;

                    return (
                        <div
                            key={i}
                            className={`border transition-all duration-300 ${
                                isOpen
                                    ? 'border-primary/25 bg-gradient-to-r from-primary/5 to-transparent'
                                    : 'border-border/15 bg-muted/[0.03]'
                            }`}
                        >
                            {isOpen ? (
                                /* Открытая подсказка */
                                <div className="px-4 py-3 flex gap-3">
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <span className="text-[8px] font-black text-primary/50 tabular-nums">
                                            #{String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="w-px flex-1 bg-primary/15 min-h-[8px]" />
                                    </div>
                                    <p className="text-[12px] text-foreground/65 leading-relaxed pt-0.5">{hint}</p>
                                </div>
                            ) : isNext ? (
                                /* Следующая — кнопка открытия */
                                <button
                                    onClick={() => setRevealed(i + 1)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[8px] font-black text-muted-foreground/20 tabular-nums">
                                            #{String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/30 italic">
                                            Подсказка скрыта
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                                        <Eye className="size-3" />
                                        <span className="text-[9px] uppercase tracking-wider font-bold">
                                            Открыть
                                        </span>
                                    </div>
                                </button>
                            ) : (
                                /* Заблокированная */
                                <div className="px-4 py-3 flex items-center gap-3 opacity-30">
                                    <span className="text-[8px] font-black text-muted-foreground/50 tabular-nums">
                                        #{String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/40 italic">
                                        Сначала открой предыдущие
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {revealed > 0 && revealed < hints.length && (
                <div className="px-4 py-2 border-t border-border/10 shrink-0">
                    <p className="text-[8px] text-muted-foreground/20 italic text-center">
                        Попробуй сначала сам, прежде чем открыть следующую
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Ресурсы ─── */
function ResourcesTab({ resources }: { resources: { title: string; url: string }[] }) {
    if (!resources || resources.length === 0) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full gap-3 text-center">
                <BookOpen className="size-8 text-muted-foreground/10" />
                <p className="text-[10px] text-muted-foreground/25 uppercase tracking-widest font-mono">
                    Материалы не добавлены
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full font-mono">
            <div className="px-4 py-2.5 border-b border-border/10 shrink-0">
                <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest">
                    Полезные ссылки
                </span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-1.5">
                {resources.map((res, i) => (
                    <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-2.5 border border-border/10 hover:border-primary/25 hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[9px] text-primary/25 font-mono shrink-0 tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[11px] text-muted-foreground/55 group-hover:text-foreground/70 transition-colors truncate">
                                {res.title}
                            </span>
                        </div>
                        <ArrowUpRight className="size-3.5 text-muted-foreground/20 group-hover:text-primary/50 transition-colors shrink-0 ml-2" />
                    </a>
                ))}
            </div>
        </div>
    );
}

/* ─── Заметки ─── */
function NotesTab({ taskId, notesTitle }: { taskId?: string; notesTitle?: string }) {
    const storageKey = `notes_${taskId ?? 'default'}`;
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const val = localStorage.getItem(storageKey);
        if (val) setNotes(val);
    }, [storageKey]);

    const handleChange = (val: string) => {
        setNotes(val);
        localStorage.setItem(storageKey, val);
        setSaved(true);
        setTimeout(() => setSaved(false), 800);
    };

    const placeholder = notesTitle
        ? `# ${notesTitle}\n\n`
        : `# Мои заметки\n\n`;

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-2.5 border-b border-border/10 flex items-center justify-between shrink-0">
                <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-mono">
                    Заметки
                </span>
                <span className={`text-[8px] font-mono transition-opacity duration-300 ${saved ? 'text-primary/40 opacity-100' : 'opacity-0'}`}>
                    сохранено
                </span>
            </div>
            <Textarea
                value={notes}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 resize-none font-mono text-[11px] bg-transparent border-none focus-visible:ring-0 rounded-none placeholder:text-muted-foreground/15 text-foreground/60 leading-relaxed px-4 py-3"
            />
        </div>
    );
}

/* ─── Главный экспорт ─── */
export function BottomTabs({ courseData, taskStatus, progress }: BottomTabsProps) {
    const hasHints     = (courseData.hints?.length ?? 0) > 0;
    const hasResources = (courseData.resources?.length ?? 0) > 0;

    return (
        <Tabs defaultValue="mission" className="flex flex-col h-full">
            <TabsList className="bg-transparent border-b border-white/[0.04] h-9 w-full justify-start rounded-none px-1 shrink-0 gap-0">
                <TabsTrigger
                    value="mission"
                    className="h-full text-[9px] uppercase font-bold tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary/60 data-[state=active]:text-primary/80 data-[state=active]:bg-transparent text-muted-foreground/25 px-3 gap-1.5 transition-colors"
                >
                    <Flag className="size-3" /> Задание
                </TabsTrigger>

                <TabsTrigger
                    value="hints"
                    className="h-full text-[9px] uppercase font-bold tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary/60 data-[state=active]:text-primary/80 data-[state=active]:bg-transparent text-muted-foreground/25 px-3 gap-1.5 transition-colors"
                >
                    <Lightbulb className="size-3" />
                    Подсказки
                    {hasHints && (
                        <span className="size-4 rounded-full bg-primary/15 text-primary/50 text-[8px] font-black flex items-center justify-center ml-0.5">
                            {courseData.hints!.length}
                        </span>
                    )}
                </TabsTrigger>

                {hasResources && (
                    <TabsTrigger
                        value="resources"
                        className="h-full text-[9px] uppercase font-bold tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary/60 data-[state=active]:text-primary/80 data-[state=active]:bg-transparent text-muted-foreground/25 px-3 gap-1.5 transition-colors"
                    >
                        <BookOpen className="size-3" /> Ресурсы
                    </TabsTrigger>
                )}

                <TabsTrigger
                    value="notes"
                    className="h-full text-[9px] uppercase font-bold tracking-widest rounded-none border-b-2 border-transparent data-[state=active]:border-primary/60 data-[state=active]:text-primary/80 data-[state=active]:bg-transparent text-muted-foreground/25 px-3 gap-1.5 transition-colors"
                >
                    <StickyNote className="size-3" /> Заметки
                </TabsTrigger>
            </TabsList>

            <TabsContent value="mission" className="flex-1 overflow-auto m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <MissionTab courseData={courseData} taskStatus={taskStatus} />
            </TabsContent>
            <TabsContent value="hints" className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <HintsTab hints={courseData.hints ?? []} />
            </TabsContent>
            {hasResources && (
                <TabsContent value="resources" className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                    <ResourcesTab resources={courseData.resources!} />
                </TabsContent>
            )}
            <TabsContent value="notes" className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <NotesTab taskId={courseData.taskId} notesTitle={courseData.notesTitle} />
            </TabsContent>
        </Tabs>
    );
}