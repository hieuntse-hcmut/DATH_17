import { useState } from 'react'
import { Outlet } from 'react-router'
import Header from '~/components/layout/Header'
import Footer from '~/components/layout/Footer'
import Sidebar from '~/components/layout/Sidebar'
import NotificationModal from '~/components/layout/NotificationModal' // Điều chỉnh lại đường dẫn nếu bạn đặt file NotificationModal ở thư mục khác

export default function MainLayout() {
    const [isNotifOpen, setIsNotifOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-950 transition-colors overflow-hidden">
            {/* Cột nội dung chính bên phải */}
            <div className="relative flex flex-col flex-1 min-w-0 pl-0  w-full transition-all duration-200">
                <Header />
                {/* Sidebar tích hợp callback mở/đóng thông báo */}
                <Sidebar 
                    onOpenNotification={() => setIsNotifOpen(true)} 
                    onCloseNotification={() => setIsNotifOpen(false)} 
                />
                {/* Khoảng đệm pb-16 trên mobile giúp nội dung không bị thanh điều hướng dưới đáy che khuất */}
                <div className="md:pl-66 pt-16 pb-16 md:pb-0 flex flex-col flex-1 w-full overflow-y-auto">
                    <div className="flex-1 w-full p-4 md:p-6">
                        <Outlet />
                    </div>
                </div>
            </div>

            {/* Modal thông báo hệ thống */}
            <NotificationModal 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
            />
        </div>
    )
}