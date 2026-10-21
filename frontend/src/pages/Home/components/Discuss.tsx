import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
    faChevronDown, 
    faHeart, 
    faThumbsUp, 
    faEllipsis, 
    faBold, 
    faItalic, 
    faCode, 
    faPaperclip, 
    faFaceSmile, 
    faPaperPlane 
} from "@fortawesome/free-solid-svg-icons"

export default function DiscussPage() {
    const { t } = useTranslation()
    const [replyContent, setReplyContent] = useState('')

    return (
        <div className="flex flex-col w-full h-full min-h-[calc(100vh-140px)]">
            
            {/* Main Container Box - Phủ đầy chiều ngang và cao của trang */}
            <div className="w-full flex-1 bg-white dark:bg-surface rounded-none md:rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
                
                {/* Scrollable Thread Body */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-5 bg-[#FAF8FF] dark:bg-surface-muted/30">
                    
                    {/* Header Title & Sort */}
                    <div className="flex flex-row justify-between items-center w-full px-1 py-1">
                        <h2 className="font-['Be_Vietnam_Pro'] font-semibold text-xl text-[#131B2E] dark:text-fg tracking-tight">
                            {t('discussion.title', 'Trao đổi & Thảo luận')}
                        </h2>
                        
                        <div className="flex items-center gap-1 cursor-pointer text-[#464555] dark:text-fg-muted hover:text-primary transition-colors">
                            <span className="font-['Inter'] font-semibold text-[11px] tracking-[0.33px]">
                                {t('discussion.sort_by', 'Sắp xếp theo: Mới nhất')}
                            </span>
                            <FontAwesomeIcon icon={faChevronDown} className="w-2 h-2" />
                        </div>
                    </div>

                    {/* Comment 1: Đỗ Khánh Linh */}
                    <div className="flex flex-col p-4 md:p-5 gap-3 bg-white dark:bg-surface shadow-xs rounded-xl border border-border/60">
                        <div className="flex flex-row justify-between items-start w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    ĐKL
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Inter'] font-semibold text-sm text-[#131B2E] dark:text-fg">
                                            Đỗ Khánh Linh
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-[#EAEDFF] dark:bg-primary/20 text-[#464555] dark:text-primary rounded text-[11px] font-semibold tracking-[0.33px]">
                                            K66-KTPM
                                        </span>
                                    </div>
                                    <span className="font-['Inter'] font-semibold text-[11px] text-[#777587] tracking-[0.33px]">
                                        45 phút trước
                                    </span>
                                </div>
                            </div>
                            <button className="text-[#777587] hover:text-fg p-1">
                                <FontAwesomeIcon icon={faEllipsis} className="w-3 h-3" />
                            </button>
                        </div>

                        <p className="font-['Be_Vietnam_Pro'] text-sm text-[#131B2E] dark:text-fg pl-13 leading-relaxed">
                            Em đã thử áp dụng cách chuyển sang vòng lặp while như thầy Nam hướng dẫn và giảm được hoàn toàn lỗi{' '}
                            <span className="px-1 py-0.5 bg-[#EAEDFF] text-[#BA1A1A] font-mono text-xs rounded font-medium">
                                RecursionError
                            </span>{' '}
                            khi chạy với <span className="px-1 py-0.5 bg-[#EAEDFF] text-[#131B2E] font-mono text-xs rounded font-medium">N = 10000</span> ! Cảm ơn thầy nhiều ạ! 🎉
                        </p>

                        <div className="flex items-center gap-4 pl-13 text-xs font-semibold">
                            <div className="flex items-center gap-1 text-[#BA1A1A]">
                                <FontAwesomeIcon icon={faHeart} className="w-3 h-3" />
                                <span>3</span>
                            </div>
                            <button className="text-[#464555] dark:text-fg-muted hover:text-primary">
                                {t('discussion.reply', 'Trả lời')}
                            </button>
                        </div>
                    </div>

                    {/* Comment 2: Nguyễn Văn Minh with Nested Reply */}
                    <div className="flex flex-col p-4 md:p-5 gap-3 bg-white dark:bg-surface shadow-xs rounded-xl border border-border/60">
                        <div className="flex flex-row justify-between items-start w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 overflow-hidden flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    NVM
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Inter'] font-semibold text-sm text-[#131B2E] dark:text-fg">
                                            Nguyễn Văn Minh
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-[#E0E0FF] dark:bg-primary/20 text-[#02006D] dark:text-primary rounded text-[11px] font-semibold tracking-[0.33px]">
                                            Bạn
                                        </span>
                                    </div>
                                    <span className="font-['Inter'] font-semibold text-[11px] text-[#777587] tracking-[0.33px]">
                                        25 phút trước
                                    </span>
                                </div>
                            </div>
                            <button className="text-[#777587] hover:text-fg p-1">
                                <FontAwesomeIcon icon={faEllipsis} className="w-3 h-3" />
                            </button>
                        </div>

                        <p className="font-['Be_Vietnam_Pro'] text-sm text-[#131B2E] dark:text-fg pl-13 leading-relaxed">
                            Thưa thầy, vậy trong các ngôn ngữ hiện đại trên máy ảo JVM như Scala hay Kotlin thì compiler hỗ trợ từ khóa gì để ép buộc kiểm tra đệ quy đuôi ngay lúc biên dịch ạ?
                        </p>

                        <div className="flex items-center gap-4 pl-13 text-xs font-semibold">
                            <button className="flex items-center gap-1 text-[#464555] dark:text-fg-muted hover:text-primary">
                                <FontAwesomeIcon icon={faThumbsUp} className="w-3 h-3" />
                                <span>Thích (1)</span>
                            </button>
                            <button className="text-[#3525CD] hover:underline">
                                Đang trả lời
                            </button>
                        </div>

                        {/* Nested Reply (Hoàng Quốc Bảo) */}
                        <div className="pl-13 pt-1">
                            <div className="flex flex-col p-3.5 bg-white dark:bg-surface-muted/40 rounded-lg border border-border/40 gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 overflow-hidden flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                                        HQB
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-['Inter'] font-semibold text-xs text-[#131B2E] dark:text-fg">
                                            Hoàng Quốc Bảo
                                        </span>
                                        <span className="font-['Inter'] font-semibold text-[11px] text-[#777587]">
                                            10 phút trước
                                        </span>
                                    </div>
                                </div>
                                <p className="font-['Be_Vietnam_Pro'] text-[13px] text-[#131B2E] dark:text-fg pl-9 leading-normal">
                                    Trong Kotlin có từ khóa <span className="px-1 py-0.5 bg-[#DAE2FD] text-[#3525CD] font-mono text-xs rounded font-medium">tailrec</span> đó bạn Minh ơi! Nếu hàm không thực sự là tail call thì compiler sẽ báo cảnh báo ngay.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Rich Comment Input Box at Bottom - Phủ kín chiều ngang */}
                <div className="flex flex-col p-3.5 md:p-4 gap-2.5 bg-white dark:bg-surface border-t border-border shadow-[0px_-4px_16px_rgba(0,0,0,0.03)]">
                    
                    {/* Toolbar & User Info */}
                    <div className="flex flex-row justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0px_0px_0px_2px_rgba(53,37,205,0.2)]">
                                NVM
                            </div>
                            <span className="font-['Inter'] font-semibold text-xs text-[#131B2E] dark:text-fg">
                                Nguyễn Văn Minh
                            </span>
                        </div>

                        {/* Formatting Actions Toolbar */}
                        <div className="flex items-center gap-1 p-1 bg-[#F2F3FF] dark:bg-surface-muted rounded-xl">
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#464555] dark:text-fg-muted">
                                <FontAwesomeIcon icon={faBold} className="w-3 h-3" />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#464555] dark:text-fg-muted">
                                <FontAwesomeIcon icon= {faItalic} className="w-3 h-3" />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#464555] dark:text-fg-muted">
                                <FontAwesomeIcon icon={faCode} className="w-3 h-3" />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#464555] dark:text-fg-muted">
                                <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3" />
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-[#464555] dark:text-fg-muted">
                                <FontAwesomeIcon icon={faFaceSmile} className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Editable Input Field Area */}
                    <div className="relative w-full">
                        <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={t('discussion.placeholder', 'Viết phản hồi học thuật của bạn, đặt câu hỏi hoặc đóng góp lời giải (Hỗ trợ Markdown và KaTeX)...')}
                            className="w-full h-20 bg-[#F2F3FF] dark:bg-surface-muted rounded-xl px-3.5 py-2.5 pr-24 font-['Be_Vietnam_Pro'] text-[13px] text-[#131B2E] dark:text-fg placeholder-[#777587] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        />

                        {/* Submit Action Button */}
                        <div className="absolute right-2.5 bottom-3">
                            <button 
                                onClick={() => setReplyContent('')}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                                <span className="font-['Inter'] font-semibold text-xs">
                                    {t('discussion.submit', 'Đăng')}
                                </span>
                                <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}