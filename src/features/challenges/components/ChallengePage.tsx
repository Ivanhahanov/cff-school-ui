"use client";

import React, { useState } from 'react';
import {
    Terminal, Flag, Box, Download, ExternalLink,
    Clock, AlertCircle, Play, Square, RefreshCcw, History,
    User, Calendar, ShieldCheck
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChallengeInstance } from './ChallengeInstance';
import { ModelsChallengeDetailsResponse, postApiV1ChallengesByIdSubmit } from "@/api/generated";

// Цветовая индикация сложности
const DIFF_STYLES: Record<string, { color: string, bg: string, border: string, dot: string, label: string }> = {
    "Easy": {
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        dot: "bg-green-500",
        label: "LOW_THREAT"
    },
    "Medium": {
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        dot: "bg-yellow-500",
        label: "MID_THREAT"
    },
    "Hard": {
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        dot: "bg-orange-500",
        label: "HIGH_THREAT"
    },
    "Insane": {
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        dot: "bg-red-500",
        label: "CRITICAL_THREAT"
    },
};

interface ChallengePageProps {
    challenge: ModelsChallengeDetailsResponse;
    accessToken: string
}

export function ChallengePage({ challenge, accessToken }: ChallengePageProps) {
    const [flag, setFlag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Получаем стиль или дефолтный (для защиты от undefined)
    const diffStyle = DIFF_STYLES[challenge.difficulty || "Easy"] || DIFF_STYLES["Easy"];

    const handleSubmitFlag = async () => {
        if (!flag) return;
        setIsSubmitting(true);
        try {
            const { data } = await postApiV1ChallengesByIdSubmit({
                path: { id: String(challenge.id) },
                body: { flag }
            });

            if (data?.correct) toast.success("Flag captured!", { description: data.message });
            else toast.error("Wrong flag", { description: "Try harder!" });
        } catch (err) {
            toast.error("API_ERROR");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 font-mono text-foreground max-w-7xl p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="border-border/40 bg-card/30 rounded-none overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="rounded-none border-primary/50 text-primary bg-primary/5 px-2 uppercase">
                                            {challenge.category}
                                        </Badge>
                                        {/* Динамический Badge сложности */}
                                        <Badge variant="outline" className={`rounded-none ${diffStyle.border} ${diffStyle.bg} ${diffStyle.color} px-2 uppercase flex items-center gap-1.5`}>
                                            <span className={`size-1.5 rounded-full ${diffStyle.dot} animate-pulse`} />
                                            {diffStyle.label}
                                        </Badge>
                                        <Badge variant="secondary" className="rounded-none text-[9px] uppercase opacity-70">
                                            {challenge.stage}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                                        <Box className="size-8 text-primary" />
                                        {challenge.name}
                                    </CardTitle>
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black text-primary tracking-tighter">{challenge.points}</span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Points Available</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="prose prose-invert max-w-none">
                                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {challenge.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {challenge.file_url && (
                                    <Button variant="outline" asChild className="rounded-none border-border/60 hover:border-primary transition-all text-[11px] uppercase font-bold group">
                                        <a href={challenge.file_url} download>
                                            <Download className="mr-2 size-4 group-hover:animate-bounce" /> download_resources
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" className="rounded-none border-border/60 hover:border-primary transition-all text-[11px] uppercase font-bold">
                                    <History className="mr-2 size-4" /> Solves: {challenge.solves}
                                </Button>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* FLAG SUBMISSION */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                    <Flag className="size-4" /> Capture the Flag
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="CTF{fl4g_h3r3...}"
                                        className="rounded-none border-border/40 bg-muted/20 focus-visible:ring-primary focus-visible:ring-offset-0 font-mono"
                                        value={flag}
                                        onChange={(e) => setFlag(e.target.value)}
                                    />
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={handleSubmitFlag}
                                        className="rounded-none px-8 font-black uppercase tracking-tighter"
                                    >
                                        {isSubmitting ? "Decrypting..." : "Submit"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="hints" className="w-full">
                        <TabsList className="bg-muted/20 rounded-none border-b border-border/40 w-full justify-start h-auto p-0">
                            <TabsTrigger value="hints" className="rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6 text-[10px] uppercase font-bold tracking-widest">Hints (1)</TabsTrigger>
                            <TabsTrigger value="stats" className="rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6 text-[10px] uppercase font-bold tracking-widest">Global Stats</TabsTrigger>
                        </TabsList>
                        <TabsContent value="hints" className="p-4 border border-t-0 border-border/40 bg-card/20 space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-muted/30 border-l-2 border-primary/50">
                                <AlertCircle className="size-4 text-primary mt-0.5" />
                                <div className="text-[12px]">
                                    <p className="font-bold text-primary mb-1 uppercase">System Hint</p>
                                    <p className="text-muted-foreground italic text-[11px]">Check the challenge source: {challenge.source}.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="flex flex-col gap-6">
                    {/* НАШ НОВЫЙ КОМПОНЕНТ */}
                    <ChallengeInstance challengeId={challenge.id!} accessToken={accessToken} />
                    
                

                    {/* Metadata Card */}
                    <Card className="border-border/40 bg-card/30 rounded-none">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                    <User className="size-3" /> Author
                                </div>
                                <span className="text-[11px] font-bold text-primary">@{challenge.author || "admin"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                    <ShieldCheck className="size-3" /> Source
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase">{challenge.source}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                    <Calendar className="size-3" /> Released
                                </div>
                                <span className="text-[11px] font-bold text-muted-foreground">{challenge.createdAt}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}