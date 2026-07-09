"use client";

import React from 'react';
import { Monitor } from "lucide-react";

export function NoVncViewer({ url }: { url: string | null }) {
    if (!url) return (
        <div className="flex flex-col items-center justify-center h-full bg-black/40 text-muted-foreground font-mono">
            <Monitor className="size-12 mb-4 opacity-10" />
            <p className="text-[10px] uppercase tracking-widest">Awaiting GUI Connection...</p>
        </div>
    );

    return (
        <div className="w-full h-full bg-[#0a0a0a] relative">
            <div className="absolute top-0 left-0 right-0 h-6 bg-muted/10 border-b border-white/5 flex items-center px-3 z-10">
                <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-red-500/50" />
                    <div className="size-2 rounded-full bg-yellow-500/50" />
                    <div className="size-2 rounded-full bg-green-500/50" />
                </div>
                <span className="ml-4 text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Remote_Desktop::NoVNC</span>
            </div>
            <iframe 
                src={url} 
                className="w-full h-full pt-6 border-none"
                allow="fullscreen"
            />
        </div>
    );
}