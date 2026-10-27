import { useMemo } from 'react'

import { useGetCourseToc, useGetCourseProgress } from './courseDetail.query'
import type {
  IChapterWithProgress,
  ILessonWithProgress,
  ICourseTocWithProgress,
  ICourseToc,
} from './courseDetail.type'

export interface ICourseTocData {
  chapters: Array<ICourseToc | IChapterWithProgress>
  progressSummary?: ICourseTocWithProgress['progressSummary']
}

export interface ICourseTocWithProgressReturn {
  data: ICourseTocData | undefined
  isLoading: boolean
  isError: boolean
}

export const useCourseTocWithProgress = (
  courseId?: number,
  isStudent?: boolean
): ICourseTocWithProgressReturn => {
  const tocQuery = useGetCourseToc(courseId)
  const progressQuery = useGetCourseProgress(courseId, isStudent)

  const data = useMemo<ICourseTocData | undefined>(() => {
    if (!tocQuery.data) return undefined

    if (!isStudent) return { chapters: tocQuery.data }

    if (!progressQuery.data) return undefined

    const { lessons, ...progressSummary } = progressQuery.data
    const progressMap = new Map(lessons.map((l) => [l.lessonId, l]))

    const chapters = tocQuery.data.map((ch): IChapterWithProgress => {
      const chLessons: ILessonWithProgress[] = ch.lessons.map((l) => {
        const p = progressMap.get(l.id)
        return {
          ...l,
          completed: p?.completed ?? false,
          lastPosition: p?.lastPosition ?? 0,
        }
      })

      const completedLessons = chLessons.filter((l) => l.completed).length

      return {
        ...ch,
        lessons: chLessons,
        totalLessons: chLessons.length,
        completedLessons,
        isCompleted: chLessons.length > 0 && completedLessons === chLessons.length,
      }
    })

    return { chapters, progressSummary }
  }, [isStudent, tocQuery.data, progressQuery.data])

  return {
    data,
    isLoading: tocQuery.isLoading || (!!isStudent && progressQuery.isLoading),
    isError: tocQuery.isError || (!!isStudent && progressQuery.isError),
  }
}