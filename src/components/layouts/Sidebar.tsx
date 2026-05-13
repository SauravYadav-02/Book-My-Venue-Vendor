import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ElementType } from "react";
import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    Calendar,
    BarChart3,
    Settings,
    Plus,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Package,
    Star,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "../../context/SubscriptionContext";
import toast from "react-hot-toast";

// ─── Nav Config ───────────────────────────────────────────────────────────────
const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Listings", path: "/venue", icon: ClipboardList },
    { label: "Bookings", path: "/booking", icon: CalendarDays, badge: 28 },
    { label: "Calendar", path: "/calendar", icon: Calendar },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Reviews", path: "/reviews", icon: Star },
    { label: "Billing", path: "/billing", icon: Package },
    { label: "Payments", path: "/payments", icon: History },
    { label: "Settings", path: "/settings", icon: Settings },
];

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
                    ? "bg-primary-bg text-primary-light"
                    : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-primary-light"
                }
            `}
        >
            {/* Active / hover left indicator */}
            <span
                className={`
                    absolute left-0 w-1 rounded-r-md bg-primary-light
                    transition-all duration-200 h-[60%]
                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
            />

            {/* Icon */}
            <Icon
                className={`shrink-0 transition-colors duration-200
                    ${isActive ? "text-primary-light" : "text-gray-400 group-hover:text-primary-light"}
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
                                ${isActive ? "bg-primary-light text-white" : "bg-red-500 text-white"}
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = () => {
    const navigate = useNavigate();
    const { currentSubscription } = useSubscription();
    
    const [active, setActive] = useState(() => {
        const path = window.location.pathname.slice(1).toLowerCase();
        const matched = navItems.find(item => item.label.toLowerCase() === path);
        return matched ? matched.label : "Dashboard";
    });
    const [open, setOpen] = useState(false);   // mobile drawer
    const [collapsed, setCollapsed] = useState(false);   // desktop icon-only mode

    const sidebarContent = (isMobile = false) => (
        <>
            {/* ── Top accent strip ── */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm bg-gradient-to-b from-primary-light to-green-300 opacity-80" />

            {/* ── Brand ─────────────────────────────────────────────────────── */}
            <div className={`flex items-center border-b border-gray-100 px-4 py-5 h-[73px]
                ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>

                {(!collapsed || isMobile) && (
                    <div>
                        <h1 className="text-base font-bold text-primary tracking-tight leading-tight">
                            BookMyVenue
                        </h1>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">
                            Management
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {/* Desktop collapse toggle */}
                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-light transition-colors"
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
            </div>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => (
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
                        w-full flex items-center gap-2 bg-primary hover:bg-primary-light
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

                {/* Help Center */}
                <button
                    className={`
                        group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        text-gray-500 hover:bg-gray-50 hover:text-primary transition-all duration-200 border-none cursor-pointer bg-transparent
                        ${collapsed && !isMobile ? "justify-center" : ""}
                    `}
                    title={collapsed && !isMobile ? "Help Center" : undefined}
                >
                    <HelpCircle size={18} className="shrink-0" />
                    {(!collapsed || isMobile) && <span>Help Center</span>}
                </button>

                {/* Logout */}
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate("/login");
                    }}
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

            {/* ── Mobile hamburger in top-left (shown inside Navbar area) ── */}
            {/* This is handled from Navbar on mobile via the open state prop */}
            {/* We expose a trigger button for mobile via the Navbar */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed top-3.5 left-4 z-30 p-2 rounded-xl bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 transition-colors duration-200"
                aria-label="Open menu"
                id="mobile-menu-trigger"
            >
                <Menu size={20} />
            </button>
        </>
    );
};

export default Sidebar;