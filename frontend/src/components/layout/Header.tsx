import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
    faMagnifyingGlass,  
    faChevronDown, 
    faUser, 
    faFileLines, 
    faCalendarDays, 
    faPalette, 
    faGlobe, 
    faRightFromBracket
} from "@fortawesome/free-solid-svg-icons"
import { supportedLngs } from "~/i18n"
import logo from "../../assets/logo.png"
import { useMe } from "~/services/me.query"
import { useLogout } from "~/pages/Auth/services/auth.query"

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme'

const getCurrentTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

export default function Header() {
    const { t, i18n } = useTranslation()
    const {data: me} = useMe();
    const [isOpen, setIsOpen] = useState(false)
    const [theme, setTheme] = useState<Theme>(getCurrentTheme)
    const logout = useLogout()

    const toggleTheme = (newTheme: Theme) => {
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
        localStorage.setItem(STORAGE_KEY, newTheme)
        setTheme(newTheme)
    }

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    const capitalize = (str: string) => {
        if (str?.trim()) {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        }
        return ""
    }
    return (
        <header className="fixed top-0 inset-x-0 h-16 bg-[#FAF8FF]/95 lg:bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-[#E2E7FF] dark:border-gray-800 px-4 lg:px-10 flex items-center justify-between z-50 transition-colors">
            {/* Logo & Brand Container */}
            <div className="flex items-center gap-3 lg:gap-4 lg:w-[264px]">
                <div className="w-8 h-8 flex items-center justify-center bg-[#4F46E5] text-white rounded-md font-bold overflow-hidden shrink-0">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                {/* Desktop Brand */}
                <div className="hidden lg:flex flex-col">
                    <span className="font-serif font-semibold text-lg leading-4.5 tracking-tight text-[#3525CD] dark:text-indigo-400">
                        Smart Campus
                    </span>
                    <span className="font-sans font-semibold text-[11px] leading-3.5 tracking-[0.55px] uppercase text-[#464555] dark:text-gray-400 pt-0.5">
                        {t('header.portal', 'PORTAL SINH VIÊN')}
                    </span>
                </div>
                {/* Mobile Brand */}
                <div className="flex lg:hidden flex-col">
                    <span className="font-serif font-semibold text-base leading-5 text-[#3525CD] dark:text-indigo-400">
                        Smart Campus
                    </span>
                    <span className="font-sans font-semibold text-[11px] leading-3.5 text-[#464555] dark:text-gray-400">
                        {t('nav.home', 'Trang chủ')}
                    </span>
                </div>
            </div>

            {/* Search Input Container */}
            <div className="hidden lg:flex flex-1 max-w-[640px] px-8 justify-center">
                <div className="relative w-full max-w-[448px] h-[30px] bg-[#F2F3FF] dark:bg-gray-800 rounded-xl flex items-center px-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-[15px] h-[15px] text-[#777587] dark:text-gray-400 mr-2 shrink-0" />
                    <input 
                        placeholder={t('header.search_placeholder', 'Tìm kiếm khóa học, tài liệu, lớp học...')} 
                        className="w-full bg-transparent border-none outline-none font-sans text-sm text-[#777587] dark:text-gray-200 leading-4.5"
                    />
                </div>
            </div>

            {/* Right Actions & Profile Container */}
            <div className="flex items-center gap-2 lg:gap-3">

                <div className="hidden lg:block w-[1px] h-6 bg-[#E2E7FF] dark:bg-gray-800 mx-1"></div>

                {/* Profile Section with Dropdown Toggle */}
                <div className="relative">
                    <div 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 lg:gap-3 pl-1 cursor-pointer select-none py-1 lg:px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-8 h-8 rounded-full ring-1 ring-[#E2E7FF] dark:ring-gray-700 object-cover" />
                        <div className="hidden lg:flex flex-col">
                            <span className="font-sans font-semibold text-xs leading-4 tracking-[0.24px] text-[#131B2E] dark:text-white">
                                {me?.fullName}
                            </span>
                            <span className="font-sans font-semibold text-[11px] leading-3.5 tracking-[0.33px] text-[#464555] dark:text-gray-400">
                                {me && capitalize(me?.role)}
                            </span>
                        </div>
                        <FontAwesomeIcon icon={faChevronDown} className={`hidden lg:inline-block w-2 h-1.5 text-[#464555] dark:text-gray-400 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu Popup */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-[320px] lg:w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-[#E2E7FF] dark:border-gray-800 py-3 flex flex-col z-50">
                            {/* Card thông tin sinh viên */}
                            <div className="px-4 pb-3 border-b border-[#E2E7FF] dark:border-gray-800 flex items-center gap-3">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#E2E7FF] dark:ring-gray-700" />
                                <div className="flex flex-col">
                                    <span className="font-sans font-bold text-sm text-[#131B2E] dark:text-white">{me?.fullName}</span>
                                    <span className="font-sans text-[11px] text-[#777587] dark:text-gray-400">{me?.email}</span>
                                </div>
                            </div>

                            {/* Danh sách menu liên kết */}
                            <div className="py-1 border-b border-[#E2E7FF] dark:border-gray-800 text-sm text-[#464555] dark:text-gray-300">
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F2F3FF] dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-[#777587] dark:text-gray-400" />
                                        <span>{t('header.profile', 'Hồ sơ cá nhân')}</span>
                                    </div>
                                    <span className="text-gray-400">›</span>
                                </Link>
                                <a href="#" className="flex items-center px-4 py-2.5 hover:bg-[#F2F3FF] dark:hover:bg-gray-800 transition-colors gap-3">
                                    <FontAwesomeIcon icon={faFileLines} className="w-4 h-4 text-[#777587] dark:text-gray-400" />
                                    <span>{t('header.grades', 'Bảng điểm chi tiết')}</span>
                                </a>
                                <a href="#" className="flex items-center px-4 py-2.5 hover:bg-[#F2F3FF] dark:hover:bg-gray-800 transition-colors gap-3">
                                    <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-[#777587] dark:text-gray-400" />
                                    <span>{t('header.schedule', 'Lịch học & Thi')}</span>
                                </a>
                            </div>

                            {/* Khu vực Giao diện & Ngôn ngữ */}
                            <div className="py-2.5 border-b border-[#E2E7FF] dark:border-gray-800 px-4 flex flex-col gap-3 text-sm text-[#464555] dark:text-gray-300">
                                {/* Chọn Giao diện (Sáng / Tối) */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faPalette} className="w-4 h-4 text-[#777587] dark:text-gray-400" />
                                        <span>{t('header.theme', 'Giao diện')}</span>
                                    </div>
                                    <div className="cursor-pointer bg-[#F2F3FF] dark:bg-gray-800 p-0.5 rounded-lg flex items-center text-xs font-semibold">
                                        <button 
                                            onClick={() => toggleTheme('light')} 
                                            className={`cursor-pointer px-3 py-1 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-700 text-[#3525CD] dark:text-white shadow-sm' : 'text-[#777587] dark:text-gray-400'}`}
                                        >
                                            {t('header.light', 'Sáng')}
                                        </button>
                                        <button 
                                            onClick={() => toggleTheme('dark')} 
                                            className={`cursor-pointer px-3 py-1 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-700 text-[#3525CD] dark:text-white shadow-sm' : 'text-[#777587] dark:text-gray-400'}`}
                                        >
                                            {t('header.dark', 'Tối')}
                                        </button>
                                    </div>
                                </div>

                                {/* Chọn Ngôn ngữ (VI / EN) */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-[#777587] dark:text-gray-400" />
                                        <span>{t('header.lang', 'Ngôn ngữ')}</span>
                                    </div>
                                    <div className="cursor-pointer bg-[#F2F3FF] dark:bg-gray-800 p-0.5 rounded-lg flex items-center text-xs font-semibold">
                                        {supportedLngs.map((lng) => {
                                            const isActive = i18n.resolvedLanguage === lng
                                            return (
                                                <button
                                                    key={lng}
                                                    onClick={() => changeLanguage(lng)}
                                                    className={`cursor-pointer px-3 py-1 rounded-md uppercase transition-all ${isActive ? 'bg-white dark:bg-gray-700 text-[#3525CD] dark:text-white shadow-sm' : 'text-[#777587] dark:text-gray-400'}`}
                                                >
                                                    {lng}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Nút đăng xuất */}
                            <div className="pt-2 px-2">
                                <button onClick={logout} className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-medium text-sm transition-colors">
                                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                                    <span>{t('header.logout', 'Đăng xuất tài khoản')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}