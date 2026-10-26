import { getApi } from "~/config/axiosClient";
import type { ICourse } from "./myCourses.type";

export const getMyCourses = () => {
    return getApi<ICourse[]>(`/courses/me`);
};
