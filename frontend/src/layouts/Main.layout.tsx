import { Outlet } from 'react-router'
import Header from '~/components/layout/Header'
import Footer from '~/components/layout/Footer'
import Sidebar from '~/components/layout/Sidebar'

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Cột 1: Sidebar ẩn trên mobile, hiển thị dạng cố định từ màn hình cỡ trung (md) trở lên */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Cột 2: Phần bên phải tự động dịch chuyển lề trái tương ứng (0 trên mobile, 264px trên desktop) */}
            <div className="flex flex-col flex-1 min-w-0 pl-0 md:pl-[264px] w-full transition-all duration-200">
                <Header />
                
                <div className="pt-16 flex flex-col flex-1 w-full">
                    <div className="flex-1 w-full p-4 md:p-6">
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}