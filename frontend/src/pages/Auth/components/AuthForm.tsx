import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faEye,
  faEyeSlash,
  faLock,
  faUser,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router'
import { useLogin } from '../services/auth.query'

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-10 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary/30'

export default function AuthForm({ isLogin } : { isLogin: boolean }) {
  const { t } = useTranslation("auth")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { mutate, isPending, error } = useLogin();
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      username: String(form.get('username') ?? ''),
      password: String(form.get('password') ?? ''),
    }
    

    mutate(payload, {
      onSuccess: () => {
        navigate('/');
      },
      onError: (error) => {
        alert(`Login failed: ${error}`)
      },
    })
  }

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
            {isLogin ? t('login.id') : (
              <>
                {t('signin.id')} <span className="text-danger">*</span>
              </>
            )}
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
            />
            <input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="user.name"
              className={inputClass}
              required
            />
          </div>
        </div>
        {/* Email chỉ hiển thị khi đăng ký */}
        {!isLogin && (
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              {t('signin.email')}
              <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="user.name"
                className={inputClass}
                required
              />
            </div>
          </div>
        )}

        {/* Mật khẩu */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            {isLogin ? t('login.password') : (
              <>
                {t('signin.password')} <span className="text-danger">*</span>
              </>
            )}
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="......."
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              // FIXME: aria-label ẩn/hiện mật khẩu
              aria-label="FIXME"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle hover:text-fg"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Nhập lại mật khẩu */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
              {t('signin.confirmPassword')}
              <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
              />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="......."
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                // FIXME: aria-label ẩn/hiện mật khẩu
                aria-label="FIXME"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle hover:text-fg"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
        )}

        {/* Ghi nhớ + quên mật khẩu TODO */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-fg-muted">
            <input type="checkbox" name="remember" className="size-4 accent-primary" />
            {t('login.remember')}
          </label>
          <a href="#" className="font-medium text-link hover:underline">
            {t('login.forgot')} 
          </a> 
        </div>

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-lg shadow-primary/25 transition hover:bg-primary-hover"
        >
          <span className="lg:hidden">{t('login.title')}</span>
          <span className="hidden lg:inline">{isLogin ? t('login.submit') : t('signin.submit')}</span>
          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </button>
      </form>

      <div className="order-last mt-5 rounded-xl bg-primary-soft p-3 text-center text-xs order-none mt-5 bg-transparent p-0">
        <Link to={isLogin ? "/sign-up" : "/log-in"} className="font-medium text-link hover:underline">
          <span className="text-fg-muted">{isLogin ? t('login.dontHaveAccount') : t('signin.haveAccount')} </span>
          <span className="">{isLogin ? t('login.register') : t('signin.login')}</span>
          <FontAwesomeIcon icon={faArrowRight} className="ml-1 hidden text-[10px] lg:inline" />
        </Link>
      </div>
    </div>
  )
}