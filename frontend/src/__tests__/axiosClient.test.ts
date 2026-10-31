import { describe, it, expect } from 'vitest'

// Mirror of core logic in axiosClient.ts
const PUBLIC_PATHS_BE = ['/health', '/auth/login', '/auth/register', '/error']

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

// Generate base64 mock JWT
function createMockJwt(expTimestampSeconds: number, username = 'testuser') {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: username, exp: expTimestampSeconds }))
  const signature = 'fake_signature'
  return `${header}.${payload}.${signature}`
}

function processResponse(data: unknown) {
  const body = data as { success?: boolean; data?: unknown; error_message?: string; error_code?: string } | undefined
  if (body && typeof body === 'object' && body.success === false) {
    throw new Error(body.error_message || 'Request failed')
  }
  return body?.data !== undefined ? body.data : body
}

describe('Frontend Axios Client & Interceptor Logic Suite', () => {
  it('TC-FE-AXIOS-001: isPublicRequest returns true for /auth/login', () => {
    expect(isPublicRequest('/auth/login')).toBe(true)
    expect(isPublicRequest('http://localhost:8080/api/auth/login')).toBe(true)
  })

  it('TC-FE-AXIOS-002: isPublicRequest returns true for /health and /error', () => {
    expect(isPublicRequest('/health')).toBe(true)
    expect(isPublicRequest('/error')).toBe(true)
  })

  it('TC-FE-AXIOS-003: isPublicRequest returns false for protected endpoints', () => {
    expect(isPublicRequest('/courses')).toBe(false)
    expect(isPublicRequest('/api/notifications/me')).toBe(false)
    expect(isPublicRequest('/admin/users')).toBe(false)
    expect(isPublicRequest(undefined)).toBe(false)
  })

  it('TC-FE-AXIOS-004: isTokenExpired correctly flags past expiration', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 300 // 5 minutes ago
    const expiredToken = createMockJwt(pastExp)
    expect(isTokenExpired(expiredToken)).toBe(true)
  })

  it('TC-FE-AXIOS-005: isTokenExpired correctly validates future expiration', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour ahead
    const validToken = createMockJwt(futureExp)
    expect(isTokenExpired(validToken)).toBe(false)
  })

  it('TC-FE-AXIOS-006: isTokenExpired handles malformed tokens gracefully', () => {
    expect(isTokenExpired('not-a-token')).toBe(false)
    expect(isTokenExpired('')).toBe(false)
    expect(isTokenExpired('a.invalid_base64.c')).toBe(false)
  })

  it('TC-FE-AXIOS-007: processResponse unpacks ApiResponse envelope on success', () => {
    const envelope = { success: true, data: [{ id: 1, title: 'Math 101' }] }
    const result = processResponse(envelope)
    expect(result).toEqual([{ id: 1, title: 'Math 101' }])
  })

  it('TC-FE-AXIOS-008: processResponse returns naked response when not wrapped in ApiResponse', () => {
    const raw = { id: 1, username: 'admin' }
    const result = processResponse(raw)
    expect(result).toEqual(raw)
  })

  it('TC-FE-AXIOS-009: processResponse throws error when success is false', () => {
    const errorEnvelope = { success: false, error_code: 'NOT_FOUND', error_message: 'Course 99 does not exist' }
    expect(() => processResponse(errorEnvelope)).toThrow('Course 99 does not exist')
  })

  it('TC-FE-AXIOS-010: processResponse unpacks null data cleanly without falling back to body', () => {
    const nullDataEnvelope = { success: true, data: null }
    const result = processResponse(nullDataEnvelope)
    expect(result).toBeNull()
  })
})
