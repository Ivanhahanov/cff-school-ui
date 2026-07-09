"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Loader2, Square, ExternalLink,
    RefreshCcw, Shield, Activity, XCircle,
} from "lucide-react";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from "sonner";

import { useInfra } from "@/context/session-context";
import { Button } from "@/components/ui/button";
import {
    postApiV1InfraByIdDeploy,
    deleteApiV1InfraByIdDestroy,
    postApiV1CoursesTasksByIdSwitch,
    ModelsActiveInfraResponse,
} from "@/api/generated";
import { getActiveInfraAction } from '@/lib/instance';

interface CourseInstanceProps {
    challengeId: string;   // slug модуля = ID инфры
    taskSlug: string;      // slug текущего задания
    accessToken: string;
}

const parseBackendMessage = (msg: string): string => {
    if (!msg) return "Инициализация защищённого периметра...";
    if (msg.includes("Allocating cluster resources")) return "Выделение изолированных ресурсов...";
    if (msg.includes("Downloading tasks assets")) return "Развёртывание конфигурации задания...";
    if (msg.includes("Environment is ready")) return "Рабочее пространство готово.";
    return msg;
};

async function callSwitchTask(
    taskSlug: string,
    accessToken: string
): Promise<{ ok: boolean; error?: string }> {
    try {
        const result = await postApiV1CoursesTasksByIdSwitch({
            path: { id: taskSlug },
            headers: { Authorization: `Bearer ${accessToken}` },
        }) as any;

        if (result?.error) {
            return {
                ok: false,
                error: result.error?.error ?? result.error?.message ?? JSON.stringify(result.error),
            };
        }
        if (result?.response && !result.response.ok) {
            let body = '';
            try { body = await result.response.clone().text(); } catch {}
            return { ok: false, error: `HTTP ${result.response.status}: ${body || 'Server Error'}` };
        }
        return { ok: true };
    } catch (e: any) {
        return { ok: false, error: e?.message ?? String(e) };
    }
}

