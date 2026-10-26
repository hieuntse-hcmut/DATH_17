import { useQuery } from "@tanstack/react-query";
import { getMe } from "./me.api";

export const useMe = () =>
    useQuery({
        queryKey: ["me"],
        queryFn: getMe
    })