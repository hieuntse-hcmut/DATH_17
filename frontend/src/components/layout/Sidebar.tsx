import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { accessTokenStorage } from "~/config/accessTokenStorage"
import { useGetUnreadNotificationCount } from "~/services/notification/notification.query"
import { useMe } from "~/services/me.query"
import {
  faHouse,
  faGraduationCap,
  faBell,
  faCalendarDays,
  faUsers,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"

interface SidebarProps {
  onOpenNotification?: () => void
  onCloseNotification?: () => void
}

type Role = "STUDENT" | "LECTURER" | "ADMIN"
type ActiveItem = "trang-chu" | "khoa-hoc" | "nguoi-dung" | "thong-bao"

interface NavItem {
  key: ActiveItem
  icon: IconDefinition
  to?: string // không có "to" => là nút (thông báo)
  labelKey: string
  fallback: string
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [
    { key: "trang-chu", icon: faHouse, to: "/", labelKey: "nav.home", fallback: "Trang chủ" },
    { key: "khoa-hoc", icon: faGraduationCap, to: "/my-courses", labelKey: "nav.my_courses", fallback: "Khoá học của tôi" },
    { key: "thong-bao", icon: faBell, labelKey: "nav.notifications", fallback: "Thông báo" },
  ],
  LECTURER: [
    { key: "khoa-hoc", icon: faGraduationCap, to: "/my-courses", labelKey: "nav.my_courses", fallback: "Khoá học" },
    { key: "thong-bao", icon: faBell, labelKey: "nav.notifications", fallback: "Thông báo" },
  ],
  ADMIN: [
    { key: "nguoi-dung", icon: faUsers, to: "/admin/users", labelKey: "nav.users", fallback: "Danh sách người dùng" },
    { key: "thong-bao", icon: faBell, labelKey: "nav.notifications", fallback: "Thông báo" },
  ],
}

const LABEL_CLASS =
  "hidden lg:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]"

const getItemClass = (isActive: boolean) =>
  `flex flex-col lg:flex-row items-center justify-center lg:justify-start px-0 lg:px-3 py-0 lg:py-2 gap-0 lg:gap-3 w-[76.39px] lg:w-full h-16 lg:h-[38px] lg:rounded-xl transition-colors cursor-pointer ${
    isActive
      ? "lg:bg-[#6750A3] text-white"
      : "text-[#464555] dark:text-gray-300 hover:bg-[#E2E7FF]/60 dark:hover:bg-gray-800 hover:text-[#3525CD] dark:hover:text-white"
  }`

const getIconWrapperClass = (isActive: boolean) =>
  `flex items-center justify-center w-[45px] h-[45px] lg:w-5 lg:h-5 shrink-0 rounded-full lg:rounded-none transition-all ${
    isActive ? "bg-[#6750A3] text-white shadow-sm" : "bg-transparent text-[#464555] dark:text-gray-300"
  }`

function getActiveFromPath(pathname: string): ActiveItem {
  if (pathname.startsWith("/my-courses")) return "khoa-hoc"
  if (pathname.startsWith("/admin/users")) return "nguoi-dung"
  if (pathname.startsWith("/admin/users")) return "nguoi-dung"
  if (pathname.startsWith("/courses")) return "khoa-hoc"
  return "trang-chu"
}

export default function Sidebar({ onOpenNotification, onCloseNotification }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { data: me } = useMe()
  const unreadCountQuery = useGetUnreadNotificationCount(Boolean(accessTokenStorage.getAccessToken()))
  const unreadCount = unreadCountQuery.data?.unread ?? 0
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount

  // Menu theo role; me chưa tải xong thì tạm dùng menu STUDENT
  const items = NAV_BY_ROLE[(me?.role as Role) ?? "STUDENT"] ?? NAV_BY_ROLE.STUDENT

  // Mục được chọn thủ công (thông báo) - chỉ có hiệu lực trong lần điều hướng hiện tại
  const [selectedItem, setSelectedItem] = useState<{ item: ActiveItem; locationKey: string } | null>(null)
  const activeItem: ActiveItem =
    selectedItem?.locationKey === location.key
      ? selectedItem.item
      : getActiveFromPath(location.pathname)

  const selectItem = (item: ActiveItem) => setSelectedItem({ item, locationKey: location.key })

  // Dùng cho các link điều hướng thật: xoá lựa chọn thủ công và đóng panel thông báo
  const handleNavigate = () => {
    setSelectedItem(null)
    onCloseNotification?.()
  }

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 flex flex-col lg:absolute lg:top-16 lg:h-[calc(100vh-64px)] lg:w-64 bg-[#F2F3FF] dark:bg-gray-900 border-t lg:border-t-0 lg:border-r border-[#E2E7FF] dark:border-gray-700">
      <nav className="flex flex-row lg:flex-col items-center lg:items-stretch justify-around lg:justify-start gap-0 lg:gap-1 lg:p-3 lg:flex-1">
        {items.map((it) => {
          const active = activeItem === it.key
          const label = t(it.labelKey, it.fallback)

          // Link điều hướng thật
          if (it.to) {
            return (
              <Link key={it.key} to={it.to} onClick={handleNavigate} className={getItemClass(active)}>
                <div className={getIconWrapperClass(active)}>
                  <FontAwesomeIcon icon={it.icon} className="w-4 h-4 lg:w-[15px] lg:h-[15px]" />
                </div>
                <span className={LABEL_CLASS}>{label}</span>
              </Link>
            )
          }

          // Nút thông báo (có badge chưa đọc)
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => {
                selectItem("thong-bao")
                onOpenNotification?.()
              }}
              className={getItemClass(active)}
            >
              <div className={`${getIconWrapperClass(active)} relative`}>
                <FontAwesomeIcon icon={it.icon} className="w-4 h-4 lg:w-[13.33px] lg:h-[16.67px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white lg:hidden">
                    {unreadLabel}
                  </span>
                )}
              </div>
              <span className={`${LABEL_CLASS} flex-1 text-left`}>{label}</span>
              {unreadCount > 0 && (
                <span className="hidden lg:flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white">
                  {unreadLabel}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Thông tin học kỳ */}
      <div className="hidden lg:block p-3 w-full">
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
  )
}