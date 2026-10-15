import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faHouse, 
  faGraduationCap, 
  faClipboardList, 
  faBell, 
  faComments, 
  faCalendarDays 
} from "@fortawesome/free-solid-svg-icons"

export default function Sidebar() {
  const { t } = useTranslation()
  const [activeItem, setActiveItem] = useState('trang-chu')

  const getItemClass = (id: string) => {
    const isActive = activeItem === id
    return `flex flex-col md:flex-row items-center justify-center md:justify-start px-0 md:px-3 py-0 md:py-2 gap-0 md:gap-3 w-[76.39px] md:w-full h-16 md:h-[38px] md:rounded-xl transition-colors cursor-pointer ${
      isActive 
        ? "md:bg-[#6750A3] text-white" 
        : "text-[#464555] dark:text-gray-300 hover:bg-[#E2E7FF]/60 dark:hover:bg-gray-800 hover:text-[#3525CD] dark:hover:text-white"
    }`
  }

  const getIconWrapperClass = (id: string) => {
    const isActive = activeItem === id
    return `flex items-center justify-center w-[45px] h-[45px] md:w-5 md:h-5 shrink-0 rounded-full md:rounded-none transition-all ${
      isActive ? "bg-[#6750A3] text-white shadow-sm" : "bg-transparent text-[#464555] dark:text-gray-300"
    }`
  }

  return (
    <aside className="w-full md:w-[264px] h-16 md:h-[calc(100vh-64px)] fixed bottom-0 md:bottom-auto md:left-0 md:top-16 bg-[#FAF8FF]/90 md:bg-[#F2F3FF] dark:bg-gray-900 border-t md:border-t-0 md:border-r border-[#E2E7FF] dark:border-gray-800 shadow-[0px_-1px_8px_rgba(0,0,0,0.04)] md:shadow-[0px_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-md flex flex-row md:flex-col justify-between z-30 transition-colors">
      
      {/* Menu Navigation chính */}
      <div className="flex flex-row md:flex-col items-center md:items-start justify-around md:justify-start w-full px-2 md:px-3 py-0 md:py-2 md:gap-1">
        
        {/* Nhóm HỌC TẬP */}
        <div className="hidden md:block px-3 pt-[19px] pb-[7px] w-full">
          <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#777587] dark:text-gray-400">
            {t('nav.learning', 'HỌC TẬP')}
          </span>
        </div>

        {/* 1. Trang chủ */}
        <a href="#trang-chu" onClick={(e) => { e.preventDefault(); setActiveItem('trang-chu'); }} className={getItemClass('trang-chu')}>
          <div className={getIconWrapperClass('trang-chu')}>
            <FontAwesomeIcon icon={faHouse} className="w-4 h-4 md:w-[13.33px] md:h-[15px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.home', 'Trang chủ')}
          </span>
        </a>

        {/* 2. Khóa học của tôi */}
        <a href="#khoa-hoc" onClick={(e) => { e.preventDefault(); setActiveItem('khoa-hoc'); }} className={getItemClass('khoa-hoc')}>
          <div className={getIconWrapperClass('khoa-hoc')}>
            <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4 md:w-[18.33px] md:h-[15px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.my_courses', 'Khoá học của tôi')}
          </span>
        </a>

        {/* 3. Bài kiểm tra */}
        <a href="#bai-kiem-tra" onClick={(e) => { e.preventDefault(); setActiveItem('bai-kiem-tra'); }} className={getItemClass('bai-kiem-tra')}>
          <div className={getIconWrapperClass('bai-kiem-tra')}>
            <FontAwesomeIcon icon={faClipboardList} className="w-4 h-4 md:w-[15px] md:h-[16.67px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.quizzes', 'Bài kiểm tra')}
          </span>
        </a>

        {/* Nhóm GIAO TIẾP */}
        <div className="hidden md:block px-3 pt-[31px] pb-[7px] w-full">
          <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#777587] dark:text-gray-400">
            {t('nav.communication', 'GIAO TIẾP')}
          </span>
        </div>

        {/* 4. Thông báo */}
        <a href="#thong-bao" onClick={(e) => { e.preventDefault(); setActiveItem('thong-bao'); }} className={getItemClass('thong-bao')}>
          <div className={getIconWrapperClass('thong-bao')}>
            <FontAwesomeIcon icon={faBell} className="w-4 h-4 md:w-[13.33px] md:h-[16.67px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.notifications', 'Thông báo')}
          </span>
        </a>

        {/* 5. Thảo luận */}
        <a href="#thao-luan" onClick={(e) => { e.preventDefault(); setActiveItem('thao-luan'); }} className={getItemClass('thao-luan')}>
          <div className={getIconWrapperClass('thao-luan')}>
            <FontAwesomeIcon icon={faComments} className="w-4 h-4 md:w-[16.67px] md:h-[16.67px]" />
          </div>
          <span className="hidden md:inline font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
            {t('nav.discussions', 'Thảo luận')}
          </span>
        </a>

      </div>

      {/* Thông tin học kỳ */}
      <div className="hidden md:block p-3 w-full">
        <div className="flex flex-col p-3 gap-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2E7FF] dark:border-gray-700">
          <div className="flex items-center gap-1 w-full">
            <div className="flex items-center justify-center w-[13.5px]">
              <FontAwesomeIcon icon={faCalendarDays} className="w-[13.5px] h-[15px] text-[#3525CD] dark:text-indigo-400" />
            </div>
            <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.24px] text-[#131B2E] dark:text-white">
              {t('nav.semester', 'Học kỳ II (2024 - 2025)')}
            </span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#464555] dark:text-gray-300">
              {t('nav.week', 'Tuần 12')}
            </span>
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#777587] dark:text-gray-400">
              {t('nav.program', 'Chính quy')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}