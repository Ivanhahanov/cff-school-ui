"use client";

import React, { useState } from 'react';
import { Maximize2, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InteractiveTerminalProps {
    url: string | null;
    title?: string;
}

export function InteractiveTerminal({ url, title = "RECOVERY_SHELL" }: InteractiveTerminalProps) {
    const [isLoading, setIsLoading] = useState(true);

    if (!url) {
        return (
            <div className="w-full h-full min-h-[400px] bg-[#050505] border border-primary/10 flex items-center justify-center flex-col gap-4 text-muted-foreground">
                <Terminal className="size-12 opacity-10 animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.3em]">Awaiting_Endpoint...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[450px] bg-[#050505] border border-primary/20 flex flex-col group relative">
            {/* Панель управления терминалом */}
            <div className="h-8 bg-black/80 border-b border-primary/10 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-primary/70 tracking-widest">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-6 text-primary hover:bg-primary/10" onClick={() => {}}>
                        <RefreshCw className="size-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6 text-primary hover:bg-primary/10">
                        <Maximize2 className="size-3" />
                    </Button>
                </div>
            </div>

            {/* Контейнер Iframe */}
            <div className="flex-1 relative overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-[#050505] flex items-center justify-center">
                        <div className="text-[10px] text-primary animate-pulse font-mono">ESTABLISHING_CONNECTION...</div>
                    </div>
                )}
                <iframe
                    src={url}
                    onLoad={() => setIsLoading(false)}
                    className="w-full h-full border-none"
                    // Важные атрибуты для терминала:
                    allow="clipboard-read; clipboard-write; fullscreen"
                    title="Interactive Terminal"
                />
            </div>

            {/* Декор снизу */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
    );
}