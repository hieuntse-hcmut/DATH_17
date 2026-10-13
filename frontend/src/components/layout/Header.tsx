import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
    faMagnifyingGlass, 
    faMoon, 
    faBell, 
    faChevronDown, 
    faUser, 
    faFileLines, 
    faCalendarDays, 
    faPalette, 
    faGlobe, 
    faRightFromBracket
} from "@fortawesome/free-solid-svg-icons"
import logo from "../../assets/logo.png"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const [theme, setTheme] = useState("light")
    const [lang, setLang] = useState("vi")

    return (
        <header className="fixed top-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E7FF] px-10 flex items-center justify-between z-20">
            {/* Logo & Brand Container */}
            <div className="flex items-center gap-4 w-[264px]">
                <div className="w-8 h-8 flex items-center justify-center bg-[#4F46E5] text-white rounded-md font-bold overflow-hidden">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="font-serif font-semibold text-lg leading-4.5 tracking-tight text-[#3525CD]">
                        Smart Campus
                    </span>
                    <span className="font-sans font-semibold text-[11px] leading-3.5 tracking-[0.55px] uppercase text-[#464555] pt-0.5">
                        PORTAL SINH VIÊN
                    </span>
                </div>
            </div>

            {/* Search Input Container */}
            <div className="flex-1 max-w-[640px] px-8 flex justify-center">
                <div className="relative w-full max-w-[448px] h-[30px] bg-[#F2F3FF] rounded-xl flex items-center px-3">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-[15px] h-[15px] text-[#777587] mr-2 shrink-0" />
                    <input 
                        placeholder="Tìm kiếm khóa học, tài liệu, lớp học..." 
                        className="w-full bg-transparent border-none outline-none font-sans text-sm text-[#777587] leading-4.5"
                    />
                    <div className="px-1 py-0.5 bg-[#E2E7FF] rounded flex items-center gap-0.5 shrink-0">
                        <span className="font-sans font-semibold text-[11px] text-[#777587] tracking-[0.33px]">Ctrl</span>
                        <span className="font-sans font-semibold text-[11px] text-[#777587] tracking-[0.33px]">K</span>
                    </div>
                </div>
            </div>

            {/* Right Actions & Profile Container */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle Button */}
                <button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                    <FontAwesomeIcon icon={faMoon} className="w-4 h-4 text-[#464555]" />
                </button>

                {/* Notification Button */}
                <button className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                    <FontAwesomeIcon icon={faBell} className="w-3.5 h-4 text-[#464555]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BA1A1A] rounded-full ring-2 ring-white"></span>
                </button>

                <div className="w-[1px] h-6 bg-[#E2E7FF] mx-1"></div>

                {/* Profile Section with Dropdown Toggle */}
                <div className="relative">
                    <div 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 pl-1 cursor-pointer select-none py-1 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-8 h-8 rounded-full ring-1 ring-[#E2E7FF] object-cover" />
                        <div className="flex flex-col">
                            <span className="font-sans font-semibold text-xs leading-4 tracking-[0.24px] text-[#131B2E]">
                                Nguyễn Văn Minh
                            </span>
                            <span className="font-sans font-semibold text-[11px] leading-3.5 tracking-[0.33px] text-[#464555]">
                                Sinh viên
                            </span>
                        </div>
                        <FontAwesomeIcon icon={faChevronDown} className={`w-2 h-1.5 text-[#464555] ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu Popup */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-[#E2E7FF] py-3 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* Card thông tin sinh viên */}
                            <div className="px-4 pb-3 border-b border-[#E2E7FF] flex items-center gap-3">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#E2E7FF]" />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-sans font-bold text-sm text-[#131B2E]">Nguyễn Văn Minh</span>
                                        <span className="bg-[#66F59A]/30 text-[#0F763E] text-[10px] font-semibold px-2 py-0.5 rounded-full">Chính quy</span>
                                    </div>
                                    <span className="font-sans text-xs text-[#3525CD] font-medium mt-0.5">MSSV: 2021001</span>
                                    <span className="font-sans text-[11px] text-[#777587]">minh.nv2021001@sis.campus.edu.vn</span>
                                </div>
                            </div>

                            {/* Danh sách menu liên kết */}
                            <div className="py-1 border-b border-[#E2E7FF] text-sm text-[#464555]">
                                <a href="#" className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F2F3FF] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-[#777587]" />
                                        <span>Hồ sơ cá nhân</span>
                                    </div>
                                    <span className="text-gray-400">›</span>
                                </a>
                                <a href="#" className="flex items-center px-4 py-2.5 hover:bg-[#F2F3FF] transition-colors gap-3">
                                    <FontAwesomeIcon icon={faFileLines} className="w-4 h-4 text-[#777587]" />
                                    <span>Bảng điểm chi tiết</span>
                                </a>
                                <a href="#" className="flex items-center px-4 py-2.5 hover:bg-[#F2F3FF] transition-colors gap-3">
                                    <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-[#777587]" />
                                    <span>Lịch học & Thi</span>
                                </a>
                            </div>

                            {/* Tùy chỉnh Giao diện & Ngôn ngữ */}
                            <div className="py-2 border-b border-[#E2E7FF] px-4 flex flex-col gap-2.5 text-sm text-[#464555]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faPalette} className="w-4 h-4 text-[#777587]" />
                                        <span>Giao diện</span>
                                    </div>
                                    <div className="bg-[#F2F3FF] p-0.5 rounded-lg flex items-center text-xs font-semibold">
                                        <button 
                                            onClick={() => setTheme("light")} 
                                            className={`px-3 py-1 rounded-md transition-all ${theme === "light" ? "bg-white text-[#3525CD] shadow-sm" : "text-[#777587]"}`}
                                        >
                                            Sáng
                                        </button>
                                        <button 
                                            onClick={() => setTheme("dark")} 
                                            className={`px-3 py-1 rounded-md transition-all ${theme === "dark" ? "bg-white text-[#3525CD] shadow-sm" : "text-[#777587]"}`}
                                        >
                                            Tối
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-[#777587]" />
                                        <span>Ngôn ngữ</span>
                                    </div>
                                    <div className="bg-[#F2F3FF] p-0.5 rounded-lg flex items-center text-xs font-semibold">
                                        <button 
                                            onClick={() => setLang("vi")} 
                                            className={`px-3 py-1 rounded-md transition-all ${lang === "vi" ? "bg-white text-[#3525CD] shadow-sm" : "text-[#777587]"}`}
                                        >
                                            VI
                                        </button>
                                        <button 
                                            onClick={() => setLang("en")} 
                                            className={`px-3 py-1 rounded-md transition-all ${lang === "en" ? "bg-white text-[#3525CD] shadow-sm" : "text-[#777587]"}`}
                                        >
                                            EN
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Nút đăng xuất */}
                            <div className="pt-2 px-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
                                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                                    <span>Đăng xuất tài khoản</span>
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}