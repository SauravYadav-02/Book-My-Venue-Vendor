
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import VendorScreenDefault from './VendorScreenDefault'
import { motion } from 'framer-motion'

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
                <motion.main 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8"
                >
                    {children || (<VendorScreenDefault />)}
                </motion.main>
            </div>
        </div>
    )
}

export default Layout