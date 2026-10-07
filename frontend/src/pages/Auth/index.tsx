import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGraduationCap, faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import LangThemeToggle from '~/components/LangThemeToggle'
import { useTranslation } from 'react-i18next'

import AuthForm from './components/AuthForm'
import AuthShowcase from './components/AuthShowcase'

export default function Auth({ isLogin } : { isLogin: boolean }) {
  const { t } = useTranslation('auth')
  
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <LangThemeToggle className="absolute top-4 right-4 z-10" />

      <section className="flex flex-col bg-surface px-6 py-6 sm:px-12 lg:px-16 lg:py-8">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-soft px-3 py-1 text-[11px] font-medium text-tertiary lg:hidden">
          <span className="size-1.5 rounded-full bg-tertiary" />
          HỆ THỐNG HỌC TẬP SỐ
        </span>

        <div className="mt-6 flex flex-col items-center gap-3 text-center lg:mt-0 lg:flex-row lg:text-left">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-3xl text-primary lg:size-10 lg:text-lg">
            <FontAwesomeIcon icon={faGraduationCap} />
          </span>
          <div>
            <p className="text-lg font-bold text-primary lg:text-base lg:text-fg">
              Smart Campus{' '}
              <span className="rounded bg-primary-soft px-1.5 py-0.5 font-label text-[10px] lg:hidden">
                LMS
              </span>
              <span className="hidden lg:inline">LMS</span>
            </p>
            <p className="hidden text-[10px] tracking-wider text-fg-subtle uppercase lg:block">
              HỆ THỐNG HỌC TẬP SỐ
            </p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold lg:text-3xl">
              {isLogin ? t('login.title') : t('signin.title')}
            </h1>
          </div>

          <AuthForm isLogin={isLogin} />
        </div>

        <footer className="flex items-center justify-center flex-col text-center text-[11px] text-fg-subtle lg:text-left">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldHalved} className="mr-1.5" />
            {t('security')}
          </div>
          <br />
          {t('version')}
        </footer>
      </section>

      <AuthShowcase />
    </div>
  )
}