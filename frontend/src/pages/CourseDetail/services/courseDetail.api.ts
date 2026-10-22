import { getApi, postApi } from "~/config/axiosClient";
import type { IChapter, ILesson, IMaterial, IChapterWithLessons, ICourseProgress, IPostCompleteLesson } from "./courseDetail.type";

const getChapters = (courseId: number) => getApi<IChapter[]>(`/courses/${courseId}/chapters`);

const getLessons = (courseId: number, chapterId: number) => getApi<ILesson[]>(`/courses/${courseId}/chapters/${chapterId}/lessons`);

export const getMyProgress = (courseId: number) => getApi<ICourseProgress>(`/courses/${courseId}/progress/me`);

const byOrder = <T extends { orderIndex: number }>(a: T, b: T) =>
  a.orderIndex - b.orderIndex

export const fetchCourseToc = async (courseId: number): Promise<IChapterWithLessons[]> => {
    const chapters = await getChapters(courseId)

    const result = await Promise.all(
    chapters.map(async (ch) => {
        const lessons = await getLessons(courseId, ch.id)
        return { ...ch, lessons: [...lessons].sort(byOrder) }
    })
    )

    return result.sort(byOrder)
}

export const getMaterials = (courseId: number, chapterId: number, lessonId: number) =>getApi<IMaterial[]>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/materials`)

export const postCompleteLesson = (lessonId: number) => postApi<IPostCompleteLesson>(`/lessons/${lessonId}/complete`)