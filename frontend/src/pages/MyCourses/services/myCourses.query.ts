import { useQuery } from '@tanstack/react-query'
import { getMyCourses } from './myCourses.api'
import type { ICourse } from "./myCourses.type"

export const useGetMyCourses = (options?: any) => {
  return useQuery<ICourse[]>({
    queryKey: ['progess-list'],
    queryFn: () => getMyCourses(),
    ...options
  })
}
