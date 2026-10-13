import { useState } from "react"
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
  // Tạo state lưu trữ mục đang được chọn (mặc định là 'trang-chu')
  const [activeItem, setActiveItem] = useState('trang-chu')

  // Hàm helper để định nghĩa style chung cho các item
  const getItemClass = (id: string) => {
    const isActive = activeItem === id
    return `flex items-center px-3 py-2 gap-3 w-full h-[38px] rounded-xl transition-colors cursor-pointer ${
      isActive 
        ? "bg-[#6750A3] text-white" 
        : "text-[#464555] hover:bg-[#E2E7FF]/60 hover:text-[#3525CD]"
    }`
  }

  // Hàm helper định nghĩa màu cho icon tùy thuộc vào trạng thái active hay hover
  const getIconClass = (id: string) => {
    return activeItem === id ? "text-white" : "text-[#464555]"
  }

  return (
    <aside className="w-[264px] h-[calc(100vh-64px)] fixed left-0 top-16 bg-[#F2F3FF] shadow-[0px_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between z-10 overflow-y-auto">
      {/* Container chính phía trên */}
      <div className="flex flex-col items-start w-full">
        {/* Navigation Menu */}
        <nav className="flex flex-col items-start px-3 py-2 gap-1 w-full">
          
          {/* Nhóm: HỌC TẬP */}
          <div className="px-3 pt-[19px] pb-[7px] w-full">
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#777587]">
              HỌC TẬP
            </span>
          </div>

          {/* Link: Trang chủ */}
          <a 
            href="#trang-chu" 
            onClick={(e) => { e.preventDefault(); setActiveItem('trang-chu'); }} 
            className={getItemClass('trang-chu')}
          >
            <div className="w-[13.33px] flex items-center justify-center">
              <FontAwesomeIcon icon={faHouse} className={`w-[13.33px] h-[15px] ${getIconClass('trang-chu')}`} />
            </div>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
              Trang chủ
            </span>
          </a>

          {/* Link: Khóa học của tôi */}
          <a 
            href="#khoa-hoc" 
            onClick={(e) => { e.preventDefault(); setActiveItem('khoa-hoc'); }} 
            className={getItemClass('khoa-hoc')}
          >
            <div className="w-[18.33px] flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className={`w-[18.33px] h-[15px] ${getIconClass('khoa-hoc')}`} />
            </div>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
              Khoá học của tôi
            </span>
          </a>

          {/* Link: Bài kiểm tra */}
          <a 
            href="#bai-kiem-tra" 
            onClick={(e) => { e.preventDefault(); setActiveItem('bai-kiem-tra'); }} 
            className={getItemClass('bai-kiem-tra')}
          >
            <div className="w-[15px] flex items-center justify-center">
              <FontAwesomeIcon icon={faClipboardList} className={`w-[15px] h-[16.67px] ${getIconClass('bai-kiem-tra')}`} />
            </div>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
              Bài kiểm tra
            </span>
          </a>

          {/* Nhóm: GIAO TIẾP */}
          <div className="px-3 pt-[31px] pb-[7px] w-full">
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.55px] uppercase text-[#777587]">
              GIAO TIẾP
            </span>
          </div>

          {/* Link: Thông báo */}
          <a 
            href="#thong-bao" 
            onClick={(e) => { e.preventDefault(); setActiveItem('thong-bao'); }} 
            className={getItemClass('thong-bao')}
          >
            <div className="w-[13.33px] flex items-center justify-center">
              <FontAwesomeIcon icon={faBell} className={`w-[13.33px] h-[16.67px] ${getIconClass('thong-bao')}`} />
            </div>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
              Thông báo
            </span>
          </a>

          {/* Link: Thảo luận */}
          <a 
            href="#thao-luan" 
            onClick={(e) => { e.preventDefault(); setActiveItem('thao-luan'); }} 
            className={getItemClass('thao-luan')}
          >
            <div className="w-[16.67px] flex items-center justify-center">
              <FontAwesomeIcon icon={faComments} className={`w-[16.67px] h-[16.67px] ${getIconClass('thao-luan')}`} />
            </div>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-[14px] leading-[22px]">
              Thảo luận
            </span>
          </a>

        </nav>
      </div>

      {/* Phần thông tin học kỳ ở dưới cùng */}
      <div className="p-3 w-full">
        <div className="flex flex-col p-3 gap-1 w-full bg-[#F2F3FF] rounded-xl">
          <div className="flex items-center gap-1 w-full">
            <div className="flex items-center justify-center w-[13.5px]">
              <FontAwesomeIcon icon={faCalendarDays} className="w-[13.5px] h-[15px] text-[#3525CD]" />
            </div>
            <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] tracking-[0.24px] text-[#131B2E]">
              Học kỳ II (2024 - 2025)
            </span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#464555]">
              Tuần 12
            </span>
            <span className="font-['Inter'] font-semibold text-[11px] leading-[14px] tracking-[0.33px] text-[#777587]">
              Chính quy
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}