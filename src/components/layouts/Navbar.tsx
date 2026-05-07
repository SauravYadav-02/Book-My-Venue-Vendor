import { useState } from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
    const [showProfileInfo, setShowProfileInfo] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("vendorId");
        navigate("/login");
    };

    return (
        <header className="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 xl:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">

            {/* ── Left: Search & Title (Mobile) ───────────────────────── */}
            <div className="flex items-center gap-4 flex-1">
                <h1 className="font-semibold text-gray-800 tracking-tight text-lg md:text-xl hidden md:block">
                    Vendor Dashboard
                </h1>

                {/* Mobile Title - hides when searching */}
                <h1 className="font-semibold text-gray-800 tracking-tight text-lg md:hidden">
                    Dashboard
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
                                    Alexander Sterling
                                </span>
                                <span className="text-gray-500 font-medium leading-tight mt-0.5 text-xs block">
                                    Owner, Sterling Estates
                                </span>
                                
                                {/* Logout Button (Mobile View Dropdown) */}
                                <button 
                                    onClick={handleLogout}
                                    className="mt-3 flex items-center gap-2 text-red-500 font-medium text-sm hover:text-red-600 transition-colors w-full"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text info (Desktop) */}
                    <div className="hidden md:flex flex-col text-right">
                        <span className="font-medium text-gray-800 leading-tight text-sm">
                            Alexander Sterling
                        </span>
                        <span className="text-gray-500 font-medium leading-tight mt-0.5 text-xs">
                            Owner, Sterling Estates
                        </span>
                    </div>

                    {/* Avatar */}
                    <button
                        onClick={() => setShowProfileInfo((prev) => !prev)}
                        className="focus:outline-none shrink-0"
                        aria-label="Toggle profile info"
                    >
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="Alexander Sterling"
                            className="rounded-full object-cover ring-2 ring-transparent hover:ring-primary-light transition-all duration-200 w-9 h-9 sm:w-10 sm:h-10 cursor-pointer"
                        />
                    </button>

                    {/* Desktop Logout Button */}
                    <button 
                        onClick={handleLogout}
                        title="Logout"
                        className="hidden md:flex p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors duration-150 ml-2"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;