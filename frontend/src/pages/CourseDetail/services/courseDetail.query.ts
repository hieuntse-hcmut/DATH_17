import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchCourseToc, getMaterials, getMyProgress, postCompleteLesson } from './courseDetail.api'

export const useGetCourseToc = (courseId?: number) =>
  useQuery({
    queryKey: ['course-toc', courseId],
    queryFn: () => fetchCourseToc(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  })

export const useGetCourseProgress = (courseId?: number) =>
  useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => getMyProgress(courseId!),
    enabled: !!courseId,
  })

export const useGetMaterials = (courseId?: number, chapterId?: number, lessonId?: number) =>
  useQuery({
    queryKey: ['materials', courseId, chapterId, lessonId],
    queryFn: () => getMaterials(courseId!, chapterId!, lessonId!),
    enabled: !!courseId && !!chapterId && !!lessonId,
  })

export const usePostCompleteLesson = () =>
    useMutation({
        mutationFn: (lessonId: number) => postCompleteLesson(lessonId),

        onSuccess: (response) => {
            
        },
    });

