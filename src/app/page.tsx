"use client"

import { 
  BookOpen, 
  Server, 
  History, 
  ChevronRight, 
  Play, 
  FileText, 
  AlertCircle,
  Network,
  Compass,
  Map,
  Lock,
  CircleDot
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function EducationalDashboard() {
  return (
    <div className="flex flex-col gap-10 font-mono text-foreground pb-12">
      
      {/* --- SECTION 1: ACTIVE LEARNING PATH --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="size-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Active_Learning_Path</h2>
        </div>
        
        <Card className="rounded-none border border-primary/20 bg-primary/5 shadow-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-2 opacity-10 border-b border-l border-primary/40">
            <Network className="size-12" />
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <Badge className="rounded-none text-[9px] border-primary/50 text-primary mb-2 uppercase">Current_Module</Badge>
                  <h3 className="text-xl font-bold uppercase tracking-tighter text-primary">Advanced_SQL_Injection_Techniques</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span className="text-muted-foreground italic">Module_Completion</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-1.5 bg-primary/10 rounded-none" />
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-3">
                <Button className="rounded-none bg-primary text-black font-bold uppercase text-[10px] h-10 px-8 hover:bg-white transition-colors">
                  Continue_Lesson <Play className="ml-2 size-3 fill-current" />
                </Button>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Next: Time-Based_Exfiltration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- SECTION 2: SPECIALIZATION ROADMAPS (NEW) --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Career_Roadmaps</h2>
          </div>
          <Button variant="link" className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary p-0 h-auto tracking-widest">
            View_Full_Atlas [→]
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RoadmapMiniCard 
            title="Web_Pentester" 
            progress={42} 
            icon={Network} 
            status="Active"
          />
          <RoadmapMiniCard 
            title="Binary_Researcher" 
            progress={15} 
            icon={Map} 
            status="Locked"
            isLocked
          />
          <RoadmapMiniCard 
            title="SOC_Analyst" 
            progress={0} 
            icon={AlertCircle} 
            status="Ready"
          />
        </div>
      </section>

      {/* --- SECTION 3: LABS & KNOWLEDGE --- */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT: VIRTUAL LABS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Server className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Active_Lab_Instances</h2>
          </div>
          <div className="space-y-2">
            {[
              { name: "Web_Vuln_Lab_01", ip: "10.10.12.45", status: "Running", ttl: "01:42:10" },
              { name: "Binary_Pwn_Sandbox", ip: "10.10.12.89", status: "Stopped", ttl: "00:00:00" },
            ].map((lab) => (
              <div key={lab.name} className="flex items-center justify-between p-4 border border-border/40 bg-card/20 group">
                <div className="flex items-center gap-4">
                  <div className={`size-2 ${lab.status === "Running" ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"}`} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-tight">{lab.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{lab.ip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block font-bold">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-tighter">TTL</div>
                    <div className={`text-[10px] ${lab.status === "Running" ? "text-primary" : "text-muted-foreground"}`}>{lab.ttl}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-none border-border/60 text-[9px] h-7 uppercase font-bold">
                    {lab.status === "Running" ? "Reboot" : "Spawn"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DOCUMENTATION */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <FileText className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Theory_&_Docs</h2>
          </div>
          <div className="border border-border/40 bg-card/20 divide-y divide-border/20">
            {[
              { title: "Understanding_CORS_Policy", category: "Web", date: "2d ago" },
              { title: "GDB_Cheat_Sheet", category: "Pwn", date: "5d ago" },
              { title: "Intro_to_ASM_x64", category: "Reverse", date: "1w ago" },
            ].map((doc, i) => (
              <div key={i} className="p-3 hover:bg-muted/10 flex items-center justify-between cursor-pointer group transition-colors">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-tight group-hover:text-primary">{doc.title}</div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase">{doc.category}</div>
                </div>
                <ChevronRight className="size-3 text-muted-foreground/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION 4: MILESTONES --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History className="size-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Educational_Milestones</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { title: "SQL_Mastery", date: "2024.03.20", icon: AlertCircle },
             { title: "First_Root_Access", date: "2024.03.18", icon: AlertCircle },
             { title: "Crypto_Basics_Compl", date: "2024.03.15", icon: AlertCircle },
           ].map((m, i) => (
             <div key={i} className="p-3 border border-dashed border-border flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="p-2 border border-border bg-muted/20">
                   <m.icon className="size-4 text-primary" />
                </div>
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-tighter">{m.title}</div>
                   <div className="text-[8px] text-muted-foreground uppercase">{m.date}</div>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  )
}

/* --- SUB-COMPONENTS --- */

function RoadmapMiniCard({ title, progress, icon: Icon, status, isLocked = false }: any) {
  return (
    <div className={`p-4 border border-border/40 bg-card/20 relative group overflow-hidden ${isLocked ? 'opacity-50' : 'hover:border-primary/40 cursor-pointer'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="p-1.5 bg-muted/30 border border-border/50">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        {isLocked ? (
          <Lock className="size-3 text-muted-foreground" />
        ) : (
          <CircleDot className={`size-3 ${progress > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        )}
      </div>
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-tighter truncate">{title}</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted/30">
            <div className="h-full bg-primary/60" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-widest ${className}`}>
      {children}
    </span>
  )
}