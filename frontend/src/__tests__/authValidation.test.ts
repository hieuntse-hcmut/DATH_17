import { describe, it, expect } from 'vitest'

// Mirror of validation logic in AuthForm.tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Values {
  username: string
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

function validate(values: Values, isLogin: boolean) {
  const errs: Record<string, string> = {}
  const username = values.username.trim()
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const { password, confirmPassword } = values

  if (!username) errs.username = 'VALIDATION_REQUIRED'
  if (!password) errs.password = 'VALIDATION_REQUIRED'

  if (isLogin) return errs

  if (username && (username.length < 3 || username.length > 100)) {
    errs.username = 'VALIDATION_USERNAME_LENGTH'
  }

  if (!fullName) errs.fullName = 'VALIDATION_REQUIRED'
  else if (fullName.length > 150) errs.fullName = 'VALIDATION_MAX_LENGTH'

  if (!email) errs.email = 'VALIDATION_REQUIRED'
  else if (!EMAIL_REGEX.test(email)) errs.email = 'VALIDATION_EMAIL_INVALID'
  else if (email.length > 255) errs.email = 'VALIDATION_MAX_LENGTH'

  if (password && (password.length < 8 || password.length > 72)) {
    errs.password = 'VALIDATION_PASSWORD_LENGTH'
  }

  if (!confirmPassword) errs.confirmPassword = 'VALIDATION_REQUIRED'
  else if (confirmPassword !== password) {
    errs.confirmPassword = 'VALIDATION_CONFIRM_MISMATCH'
  }

  return errs
}

describe('Frontend Auth Form Validation Suite', () => {
  const validRegister: Values = {
    username: 'student1',
    fullName: 'Nguyen Van A',
    email: 'student1@campus.edu.vn',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  }

  it('TC-FE-AUTH-001: Login with empty username and password returns required errors', () => {
    const errs = validate({ username: '', fullName: '', email: '', password: '', confirmPassword: '' }, true)
    expect(errs.username).toBe('VALIDATION_REQUIRED')
    expect(errs.password).toBe('VALIDATION_REQUIRED')
    expect(Object.keys(errs).length).toBe(2)
  })

  it('TC-FE-AUTH-002: Login with non-empty fields passes validation regardless of length', () => {
    const errs = validate({ username: 'ab', fullName: '', email: '', password: '1', confirmPassword: '' }, true)
    expect(Object.keys(errs).length).toBe(0)
  })

  it('TC-FE-AUTH-003: Register with valid payload has no validation errors', () => {
    const errs = validate(validRegister, false)
    expect(Object.keys(errs).length).toBe(0)
  })

  it('TC-FE-AUTH-004: Register with username < 3 characters triggers length error', () => {
    const errs = validate({ ...validRegister, username: 'ab' }, false)
    expect(errs.username).toBe('VALIDATION_USERNAME_LENGTH')
  })

  it('TC-FE-AUTH-005: Register with username > 100 characters triggers length error', () => {
    const longUser = 'a'.repeat(101)
    const errs = validate({ ...validRegister, username: longUser }, false)
    expect(errs.username).toBe('VALIDATION_USERNAME_LENGTH')
  })

  it('TC-FE-AUTH-006: Register with empty full name triggers required error', () => {
    const errs = validate({ ...validRegister, fullName: '   ' }, false)
    expect(errs.fullName).toBe('VALIDATION_REQUIRED')
  })

  it('TC-FE-AUTH-007: Register with full name > 150 characters triggers max length error', () => {
    const longName = 'A'.repeat(151)
    const errs = validate({ ...validRegister, fullName: longName }, false)
    expect(errs.fullName).toBe('VALIDATION_MAX_LENGTH')
  })

  it('TC-FE-AUTH-008: Register with invalid email formats triggers email invalid error', () => {
    const invalidEmails = ['plain', 'missing@domain', '@no-local.com', 'spaces in@mail.com']
    for (const em of invalidEmails) {
      const errs = validate({ ...validRegister, email: em }, false)
      expect(errs.email).toBe('VALIDATION_EMAIL_INVALID')
    }
  })

  it('TC-FE-AUTH-009: Register with password < 8 characters triggers password length error', () => {
    const errs = validate({ ...validRegister, password: 'short', confirmPassword: 'short' }, false)
    expect(errs.password).toBe('VALIDATION_PASSWORD_LENGTH')
  })

  it('TC-FE-AUTH-010: Register with password > 72 characters triggers password length error', () => {
    const longPass = 'p'.repeat(73)
    const errs = validate({ ...validRegister, password: longPass, confirmPassword: longPass }, false)
    expect(errs.password).toBe('VALIDATION_PASSWORD_LENGTH')
  })

  it('TC-FE-AUTH-011: Register with mismatched confirmPassword triggers mismatch error', () => {
    const errs = validate({ ...validRegister, confirmPassword: 'DifferentPassword' }, false)
    expect(errs.confirmPassword).toBe('VALIDATION_CONFIRM_MISMATCH')
  })

  it('TC-FE-AUTH-012: Register with whitespace-only username is trimmed and triggers required', () => {
    const errs = validate({ ...validRegister, username: '   ' }, false)
    expect(errs.username).toBe('VALIDATION_REQUIRED')
  })
})