export function CourseInstance({ challengeId, taskSlug, accessToken }: CourseInstanceProps) {
    const { activeInfra, setActiveInfra } = useInfra();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [switchError, setSwitchError] = useState<string | null>(null);
    const [progress, setProgress] = useState("МОДУЛЬ_ГОТОВ_К_ЗАПУСКУ");
    const [logs, setLogs] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    // ── Переключаем задание когда инфра уже запущена ──────────────────────
    // Срабатывает при каждом изменении taskSlug (переход между заданиями)
    // или когда activeInfra появляется в контексте (возврат на страницу).
    // Не срабатывает если инфра не запущена (activeInfra === null).
    const prevTaskSlugRef = useRef<string | null>(null);
    useEffect(() => {
        if (!activeInfra) return;                         // инфра не запущена — ничего не делаем
        if (isConnecting) return;                         // идёт деплой — switch будет после ready
        if (prevTaskSlugRef.current === taskSlug) return; // taskSlug не изменился — не нужен switch

        prevTaskSlugRef.current = taskSlug;

        const doSwitch = async () => {
            setIsSwitching(true);
            setSwitchError(null);
            const { ok, error } = await callSwitchTask(taskSlug, accessToken);
            if (!ok) setSwitchError(error ?? "unknown error");
            setIsSwitching(false);
        };

        doSwitch();
    }, [taskSlug, activeInfra]); // eslint-disable-line react-hooks/exhaustive-deps

    const addLog = (msg: string) => {
        const t = new Date().toLocaleTimeString('ru-RU', { hour12: false });
        setLogs(prev => [...prev.slice(-4), `[${t}] ${msg}`]);
    };

    const startStream = (slugForSwitch: string) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/infra/${challengeId}/stream`, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'text/event-stream' },
            signal: abortControllerRef.current.signal,
            onmessage: async (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    setProgress(parseBackendMessage(data.message));
                    addLog(parseBackendMessage(data.message));

                    if (data.status === 'ready') {
                        // ── Инфра поднялась → переключаем задание ──
                        addLog("Переключение задания...");
                        const { ok, error } = await callSwitchTask(slugForSwitch, accessToken);
                        if (ok) {
                            addLog("Файлы задания развёрнуты.");
                            setSwitchError(null);
                        } else {
                            addLog(`Предупреждение: ${error}`);
                            setSwitchError(error ?? null);
                        }

                        const { data: infra, success } = await getActiveInfraAction();
                        setActiveInfra(
                            success && infra
                                ? (infra as ModelsActiveInfraResponse)
                                : { name: challengeId, endpoints: [{ name: "workspace", url: data.message }] }
                        );
                        // prevTaskSlugRef синхронизируем чтобы useEffect не сработал повторно
                        prevTaskSlugRef.current = slugForSwitch;
                        setIsConnecting(false);
                        toast.success("Стенд активирован");
                        abortControllerRef.current?.abort();
                    }

                    if (data.status === 'error' || data.status === 'destroyed') {
                        setIsConnecting(false);
                        toast.error(data.status === 'error' ? "Ошибка инициализации" : "Сессия завершена");
                        setActiveInfra(null);
                        abortControllerRef.current?.abort();
                    }
                } catch (e) { console.error(e); }
            },
            onerror(err) {
                setIsConnecting(false);
                toast.error("Сбой связи с сервером");
                throw err;
            },
        });
    };

    const handleInitialize = async () => {
        setIsConnecting(true);
        setSwitchError(null);
        setLogs([]);
        setProgress("ПОДГОТОВКА_СТЕНДА");
        addLog("Авторизация сессии...");
        try {
            await postApiV1InfraByIdDeploy({
                path: { id: challengeId },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            addLog("Запрос подтверждён. Сборка среды...");
            startStream(taskSlug);
        } catch {
            setIsConnecting(false);
            toast.error("Ошибка запуска");
            addLog("Ошибка: доступ заблокирован.");
        }
    };

    const handleTerminate = async () => {
        try {
            await deleteApiV1InfraByIdDestroy({
                path: { id: challengeId },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setActiveInfra(null);
            setIsConnecting(false);
            setSwitchError(null);
            prevTaskSlugRef.current = null; // сбрасываем — при следующем запуске нужен switch
            setProgress("МОДУЛЬ_ГОТОВ_К_ЗАПУСКУ");
            toast.success("Стенд деактивирован");
        } catch {
            toast.error("Ошибка остановки окружения");
        }
    };

    const handleManualSwitch = async () => {
        setIsSwitching(true);
        setSwitchError(null);
        const { ok, error } = await callSwitchTask(taskSlug, accessToken);
        if (ok) {
            toast.success("Задание переключено");
        } else {
            setSwitchError(error ?? "unknown error");
            toast.error("Ошибка переключения");
        }
        setIsSwitching(false);
    };

    const activeUrl = activeInfra?.endpoints?.[0]?.url ?? null;

    /* ── STANDBY ── */
    if (!activeInfra && !isConnecting) {
        return (
            <div className="p-8 border border-white/5 bg-black/20 flex flex-col items-center text-center font-mono relative overflow-hidden group">
                <div className="absolute top-0 left-0 size-2 border-t border-l border-white/10 group-hover:border-white/30 transition-colors" />
                <div className="absolute bottom-0 right-0 size-2 border-b border-r border-white/10 group-hover:border-white/30 transition-colors" />
                <div className="size-12 border border-white/10 bg-white/[0.01] flex items-center justify-center mb-5">
                    <Shield className="size-5 text-white/30" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90 mb-2">
                    РАБОЧЕЕ_ПРОСТРАНСТВО
                </h3>
                <p className="text-[10px] text-muted-foreground/60 max-w-[280px] leading-relaxed mb-6 font-sans">
                    Разверните персональный изолированный стенд для выполнения практической части задания.
                </p>
                <Button
                    onClick={handleInitialize}
                    variant="outline"
                    className="h-9 rounded-none border-white/20 bg-transparent hover:bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase transition-all active:scale-[0.98]"
                >
                    Запустить стенд
                </Button>
            </div>
        );
    }

    /* ── CONNECTING ── */
    if (isConnecting) {
        return (
            <div className="p-5 border border-white/10 bg-black/40 font-mono space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Loader2 className="size-3 text-amber-500/80 animate-spin" />
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Развёртывание среды</span>
                    </div>
                    <span className="text-[8px] text-white/20 uppercase tracking-widest">DEPLOY</span>
                </div>
                <div className="bg-black/60 border border-white/5 p-3 space-y-2 min-h-[80px] flex flex-col justify-end">
                    {logs.map((log, idx) => (
                        <div key={idx} className="text-[9px] text-white/50 truncate leading-none">
                            <span className="text-white/15 mr-2">›</span>{log}
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="h-px w-full bg-white/10 relative overflow-hidden">
                        <div className="h-full bg-white/50 animate-[loading_1.8s_infinite] w-1/4 absolute" />
                    </div>
                    <div className="flex justify-between text-[8px] uppercase tracking-wider font-bold">
                        <span className="text-white/30 truncate max-w-[200px]">{progress}</span>
                        <span className="text-amber-500/70 animate-pulse">PENDING</span>
                    </div>
                </div>
                <style jsx global>{`@keyframes loading { 0% { left: -25%; } 100% { left: 100%; } }`}</style>
            </div>
        );
    }

    /* ── RUNNING ── */
    return (
        <div className="border border-white/10 bg-black/40 overflow-hidden font-mono">
            <div className="px-3 py-2 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-wider">
                        {isSwitching ? "Переключение задания..." : "Стенд активен"}
                    </span>
                    {isSwitching && <Loader2 className="size-3 text-emerald-500/50 animate-spin" />}
                </div>
                <span className="text-[8px] text-white/20 uppercase tracking-widest truncate max-w-[120px]">
                    {activeInfra?.name ?? "SANDBOX"}
                </span>
            </div>

            <div className="p-3 space-y-2.5">
                {switchError && !isSwitching && (
                    <div className="flex items-start gap-2 border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                        <XCircle className="size-3 text-red-400/60 shrink-0 mt-0.5" />
                        <div className="min-w-0 space-y-1">
                            <p className="text-[9px] text-red-400/70 font-bold uppercase tracking-wider">
                                Ошибка переключения задания
                            </p>
                            <p className="text-[9px] text-red-400/50 font-mono break-all leading-relaxed">{switchError}</p>
                            <button
                                onClick={handleManualSwitch}
                                className="text-[9px] text-red-400/50 hover:text-red-400/80 underline underline-offset-2 transition-colors"
                            >
                                Повторить
                            </button>
                        </div>
                    </div>
                )}

                {activeUrl ? (
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] uppercase text-white/30 font-bold tracking-wider">Точка входа</span>
                        <div className="flex items-center gap-2 bg-white/[0.01] border border-white/5 px-2 py-2 group hover:border-white/10 transition-colors">
                            <Activity className="size-3 text-white/15 shrink-0 group-hover:text-white/30 transition-colors" />
                            <code className="text-[10px] text-white/70 truncate flex-1 tracking-tight select-all">{activeUrl}</code>
                            <Button variant="ghost" size="icon" className="size-6 text-white/20 hover:text-white hover:bg-white/5 rounded-none shrink-0"
                                onClick={() => window.open(activeUrl, '_blank')}>
                                <ExternalLink className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[9px] text-white/30 border border-white/5 bg-white/[0.01] p-2 italic text-center">
                        Каналы связи не обнаружены
                    </p>
                )}

                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    <Button variant="ghost" disabled={isSwitching} onClick={handleManualSwitch}
                        className="h-8 rounded-none border border-white/5 text-[9px] uppercase tracking-wider text-white/30 hover:text-white hover:bg-white/5 gap-1">
                        {isSwitching ? <Loader2 className="size-3 animate-spin" /> : <RefreshCcw className="size-3" />}
                        Задание
                    </Button>
                    <Button variant="ghost" onClick={handleInitialize}
                        className="h-8 rounded-none border border-white/5 text-[9px] uppercase tracking-wider text-white/30 hover:text-white hover:bg-white/5 gap-1">
                        <RefreshCcw className="size-3" /> Стенд
                    </Button>
                    <Button variant="ghost" onClick={handleTerminate}
                        className="h-8 rounded-none border border-red-950/20 text-[9px] uppercase tracking-wider text-red-500/30 hover:text-red-400 hover:bg-red-500/5 gap-1">
                        <Square className="size-3" /> Стоп
                    </Button>
                </div>
            </div>
        </div>
    );
}