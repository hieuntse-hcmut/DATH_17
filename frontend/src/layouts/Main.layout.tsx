import { Outlet } from 'react-router'

import Header from '~/components/layout/Header'
import Footer from '~/components/layout/Footer'
import Sidebar from '~/components/layout/Sidebar'

export default function MainLayout() {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Cột 1: Sidebar cố định bên trái */}
            <Sidebar />

            {/* Cột 2: Phần bên phải chiếm toàn bộ phần không gian còn lại */}
            <div className="flex flex-col flex-1 min-w-0 pl-[264px]">
                {/* Header cố định */}
                <Header />
                
                {/* Khu vực chứa nội dung động (Outlet) và Footer, được đẩy xuống tránh Header (pt-16) */}
                <div className="pt-16 flex flex-col flex-1 w-full">
                    <div className="flex-1 w-full p-6">
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}