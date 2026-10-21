import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faXmark, faTriangleExclamation, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { useToast } from "~/components/Toast"
import { accessTokenStorage } from "~/config/accessTokenStorage"
import { getErrorMessage } from "~/utils/getErrorMessage"
import {
    useGetMyNotifications,
    useMarkAllNotificationsAsRead,
    useMarkNotificationAsRead,
} from "~/services/notification/notification.query"

interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
}

type FilterTab = 'all' | 'courses' | 'discussion' | 'unread'

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toast = useToast()
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const isAuthenticated = Boolean(accessTokenStorage.getAccessToken())
    const notificationsQuery = useGetMyNotifications(isOpen && isAuthenticated)
    const markAsReadMutation = useMarkNotificationAsRead()
    const markAllAsReadMutation = useMarkAllNotificationsAsRead()

    if (!isOpen) return null

    const notifications = notificationsQuery.data?.filter(item => {
        if (activeTab === 'courses') {
            return ['ENROLLED_BY_STAFF', 'REMOVED_FROM_COURSE', 'COURSE_COMPLETED', 'NEW_CONTENT'].includes(item.type)
        }
        if (activeTab === 'discussion') return item.type === 'FORUM_REPLY'
        if (activeTab === 'unread') return !item.read
        return true
    }) ?? []
    const allNotifications = notificationsQuery.data ?? []
    const courseNotificationCount = allNotifications.filter(item =>
        ['ENROLLED_BY_STAFF', 'REMOVED_FROM_COURSE', 'COURSE_COMPLETED', 'NEW_CONTENT'].includes(item.type)
    ).length
    const discussionNotificationCount = allNotifications.filter(item => item.type === 'FORUM_REPLY').length
    const unreadNotificationCount = allNotifications.filter(item => !item.read).length

    const handleNotificationClick = async (item: (typeof allNotifications)[number]) => {
        if (!item.read) {
            try {
                await markAsReadMutation.mutateAsync(item.id)
            } catch (error) {
                toast.error(getErrorMessage(error, 'Không thể cập nhật trạng thái thông báo.'))
                return
            }
        }
        if (item.link) navigate(item.link)
    }

    return (
        <div className="fixed inset-x-0 top-16 bottom-16 md:bottom-auto md:top-16 md:right-6 md:left-auto z-20 flex justify-end pointer-events-none">
            
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-0 pointer-events-auto bg-transparent md:bg-black/20 md:backdrop-blur-xs transition-opacity"
                onClick={onClose}
            ></div>

            {/* Notification Main Container */}
            <div className="relative z-10 w-full h-full md:w-[576px] md:max-w-[576px] md:h-[88vh] md:max-h-[976px] bg-surface dark:bg-surface md:rounded-2xl shadow-2xl border-t md:border border-border flex flex-col overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-right-4 duration-200">
                
                {/* Header & Filter Tabs Section */}
                <div className="flex flex-col px-4 md:px-6 pt-3 md:pt-6 pb-3 gap-3 bg-surface dark:bg-surface border-b border-border shrink-0">
                    
                    {/* Header Title (Desktop) */}
                    <div className="hidden md:flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 flex items-center justify-center bg-primary-soft dark:bg-primary/20 text-primary rounded-xl shrink-0">
                                <FontAwesomeIcon icon={faBell} className="w-4 h-4" />
                            </div>
                            <h2 className="font-sans font-semibold text-xl tracking-tight text-fg">
                                {t('notifications.title', 'Thông báo hệ thống')}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-muted text-fg-muted transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'all' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.all', 'Tất cả')}</span>
                            <span>{allNotifications.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('courses')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'courses' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.courses', 'Khóa học')}</span>
                            <span>{courseNotificationCount}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('discussion')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'discussion' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.discussion', 'Thảo luận')}</span>
                            <span>{discussionNotificationCount}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('unread')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'unread' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.unread', 'Chưa đọc')}</span>
                            <span>{unreadNotificationCount}</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Notification Feed */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-4">
                    
                    {/* Nút Đã đọc tất cả */}
                    <div className="flex justify-between items-center text-xs font-semibold text-fg-subtle tracking-wider px-1">
                        <span className="uppercase">{t('notifications.groups.recent', 'Danh sách thông báo')}</span>
                        <button 
                            onClick={() => markAllAsReadMutation.mutate(undefined, {
                                onError: error => toast.error(getErrorMessage(error, 'Không thể đánh dấu thông báo đã đọc.')),
                            })}
                            disabled={markAllAsReadMutation.isPending}
                            className="hover:text-primary cursor-pointer text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>{t('notifications.mark_all_read', 'Đã đọc tất cả')}</span>
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-sm text-fg-muted">
                            <span>Đăng nhập để xem thông báo của bạn.</span>
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="rounded-xl bg-primary px-4 py-2 font-semibold text-on-primary transition-colors hover:bg-primary/90"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    ) : notificationsQuery.isPending ? (
                        <div className="flex justify-center items-center py-10 text-xs text-fg-muted">
                            Đang tải thông báo...
                        </div>
                    ) : notificationsQuery.isError ? (
                        <div role="alert" className="flex justify-center items-center py-10 text-xs text-danger">
                            {getErrorMessage(notificationsQuery.error, 'Không thể tải thông báo. Vui lòng thử lại.')}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-fg-muted text-xs gap-2">
                            <FontAwesomeIcon icon={faBell} className="w-8 h-8 opacity-40" />
                            <span>Không có thông báo nào</span>
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => void handleNotificationClick(item)}
                                className={`flex flex-col p-3.5 gap-1 border rounded-2xl shadow-xs transition-all cursor-pointer ${
                                    item.read 
                                        ? 'bg-surface border-border/40 opacity-75' 
                                        : 'bg-surface-muted/80 dark:bg-surface-muted/50 border-primary/30 font-medium'
                                } hover:border-primary/60`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 mt-0.5 ${
                                            item.type?.includes('WARNING') || item.type?.includes('ALERT') 
                                                ? 'bg-[#FFDAD6] text-[#BA1A1A]' 
                                                : 'bg-[#E0E0FF] text-[#02006D] font-bold text-sm rounded-full'
                                        }`}>
                                            <FontAwesomeIcon icon={item.type?.includes('WARNING') ? faTriangleExclamation : faBell} className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="font-sans font-semibold text-sm md:text-base text-fg tracking-tight truncate">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {!item.read && (
                                            <span
                                                aria-label="Chưa đọc"
                                                className="h-2 w-2 rounded-full bg-red-600"
                                            />
                                        )}
                                        <span className="text-[11px] font-semibold text-fg-subtle">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <p className="font-sans text-xs text-fg-muted pl-[52px] leading-relaxed line-clamp-2">
                                    {item.message}
                                </p>
                            </div>
                        ))
                    )}

                </div>
            </div>
        </div>
    )
}