import React, { useState } from 'react';
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitTaskFlagAction } from "../actions";

interface CourseTaskProps {
    taskId: string;
    points: string;
    onSolve?: () => void;
}

export function CourseTask({ taskId, points, onSolve }: CourseTaskProps) {
    const [flag, setFlag] = useState('');
    const [solved, setSolved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleCheck = async () => {
        if (!flag.trim()) {
            toast.error("Флаг не может быть пустым");
            return;
        }

        setIsPending(true);
        
        // Вызов нашего OpenAPI Server Action
        const result = await submitTaskFlagAction(taskId, flag);
        
        setIsPending(false);

        if (result.success) {
            toast.success(result.message);
            setSolved(true);
            if (onSolve) onSolve();
        } else {
            // Сюда прилетит сообщение бэкенда "[ОТКАЗ]: Неверный флаг..."
            toast.error(result.message); 
        }
    };

    return (
        <Card className={`my-6 rounded-none border-l-4 ${solved ? 'border-l-green-500 bg-green-500/5' : 'border-l-primary bg-primary/5'}`}>
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="size-3" /> Objectives::{taskId}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono border-primary/20">{points} PTS</Badge>
                </div>
                <div className="flex gap-2">
                    <input 
                        value={flag}
                        onChange={(e) => setFlag(e.target.value)}
                        disabled={solved || isPending}
                        placeholder="Enter Flag..." 
                        className="flex-1 bg-background/50 border border-border/40 px-3 py-1 text-xs font-mono focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !solved && !isPending) handleCheck();
                        }}
                    />
                    <button 
                        onClick={handleCheck}
                        disabled={solved || isPending}
                        className="bg-primary text-primary-foreground px-4 py-1 text-[10px] font-mono font-black uppercase hover:opacity-90 disabled:opacity-50 transition-all min-w-[80px]"
                    >
                        {isPending ? 'Checking...' : solved ? 'Verified' : 'Verify'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}