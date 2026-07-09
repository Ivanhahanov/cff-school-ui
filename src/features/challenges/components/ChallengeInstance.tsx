"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Terminal, Box, Play, Square, RefreshCcw,
    ExternalLink, Clock, Loader2, Globe, Shield, Activity
} from "lucide-react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

// Предполагаем наличие этих функций в твоем SDK
import { postApiV1ChallengesByIdStart, deleteApiV1ChallengesByIdStop } from "@/api/generated";
import type { ModelsInstanceEvent } from "@/api/generated"; 

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Стандартная утилита shadcn

interface InstanceProps {
    challengeId: string;
    accessToken: string;
}

export function ChallengeInstance({ challengeId, accessToken }: InstanceProps) {
    const [status, setStatus] = useState<'off' | 'starting' | 'running' | 'error'>('off');
    const [progressMsg, setProgressMsg] = useState('Initializing...');
    const [url, setUrl] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(3600);
    
    const abortControllerRef = useRef<AbortController | null>(null);

    const connectToStream = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/challenges/${challengeId}/stream`;

        fetchEventSource(streamUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'text/event-stream',
            },
            signal: abortControllerRef.current.signal,
            onmessage(msg) {
                const data = JSON.parse(msg.data) as ModelsInstanceEvent;
                setProgressMsg(data.message || "Processing...");

                if (data.status === 'ready' && data.url) {
                    setUrl(data.url);
                    setStatus('running');
                    toast.success("DEPLOYMENT_COMPLETE");
                    abortControllerRef.current?.abort();
                }

                if (data.status === 'error') {
                    setStatus('error');
                    toast.error("K8S_FAILURE", { description: data.message });
                    abortControllerRef.current?.abort();
                }
            },
            onerror(err) {
                setStatus('error');
                throw err; 
            }
        });
    }, [challengeId, accessToken]);

    const handleStart = async () => {
        setStatus('starting');
        try {
            await postApiV1ChallengesByIdStart({
                path: { id: challengeId },
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            connectToStream();
        } catch (err) {
            setStatus('error');
            toast.error("API_ERROR");
        }
    };

    const handleTerminate = async () => {
        const loadingToast = toast.loading("Terminating...");
        try {
            await deleteApiV1ChallengesByIdStop({
                path: { id: challengeId },
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (abortControllerRef.current) abortControllerRef.current.abort();
            setStatus('off');
            setUrl(null);
            toast.success("INSTANCE_TERMINATED", { id: loadingToast });
        } catch (err) {
            toast.error("TERMINATION_FAILED", { id: loadingToast });
        }
    };

    const formatTime = (s: number) => 
        `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

    return (
        <Card className="border-primary/20 bg-[#050505] rounded-none relative overflow-hidden font-mono">
            {/* Декоративная сетка на фоне */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50" />
            
            <CardHeader className="border-b border-primary/10 bg-black/60 py-3 relative z-10">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-between text-primary/70">
                    <span className="flex items-center gap-2">
                        <Terminal className="size-3.5" /> 
                        Instance_Control
                    </span>
                    <div className="flex items-center gap-2">
                        {status === 'running' && (
                             <span className="flex items-center gap-1.5 text-emerald-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                ONLINE
                             </span>
                        )}
                        {status === 'off' && <span className="text-muted-foreground/50">STANDBY</span>}
                        {status === 'error' && <span className="text-red-500">FAULT</span>}
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-5 space-y-4 relative z-10">
                {status === 'off' || status === 'error' ? (
                    <div className="space-y-4 py-1">
                        <div className="text-[10px] text-muted-foreground/80 leading-relaxed uppercase border-l-2 border-primary/20 pl-3">
                            Remote sandbox environment ready. <br/>
                            Spin-up estimated: <span className="text-primary text-bold">45.0s</span>
                        </div>
                        <Button
                            onClick={handleStart}
                            className="w-full rounded-none border border-primary/40 bg-primary/5 hover:bg-primary/20 text-primary font-bold text-[10px] uppercase transition-all duration-300"
                        >
                            <Play className="size-3 mr-2 fill-primary" /> Initialize_Sequence
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {status === 'starting' ? (
                            <div className="space-y-3 py-1">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-[10px] text-primary animate-pulse">
                                        <Loader2 className="size-3 animate-spin" />
                                        {progressMsg.toUpperCase()}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-primary/10 overflow-hidden">
                                    <div className="h-full bg-primary animate-[loading_2s_infinite] w-1/3" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-3 bg-primary/5 border border-primary/30 flex items-center justify-between group hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Globe className="size-3.5 text-primary/60" />
                                        <code className="text-[11px] text-primary font-mono tracking-tight truncate">
                                            {url}
                                        </code>
                                    </div>
                                    <Button 
                                        variant="ghost" size="icon" className="size-7 hover:bg-primary/20 hover:text-primary rounded-none transition-all"
                                        onClick={() => window.open(url!, '_blank')}
                                    >
                                        <ExternalLink className="size-3.5" />
                                    </Button>
                                </div>
                                
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Shield className="size-3 text-primary/50" /> Isolated
                                        </span>
                                        <span className="flex items-center gap-1.5 text-primary/80">
                                            <Clock className="size-3" /> {formatTime(timeLeft)}
                                        </span>
                                    </div>
                                    <Activity className="size-3 text-primary/30" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-none text-[9px] uppercase font-bold h-9 border-primary/20 bg-transparent hover:bg-primary/5 hover:border-primary/40 transition-all" 
                                disabled={status === 'starting'}
                            >
                                <RefreshCcw className="size-3 mr-2" /> Reset_State
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleTerminate} 
                                className="rounded-none text-[9px] uppercase font-bold h-9 border-red-900/30 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                            >
                                <Square className="size-3 mr-2 fill-current" /> Terminate
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
            
            {/* Дополнительный декоративный элемент снизу */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </Card>
    );
}