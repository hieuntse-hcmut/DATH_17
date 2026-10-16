import axios, { AxiosError, type AxiosResponse } from 'axios'

import { accessTokenStorage } from './accessTokenStorage'


interface ApiEnvelope<T = unknown> {
  success?: boolean
  data?: T
  error_message?: string
  error_code?: string | number
}

// ----------------- Unauthorized handler ----------
let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// ---------- Request: attach token of backend ----------
api.interceptors.request.use((config) => {
  const token = accessTokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------- Response ----------
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

    const isGet = response.config.method?.toLowerCase() === 'get'
    const result = isGet && body?.data !== undefined ? body.data : body
    return result as unknown as AxiosResponse
  },
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login') // need to update real path

    // Token expired/invalid -> delete token and notify the app.
    // Skip login requests because incorrect password also returns 401.
    if (error.response?.status === 401 && !isLoginRequest) {
      accessTokenStorage.clearAccessToken()
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export const getApi = <T>(path: string, params?: Record<string, unknown>) =>
  api.get(path, { params }) as unknown as Promise<T>

export const postApi = <T>(path: string, body?: unknown) =>
  api.post(path, body) as unknown as Promise<T>

export const putApi = <T>(path: string, body?: unknown) =>
  api.put(path, body) as unknown as Promise<T>

export const deleteApi = <T>(path: string) =>
  api.delete(path) as unknown as Promise<T>