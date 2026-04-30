
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import VendorScreenDefault from './VendorScreenDefault'

interface LayoutProps {
    children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans">
            {/* Sidebar automatically manages its own width */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />

                {/* Scrollable page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children || (<VendorScreenDefault />)}
                </main>
            </div>
        </div>
    )
}

export default Layout