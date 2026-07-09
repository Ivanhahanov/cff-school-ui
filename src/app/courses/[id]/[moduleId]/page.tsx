import { redirect } from 'next/navigation';
import { getApiV1CoursesBySlugByModuleSlug } from "@/api/generated";

export default async function ModulePage({ params }: { params: { id: string, moduleId: string } }) {
    const { id, moduleId } = await params;

    // Получаешь данные модуля (из БД или API)
    const { data: module, error } = await getApiV1CoursesBySlugByModuleSlug({
                path: { slug: id, moduleSlug: moduleId, },
            });
    const firstTaskId = module?.tasks![0].slug

    // Сразу отправляешь на первое задание
    redirect(`/courses/${id}/${moduleId}/${firstTaskId}`);
}