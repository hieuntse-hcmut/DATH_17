import { useQuery } from '@tanstack/react-query'
import { getCourseProgress } from './myCourses.api'
import type { ICourseProgress } from "./myCourses.type"

export const useGetCourseProgress = (options?: any) => {
  return useQuery<ICourseProgress[]>({
    queryKey: ['progess-list'],
    queryFn: () => getCourseProgress(),
    ...options
  })
}
