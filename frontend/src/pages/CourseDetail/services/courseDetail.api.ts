import { deleteApi, getApi, postApi, putApi } from "~/config/axiosClient";
import type { ILessonPayload, IChapter, ILesson, IMaterial, ICourseToc, ICourseProgress, IPostCompleteLesson, IChapterPayload, ICourse } from "./courseDetail.type";

const getChapters = (courseId: number) => getApi<IChapter[]>(`/courses/${courseId}/chapters`);

const getLessons = (courseId: number, chapterId: number) => getApi<ILesson[]>(`/courses/${courseId}/chapters/${chapterId}/lessons`);

export const getCourse = (courseId: number) => getApi<ICourse>(`/courses/${courseId}`)

export const getMyProgress = (courseId: number) => getApi<ICourseProgress>(`/courses/${courseId}/progress/me`);

const byOrder = <T extends { orderIndex: number }>(a: T, b: T) =>
  a.orderIndex - b.orderIndex

export const fetchCourseToc = async (courseId: number): Promise<ICourseToc[]> => {
    const chapters = await getChapters(courseId)

    const result = await Promise.all(
    chapters.map(async (ch) => {
        const lessons = await getLessons(courseId, ch.id)
        return { ...ch, lessons: [...lessons].sort(byOrder) }
    })
    )

    return result.sort(byOrder)
}

export const postCompleteLesson = (lessonId: number) => postApi<IPostCompleteLesson>(`/lessons/${lessonId}/complete`)

// ---------- Chapter ----------

export const postNewChapter = (
    courseId: number, 
    payload: IChapterPayload
) => 
    postApi<IChapter>(
        `/courses/${courseId}/chapters`, 
        payload
    )

export const putChapter = (
    courseId: number, 
    chapterId: number, 
    payload: IChapterPayload
) => 
    putApi<IChapter>(
        `/courses/${courseId}/chapters/${chapterId}`, 
        payload
    )

export const deleteChapter = (
    courseId: number, 
    chapterId: number
) => 
    deleteApi(
        `/courses/${courseId}/chapters/${chapterId}`
    )

// ---------- Lesson ----------

export const postNewLesson = (
    courseId: number,
    chapterId: number,
    payload: ILessonPayload,
) =>
    postApi<ILesson>(
        `/courses/${courseId}/chapters/${chapterId}/lessons`,
        payload,
    )

export const putLesson = (
    courseId: number,
    chapterId: number,
    lessonId: number,
    payload: ILessonPayload,
) =>
    putApi<ILesson>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        payload,
  )

export const deleteLesson = (
    courseId: number,
    chapterId: number,
    lessonId: number,
) =>
    deleteApi(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
    )

// ---------- Material ----------

export type MaterialBody = {
    title: string
    fileUrl: string
    fileType: string
}

export const getMaterials = (
    courseId: number,
    chapterId: number,
    lessonId: number,
) =>
    getApi<IMaterial[]>(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/materials`,
    )

export const postNewMaterial = (
    courseId: number,
    chapterId: number,
    lessonId: number,
    payload: MaterialBody,
) =>
    postApi(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/materials`,
        payload,
    )

export const putMaterial = (
    courseId: number,
    chapterId: number,
    lessonId: number,
    materialId: number,
    payload: MaterialBody,
) =>
    putApi(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/materials/${materialId}`,
        payload,
    )

export const deleteMaterial = (
    courseId: number,
    chapterId: number,
    lessonId: number,
    materialId: number,
) =>
    deleteApi(
        `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/materials/${materialId}`,
    )
