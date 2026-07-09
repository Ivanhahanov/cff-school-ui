"use client"

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
    Calendar, Terminal, EyeOff, ArrowUpDown, X, Hash, SlidersHorizontal
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = ["Web", "Pwn", "Crypto", "Reverse", "OSINT"]
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Insane"]
const SOURCES = ["Internal", "HTB_Partner", "Cyber_Community", "Gov_Archive"]
const STAGES = ["Alpha", "Beta", "Stable", "Legacy"];

export function ChallengesFilters({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [inputValue, setInputValue] = useState(searchParams.get('q') || '')

    useEffect(() => {
        setInputValue(searchParams.get('q') || '')
    }, [searchParams])

    const selectedCats = searchParams.getAll('cats').filter(Boolean)
    const selectedDiffs = searchParams.getAll('diffs').filter(Boolean)
    const selectedStages = searchParams.getAll('stages').filter(Boolean);
    const source = searchParams.get('src') || 'ALL'
    const sortBy = searchParams.get('sort') || 'newest'
    const hideSolved = searchParams.get('hideSolved') === 'true'

    const updateParams = (updates: Record<string, any>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k, v]) => {
            params.delete(k)
            if (Array.isArray(v)) {
                v.forEach(val => { if (val) params.append(k, val) })
            } else if (v !== 'ALL' && v !== '' && v !== null && v !== undefined) {
                params.set(k, v.toString())
            }
        })
        if (updates.page === undefined) params.set('page', '1')
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (inputValue !== (searchParams.get('q') || '')) {
                updateParams({ q: inputValue })
            }
        }, 400)
        return () => clearTimeout(timeoutId)
    }, [inputValue])

    const toggleFilter = (list: string[], item: string) =>
        list.includes(item) ? list.filter(i => i !== item) : [...list, item]

    const hasActiveFilters = selectedCats.length > 0 || selectedDiffs.length > 0 || (inputValue !== '' && inputValue !== null) || source !== 'ALL';

    return (
        <div className="space-y-4 font-mono">
            {/* --- ВЕРХНЯЯ ПАНЕЛЬ: ПОИСК И ИСТОЧНИК --- */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/20 p-4 border border-border/50 rounded-none">
                <div className="flex items-center gap-3 w-full md:w-[400px]">
                    <Terminal className={`size-4 transition-colors ${isPending ? 'text-yellow-500 animate-pulse' : 'text-primary'}`} />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="grep course_name..."
                        className="border-none bg-transparent focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50 font-mono h-auto p-2"
                    />
                </div>

                <div className="flex items-center gap-3 border-l border-border/50 pl-4 w-full md:w-auto">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase whitespace-nowrap">Origin_Src:</span>
                    <select
                        onChange={(e) => updateParams({ src: e.target.value })}
                        value={source}
                        className="bg-transparent border-b border-primary/20 text-[11px] uppercase py-1 outline-none focus:border-primary text-primary cursor-pointer font-bold w-full md:w-auto"
                    >
                        <option value="ALL">ALL_ORIGINS</option>
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* --- СРЕДНЯЯ ПАНЕЛЬ: КАТЕГОРИИ И СЛОЖНОСТЬ --- */}
            <div className="p-4 bg-muted/5 border border-border/20 rounded-none space-y-4">
                <div className="flex flex-wrap items-center gap-8">
                    {/* Группа Категорий */}
                    <div className="space-y-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight block">Target_Category</span>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => updateParams({ cats: toggleFilter(selectedCats, cat) })}
                                    className={`px-3 py-1 text-[10px] font-mono border transition-all rounded-none ${selectedCats.includes(cat)
                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-[0_0_8px_rgba(var(--primary),0.1)]'
                                            : 'border-border/40 text-muted-foreground hover:border-primary/40'
                                        }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Группа Сложности */}
                    <div className="space-y-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight block">Difficulty_Level</span>
                        <div className="flex flex-wrap gap-2">
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff}
                                    onClick={() => updateParams({ diffs: toggleFilter(selectedDiffs, diff) })}
                                    className={`px-3 py-1 text-[10px] font-mono border transition-all rounded-none ${selectedDiffs.includes(diff)
                                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-[0_0_8px_rgba(var(--primary),0.1)]'
                                            : 'border-border/40 text-muted-foreground hover:border-primary/40'
                                        }`}
                                >
                                    [{diff.toUpperCase()}]
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight block">Deployment_Stage</span>
                        <div className="flex flex-wrap gap-2">
                            {STAGES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => updateParams({ stages: toggleFilter(selectedStages, s.toLowerCase()) })}
                                    className={`px-3 py-1 text-[10px] font-mono border transition-all rounded-none ${selectedStages.includes(s.toLowerCase())
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                                            : 'border-border/40 text-muted-foreground hover:border-primary/40'
                                        }`}
                                >
                                    {s.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Скрыть решенные */}
                    <div className="ml-auto self-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateParams({ hideSolved: !hideSolved })}
                            className={`text-[10px] font-mono rounded-none h-8 ${hideSolved ? 'border-primary text-primary bg-primary/5' : 'border-border/40 text-muted-foreground'}`}
                        >
                            <EyeOff className="mr-2 size-3" /> {hideSolved ? 'STATUS: HIDING_SOLVED' : 'STATUS: SHOW_ALL'}
                        </Button>
                    </div>
                </div>

                {/* --- НИЖНЯЯ ПАНЕЛЬ: СОРТИРОВКА И ТЕГИ --- */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border/10 items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`text-[10px] font-mono h-7 rounded-none ${sortBy === 'newest' ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => updateParams({ sort: 'newest' })}
                    >
                        <Calendar className="mr-2 size-3" /> BY_DATE
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`text-[10px] font-mono h-7 rounded-none ${sortBy.includes('points') ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => updateParams({ sort: sortBy === 'points-desc' ? 'points-asc' : 'points-desc' })}
                    >
                        <ArrowUpDown className="mr-2 size-3" /> BY_POINTS {sortBy === 'points-desc' ? '▼' : sortBy === 'points-asc' ? '▲' : ''}
                    </Button>


                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-mono h-7 ml-auto text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-none"
                            onClick={() => {
                                setInputValue('');
                                updateParams({ cats: [], diffs: [], q: '', hideSolved: false, src: 'ALL', sort: 'newest' });
                            }}
                        >
                            <X className="mr-2 size-3" /> RESET_ALL
                        </Button>
                    )}
                </div>
            </div>

            {/* Список контента с эффектом загрузки */}
            <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {children}
            </div>
        </div>
    )
}