import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
}

type FilterTab = 'all' | 'courses' | 'discussion' | 'unread'

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<FilterTab>('all')

    if (!isOpen) return null

    return (
        <div className="fixed inset-x-0 top-16 bottom-16 md:bottom-auto md:top-16 md:right-6 md:left-auto z-20 flex justify-end pointer-events-none">
            
            {/* Backdrop: Chỉ có hiệu ứng bóng mờ ở màn hình desktop (md), mobile giữ nguyên trong suốt */}
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
                            <span className="opacity-80 px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">18</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('courses')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'courses' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.courses', 'Khóa học')}</span>
                            <span className="opacity-80 px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">5</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('discussion')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'discussion' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.discussion', 'Thảo luận')}</span>
                            <span className="opacity-80 px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">8</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('unread')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'unread' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-muted text-fg-muted hover:text-fg'}`}
                        >
                            <span>{t('notifications.tabs.unread', 'Chưa đọc')}</span>
                            <span className="opacity-80 px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-[10px]">5</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Notification Feed */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-4">
                    
                    {/* Item 1: Urgent Assignment Deadline */}
                    <div className="flex flex-col p-3 gap-1 bg-surface-muted/60 dark:bg-surface-muted/50 border border-border/60 rounded-2xl shadow-xs hover:border-primary/40 transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#FFDAD6] text-[#BA1A1A] rounded-xl shrink-0 mt-0.5">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-sans font-semibold text-sm md:text-base text-fg tracking-tight truncate">
                                        {t('notifications.items.ai102_title', 'Cảnh báo học tập môn AI102')}
                                    </h3>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-fg-subtle shrink-0">14:15</span>
                        </div>
                        <p className="font-sans text-xs text-fg-muted pl-[52px] leading-relaxed line-clamp-2">
                            {t('notifications.items.ai102_desc', 'Giảng viên đã nhắc nhở tình trạng học tập đáng báo động của bạn ở môn AI102. Ấn vào để xem chi tiết')}
                        </p>
                    </div>

                    {/* Item 2: Instructor Reply */}
                    <div className="flex flex-col p-3 gap-1 bg-surface-muted/60 dark:bg-surface-muted/50 border border-border/60 rounded-2xl shadow-xs hover:border-primary/40 transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 flex items-center justify-center bg-[#E0E0FF] text-[#02006D] font-bold text-sm rounded-full shrink-0 mt-0.5">
                                    HB
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-sans font-semibold text-sm md:text-base text-fg tracking-tight leading-snug line-clamp-2 md:line-clamp-none">
                                        {t('notifications.items.reply_title', 'Giảng viên đã phản hồi câu hỏi thảo luận của bạn trong môn AI102')}
                                    </h3>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-fg-subtle shrink-0">08:45</span>
                        </div>
                        <p className="font-sans text-xs text-fg-muted pl-[52px] leading-relaxed line-clamp-2">
                            {t('notifications.items.reply_desc', 'Đây là 1 câu hỏi đã được nhắn đến trong bài học, hãy coi lại bài 2........')}
                        </p>
                    </div>

                    {/* NHÓM: TUẦN NÀY */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-border">
                        <div className="flex justify-between items-center text-xs font-semibold text-fg-subtle tracking-wider px-1">
                            <span className="uppercase">{t('notifications.groups.this_week', 'Tuần này')}</span>
                            <span className="hover:text-fg cursor-pointer text-[11px] font-semibold transition-colors">
                                {t('notifications.mark_all_read', 'Đã đọc tất cả')}
                            </span>
                        </div>

                        {/* Item 3 */}
                        <div className="flex flex-col p-3 gap-1 bg-surface-muted/60 dark:bg-surface-muted/50 border border-border/60 rounded-2xl shadow-xs hover:border-primary/40 transition-all cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#E0E0FF] text-[#02006D] font-bold text-sm rounded-full shrink-0 mt-0.5">
                                        HB
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-sans font-semibold text-sm md:text-base text-fg tracking-tight leading-snug line-clamp-2 md:line-clamp-none">
                                            {t('notifications.items.reply_title', 'Giảng viên đã phản hồi câu hỏi thảo luận của bạn trong môn AI102')}
                                        </h3>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-fg-subtle shrink-0">13/11</span>
                            </div>
                            <p className="font-sans text-xs text-fg-muted pl-[52px] leading-relaxed line-clamp-2">
                                {t('notifications.items.reply_desc', 'Đây là 1 câu hỏi đã được nhắn đến trong bài học, hãy coi lại bài 2........')}
                            </p>
                        </div>

                        {/* Item 4 */}
                        <div className="flex flex-col p-3 gap-1 bg-surface-muted/60 dark:bg-surface-muted/50 border border-border/60 rounded-2xl shadow-xs hover:border-primary/40 transition-all cursor-pointer">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#E0E0FF] text-[#02006D] font-bold text-sm rounded-full shrink-0 mt-0.5">
                                        HB
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="font-sans font-semibold text-sm md:text-base text-fg tracking-tight leading-snug line-clamp-2 md:line-clamp-none">
                                            {t('notifications.items.reply_title', 'Giảng viên đã phản hồi câu hỏi thảo luận của bạn trong môn AI102')}
                                        </h3>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-fg-subtle shrink-0">10/11</span>
                            </div>
                            <p className="font-sans text-xs text-fg-muted pl-[52px] leading-relaxed line-clamp-2">
                                {t('notifications.items.reply_desc', 'Đây là 1 câu hỏi đã được nhắn đến trong bài học, hãy coi lại bài 2........')}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}