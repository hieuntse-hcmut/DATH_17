import { useQuery } from '@tanstack/react-query'
import { fetchCourseToc, getCourse, getMaterials, getMyProgress } from './courseDetail.api'

export const useGetCourseToc = (courseId?: number, enabled?: boolean) =>
  useQuery({
    queryKey: ['course-toc', courseId],
    queryFn: () => fetchCourseToc(courseId!),
    enabled: enabled && !!courseId,
    staleTime: 5 * 60 * 1000,
  })

export const useGetCourseProgress = (courseId?: number, enabled?: boolean) =>
  useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => getMyProgress(courseId!),
    enabled: enabled && !!courseId,
  })

export const useGetMaterials = (courseId?: number, chapterId?: number, lessonId?: number) =>
  useQuery({
    queryKey: ['materials', courseId, chapterId, lessonId],
    queryFn: () => getMaterials(courseId!, chapterId!, lessonId!),
    enabled: !!courseId && !!chapterId && !!lessonId,
  })

export const useGetCourse = (courseId?: number, isStudent?: boolean) =>
  useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId && !isStudent,
  })



