import { notFound } from "next/navigation";
import { CoursePage } from "@/features/courses/components/CoursePage";
import { getServerClient } from "@/api/client";
import { getAccessToken } from '@logto/next/server-actions';
import { logtoConfig } from '@/app/logto';
import {
    getApiV1CoursesBySlugByModuleSlug,
    postApiV1CoursesTasksByIdSwitch,
} from "@/api/generated";
import matter from 'gray-matter';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});

async function getCourseMarkdown(s3Key: string) {
    const command = new GetObjectCommand({ Bucket: "ctf", Key: s3Key });
    const response = await s3.send(command);
    return response.Body?.transformToString()!;
}

export default async function Page({
    params,
}: {
    params: { id: string; moduleId: string; taskId: string };
}) {
    const { id, moduleId, taskId } = await params;

    await getServerClient();
    const token = await getAccessToken(logtoConfig, logtoConfig.resources?.[0]);

    try {
        const { data: module, error } = await getApiV1CoursesBySlugByModuleSlug({
            path: { slug: id, moduleSlug: moduleId },
        });

        if (error || !module?.tasks?.length) return notFound();

        const taskIndex = taskId
            ? module.tasks.findIndex((t) => t.slug === taskId)
            : 0;

        if (taskIndex === -1) return notFound();

        const taskData = module.tasks[taskIndex];
        if (!taskData.content_path) return notFound();

        // ── Switch задания на сервере ──────────────────────────────────────────
        // Вызываем до рендера страницы — агент развернёт файлы пока грузится HTML.
        // Ошибки глотаем: если инфра ещё не запущена (первый вход) — switch упадёт,
        // но это нормально. CourseInstance запустит инфру и дальше пользователь
        // перейдёт на задание уже через handleInitialize → startStream.
        // Если инфра активна — файлы переключатся до того как загрузится iframe.
        let switchError: string | null = null;
        try {
            await postApiV1CoursesTasksByIdSwitch({
                path: { id: taskData.slug! },
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err: any) {
            // Логируем но не падаем — инфра может быть просто не запущена
            switchError = err?.message ?? "infra not ready";
            console.log(`[switch-task] skipped for ${taskData.slug}: ${switchError}`);
        }
        // ──────────────────────────────────────────────────────────────────────

        const markdown = await getCourseMarkdown(taskData.content_path);
        const { data: metadata, content } = matter(markdown);

        const courseData = {
            courseTitle: id,
            moduleTitle: moduleId,
            taskId:      metadata.id        ?? taskData.slug,
            title:       metadata.title     ?? "Untitled",
            description: metadata.summary   ?? "",
            content,
            difficulty:  metadata.difficulty ?? "—",
            category:    metadata.category   ?? "—",
            instanceId:  String(moduleId),
            checkMode:   metadata.check?.mode    ?? "flag",
            setupScript: metadata.setup?.script  ?? null,
            targetDir:   metadata.target_dir     ?? null,
            notesTitle:  metadata.notes_title    ?? null,
            objectives:  metadata.objectives     ?? [],
            hints:       metadata.hints          ?? [],
            resources:   metadata.resources      ?? [],
            switchError,
        };

        const nextTask = module.tasks[taskIndex + 1];
        const prevTask = module.tasks[taskIndex - 1];

        return (
            <CoursePage
                courseData={courseData}
                accessToken={token}
                progress={{ current: taskIndex + 1, total: module.tasks.length }}
                nextPath={nextTask ? `/courses/${id}/${moduleId}/${nextTask.slug}` : null}
                prevPath={prevTask ? `/courses/${id}/${moduleId}/${prevTask.slug}` : null}
                isLastTask={taskIndex === module.tasks.length - 1}
                initialStatus={taskData.status ?? "OPEN"}
            />
        );
    } catch (err) {
        console.error("Course load error:", err);
        return notFound();
    }
}