'use client'

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PurchaseCardProps {
  courseSlug: string
  initialIsUnlocked: boolean
  price: number
}

export function PurchaseCard({ courseSlug, initialIsUnlocked, price }: PurchaseCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(initialIsUnlocked)
  const [loading, setLoading] = useState(false)

  const handleUnlockCourse = async () => {
    try {
      setLoading(true)
      // Пример вызова вашего Swagger-клиента:
      // await api.courses.unlock(courseSlug)
      
      setIsUnlocked(true)
    } catch (err) {
      alert("Ошибка при покупке курса. Проверьте баланс.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border p-8 shadow-sm">
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Доступ</span>
          {isUnlocked ? (
            <span className="text-emerald-500 text-[10px] font-bold uppercase">Куплено</span>
          ) : (
            <span className="text-red-500 text-[10px] font-bold uppercase">Заблокировано</span>
          )}
        </div>
        
        {!isUnlocked && (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic">{price}</span>
            <span className="text-sm font-bold text-muted-foreground uppercase">кредитов</span>
          </div>
        )}
      </div>

      <Button 
        disabled={isUnlocked || loading}
        onClick={handleUnlockCourse}
        className="w-full h-12 rounded-none bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest transition-all hover:scale-[1.02] disabled:hover:scale-100 data-[unlocked=true]:bg-emerald-600 data-[unlocked=true]:text-white"
        data-unlocked={isUnlocked}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isUnlocked ? (
          "Доступ открыт"
        ) : (
          "Открыть полный доступ"
        )}
      </Button>
    </div>
  )
}