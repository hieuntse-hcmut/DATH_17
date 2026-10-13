import { Outlet } from 'react-router'

import Header from '~/components/layout/Header'
import Footer from '~/components/layout/Footer'
import Sidebar from '~/components/layout/Sidebar'

export default function MainLayout() {
    return (
        <main className='gird grid-cols-[264px_1fr]'>
            <Sidebar/>
            <Header/>
                <Outlet />
            <Footer />
        </main>
    )
}