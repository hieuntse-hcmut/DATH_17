import { getApi } from "~/config/axiosClient";

export const getMe = () => getApi("/auth/me");