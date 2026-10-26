import { postApi } from '~/config/axiosClient'
import { accessTokenStorage } from '~/config/accessTokenStorage'

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload {
  username: string
  fullName: string
  password: string
  email: string
}

interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
}

interface RegisterResponse {
  message?: string
}

export const login = async (payload: LoginPayload) => {
  const res = await postApi<LoginResponse>('/auth/login', payload)
  accessTokenStorage.setAccessToken(res.accessToken)
  accessTokenStorage.setUserId(res.userId)
  return res.username
}

export const register = async (payload: RegisterPayload) => {
  const res = await postApi<RegisterResponse>('/auth/register', payload)
  return res?.message
}

export const logout = () => {
  accessTokenStorage.clearAccessToken()
}

// export const getMe = () => getApi<User>('/auth/me')