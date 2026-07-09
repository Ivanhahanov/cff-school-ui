"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { getActiveInfraAction } from "@/lib/instance";
import { ModelsActiveInfraResponse } from "@/api/generated";

const WARN_THRESHOLD_SECS = 120;

interface InfraContextType {
  activeInfra: ModelsActiveInfraResponse | null;
  setActiveInfra: (infra: ModelsActiveInfraResponse | null) => void;
  timeLeft: number | null; // секунды до истечения; null если нет активной сессии
  refresh: () => Promise<void>;
}

const InfraContext = createContext<InfraContextType | undefined>(undefined);

export function InfraProvider({ children }: { children: React.ReactNode }) {
  const [activeInfra, setActiveInfra] =
    useState<ModelsActiveInfraResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const expiredRef = useRef<Date | null>(null);

  // ── Синхронизация с сервером ─────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const { data, success } = await getActiveInfraAction();
    if (success && data) {
      setActiveInfra(data);
      expiredRef.current = data.expired ? new Date(data.expired) : null;
    } else {
      setActiveInfra(null);
      expiredRef.current = null;
      setTimeLeft(null);
    }
  }, []);

  // Первичная загрузка
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Синхронизация при возвращении на вкладку — на случай если сессия была
  // остановлена в другой вкладке или на другом устройстве
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  // ── Тик каждую секунду ───────────────────────────────────────────────────
  useEffect(() => {
    const tickId = setInterval(() => {
      if (!expiredRef.current) {
        setTimeLeft(null);
        return;
      }
      const secs = Math.floor(
        (expiredRef.current.getTime() - Date.now()) / 1000
      );
      if (secs <= 0) {
        setActiveInfra(null);
        expiredRef.current = null;
        setTimeLeft(null);
      } else {
        setTimeLeft(secs);
      }
    }, 1000);
    return () => clearInterval(tickId);
  }, []);

  // Когда снаружи вызывают setActiveInfra (после deploy/destroy),
  // обновляем expiredRef синхронно
  const setActiveInfraWrapped = useCallback(
    (infra: ModelsActiveInfraResponse | null) => {
      setActiveInfra(infra);
      expiredRef.current = infra?.expired ? new Date(infra.expired) : null;
      if (!infra) setTimeLeft(null);
    },
    []
  );

  return (
    <InfraContext.Provider
      value={{
        activeInfra,
        setActiveInfra: setActiveInfraWrapped,
        timeLeft,
        refresh,
      }}
    >
      {children}
    </InfraContext.Provider>
  );
}

export const useInfra = () => {
  const context = useContext(InfraContext);
  if (!context) throw new Error("useInfra must be used within InfraProvider");
  return context;
};


export { WARN_THRESHOLD_SECS };

// useCountdownLabel — минуты для кнопки
export function useCountdownLabel(): string | null {
  const { timeLeft } = useInfra();
  if (timeLeft === null) return null;
  if (timeLeft <= 0) return "ИСТЕКЛО";
  const m = Math.ceil(timeLeft / 60); // округляем вверх: 1:59 → "2 мин"
  return `${m} мин`;
}

// useCountdownLabelExact — MM:SS для дропдауна
export function useCountdownLabelExact(): string | null {
  const { timeLeft } = useInfra();
  if (timeLeft === null) return null;
  if (timeLeft <= 0) return "ИСТЕКЛО";
  const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}