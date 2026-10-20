import { useQuery } from '@tanstack/react-query';
import { fetchMyCourses } from './myCourses.api';

export const myCoursesKeys = {
  all: ['my-courses'] as const,
};

export const useMyCourses = () =>
  useQuery({
    queryKey: myCoursesKeys.all,
    queryFn: fetchMyCourses,
  });
