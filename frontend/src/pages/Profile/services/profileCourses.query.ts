import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getProfileCourses } from './profileCourses.api'
import type { IProfileCourse } from "./profileCourses.type"

export const useProfileCourses = (
  options?: Omit<UseQueryOptions<IProfileCourse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<IProfileCourse[]>({
    queryKey: ['my-courses'],
    queryFn: () => getProfileCourses(),
    ...options
  })
}
