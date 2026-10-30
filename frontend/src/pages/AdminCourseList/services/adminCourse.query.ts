import { useQuery } from "@tanstack/react-query";
import { getCourses } from "./adminCourse.api";

export const ADMIN_COURSES_QUERY_KEY = ["admin-courses"] as const;

export const useGetCourses = () => {
  return useQuery({
    queryKey: ADMIN_COURSES_QUERY_KEY,
    queryFn: getCourses,
  });
};
