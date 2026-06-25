import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import VendorScreenDefault from './VendorScreenDefault'
import { motion } from 'framer-motion'
import VendorFooter from './VendorFooter'

interface LayoutProps {
    children?: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const showFooter = location.pathname !== "/venue/add";

    return (
        <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden font-sans">
            {/* Sidebar automatically manages its own width */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Scrollable page content */}
                <motion.main 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col justify-between"
                >
                    <div className="p-4 md:p-6 lg:p-8 flex-1">
                        {children || (<VendorScreenDefault />)}
                    </div>
                    {showFooter && <VendorFooter />}
                </motion.main>
            </div>
        </div>
    )
}

export default Layout