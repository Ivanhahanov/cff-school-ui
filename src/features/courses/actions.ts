"use server"

import { postApiV1CoursesBySlugUnlock, getApiV1CoursesBySlugPreview,postApiV1CoursesTasksByIdSubmit } from "@/api/generated"
import { getServerClient } from "@/api/client"

// Экшен для разблокировки курса
export async function unlockCourseAction(slug: string) {
  try {
    await getServerClient()
    const response = await postApiV1CoursesBySlugUnlock({
      path: { slug }
    })
    return { success: true, data: response.data }
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.body?.error || "Ошибка при активации курса на сервере." 
    }
  }
}

// Экшен для получения превью структуры курса
export async function getCoursePreviewAction(slug: string) {
  try {
    await getServerClient()
    const response = await getApiV1CoursesBySlugPreview({
      path: { slug }
    })
    return { success: true, data: response.data }
  } catch (error: any) {
    return {
      success: false,
      error: error?.body?.error || "Не удалось загрузить структуру курса."
    }
  }
}


export async function submitTaskFlagAction(taskId: string, flag: string) {
  try {
    // 1. Инициализируем клиент (он сам подтянет сессию/токены, accessToken в аргументы компонента передавать больше не нужно!)
    await getServerClient()

    // 2. Делаем типизированный запрос к бэкенду
    const response = await postApiV1CoursesTasksByIdSubmit({
      path: { id: taskId },
      body: { flag: flag }
    })

    // 3. Возвращаем результат
    // response.data содержит { is_correct: boolean, message: string }
    return { 
      success: response.data?.is_correct ?? false, 
      message: response.data?.message || "[СИСТЕМА]: Ответ обработан." 
    }
  } catch (error: any) {
    console.error("Flag submission error:", error)
    return {
      success: false,
      message: error?.body?.error || "[ОШИБКА]: Не удалось отправить флаг на сервер."
    }
  }
}

