"use client"

import { Compass, ArrowRight, Layers, Clock, GraduationCap } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ROADMAP_PROFESSIONS = [
  {
    id: "web-hacker",
    title: "Full-Stack_Bug_Hunter",
    courses_count: 5,
    total_hours: 120,
    difficulty: "Mid",
    description: "Complete path from web basics to advanced exploitation and bug bounty hunting."
  },
  {
    id: "pwn-expert",
    title: "Binary_Exploitation_Master",
    courses_count: 4,
    total_hours: 200,
    difficulty: "Hard",
    description: "Focus on memory corruption, reverse engineering and custom exploit development."
  }
]

export default function RoadmapsAtlas() {
  return (
    <div className="flex flex-col gap-8 font-mono">
      <div className="space-y-2 border-l-2 border-primary pl-4">
        <h1 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
          <Compass className="size-5 text-primary" /> Career_Atlas
        </h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
          // Combined learning paths curated from individual platform courses
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ROADMAP_PROFESSIONS.map((roadmap) => (
          <Card key={roadmap.id} className="rounded-none border-border/40 bg-card/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-tighter">{roadmap.title}</h2>
                  <div className="flex gap-3 text-[9px] text-muted-foreground font-bold">
                    <span className="flex items-center gap-1"><Layers className="size-3" /> {roadmap.courses_count}_COURSES</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {roadmap.total_hours}_HRS</span>
                  </div>
                </div>
                <span className="text-[10px] border border-primary/40 px-2 py-0.5 text-primary uppercase font-bold">
                  {roadmap.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                {">"} {roadmap.description}
              </p>
            </CardContent>
            <CardFooter className="p-0 border-t border-border/20">
              <Button asChild variant="ghost" className="w-full h-12 rounded-none text-[10px] font-bold uppercase hover:bg-primary/5 group">
                <Link href={`/roadmaps/${roadmap.id}`} className="flex items-center gap-2">
                  View_Career_Path <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}