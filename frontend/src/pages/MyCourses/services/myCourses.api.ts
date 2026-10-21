import { getApi } from "~/config/axiosClient";
import type { ICourseProgress } from "./myCourses.type";

export const getCourseProgress = () => {
    return getApi<ICourseProgress[]>(`/progress/me`);
};
