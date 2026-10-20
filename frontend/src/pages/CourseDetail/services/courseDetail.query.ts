import { useQuery } from '@tanstack/react-query'
import { fetchCourseDetail } from './courseDetail.api'

export const useCourseDetailQuery = (courseId: string) =>
  useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: () => fetchCourseDetail(courseId),
    enabled: !!courseId,
  })
