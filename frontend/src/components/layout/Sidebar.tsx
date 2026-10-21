import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { accessTokenStorage } from "~/config/accessTokenStorage"
import { useGetUnreadNotificationCount } from "~/services/notification/notification.query"
import { 
  faHouse, 
  faGraduationCap, 
  faClipboardList, 
  faBell, 
  faComments, 
  faCalendarDays 
} from "@fortawesome/free-solid-svg-icons"

interface SidebarProps {
  onOpenNotification?: () => void
  onCloseNotification?: () => void
}

type ActiveItem = 'trang-chu' | 'khoa-hoc' | 'bai-kiem-tra' | 'thong-bao' | 'thao-luan'

export default function Sidebar({ onOpenNotification, onCloseNotification }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const unreadCountQuery = useGetUnreadNotificationCount(Boolean(accessTokenStorage.getAccessToken()))
  const unreadCount = unreadCountQuery.data?.unread ?? 0
  const [selectedItem, setSelectedItem] = useState<{ item: ActiveItem; locationKey: string } | null>(null)
  const activeItem = selectedItem?.locationKey === location.key
    ? selectedItem.item
    : location.pathname === '/discuss' ? 'thao-luan' : 'trang-chu'
  const selectItem = (item: ActiveItem) => setSelectedItem({ item, locationKey: location.key })

  const getItemClass = (isActive: boolean) => {
    return `flex flex-col md:flex-row items-center justify-center md:justify-start px-0 md:px-3 py-0 md:py-2 gap-0 md:gap-3 w-[76.39px] md:w-full h-16 md:h-[38px] md:rounded-xl transition-colors cursor-pointer ${
      isActive 
        ? "md:bg-[#6750A3] text-white" 
        : "text-[#464555] dark:text-gray-300 hover:bg-[#E2E7FF]/60 dark:hover:bg-gray-800 hover:text-[#3525CD] dark:hover:text-white"
    }`
  }

  const getIconWrapperClass = (isActive: boolean) => {
    return `flex items-center justify-center w-[45px] h-[45px] md:w-5 md:h-5 shrink-0 rounded-full md:rounded-none transition-all ${
      isActive ? "bg-[#6750A3] text-white shadow-sm" : "bg-transparent text-[#464555] dark:text-gray-300"
    }`
  }

    const getItemClass = (id: string) => {
        const isActive = activeItem === id;
        return `flex flex-col md:flex-row items-center justify-center md:justify-start px-0 md:px-3 py-0 md:py-2 gap-0 md:gap-3 w-[76.39px] md:w-full h-16 md:h-[38px] md:rounded-xl transition-colors cursor-pointer ${
            isActive
                ? "md:bg-[#6750A3] text-white"
                : "text-[#464555] dark:text-gray-300 hover:bg-[#E2E7FF]/60 dark:hover:bg-gray-800 hover:text-[#3525CD] dark:hover:text-white"
        }`;
    };

        {/* 1. Trang chủ */}
        <Link to="/" onClick={() => { setSelectedItem(null); if (onCloseNotification) onCloseNotification(); }} className={getItemClass(activeItem === 'trang-chu')}>
          <div className={getIconWrapperClass(activeItem === 'trang-chu')}>
            <FontAwesomeIcon icon={faHouse} className="w-4 h-4 md:w-[13.33px] md:h-[15px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.home', 'Trang chủ')}
          </span>
        </Link>

        {/* 2. Khóa học của tôi */}
        <button type="button" onClick={() => { selectItem('khoa-hoc'); if (onCloseNotification) onCloseNotification(); }} className={getItemClass(activeItem === 'khoa-hoc')}>
          <div className={getIconWrapperClass(activeItem === 'khoa-hoc')}>
            <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 md:w-[18.33px] md:h-[15px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.my_courses', 'Khoá học của tôi')}
          </span>
        </button>

        {/* 3. Bài kiểm tra */}
        <button type="button" onClick={() => { selectItem('bai-kiem-tra'); if (onCloseNotification) onCloseNotification(); }} className={getItemClass(activeItem === 'bai-kiem-tra')}>
          <div className={getIconWrapperClass(activeItem === 'bai-kiem-tra')}>
            <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 md:w-[15px] md:h-[16.67px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.quizzes', 'Bài kiểm tra')}
          </span>
        </button>

                {/* 2. Khóa học của tôi */}
                <a
                    href="/my-courses"
                    onClick={(e) => handleClick(e, "khoa-hoc")}
                    className={getItemClass("khoa-hoc")}
                >
                    <div className={getIconWrapperClass("khoa-hoc")}>
                        <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="w-4 h-4 md:w-[18.33px] md:h-[15px]"
                        />
                    </div>
                    <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
                        {t("nav.my_courses", "Khoá học của tôi")}
                    </span>
                </a>

        {/* 4. Thông báo */}
        <button type="button" onClick={() => {
          selectItem('thong-bao')
          if (onOpenNotification) onOpenNotification(); 
        }} className={getItemClass(activeItem === 'thong-bao')}>
          <div className={`${getIconWrapperClass(activeItem === 'thong-bao')} relative`}>
            <FontAwesomeIcon icon={faBell} className="w-4 h-4 md:w-[13.33px] md:h-[16.67px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white md:hidden">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden md:inline flex-1 text-left font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.notifications', 'Thông báo')}
          </span>
          {unreadCount > 0 && (
            <span className="hidden md:flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* 5. Thảo luận */}
        <Link
          to="/discuss"
          onClick={() => {
            setSelectedItem(null)
            if (onCloseNotification) onCloseNotification()
          }}
          className={getItemClass(activeItem === 'thao-luan')}
        >
          <div className={getIconWrapperClass(activeItem === 'thao-luan')}>
            <FontAwesomeIcon icon={faComments} className="w-4 h-4 md:w-[16.67px] md:h-[16.67px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.discussions', 'Thảo luận')}
          </span>
        </Link>

                {/* 4. Thông báo */}
                <a
                    href="#thong-bao"
                    onClick={(e) => handleClick(e, "thong-bao")}
                    className={getItemClass("thong-bao")}
                >
                    <div className={getIconWrapperClass("thong-bao")}>
                        <FontAwesomeIcon
                            icon={faBell}
                            className="w-4 h-4 md:w-[13.33px] md:h-[16.67px]"
                        />
                    </div>
                    <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
                        {t("nav.notifications", "Thông báo")}
                    </span>
                </a>

                {/* 5. Thảo luận */}
                <a
                    href="#thao-luan"
                    onClick={(e) => handleClick(e, "thao-luan")}
                    className={getItemClass("thao-luan")}
                >
                    <div className={getIconWrapperClass("thao-luan")}>
                        <FontAwesomeIcon
                            icon={faComments}
                            className="w-4 h-4 md:w-[16.67px] md:h-[16.67px]"
                        />
                    </div>
                    <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
                        {t("nav.discussions", "Thảo luận")}
                    </span>
                </a>
            </div>

            {/* Thông tin học kỳ */}
            <div className="hidden md:block p-3 w-full">
                <div className="flex flex-col p-3 gap-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2E7FF] dark:border-gray-700">
                    <div className="flex items-center gap-1 w-full">
                        <div className="flex items-center justify-center w-[13.5px]">
                            <FontAwesomeIcon
                                icon={faCalendarDays}
                                className="w-[13.5px] h-[15px] text-[#3525CD] dark:text-indigo-400"
                            />
                        </div>
                        <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.24px] text-[#131B2E] dark:text-white">
                            {t("nav.semester", "Học kỳ II (2024 - 2025)")}
                        </span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                        <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#464555] dark:text-gray-300">
                            {t("nav.week", "Tuần 12")}
                        </span>
                        <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#777587] dark:text-gray-400">
                            {t("nav.program", "Chính quy")}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
