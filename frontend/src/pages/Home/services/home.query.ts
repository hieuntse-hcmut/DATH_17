import { useQuery } from "@tanstack/react-query";
import { getEnrollMe } from "./home.api";
import type { Enrollment } from "./home.type";

export const useGetEnrollMe = (options?: any) => {
    return useQuery<Enrollment[]>({
        queryKey: ["enroll-me"],
        queryFn: () => getEnrollMe(),
        ...options,
    });
};
