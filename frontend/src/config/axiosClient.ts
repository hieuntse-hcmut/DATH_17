import axios, { AxiosError, type AxiosResponse } from 'axios'

import { accessTokenStorage } from './accessTokenStorage'

interface ApiEnvelope<T = unknown> {
  success?: boolean
  data?: T
  error_message?: string
  error_code?: string | number
}

const LOGIN_PATH_FE = '/login'
const PUBLIC_PATHS_BE = ["/health", "/auth/login", "/auth/register", "/error"];

const isPublicRequest = (url?: string) =>
  !!url && PUBLIC_PATHS_BE.some((path) => url.includes(path))

const isTokenExpired = (token: string) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

const redirectToLogin = () => {
  accessTokenStorage.clearAccessToken()
  if (window.location.pathname === LOGIN_PATH_FE) return
  if (onUnauthorized) onUnauthorized()
  else window.location.replace(LOGIN_PATH_FE)
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  if (isPublicRequest(config.url)) return config

  const token = accessTokenStorage.getAccessToken()

  if (!token || isTokenExpired(token)) {
    redirectToLogin()
    return Promise.reject(new axios.CanceledError('Unauthenticated'))
  }

  config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope | undefined

    if (body && typeof body === 'object' && body.success === false) {
      return Promise.reject(
        new AxiosError(
          body.error_message || 'Request failed',
          body.error_code !== undefined ? String(body.error_code) : undefined,
          response.config,
          response.request,
          response,
        ),
      )
    }

    const result = body?.data !== undefined ? body.data : body
    return result as unknown as AxiosResponse
  },
  (error: AxiosError<ApiEnvelope>) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    if (error.response?.status === 401 && !isPublicRequest(error.config?.url)) {
      redirectToLogin()
    }

    const serverMessage = error.response?.data?.error_message
    if (serverMessage) error.message = serverMessage

    return Promise.reject(error)
  },
)

export const getApi = <T>(path: string, params?: Record<string, unknown>) =>
  api.get(path, { params }) as unknown as Promise<T>

export const postApi = <T>(path: string, body?: unknown) =>
  api.post(path, body) as unknown as Promise<T>

export const putApi = <T>(path: string, body?: unknown) =>
  api.put(path, body) as unknown as Promise<T>

export const patchApi = <T>(path: string, body?: unknown) =>
  api.patch(path, body) as unknown as Promise<T>

export const deleteApi = <T>(path: string) =>
  api.delete(path) as unknown as Promise<T>