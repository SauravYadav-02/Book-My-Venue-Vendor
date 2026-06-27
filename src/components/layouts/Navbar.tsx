import { useState } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVendor } from "../../context/VendorContext";

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const [showProfileInfo, setShowProfileInfo] = useState(false);
    const { vendor, loading } = useVendor();

    const vendorName = loading ? "Loading..." : (vendor?.fullName || "Vendor");
    const businessName = loading ? "Please wait..." : (vendor?.businessName || "Owner");

    return (
        <header className="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 xl:px-8 h-[60px] flex items-center justify-between sticky top-0 z-40">

            {/* ── Left: Search & Title (Mobile) ───────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                {/* Mobile Menu Trigger */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    aria-label="Open menu"
                >
                    <Menu size={22} strokeWidth={2.2} />
                </button>

                {/* Mobile Logo - shown on mobile, hidden on tablet and larger */}
                <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-[84px] h-[84px] object-contain rounded-lg md:hidden -my-3 relative z-10"
                />

                <h1 className="font-semibold text-gray-800 tracking-tight text-lg md:text-xl hidden md:block">
                    Vendor Dashboard
                </h1>
            </div>

            {/* ── Right: Bell + Profile ────────────────────────────────── */}
            <div className="flex items-center gap-3 md:gap-5 ml-4">

                <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                    <Search className="text-gray-600" size={20} />
                </button>

                {/* Notification Bell */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
                    <Bell className="text-gray-600" size={20} />
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* ── Profile ────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 relative">
                    {/* Text info (Mobile Dropdown) */}
                    <AnimatePresence>
                        {showProfileInfo && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-12 right-0 bg-white shadow-lg border border-gray-100 p-4 rounded-xl z-50 w-48 text-left md:hidden"
                            >
                                <span className="font-medium text-gray-800 leading-tight text-sm block">
                                    {vendorName}
                                </span>
                                <span className="text-gray-500 font-medium leading-tight mt-0.5 text-xs block">
                                    {businessName}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text info (Desktop) */}
                    <div className="hidden md:flex flex-col text-right">
                        <span className="font-medium text-gray-800 leading-tight text-sm">
                            {vendorName}
                        </span>
                        <span className="text-gray-500 font-medium leading-tight mt-0.5 text-xs">
                            {businessName}
                        </span>
                    </div>

                    {/* Empty Avatar Placeholder */}
                    <button
                        onClick={() => setShowProfileInfo((prev) => !prev)}
                        className="focus:outline-none shrink-0"
                        aria-label="Toggle profile info"
                    >
                        <div className="rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10 cursor-pointer text-gray-500 hover:text-primary-light">
                            <User size={18} />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;