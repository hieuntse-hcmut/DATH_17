import { getApi } from "~/config/axiosClient";
import type { Enrollment } from "./home.type";

export const getEnrollMe = () => {
    return getApi<Enrollment[]>("/enrollments/me");
};
