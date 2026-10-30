import { getApi } from "~/config/axiosClient";
import type { ICourseResponse } from "./adminCourse.type";

export const getCourses = (): Promise<ICourseResponse[]> => {
  return getApi<ICourseResponse[]>("/courses");
};
