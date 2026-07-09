"use client";
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { BottomTabs } from "./BottomTabs";

import {
    Terminal as TerminalIcon,
    Layers,
    Activity,
    ExternalLink,
    RefreshCw,
    Maximize,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Lock,
    Flag,
    StickyNote,
    Server,
    Copy,
    Check,
    Wifi,
    WifiOff,
    Cpu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

import { CourseTask } from "./CourseTask";
import { useInfra } from "@/context/session-context";
import { CourseInstance } from "./Insance"

interface TaskProgress {
    current: number;
    total: number;
    nextTaskId?: string;
}

interface CoursePageProps {
    courseData: {
        courseTitle: string;
        moduleTitle: string;
        title: string;
        description: string;
        content: string;
        difficulty: string;
        category: string;
        instanceId?: string;
        // frontmatter поля
        taskId?: string;
        checkMode?: string;
        notesTitle?: string;        // ← новое
        objectives?: string[];      // ← новое
        hints?: string[];
    };
    progress: TaskProgress;
    accessToken: string;
    nextPath: string | null;
    prevPath: string | null;
    isLastTask: boolean;
    initialStatus: string;
}

/* ─── Кнопка копирования с фидбеком ─── */
function CopyButton({ text, className }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <Button variant="ghost" size="sm" className={`h-6 text-[10px] gap-1 ${className}`} onClick={handle}>
            {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            {copied ? "Скопировано" : "Копировать"}
        </Button>
    );
}

/* ─── Главный компонент ─── */
export function CoursePage({ courseData, progress, accessToken, nextPath, prevPath, isLastTask, initialStatus }: CoursePageProps) {
    const { activeInfra } = useInfra();
    const [isMounted, setIsMounted] = useState(false);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<string>(initialStatus);

    const isCompleted = taskStatus === "SOLVED";
    const canGoNext = isCompleted;

    useEffect(() => {
        if (activeInfra?.endpoints?.length && !activeTabId) {
            setActiveTabId(activeInfra.endpoints[0]!.name!);
        }
    }, [activeInfra, activeTabId]);

    useEffect(() => { setIsMounted(true); }, []);

    const currentEndpoint = activeInfra?.endpoints?.find((e: any) => e.name === activeTabId);

    if (!isMounted) {
        return <div className="h-[calc(100vh-64px)] w-full bg-background animate-pulse" />;
    }

    /* ─── Markdown компоненты ─── */
    const MarkdownComponents = {
        // Заголовки — чуть приглушённее
        h1: ({ children }: any) => (
            <h1 className="text-xl font-black uppercase tracking-tight text-foreground/90 mt-8 mb-4 pb-2 border-b border-border/20">{children}</h1>
        ),
        h2: ({ children }: any) => (
            <h2 className="text-lg font-bold uppercase tracking-tight text-foreground/80 mt-7 mb-3">{children}</h2>
        ),
        h3: ({ children }: any) => (
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mt-6 mb-3 flex items-center gap-2">
                <span className="text-primary/40 font-mono">#</span>{children}
            </h3>
        ),
        // Параграфы — мягче, с нормальным межстрочником
        p: ({ children }: any) => (
            <div className="mb-4 leading-7 text-muted-foreground/80 text-[14px] font-sans">{children}</div>
        ),
        // Инлайн-код
        code: ({ node, inline, className, children, ...props }: any) => (
            <code className="bg-primary/8 text-primary/90 px-1.5 py-0.5 font-mono text-[12px] border border-primary/15 inline" {...props}>
                {children}
            </code>
        ),
        // Блок кода
        pre: ({ children }: any) => {
            const codeElement = children?.props;
            const content = String(codeElement?.children || '').replace(/\n$/, '');
            return (
                <div className="not-prose my-5 border border-border/20 bg-black/30 group">
                    <div className="flex justify-between items-center px-4 py-2 bg-white/[0.02] border-b border-border/10">
                        <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">source</span>
                        <CopyButton text={content} className="opacity-30 group-hover:opacity-70" />
                    </div>
                    <pre className="p-5 overflow-x-auto font-mono text-[13px] text-slate-400/90 leading-relaxed">
                        <code>{codeElement?.children}</code>
                    </pre>
                </div>
            );
        },
        // Цитата
        blockquote: ({ children }: any) => (
            <blockquote className="not-prose my-4 border-l-2 border-primary/30 pl-4 py-1 bg-primary/[0.03] text-[13px] text-muted-foreground/60 italic leading-relaxed">
                {children}
            </blockquote>
        ),
        // Горизонтальная линия
        hr: () => <Separator className="my-7 bg-border/20" />,
        // Списки
        ul: ({ children }: any) => (
            <ul className="my-3 space-y-1.5 text-[14px] text-muted-foreground/70 leading-relaxed list-none pl-0">{children}</ul>
        ),
        li: ({ children }: any) => (
            <li className="flex items-start gap-2.5">
                <span className="text-primary/40 mt-1.5 shrink-0 font-mono text-[10px]">▸</span>
                <span>{children}</span>
            </li>
        ),
        // Кастомные компоненты
        terminal: ({ command, description }: any) => (
            <div className="not-prose my-5 border border-border/20 bg-black/20 group">
                <div className="flex justify-between items-center px-4 py-2 border-b border-border/10">
                    <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">{description}</span>
                    <CopyButton text={command} className="opacity-30 group-hover:opacity-80" />
                </div>
                <div className="px-4 py-3">
                    <code className="font-mono text-[13px] text-primary/80">
                        <span className="text-primary/25 mr-2 select-none">$</span>{command}
                    </code>
                </div>
            </div>
        ),
        quiz: ({ question, options, answer }: any) => {
            const opts = options.split(',');
            const [selected, setSelected] = useState<string | null>(null);
            return (
                <div className="not-prose my-6 border border-border/20 bg-muted/5 p-5">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="mt-1 size-1.5 bg-primary/60 shrink-0 animate-pulse" />
                        <p className="text-[13px] font-medium text-foreground/80 leading-relaxed">{question}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {opts.map((opt: string) => {
                            const isSelected = selected === opt;
                            const isCorrect = opt.trim() === answer.trim();
                            return (
                                <button
                                    key={opt}
                                    disabled={selected !== null}
                                    onClick={() => setSelected(opt)}
                                    className={`text-left px-3 py-2.5 border font-mono text-[11px] uppercase tracking-widest transition-all duration-200 rounded-none
                                        ${isSelected
                                            ? isCorrect
                                                ? 'border-emerald-500/40 bg-emerald-500/8 text-emerald-400/90'
                                                : 'border-red-500/40 bg-red-500/8 text-red-400/80'
                                            : 'border-border/30 bg-muted/5 text-muted-foreground/60 hover:border-primary/30 hover:text-foreground/70'
                                        }`}
                                >
                                    <span className="mr-2 opacity-40">[{isSelected ? (isCorrect ? '✓' : '✕') : '·'}]</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {selected && (
                        <p className={`mt-3 text-[10px] font-mono uppercase tracking-widest ${selected.trim() === answer.trim() ? 'text-emerald-500/70' : 'text-red-500/60'}`}>
                            {selected.trim() === answer.trim() ? '✓ Верно' : '✕ Неверно'}
                        </p>
                    )}
                </div>
            );
        },
        task: ({ id, points }: any) => (
            <div className="not-prose my-6">
                <CourseTask taskId={id} points={points} onSolve={() => setTaskStatus("SOLVED")} />
            </div>
        ),
        status: ({ type, children }: any) => (
            <span className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 text-[10px] font-bold uppercase tracking-wider font-mono
                ${type === 'danger'
                    ? 'bg-red-500/10 text-red-400/80 border border-red-500/20'
                    : 'bg-primary/10 text-primary/80 border border-primary/20'
                }`}>
                {children}
            </span>
        ),
        secret: ({ title, children }: any) => (
            <details className="not-prose my-5 border border-border/20 bg-muted/5 group">
                <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest list-none hover:text-primary/60 transition-colors flex items-center gap-2">
                    <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
                    {title || 'Подсказка'}
                </summary>
                <div className="px-4 pb-4 pt-1 text-[13px] text-muted-foreground/60 border-t border-border/20 leading-relaxed italic">
                    {children}
                </div>
            </details>
        ),
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-background overflow-hidden font-mono">

            {/* ── Верхняя панель ── */}
            <div className="h-12 shrink-0 border-b border-border/30 bg-card/10 flex items-center justify-between px-4 gap-4">
                {/* Левая часть */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                        <p className="text-[9px] text-primary/50 uppercase tracking-widest leading-none mb-0.5">
                            Задание {progress.current} / {progress.total}
                        </p>
                        <h2 className="text-[13px] font-bold uppercase tracking-tight text-foreground/90 truncate max-w-[280px]">
                            {courseData.title}
                        </h2>
                    </div>

                    <Separator orientation="vertical" className="h-7 bg-border/30 hidden md:block shrink-0" />

                    {/* Прогресс-бар */}
                    <div className="hidden md:flex items-center gap-2.5 shrink-0">
                        <div className="h-[3px] w-28 bg-muted/20 overflow-hidden">
                            <div
                                className="h-full bg-primary/50 transition-all duration-700"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                        <span className="text-[9px] text-muted-foreground/40 tabular-nums">
                            {Math.round((progress.current / progress.total) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Правая часть: навигация */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost" size="sm"
                        asChild={!!prevPath}
                        disabled={!prevPath}
                        className="h-8 px-3 rounded-none text-muted-foreground/50 hover:text-foreground hover:bg-muted/20 disabled:opacity-20 gap-1"
                    >
                        {prevPath ? (
                            <Link href={prevPath}>
                                <ChevronLeft className="size-3.5" />
                                <span className="text-[10px] uppercase tracking-widest hidden sm:inline">Назад</span>
                            </Link>
                        ) : (
                            <><ChevronLeft className="size-3.5" /><span className="text-[10px] uppercase tracking-widest hidden sm:inline">Назад</span></>
                        )}
                    </Button>

                    <Separator orientation="vertical" className="h-5 bg-border/30" />

                    <Button
                        variant="ghost" size="sm"
                        asChild={canGoNext && !isLastTask && !!nextPath}
                        disabled={!canGoNext && !isLastTask}
                        className={`h-8 px-4 rounded-none gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-all
                            ${canGoNext
                                ? 'text-primary hover:bg-primary/10 hover:text-primary'
                                : 'text-muted-foreground/30 cursor-not-allowed'
                            }`}
                    >
                        {isLastTask ? (
                            <div className="flex items-center gap-1.5">
                                <span className="hidden sm:inline">Завершить</span>
                                <CheckCircle2 className="size-3.5" />
                            </div>
                        ) : canGoNext && nextPath ? (
                            <Link href={nextPath} className="flex items-center gap-1.5">
                                <span className="hidden sm:inline">Далее</span>
                                <ChevronRight className="size-3.5" />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="hidden sm:inline">Далее</span>
                                <Lock className="size-3 opacity-40" />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* ── Основная рабочая область ── */}
            <ResizablePanelGroup orientation="horizontal" className="flex-1">

                {/* ЛЕВАЯ ПАНЕЛЬ: контент */}
                <ResizablePanel defaultSize={50} minSize={25}>
                    <ScrollArea className="h-full">
                        <div className="max-w-[720px] mx-auto px-8 py-10 pb-20">
                            <article className="prose prose-invert max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={MarkdownComponents as any}
                                >
                                    {courseData.content}
                                </ReactMarkdown>
                            </article>
                        </div>
                    </ScrollArea>
                </ResizablePanel>

                <ResizableHandle withHandle className="w-[2px] bg-border/30 hover:bg-primary/40 data-[active]:bg-primary/50 transition-colors focus-visible:outline-none" />

                {/* ПРАВАЯ ПАНЕЛЬ */}
                <ResizablePanel defaultSize={50} minSize={25}>
                    <ResizablePanelGroup orientation="vertical">

                        {/* Верх: терминал/iframe */}
                        <ResizablePanel defaultSize={68} minSize={30}>
                            <div className="flex flex-col h-full bg-[#0a0a0a]">

                                {/* Хедер терминала */}
                                <div className="h-9 bg-black/50 border-b border-white/[0.04] flex items-center px-2 justify-between shrink-0">
                                    <div className="flex h-full gap-0.5">
                                        {activeInfra?.endpoints?.map((ep: any) => (
                                            <button
                                                key={ep.name}
                                                onClick={() => setActiveTabId(ep.name!)}
                                                className={`text-[9px] font-bold px-3 h-full uppercase tracking-widest transition-all border-b-2
                                                    ${activeTabId === ep.name
                                                        ? 'text-primary/80 border-primary/60 bg-primary/5'
                                                        : 'text-muted-foreground/30 border-transparent hover:text-muted-foreground/60'
                                                    }`}
                                            >
                                                {ep.name!.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>

                                    {currentEndpoint && (
                                        <div className="flex items-center gap-0.5">
                                            <Button variant="ghost" size="icon" className="size-7 text-white/15 hover:text-primary/60">
                                                <RefreshCw className="size-3" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon" className="size-7 text-white/15 hover:text-primary/60"
                                                onClick={() => { const e = document.getElementById('instance-viewport'); e?.requestFullscreen?.(); }}
                                            >
                                                <Maximize className="size-3" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon" className="size-7 text-white/15 hover:text-primary/60"
                                                onClick={() => window.open(currentEndpoint.url, '_blank')}
                                            >
                                                <ExternalLink className="size-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* iframe */}
                                <div className="flex-1 relative bg-black">
                                    {!activeInfra ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                                            <CourseInstance challengeId={courseData.instanceId || ""} taskSlug={courseData.taskId!} accessToken={accessToken} />
                                        </div>
                                    ) : (
                                        currentEndpoint && (
                                            <IframeWithLoader
                                                src={currentEndpoint.url!}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="h-[2px] bg-border/30 hover:bg-primary/40 data-[active]:bg-primary/50 transition-colors focus-visible:outline-none" />

                        {/* Низ: вкладки с инфо */}
                        <ResizablePanel defaultSize={32} minSize={15}>
                            <div className="h-full bg-[#080808] flex flex-col">
                                <BottomTabs
                                    courseData={courseData}
                                    taskStatus={taskStatus}
                                    progress={progress}
                                />
                            </div>
                        </ResizablePanel>

                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
function IframeWithLoader({ src }: { src: string }) {
    const [iframeReady, setIframeReady] = useState(false); // Событие onLoad от браузера
    const [uiReady, setUiReady] = useState(false);         // Финальная готовность после задержки
    
    // Анимация точек в процессе ожидания
    const [dots, setDots] = useState('');
    useEffect(() => {
        if (uiReady) return;
        const id = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 400);
        return () => clearInterval(id);
    }, [uiReady]);

    // Строгие текстовые логи без раскрытия стека
    const LOG_LINES = [
        'Инициализация PTY-сессии и выделение псевдотерминала',
        'Авторизация сеанса на защищенном узле',
        'Загрузка переменных окружения безопасной оболочки',
        'Монтирование изолированной файловой системы задания',
    ];
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

    useEffect(() => {
        if (iframeReady) return;
        let i = 0;
        const id = setInterval(() => {
            if (i < LOG_LINES.length) {
                setVisibleLogs(prev => [...prev, LOG_LINES[i]]);
                i++;
            } else {
                clearInterval(id);
            }
        }, 400); // Чуть ускорили интервал для динамики
        return () => clearInterval(id);
    }, [iframeReady]);


    // Тот самый ключевой фикс: ловим onLoad, но ждем инициализации ttyd
    const handleIframeLoad = () => {
         if (iframeReady) return;

        setIframeReady(true);
        // Добавляем финальный лог, показывающий, что сокет-соединение установлено
        setVisibleLogs(prev => [...prev, 'Синхронизация потока ввода-вывода данных']);
        
        // Даем ttyd ~1500мс на отрисовку сессии и только потом убираем шторку
        setTimeout(() => {
            setUiReady(true);
        }, 1500);
    };

    return (
        <div className="relative w-full h-full bg-black font-mono overflow-hidden">
            
            {/* ОВЕРЛЕЙ ЗАГРУЗКИ */}
            {/* Используем pointer-events-none после готовности, чтобы клики сразу уходили в терминал, 
                пока идет анимация размытия */}
            <div 
                className={`absolute inset-0 z-10 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 transition-all duration-700 ease-in-out
                    ${uiReady ? 'opacity-0 scale-[1.01] pointer-events-none backdrop-blur-none' : 'opacity-100'}`}
            >
                {/* Псевдо-терминал вывода логов */}
                <div className="flex-1 space-y-2 overflow-hidden flex flex-col justify-end">
                    {visibleLogs.map((line, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 text-[10px] tracking-tight text-white/40 font-mono animate-in fade-in slide-in-from-bottom-1 duration-200"
                        >
                            <span className="text-white/20 shrink-0">✓</span>
                            <span>{line}</span>
                        </div>
                    ))}
                    
                    {/* Индикатор ожидания / Мигающий курсор курсового режима */}
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-white/20">$</span>
                        {!iframeReady ? (
                            <span className="text-white/40 italic">Сборка потока{dots}</span>
                        ) : (
                            <span className="w-1.5 h-3.5 bg-white/50 animate-pulse inline-block" />
                        )}
                    </div>
                </div>

                {/* Минималистичная тонкая линия прогресса снизу экрана */}
                <div className="h-[1px] w-full bg-white/5 overflow-hidden shrink-0 mt-4">
                    <div 
                        className={`h-full bg-white/40 transition-all duration-500 ease-out
                            ${iframeReady ? 'w-full animate-none' : 'w-1/3 animate-[loading_2s_ease-in-out_infinite]'}`} 
                    />
                </div>
            </div>

            {/* ЦЕЛЕВОЙ IFRAME С ТЕРМИНАЛОМ */}
            <iframe
                src={src}
                className={`w-full h-full border-none transition-all duration-700 ease-in-out
                    ${uiReady ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-98 blur-sm'}`}
                allow="clipboard-read; clipboard-write; fullscreen"
                sandbox="allow-forms allow-scripts allow-same-origin"
                onLoad={handleIframeLoad}
            />

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
}