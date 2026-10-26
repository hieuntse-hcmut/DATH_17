import { getApi } from "~/config/axiosClient";

export interface IMe {
  id: number
  username: string
  fullName: string
  email: string
  role: string
}

export const getMe = () => getApi<IMe>("/auth/me");