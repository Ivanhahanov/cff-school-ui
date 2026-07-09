"use server"

import { getServerClient } from "@/api/client";
import { deleteApiV1InfraByIdDestroy, getApiV1InfraActive } from "@/api/generated";

export async function stopInstanceAction(challengeId: string) {
  try {
    // 1. Получаем настроенный клиент (серверный контекст)
    await getServerClient(); 

    // 2. Вызываем СГЕНЕРИРОВАННЫЙ метод
    // Он автоматически подхватит baseUrl и headers из сконфигурированного client
    const { data, error } = await deleteApiV1InfraByIdDestroy({
      path: { id: challengeId },
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Action Failed:", error);
    return { success: false, error: "Failed to stop instance" };
  }
}

export async function getActiveInfraAction() {
  try {
    await getServerClient(); 
    const { data, error } = await getApiV1InfraActive();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Active Infra Failed:", error);
    return { success: false, data: null };
  }
}