import { getApi, postApi } from '~/config/axiosClient'
import { accessTokenStorage } from '~/config/accessTokenStorage'

// export interface User {
//   id: string
//   email: string
//   name: string
// }

interface LoginPayload {
  username: string
  password: string
}

interface LoginResponse {
  // success: boolean
  // data: { access_token: string; user: User }
  accessToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
}

export const login = async (payload: LoginPayload) => {
  const res = await postApi<LoginResponse>('/auth/login', payload)
  accessTokenStorage.setAccessToken(res.accessToken)
  return res.username
}

export const logout = () => {
  accessTokenStorage.clearAccessToken()
}

// export const getMe = () => getApi<User>('/auth/me')