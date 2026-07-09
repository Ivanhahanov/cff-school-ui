"use client"

import { 
  Fingerprint, 
  ChevronRight, 
  Terminal, 
  Unlock, 
  Zap, 
  Cpu, 
  Database,
  Code2,
  Globe,
  Activity,
  Box,
  Key
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage({ user }: { user?: any }) {
  return (
    <div className="flex flex-col gap-8 font-mono text-foreground max-w-6xl mx-auto pb-12">
      
      {/* --- HEADER: USER INFO --- */}
      <div className="border border-border/50 bg-card/30 p-8 rounded-none">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="relative shrink-0">
            <Avatar className="h-28 w-28 rounded-none border border-border bg-muted p-1">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="rounded-none bg-muted text-muted-foreground font-bold text-xl">
                {user?.username?.slice(0, 2).toUpperCase() || "OP"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -left-2 bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground uppercase">
              Operator
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tighter uppercase">
                  {user?.username || "GUEST_USER"}
                </h1>
                <Badge variant="outline" className="rounded-none border-primary/50 text-primary text-[10px] uppercase font-bold px-2 py-0">
                  Level_42
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase ml-auto border-l border-border/50 pl-4">
                  <Activity className="size-3 text-green-500" /> 
                  System_Status: <span className="text-green-500 font-bold">Online</span>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground uppercase flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Fingerprint className="size-3" /> ID: {user?.sub?.slice(0, 12)}</span>
                <span className="flex items-center gap-1.5"><Terminal className="size-3" /> bash_v5.2</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-border/30">
              <StatBlock label="Solves" value="156" />
              <StatBlock label="Global_Rank" value="#1,204" />
              <StatBlock label="XP_Total" value="12,450" />
              <StatBlock label="Achievements" value="12/48" />
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT: GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT/CENTER: PROGRESS & SKILLS */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="space-y-4">
            <SectionHeader title="Skill_Matrix" icon={Cpu} />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 bg-card/20 border border-border/40 p-6">
              <SkillBar label="Web_Exploitation" value={85} />
              <SkillBar label="Reverse_Engineering" value={60} />
              <SkillBar label="Binary_Exploitation" value={45} />
              <SkillBar label="Cryptography" value={92} />
              <SkillBar label="Forensics" value={30} />
              <SkillBar label="OSINT" value={75} />
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader title="Recent_Validated_Flags" icon={Box} />
            <div className="space-y-1">
              {[
                { name: "Broken Logic", cat: "Web", pts: 100, date: "2024-03-15" },
                { name: "XOR Secure", cat: "Crypto", pts: 250, date: "2024-03-14" },
                { name: "Kernel Overflow", cat: "Pwn", pts: 500, date: "2024-03-12" },
              ].map((solve, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border/40 bg-muted/5 text-[11px] uppercase group hover:bg-muted/10">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground w-16">{solve.date}</span>
                    <span className="text-primary font-bold">{solve.cat}</span>
                    <span className="font-bold border-l border-border/50 pl-4">{solve.name}</span>
                  </div>
                  <span className="text-muted-foreground">+{solve.pts}_pts</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: SYSTEM & ACCESS */}
        <div className="space-y-8">
          <section className="space-y-4">
            <SectionHeader title="System_Access" icon={Unlock} />
            <div className="border border-border/40 bg-card/20 p-6 space-y-4">
              <div className="space-y-3">
                <InfoField label="Email_Address" value={user?.email || "N/A"} />
                <InfoField label="Primary_Node" value="Europe_West_1" />
                <InfoField label="Auth_Method" value="OAuth2_SSO" />
                <InfoField label="Member_Since" value="2023_08_12" />
              </div>
              
              <Separator className="bg-border/40 my-6" />
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full rounded-none border-border/60 text-[10px] uppercase font-bold h-9 hover:border-primary/50 justify-between">
                  Edit_Profile <ChevronRight className="size-3" />
                </Button>
                <Button variant="outline" className="w-full rounded-none border-border/60 text-[10px] uppercase font-bold h-9 hover:border-primary/50 justify-between">
                  API_Access_Keys <Key className="size-3" />
                </Button>
                <Button variant="ghost" className="w-full rounded-none text-red-500/70 hover:text-red-500 hover:bg-red-500/5 text-[10px] uppercase font-bold h-9 mt-4">
                  Terminate_Session
                </Button>
              </div>
            </div>
          </section>

          <div className="p-4 border border-dashed border-border/60 text-center opacity-50">
             <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
               Educational_Platform_v2.4
             </p>
          </div>
        </div>

      </div>
    </div>
  )
}

/* --- HELPERS --- */

function StatBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</div>
      <div className="text-xl font-bold tracking-tighter">{value}</div>
    </div>
  )
}

function SectionHeader({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <Icon className="size-4 text-primary" />
      <h2 className="text-xs font-bold uppercase tracking-[0.2em]">{title}</h2>
    </div>
  )
}

function SkillBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-1 bg-muted/30">
        <div className="h-full bg-primary/70" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-[11px] border-b border-border/10 pb-1.5 last:border-0">
      <span className="text-muted-foreground uppercase font-bold">{label}</span>
      <span className="font-bold truncate max-w-[160px]">{value}</span>
    </div>
  )
}