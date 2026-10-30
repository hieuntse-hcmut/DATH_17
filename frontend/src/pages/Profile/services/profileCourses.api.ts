import { getApi } from "~/config/axiosClient";
import type { IProfileCourse } from "./profileCourses.type";

export const getProfileCourses = () => {
    return getApi<IProfileCourse[]>(`/courses/me`);
};
