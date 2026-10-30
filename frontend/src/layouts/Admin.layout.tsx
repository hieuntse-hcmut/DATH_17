import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import Header from '~/components/layout/Header'
import Sidebar from '~/components/layout/Sidebar'
import NotificationModal from '~/components/layout/NotificationModal' // Điều chỉnh lại đường dẫn nếu bạn đặt file NotificationModal ở thư mục khác
import { useMe } from '~/services/me.query'

export default function AdminLayout() {
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const {data: me} = useMe();
    const navigate = useNavigate()

    useEffect(() => {
        if (me?.role !== "ADMIN") {
            navigate("/")
        }
    }, [navigate, me]);

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
                <div className="lg:pl-66 pt-16 pb-16 lg:pb-0 flex flex-col flex-1 w-full overflow-y-auto">
                    <div className="flex-1 w-full p-4 lg:p-6">
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