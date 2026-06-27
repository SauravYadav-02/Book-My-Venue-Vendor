import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ElementType } from "react";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    Calendar,
    Settings,
    Plus,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Package,
    Star,
    History,
    FileText,
    AlertCircle
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "../../context/SubscriptionContext";
import { useVendor } from "../../context/VendorContext";
import toast from "react-hot-toast";



// ─── Sidebar Item ─────────────────────────────────────────────────────────────
const SidebarItem = ({
    label,
    path,
    icon: Icon,
    badge,
    active,
    setActive,
    collapsed,
    onNavigate,
}: {
    label: string;
    path: string;
    icon: ElementType;
    badge?: number;
    active: string;
    setActive: (v: string) => void;
    collapsed: boolean;
    onNavigate?: () => void;
}) => {
    const navigate = useNavigate();
    const isActive = active === label;

    return (
        <a
            href={path}
            title={collapsed ? label : undefined}
            onClick={(e) => {
                e.preventDefault();
                navigate(path);
                setActive(label);
                onNavigate?.();
            }}
            className={`
                group relative w-full flex items-center gap-3
                px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 border-none cursor-pointer
                ${collapsed ? "justify-center" : ""}
                ${isActive
                    ? "bg-brand-bg text-brand-light"
                    : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-brand-light"
                }
            `}
        >
            {/* Active / hover left indicator */}
            <span
                className={`
                    absolute left-0 w-1 rounded-r-md bg-brand-light
                    transition-all duration-200 h-[60%]
                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
            />

            {/* Icon */}
            <Icon
                className={`shrink-0 transition-colors duration-200
                    ${isActive ? "text-brand-light" : "text-gray-400 group-hover:text-brand-light"}
                `}
                size={18}
            />

            {/* Label — hidden when collapsed */}
            {!collapsed && (
                <>
                    <span className="flex-1 text-left truncate">{label}</span>
                    {badge && (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full leading-none
                                ${isActive ? "bg-brand-light text-white" : "bg-red-500 text-white"}
                            `}
                        >
                            {badge}
                        </span>
                    )}
                </>
            )}
        </a>
    );
};

