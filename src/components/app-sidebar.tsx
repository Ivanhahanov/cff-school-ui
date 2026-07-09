"use client";
import Link from "next/link";
import {
  Swords, Trophy, Settings,
  User, LogOut, BookOpen, ShieldHalf,
  Activity, LayoutDashboard, Map, ChevronRight
} from "lucide-react"
import { handleSignOut } from "@/lib/actions"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/* ─── Навигация ─── */
const mainItems = [
  { title: "Курсы",     url: "/courses",    icon: BookOpen,        soon: false },
  { title: "Дашборд",   url: "/dashboard",  icon: LayoutDashboard, soon: true  },
  { title: "Задания",   url: "/challenges", icon: Swords,          soon: true  },
  { title: "Рейтинг",   url: "/scoreboard", icon: Trophy,          soon: true  },
  { title: "Роадмапы",  url: "/roadmaps",   icon: Map,             soon: true  },
]

const systemItems = [
  { title: "Активность", url: "/event",    icon: Activity, soon: true },
  { title: "Настройки",  url: "/settings", icon: Settings, soon: true },
]

/* ─── Логотип (использует хук для определения состояния) ─── */
function SidebarLogo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <div className={cn(
      "flex h-14 w-full items-center border-b border-border/20",
      collapsed ? "justify-center" : "justify-start gap-3 px-3"
    )}>
      <div className="flex size-8 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,255,0,0.1)]">
        <ShieldHalf className="size-4" />
      </div>
      {!collapsed && (
        <div className="grid flex-1 text-left leading-tight overflow-hidden">
          <span className="font-black tracking-tighter text-sm uppercase truncate">CTF_SCHOOL</span>
          <span className="text-[8px] text-primary/60 uppercase tracking-[0.2em] font-bold">
            v0.1 · ALPHA
          </span>
        </div>
      )}
    </div>
  )
}

/* ─── Пользователь в футере ─── */
function SidebarUser({ user }: { user?: any }) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex w-full items-center transition-colors hover:bg-primary/5",
          collapsed
            ? "justify-center h-12 px-0"
            : "justify-start gap-3 px-3 h-11 border border-transparent hover:border-border/40"
        )}>
          <Avatar className={cn(
            "shrink-0",
            collapsed
              ? "size-7 rounded-full border border-primary/30"
              : "size-7 rounded-none border border-border/40"
          )}>
            <AvatarImage src={user?.picture} />
            <AvatarFallback className={cn(
              "text-[10px] font-bold text-primary bg-muted/50",
              collapsed ? "rounded-full" : "rounded-none"
            )}>
              {user?.username?.slice(0, 2).toUpperCase() ?? "OP"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="grid flex-1 text-left leading-tight overflow-hidden">
                <span className="truncate text-xs font-bold uppercase tracking-tighter">
                  {user?.username ?? "Оператор"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[8px] text-muted-foreground/50 uppercase font-bold tracking-widest">онлайн</span>
                </div>
              </div>
              <ChevronRight className="size-3.5 opacity-30 shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={8}
        className="rounded-none border-border/50 bg-popover font-mono w-52 shadow-2xl"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mb-1">Сессия</p>
          <p className="text-xs font-bold uppercase truncate">{user?.username ?? "Оператор"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem asChild className="gap-2 rounded-none cursor-pointer focus:bg-primary/10 text-[11px] uppercase font-bold py-2">
          <Link href="/profile" className="flex w-full items-center gap-2">
            <User className="size-3.5" />
            <span>Профиль</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/30" />
        <DropdownMenuItem
          className="gap-2 text-red-500/80 focus:text-red-400 focus:bg-red-500/10 rounded-none cursor-pointer text-[11px] uppercase font-bold py-2"
          onClick={handleSignOut}
        >
          <LogOut className="size-3.5" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ─── Главный компонент ─── */
export function AppSidebar({ user }: { user?: any }) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 font-mono">

      <SidebarHeader className="p-0 gap-0">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-0">

        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.25em] px-4 pb-2 text-muted-foreground/50 font-bold">
            Навигация
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "rounded-none border-l-2 border-transparent px-3 h-9 transition-all",
                    item.soon
                      ? "opacity-35 cursor-not-allowed"
                      : "hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <a
                    href={item.soon ? "#" : item.url}
                    onClick={item.soon ? (e) => e.preventDefault() : undefined}
                    className="flex items-center gap-3"
                  >
                    <item.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs uppercase font-bold tracking-tight flex-1">{item.title}</span>
                    {item.soon && (
                      <Badge variant="outline" className="text-[7px] px-1.5 py-0 h-4 font-bold uppercase tracking-widest border-border/30 text-muted-foreground/50 rounded-none">
                        скоро
                      </Badge>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 bg-border/20" />

        <SidebarGroup className="py-3">
          <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.25em] px-4 pb-2 text-muted-foreground/50 font-bold">
            Система
          </SidebarGroupLabel>
          <SidebarMenu>
            {systemItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "rounded-none border-l-2 border-transparent px-3 h-9 transition-all",
                    item.soon
                      ? "opacity-35 cursor-not-allowed"
                      : "hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <a
                    href={item.soon ? "#" : item.url}
                    onClick={item.soon ? (e) => e.preventDefault() : undefined}
                    className="flex items-center gap-3"
                  >
                    <item.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs uppercase font-bold tracking-tight flex-1">{item.title}</span>
                    {item.soon && (
                      <Badge variant="outline" className="text-[7px] px-1.5 py-0 h-4 font-bold uppercase tracking-widest border-border/30 text-muted-foreground/50 rounded-none">
                        скоро
                      </Badge>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 gap-0 border-t border-border/30">
        {/* Подсказка хоткея */}
        <SidebarHotkey />
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarHotkey() {
  const { state } = useSidebar()
  if (state === "collapsed") return null
  return (
    <div className="px-4 py-2">
      <p className="text-[8px] text-muted-foreground/30 uppercase tracking-widest font-mono flex items-center gap-1.5">
        <kbd className="inline-flex items-center px-1 py-0.5 border border-border/30 text-[7px] font-mono bg-muted/20 text-muted-foreground/40">⌘</kbd>
        <kbd className="inline-flex items-center px-1 py-0.5 border border-border/30 text-[7px] font-mono bg-muted/20 text-muted-foreground/40">B</kbd>
        <span>свернуть / развернуть</span>
      </p>
    </div>
  )
}