import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faXmark, faTriangleExclamation, faCheckCircle } from "@fortawesome/free-solid-svg-icons"
import { getApi, patchApi } from "~/config/axiosClient"

interface NotificationItem {
    id: number
    type: string
    title: string
    message: string
    link?: string
    read: boolean
    createdAt: string
}

interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
}

type FilterTab = 'all' | 'courses' | 'discussion' | 'unread'

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    // Gọi API lấy danh sách thông báo khi modal được mở hoặc thay đổi tab
    useEffect(() => {
        if (!isOpen) return

        const fetchNotifications = async () => {
            try {
                setLoading(true)
                const data = await getApi<NotificationItem[]>('/notifications/me', {
                    unreadOnly: activeTab === 'unread',
                    limit: 50,
                })
                let filteredData = data
                if (activeTab === 'courses') {
                    filteredData = data.filter(item => item.type?.includes('COURSE'))
                } else if (activeTab === 'discussion') {
                    filteredData = data.filter(item => item.type?.includes('DISCUSSION') || item.type?.includes('REPLY'))
                }
                setNotifications(filteredData)
            } catch (error) {
                console.error("Lỗi khi tải thông báo:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [isOpen, activeTab])

    // Đánh dấu 1 thông báo là đã đọc
    const handleMarkAsRead = async (id: number) => {
        try {
            await patchApi(`/notifications/${id}/read`)
            setNotifications(prev => prev.map(item => item.id === id ? { ...item, read: true } : item))
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái đọc:", error)
        }
    }

    // Đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        try {
            await patchApi('/notifications/me/read-all')
            setNotifications(prev => prev.map(item => ({ ...item, read: true })))
        } catch (error) {
            console.error("Lỗi đánh dấu tất cả đã đọc:", error)
        }
    }

    if (!isOpen) return null

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
                        </button>
                        <button 
                            onClick={() => setActiveTab('courses')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'courses' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.courses', 'Khóa học')}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('discussion')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'discussion' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.discussion', 'Thảo luận')}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('unread')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'unread' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.unread', 'Chưa đọc')}</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Notification Feed */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-4">
                    
                    {/* Nút Đã đọc tất cả */}
                    <div className="flex justify-between items-center text-xs font-semibold text-fg-subtle tracking-wider px-1">
                        <span className="uppercase">{t('notifications.groups.recent', 'Danh sách thông báo')}</span>
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="hover:text-primary cursor-pointer text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>{t('notifications.mark_all_read', 'Đã đọc tất cả')}</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-10 text-xs text-fg-muted">
                            Đang tải thông báo...
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
                                onClick={() => {
                                    if (!item.read) handleMarkAsRead(item.id)
                                    if (item.link) window.location.href = item.link
                                }}
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
                                    <span className="text-[11px] font-semibold text-fg-subtle shrink-0">
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
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