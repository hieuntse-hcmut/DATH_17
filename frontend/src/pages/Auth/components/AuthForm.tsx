import { useEffect, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faEnvelope,
  faEye,
  faEyeSlash,
  faIdCard,
  faLock,
  faSpinner,
  faUser,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router'
import { useLogin, useRegister } from '../services/auth.query'
import { useToast } from '~/components/Toast'
import { getErrorMessage } from '~/utils/getErrorMessage'

type FieldName = 'username' | 'fullName' | 'email' | 'password' | 'confirmPassword'
type Values = Record<FieldName, string>
type Errors = Partial<Record<FieldName, string>>

const emptyValues: Values = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass = (hasError: boolean) =>
  `h-11 w-full rounded-xl border bg-surface-muted pl-10 pr-10 text-sm text-fg outline-none placeholder:text-fg-subtle focus:ring-2 ${
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/30'
      : 'border-border focus:border-primary focus:ring-primary/30'
  }`

interface FieldProps {
  id: FieldName
  label: string
  icon: IconDefinition
  required?: boolean
  error?: string
  children: React.ReactNode
}

function Field({ id, label, icon, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        <FontAwesomeIcon
          icon={icon}
          className="absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
        />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default function AuthForm({ isLogin }: { isLogin: boolean }) {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const toast = useToast()

  const { mutate: login, isPending: loggingIn } = useLogin()
  const { mutate: registerUser, isPending: registering } = useRegister()
  const isBusy = loggingIn || registering

  const [values, setValues] = useState<Values>(emptyValues)
  const [errors, setErrors] = useState<Errors>({})
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Đổi giữa đăng nhập <-> đăng ký thì reset form
  useEffect(() => {
    setValues(emptyValues)
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [isLogin])

  const handleChange = (name: FieldName, value: string) => {
    setValues((v) => ({ ...v, [name]: value }))
    // Xoá lỗi của ô đang gõ
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const validate = (): Errors => {
    const errs: Errors = {}
    const username = values.username.trim()
    const fullName = values.fullName.trim()
    const email = values.email.trim()
    const { password, confirmPassword } = values

    if (!username) errs.username = t('validation.required')
    if (!password) errs.password = t('validation.required')

    // Đăng nhập chỉ cần kiểm tra không để trống
    if (isLogin) return errs

    if (username && (username.length < 3 || username.length > 100)) {
      errs.username = t('validation.usernameLength', { min: 3, max: 100 })
    }

    if (!fullName) errs.fullName = t('validation.required')
    else if (fullName.length > 150) errs.fullName = t('validation.maxLength', { max: 150 })

    if (!email) errs.email = t('validation.required')
    else if (!EMAIL_REGEX.test(email)) errs.email = t('validation.emailInvalid')
    else if (email.length > 255) errs.email = t('validation.maxLength', { max: 255 })

    if (password && (password.length < 8 || password.length > 72)) {
      errs.password = t('validation.passwordLength', { min: 8, max: 72 })
    }

    if (!confirmPassword) errs.confirmPassword = t('validation.required')
    else if (confirmPassword !== password) {
      errs.confirmPassword = t('validation.confirmMismatch')
    }

    return errs
  }

  const handleSubmit = () => {
    if (isBusy) return

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const username = values.username.trim()

    if (isLogin) {
      login(
        { username, password: values.password },
        {
          onSuccess: () => {
            toast.success(t('login.success'))
            navigate('/')
          },
          onError: (err) => toast.error(getErrorMessage(err, t('login.failed'))),
        },
      )
    } else {
      registerUser(
        {
          username,
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
        },
        {
          onSuccess: (message) => {
            toast.success(message || t('signin.success'))
            navigate('/login')
          },
          onError: (err) => toast.error(getErrorMessage(err, t('signin.failed'))),
        },
      )
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement
    if (e.key === 'Enter' && target.tagName === 'INPUT' && target.type !== 'checkbox') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleLabel = (visible: boolean) =>
    visible ? t('common.hidePassword') : t('common.showPassword')

  return (
    <div className="flex flex-col" onKeyDown={handleKeyDown}>
      <div className="space-y-4">
        {/* Username */}
        <Field
          id="username"
          label={isLogin ? t('login.id') : t('signin.id')}
          icon={faUser}
          required={!isLogin}
          error={errors.username}
        >
          <input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="user.name"
            className={inputClass(!!errors.username)}
            value={values.username}
            onChange={(e) => handleChange('username', e.target.value)}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
        </Field>

        {/* Họ tên + Email: chỉ khi đăng ký */}
        {!isLogin && (
          <>
            <Field
              id="fullName"
              label={t('signin.fullName')}
              icon={faIdCard}
              required
              error={errors.fullName}
            >
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                placeholder="Nguyen Van A"
                className={inputClass(!!errors.fullName)}
                value={values.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
            </Field>

            <Field
              id="email"
              label={t('signin.email')}
              icon={faEnvelope}
              required
              error={errors.email}
            >
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={inputClass(!!errors.email)}
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </Field>
          </>
        )}

        {/* Mật khẩu */}
        <Field
          id="password"
          label={isLogin ? t('login.password') : t('signin.password')}
          icon={faLock}
          required={!isLogin}
          error={errors.password}
        >
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            className={inputClass(!!errors.password)}
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={toggleLabel(showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle hover:text-fg"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </Field>

        {/* Nhập lại mật khẩu */}
        {!isLogin && (
          <Field
            id="confirmPassword"
            label={t('signin.confirmPassword')}
            icon={faLock}
            required
            error={errors.confirmPassword}
          >
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass(!!errors.confirmPassword)}
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={toggleLabel(showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle hover:text-fg"
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </Field>
        )}

        {/* Ghi nhớ + quên mật khẩu (chỉ đăng nhập) */}
        {/* TODO: Remember login */}
        {isLogin && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-fg-muted">
              <input
                type="checkbox"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 accent-primary"
              />
              {t('login.remember')}
            </label>
            <a href="#" className="font-medium text-link hover:underline">
              {t('login.forgot')}
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-lg shadow-primary/25 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          <span>{isLogin ? t('login.submit') : t('signin.submit')}</span>
          <FontAwesomeIcon
            icon={isBusy ? faSpinner : faArrowRight}
            spin={isBusy}
            className="text-xs"
          />
        </button>
      </div>

      <div className="mt-5 text-center text-xs">
        <Link
          to={isLogin ? '/register' : '/login'}
          className="font-medium text-link hover:underline"
        >
          <span className="text-fg-muted">
            {isLogin ? t('login.dontHaveAccount') : t('signin.haveAccount')}{' '}
          </span>
          <span>{isLogin ? t('login.register') : t('signin.login')}</span>
          <FontAwesomeIcon icon={faArrowRight} className="ml-1 hidden text-[10px] lg:inline" />
        </Link>
      </div>
    </div>
  )
}