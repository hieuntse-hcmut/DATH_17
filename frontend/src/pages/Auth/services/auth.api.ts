import { getApi, postApi } from '~/config/axiosClient'
import { accessTokenStorage } from '~/config/accessTokenStorage'

export interface User {
  id: string
  email: string
  name: string
}

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: { access_token: string; user: User }
}

export const login = async (payload: LoginPayload) => {
  const res = await postApi<LoginResponse>('/auth/login', payload)
  accessTokenStorage.setAccessToken(res.data.access_token)
  return res.data.user
}

export const logout = () => {
  accessTokenStorage.clearAccessToken()
}

export const getMe = () => getApi<User>('/auth/me')