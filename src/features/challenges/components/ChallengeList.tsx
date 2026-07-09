import { getApiV1ChallengesList } from "@/api/generated/sdk.gen";
import { getServerClient } from "@/api/client";
import {
  Target, Hash, Code2, Box, Globe, Calendar, Trophy, CheckCircle2, ChevronRight, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

import { SecurityOverlay } from "@/components/securit-overlay"

const ICON_MAP: Record<string, any> = {
  "Web": Target,
  "Pwn": Box,
  "Crypto": Hash,
  "Reverse": Code2,
  "OSINT": Globe,
};

const DEV_STAGES: Record<string, { label: string, color: string }> = {
  "alpha": { 
    label: "DEV_STAGE: ALPHA_TEST", 
    color: "text-orange-500/60" // Оранжевый — предупреждение, что может быть нестабильно
  },
  "beta": { 
    label: "DEV_STAGE: BETA_UNIT", 
    color: "text-blue-400/60"    // Синий — почти готово
  },
  "stable": { 
    label: "DEV_STAGE: STABLE_BUILD", 
    color: "text-muted-foreground/40" // Приглушенный — всё ок, не отвлекает
  },
  "legacy": { 
    label: "DEV_STAGE: DEPRECATED", 
    color: "text-red-500/50"    // Красный — старье
  }
};

const DIFF_STYLES: Record<string, { color: string, bg: string, border: string, dot: string, label: string }> = {
  "Easy": {
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    dot: "bg-green-500", // Явно прописываем цвет точки
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
// Хелпер для дефолтных значений
const getDiff = (diff: string) => DIFF_STYLES[diff] || { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "UNKNOWN" };

export const ChallengesList = async ({ searchParams }: { searchParams: any }) => {
  await getServerClient();
  const rawParams = await searchParams;

  const params = JSON.parse(JSON.stringify(rawParams));

  const pageRaw = params.page;
  const qRaw = params.q;
  const currentPage = parseInt(pageRaw || '1');
  if (pageRaw && (currentPage <= 0 || isNaN(currentPage))) {
    return (
      <SecurityOverlay
        code="PAGINATION_FAULT"
        message="Attempting to access non-existent dimensions? Space-time doesn't work that way."
        payload={`page=${pageRaw}`}
        hint="The page number must be a positive integer, neo."
      />
    )
  }

  // 2. Пасхалка на SQL Injection (если в поиске есть спецсимволы)
  const sqlPattern = /['"--;] OR /i;
  if (params && sqlPattern.test(qRaw)) {
    return (
      <SecurityOverlay
        code="INJECTION_ATTEMPT"
        message="Classic. But our ORM is braver than your payload."
        payload={`query='${qRaw}'`}
        hint="Try harder. Maybe the flag is in the response headers? (No, it's not)"
      />
    )
  }

  // 3. Проверка на "слишком умный" поиск (например, попытка найти пароли)
  if (qRaw?.toLowerCase().includes('password') || qRaw?.toLowerCase().includes('flag')) {
    return (
      <SecurityOverlay
        code="UNAUTHORIZED_DISCOVERY"
        message="Looking for shortcuts, eh? The flag isn't going to find itself."
        payload={qRaw}
      />
    )
  }
  const isSolved = false
  console.log(params.diffs)
  const response = await getApiV1ChallengesList({
    query: {
      q: params.q,
      cats: params.cats,
      diffs: params.diffs,
      src: params.src,
      sort: params.sort,
      stages: params.stages,
      hideSolved: params.hideSolved === 'true',
      page: currentPage,
    }
  });

  if (response.error) return <div className="...">Error loading data</div>;

  const { data: challenges, total, totalPages } = response.data || { data: [], total: 0, totalPages: 0 };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges?.map((ch) => {
          const Icon = ICON_MAP[ch.category!] || Target;
          const diff = getDiff(ch.difficulty!);
          const currentStage = DEV_STAGES[ch.stage?.toLowerCase()!] || DEV_STAGES["stable"];
          const solved = isSolved; // Твоя переменная

          return (
            <Card key={ch.id} className={`relative rounded-none border-border/40 bg-card/20 hover:border-primary/40 transition-all group overflow-hidden ${solved ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                {/* HEADER: Icon & Points */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-none border transition-colors ${solved ? 'border-green-500/30 text-green-500 bg-green-500/5' : `border-primary/30 text-primary bg-primary/5 group-hover:border-primary`}`}>
                    <Icon className="size-5" />
                  </div>

                  <div className="text-right font-mono">
                    <div className={`text-xl font-black tracking-tighter ${solved ? 'text-green-500' : 'text-primary'}`}>
                      {ch.points}
                    </div>
                    <div className={`text-[7px] font-bold uppercase tracking-widest ${diff.color}`}>
                      {diff.label}
                    </div>
                  </div>
                </div>

                {/* INFO: ID, Category & Date */}
                <div className="space-y-1 mb-4 font-mono">
                  <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase">
                    <div className="flex items-center gap-2">
                      <span>{ch.id}</span>
                      <span className="text-primary/40">::</span>
                      <span className="text-primary/60">{ch.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-2.5 opacity-40" />
                      <span>{ch.createdAt}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                    {ch.name}
                  </h3>
                </div>

                {/* FOOTER STATS: Source, Solves & Difficulty */}
                <div className="space-y-3 border-t border-border/10 pt-3 mt-3 font-mono">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="size-3 opacity-50" />
                      {ch.source}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary/80">
                      <Trophy className="size-3 opacity-50" />
                      {ch.solves} SLVS
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-1.5 py-0.5 border ${diff.border} ${diff.bg} ${diff.color} text-[8px] font-bold uppercase`}>
                      <div className={`size-1 rounded-full mr-1.5 animate-pulse ${diff.dot}`} />
                      {ch.difficulty}
                    </div>

                    <div className="flex flex-col items-end">
                      <div className={`text-[8px] font-bold italic tracking-tighter ${currentStage.color}`}>
                        {currentStage.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION: Link or Status */}
                {solved ? (
                  <div className="mt-4 w-full py-2 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold text-center flex items-center justify-center gap-2 rounded-none font-mono">
                    <CheckCircle2 className="size-3" /> STATUS: COMPLETED
                  </div>
                ) : (
                  <Link href={`/challenges/${ch.id}`} className="block mt-4">
                    <Button className="w-full rounded-none bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[10px] font-bold h-8 transition-all font-mono group-hover:border-primary">
                      INIT_CONNECTION <ChevronRight className="ml-1 size-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-6 font-mono">
        <div className="text-[10px] text-muted-foreground uppercase">
          Total_Nodes: <span className="text-primary">{total}</span>
        </div>

        <div className="flex gap-2">
          {/* Кнопка НАЗАД */}
          {currentPage > 1 ? (
            <Button variant="outline" asChild className="rounded-none h-8 px-3 hover:bg-primary/10">
              <Link href={{ query: { ...params, page: currentPage - 1 } }} prefetch={false}>
                <ChevronLeft className="size-4 text-primary" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled className="rounded-none h-8 px-3 opacity-30">
              <ChevronLeft className="size-4" />
            </Button>
          )}

          <div className="flex items-center px-4 bg-muted/20 border border-border/40 text-[10px] font-bold">
            {currentPage} / {totalPages || 1}
          </div>

          {/* Кнопка ВПЕРЕД */}
          {currentPage < (totalPages || 0) ? (
            <Button variant="outline" asChild className="rounded-none h-8 px-3 hover:bg-primary/10">
              <Link href={{ query: { ...params, page: currentPage + 1 } }} prefetch={false}>
                <ChevronRight className="size-4 text-primary" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled className="rounded-none h-8 px-3 opacity-30">
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};