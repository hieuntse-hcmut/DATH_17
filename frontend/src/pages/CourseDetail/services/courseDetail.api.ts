import { getApi } from "~/config/axiosClient";
import type { IProgress } from "./courseDetail.type";

export const getCourseProgress = (courseId?: string) => {
    if (courseId?.trim()) {
        return getApi<IProgress>(`/courses/${courseId}/progress/me`);
    }
    return getApi<IProgress>(`/progress/me`);
};
