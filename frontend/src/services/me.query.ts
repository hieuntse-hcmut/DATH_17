import { useQuery } from "@tanstack/react-query";
import { getMe } from "./me.api";

const getMeMockData = () => {
    return {
        role: "LECTURER"
    }
}

export const useMe = () =>
    useQuery({
        queryKey: ["me"],
        queryFn: getMeMockData 
    })