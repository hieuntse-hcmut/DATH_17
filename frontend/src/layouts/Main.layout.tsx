import { Outlet } from 'react-router'
import Header from '~/components/layout/Header'
import Footer from '~/components/layout/Footer'
import Sidebar from '~/components/layout/Sidebar'

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
            {/* Sidebar tự động chuyển đổi linh hoạt: Bottom Nav trên mobile, Sidebar dọc cố định từ màn hình md trở lên */}
            <Sidebar />

            {/* Cột nội dung chính bên phải */}
            <div className="flex flex-col flex-1 min-w-0 pl-0 md:pl-[264px] w-full transition-all duration-200">
                <Header />
                
                {/* Khoảng đệm pb-16 trên mobile giúp nội dung không bị thanh điều hướng dưới đáy che khuất */}
                <div className="pt-16 pb-16 md:pb-0 flex flex-col flex-1 w-full">
                    <div className="flex-1 w-full p-4 md:p-6">
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}