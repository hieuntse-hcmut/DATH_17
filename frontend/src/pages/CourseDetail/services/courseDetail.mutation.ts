import { useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import {
  postNewLesson,
  putLesson,
  deleteLesson,
  postNewMaterial,
  putMaterial,
  deleteMaterial,
  postCompleteLesson,
  postNewChapter,
  putChapter,
  deleteChapter,
} from './courseDetail.api'
import type { IChapterPayload, ILessonPayload } from "./courseDetail.type";

const refreshToc = (qc: QueryClient, courseId?: number) =>
    Promise.all([
        qc.invalidateQueries({ queryKey: ["course-toc", courseId] }),
        qc.invalidateQueries({ queryKey: ["course-progress", courseId] }),
    ]);

const refreshMaterials = (qc: QueryClient, courseId: number | undefined, ids: { chapterId: number; lessonId: number },) =>
  qc.invalidateQueries({
    queryKey: [
      'materials',
      courseId,
      ids.chapterId,
      ids.lessonId,
    ],
  })


export const usePostCompleteLesson = () =>
    useMutation({
        mutationFn: (lessonId: number) => postCompleteLesson(lessonId),

        onSuccess: () => {
          // TODO  qc.invalidateQueries({ queryKey: ["course-toc", courseId] })
        },
    });

export const useAddNewChapter = (courseId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: IChapterPayload) => postNewChapter(courseId!, payload),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: ['course-toc', courseId],
            })
        },
    })
}

export const useUpdateChapter = (courseId?: number, chapterId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: IChapterPayload) => putChapter(courseId!, chapterId!,payload),
        onSuccess: () => refreshToc(qc, courseId),
    });
};

export const useDeleteChapter = (courseId?: number, chapterId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deleteChapter(courseId!, chapterId!),
        onSuccess: () => refreshToc(qc, courseId),
    });
};

// ---------- Lesson ----------

export const useAddNewLesson = (courseId?: number, chapterId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: ILessonPayload) => postNewLesson(courseId!, chapterId!, payload),
        onSuccess: () => refreshToc(qc, courseId),
    });
};

export const useUpdateLesson = (courseId?: number, chapterId?: number, lessonId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: ILessonPayload) => putLesson(courseId!, chapterId!, lessonId!, payload),
        onSuccess: () => refreshToc(qc, courseId),
    });
};

export const useDeleteLesson = (courseId?: number, chapterId?: number, lessonId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deleteLesson(courseId!, chapterId!, lessonId!),
        onSuccess: () => refreshToc(qc, courseId),
    });
};

// ---------- Material ----------

export type MaterialBody = {
    title: string;
    fileUrl: string;
    fileType: string;
    totalLength?: number | null;
};

export const useAddMaterial = (courseId?: number, chapterId?: number, lessonId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: MaterialBody) => postNewMaterial(courseId!, chapterId!, lessonId!, payload),
        onSuccess: () =>
            refreshMaterials(qc, courseId, {
                chapterId: chapterId!,
                lessonId: lessonId!,
            }),
    });
};

export const useUpdateMaterial = (courseId?: number, chapterId?: number, lessonId?: number, materialId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: MaterialBody) => putMaterial(courseId!, chapterId!, lessonId!, materialId!, payload),
        onSuccess: () =>
            refreshMaterials(qc, courseId, {
                chapterId: chapterId!,
                lessonId: lessonId!,
            }),
    });
};

export const useDeleteMaterial = (courseId?: number, chapterId?: number, lessonId?: number, materialId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => deleteMaterial(courseId!, chapterId!, lessonId!, materialId!,),
        onSuccess: () =>
            refreshMaterials(qc, courseId, {
                chapterId: chapterId!,
                lessonId: lessonId!,
            }),
    });
};