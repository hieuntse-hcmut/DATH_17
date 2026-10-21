import { useQuery } from '@tanstack/react-query'
import { getCourseProgress } from './courseDetail.api'

export type IGetCourseProgress = {
  courseId?: string
  options?: any
}

export const useGetCourseProgress = ({courseId, options} : Readonly<IGetCourseProgress>) => {
  return useQuery({
    queryKey: ['progess-list', courseId?.trim() ? courseId : "full"],
    queryFn: () => getCourseProgress(courseId),
    ...options
  })
}
