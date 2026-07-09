"use client"

import { CheckCircle2, CircleDot, Lock, ArrowUpRight, BookOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ROADMAP_DATA = {
  title: "Full-Stack_Bug_Hunter",
  courses: [
    {
      id: "course-101",
      title: "Introduction_to_HTTP_&_Web_Apps",
      status: "completed",
      progress: 100,
      description: "Foundational course on how the internet works."
    },
    {
      id: "course-202",
      title: "OWASP_Top_10_Practicum",
      status: "active",
      progress: 34,
      description: "Hands-on labs covering the most critical web vulnerabilities."
    },
    {
      id: "course-303",
      title: "Advanced_Logic_Flaws",
      status: "locked",
      progress: 0,
      description: "Bypassing business logic and complex authentication schemes."
    }
  ]
}

export default function RoadmapDetailPage() {
  return (
    <div className="flex flex-col gap-10 font-mono pb-20 max-w-4xl mx-auto">
      
      {/* Header Info */}
      <div className="space-y-4 border-b border-border/40 pb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">
          {ROADMAP_DATA.title}
        </h1>
        <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
             <div className="h-1 w-8 bg-primary" />
             45% OVERALL_SYNC
          </div>
          <span>3/5 Courses_Linked</span>
          <span>Verified_Path</span>
        </div>
      </div>

      {/* Course Chain */}
      <div className="relative space-y-12">
        {/* Vertical Line Connector */}
        <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-muted/20" />

        {ROADMAP_DATA.courses.map((course, index) => (
          <div key={course.id} className="relative pl-12 group">
            
            {/* Connector Node */}
            <div className={`absolute left-0 top-2 size-10 flex items-center justify-center bg-background border-2 z-10 transition-colors ${
              course.status === 'completed' ? 'border-primary text-primary' : 
              course.status === 'active' ? 'border-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 
              'border-muted text-muted-foreground/30'
            }`}>
              {course.status === 'completed' ? <CheckCircle2 className="size-5" /> : 
               course.status === 'active' ? <CircleDot className="size-5" /> : 
               <Lock className="size-5" />}
            </div>

            {/* Course Card Component */}
            <div className={`p-6 border transition-all ${
              course.status === 'locked' 
                ? 'border-border/20 bg-card/5 opacity-60' 
                : 'border-border/60 bg-card/20 hover:border-primary/40'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Course_0{index + 1}</span>
                    {course.status === 'active' && (
                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 border border-primary/20">CURRENT_TARGET</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight">{course.title}</h3>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-xl">
                    // {course.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="w-32 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-muted/30">
                      <div className="h-full bg-primary transition-all" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    disabled={course.status === 'locked'}
                    variant={course.status === 'active' ? "default" : "outline"}
                    className="rounded-none h-9 text-[10px] font-bold uppercase w-full"
                  >
                    <Link href={`/courses/${course.id}`}>
                      {course.status === 'completed' ? 'Review_Course' : 'Go_to_Course'} 
                      <ArrowUpRight className="ml-2 size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Career Achievement */}
      <div className="mt-8 p-8 border-2 border-dashed border-border/40 bg-muted/5 text-center">
         <GraduationCap className="size-8 mx-auto text-muted-foreground/40 mb-3" />
         <h4 className="text-xs font-bold uppercase text-muted-foreground">Roadmap_Completion_Award</h4>
         <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest">Digital_Certificate & Special_Badge_ID</p>
      </div>
    </div>
  )
}