interface SidebarProps {
    open?: boolean;
    setOpen?: (o: boolean) => void;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ open: propsOpen, setOpen: propsSetOpen }: SidebarProps) => {
    const navigate = useNavigate();
    const { currentSubscription } = useSubscription();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { vendor } = useVendor();
    const vendorName = vendor?.fullName || localStorage.getItem("username") || "Vendor";
    
    const isAdminUser = !!localStorage.getItem("adminId");
    const itemsToShow: Array<{ label: string; path: string; icon: ElementType; badge?: number }> = isAdminUser ? [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Bookings", path: "/admin/bookings", icon: CalendarDays },
        { label: "Venues", path: "/admin/venues", icon: ClipboardList },
        { label: "Plans", path: "/admin/plans", icon: Package },
        { label: "Reviews", path: "/admin/reviews", icon: Star },
        { label: "Complaints", path: "/admin/complaints", icon: HelpCircle },
        { label: "Reports", path: "/admin/reports", icon: AlertCircle },
        { label: "Blogs", path: "/admin/blogs", icon: FileText },
        { label: "Settings", path: "/settings", icon: Settings },
    ] : [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Listings", path: "/venue", icon: ClipboardList },
        { label: "Bookings", path: "/booking", icon: CalendarDays },
        { label: "Calendar", path: "/calendar", icon: Calendar },
        { label: "Reviews", path: "/reviews", icon: Star },
        { label: "Complaints", path: "/complaints", icon: HelpCircle },
        { label: "Reports", path: "/reports", icon: AlertCircle },
        { label: "Billing", path: "/billing", icon: Package },
        { label: "Payments", path: "/payments", icon: History },
        { label: "Terms & Conditions", path: "/terms", icon: FileText },
        { label: "Blogs", path: "/blogs", icon: FileText },
    ];

    const [active, setActive] = useState(() => {
        const path = window.location.pathname.toLowerCase();
        const matched = itemsToShow.find(item => path.includes(item.path.toLowerCase()));
        return matched ? matched.label : "Dashboard";
    });
    
    const [localOpen, setLocalOpen] = useState(false);
    const open = propsOpen !== undefined ? propsOpen : localOpen;
    const setOpen = propsSetOpen !== undefined ? propsSetOpen : setLocalOpen;

    const [collapsed, setCollapsed] = useState(false);   // desktop icon-only mode

    const sidebarContent = (isMobile = false) => (
        <>
            {/* ── Top accent strip ── */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm bg-gradient-to-b from-brand-light to-green-300 opacity-80" />

            {/* ── Brand ─────────────────────────────────────────────────────── */}
            <div className={`flex items-center border-b border-gray-100 pl-3 pr-2 py-1 h-[60px]
                ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>

                {(!collapsed || isMobile) ? (
                    <div className="flex items-center gap-1.5">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="w-12 h-12 object-contain rounded-lg"
                        />
                        <div>
                            <h1 className="text-[15px] font-bold text-brand-primary tracking-tight leading-tight">
                                BOOK MY VENUE
                            </h1>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
                                {isAdminUser ? "Admin Area" : "Management"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-50 transition-all duration-200"
                        title="Expand Sidebar"
                    >
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="w-10 h-10 object-contain rounded-lg transition-transform duration-200 hover:scale-105"
                        />
                    </button>
                )}

                {(!collapsed || isMobile) && (
                    <div className="flex items-center gap-1">
                        {/* Desktop collapse toggle */}
                        {!isMobile && (
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-light transition-colors"
                                aria-label="Toggle sidebar"
                            >
                                <Menu size={18} />
                            </button>
                        )}

                        {/* Mobile close */}
                        {isMobile && (
                            <button
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto scrollbar-hide">
                {itemsToShow.map((item) => (
                    <SidebarItem
                        key={item.label}
                        label={item.label}
                        path={item.path}
                        icon={item.icon}
                        badge={item.badge}
                        active={active}
                        setActive={setActive}
                        collapsed={collapsed && !isMobile}
                        onNavigate={isMobile ? () => setOpen(false) : undefined}
                    />
                ))}
            </nav>

            {/* ── Bottom ────────────────────────────────────────────────────── */}
            <div className="mt-auto px-4 pb-6">
                {/* Add New Listing */}
                <button
                    onClick={() => {
                        if (!currentSubscription || currentSubscription.status === "expired") {
                            toast.error("Please purchase a subscription plan to continue adding venues.");
                            navigate("/billing");
                            setActive("Billing");
                        } else {
                            navigate("/venue/add");
                            setActive("Listings");
                        }
                        if (isMobile) setOpen(false);
                    }}
                    className={`
                        w-full flex items-center gap-2 bg-brand-primary hover:bg-brand-light
                        text-white rounded-xl font-medium shadow-sm hover:shadow-md
                        transition-all duration-200 border-none cursor-pointer text-sm
                        ${collapsed && !isMobile ? "justify-center p-3" : "justify-center px-4 py-3 mb-4"}
                    `}
                    title={collapsed && !isMobile ? "Add New Listing" : undefined}
                >
                    <Plus size={18} className="shrink-0 text-white" strokeWidth={2.5} />
                    {(!collapsed || isMobile) && <span>Add Listing</span>}
                </button>

                {(!collapsed || isMobile) && <div className="h-px bg-gray-100 mb-3 mx-2" />}

                {/* Logout */}
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className={`
                        group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1 text-sm font-medium
                        text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200 border-none cursor-pointer bg-transparent
                        ${collapsed && !isMobile ? "justify-center" : ""}
                    `}
                    title={collapsed && !isMobile ? "Logout" : undefined}
                >
                    <LogOut size={18} className="shrink-0" />
                    {(!collapsed || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ── Mobile overlay ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ══ MOBILE DRAWER ════════════════════════════════════════════════ */}
            <AnimatePresence>
                {open && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-gray-100 shadow-xl md:hidden"
                    >
                        {sidebarContent(true)}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ══ DESKTOP SIDEBAR ══════════════════════════════════════════════ */}
            <aside
                className={`
                    hidden md:flex flex-col bg-white border-r border-gray-100
                    transition-all duration-300 ease-in-out
                    h-screen shadow-sm relative
                    ${collapsed ? "md:w-20" : "md:w-64"}
                `}
            >
                {sidebarContent(false)}
            </aside>



            {/* ══ LOGOUT CONFIRMATION MODAL ══════════════════════════════════ */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setShowLogoutConfirm(false)}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative z-10 border border-gray-100 text-center"
                        >
                            <div className="mx-auto w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={22} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Confirm Logout
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Are you sure you want to log out, <span className="font-semibold text-gray-800">{vendorName}</span>?
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex-1 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        navigate("/login");
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-md hover:shadow-red-500/20 transition-all flex-1 cursor-pointer border-none"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;