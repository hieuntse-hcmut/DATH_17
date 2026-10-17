import commonVi from './shared/vi.json'
import commonEn from './shared/en.json'
import authVi from '~/pages/Auth/i18n/vi.json'
import authEn from '~/pages/Auth/i18n/en.json'
import homeVi from '~/pages/Home/i18n/vi.json'
import homeEn from '~/pages/Home/i18n/en.json'
const vi = {
  common: commonVi,
  auth: authVi,
  home: homeVi,
}

const en: typeof vi = {
  common: commonEn,
  auth: authEn,
  home: homeEn,
}

export const resources = { vi, en } as const