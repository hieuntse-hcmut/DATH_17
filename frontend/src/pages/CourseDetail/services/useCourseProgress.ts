import { useMemo } from 'react'

import { useGetCourseToc, useGetCourseProgress } from './courseDetail.query'
import type {
  IChapterWithProgress,
  ILessonWithProgress,
  ICourseTocWithProgress
} from './courseDetail.type'

export const useCourseTocWithProgress = (courseId?: number) => {
  const tocQuery = useGetCourseToc(courseId)
  const progressQuery = useGetCourseProgress(courseId)

  const data = useMemo<ICourseTocWithProgress | undefined>(() => {
    if (!tocQuery.data || !progressQuery.data) return undefined

    const { lessons, ...progressSummary } = progressQuery.data

    const progressMap = new Map(lessons.map((l) => [l.lessonId, l]))

    const chapters = tocQuery.data.map((ch): IChapterWithProgress => {
      const lessons: ILessonWithProgress[] = ch.lessons.map((l) => {
        const p = progressMap.get(l.id)
        return {
          ...l,
          completed: p?.completed ?? false,
          lastPosition: p?.lastPosition ?? 0,
          contentType: p?.contentType,
        }
      })

      const completedLessons = lessons.filter((l) => l.completed).length

      return {
        ...ch,
        lessons,
        totalLessons: lessons.length,
        completedLessons,
        isCompleted: lessons.length > 0 && completedLessons === lessons.length,
      }
    })

    return { chapters, progressSummary }
  }, [tocQuery.data, progressQuery.data])

  return {
    data,
    isLoading: tocQuery.isLoading || progressQuery.isLoading,
    isError: tocQuery.isError || progressQuery.isError,
  }
}