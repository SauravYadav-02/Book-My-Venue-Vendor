import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Sparkles, User, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LoginForm } from "../../types/authTypes";
import { validateLogin, type LoginErrors } from "./validation/authValidation";
import { loginUser } from "../../services/authService";

// ── Reusable Input Field ───────────
interface InputFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    icon?: React.ElementType;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    id, label, name, value, error, type = "text",
    placeholder, required, icon: Icon, onChange,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="flex flex-col gap-1.5 relative">
            <label
                htmlFor={id}
                className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-1.5 transition-colors duration-200"
                style={{ color: isFocused ? "#4a5043" : undefined }}
            >
                {label}
                {required && <span className="text-[#4a5043] font-semibold">*</span>}
            </label>

            <motion.div
                animate={{
                    boxShadow: isFocused && !error ? "0 0 0 4px rgba(74, 80, 67, 0.08)" : "0 0 0 0px rgba(0, 0, 0, 0)",
                    borderColor: isFocused ? "#4a5043" : (error ? "#ef4444" : "#e5e7eb")
                }}
                className={`rounded-xl border bg-white/90 backdrop-blur-md overflow-hidden transition-colors flex items-center pr-3 ${
                    error ? "border-red-400" : "border-gray-200 hover:border-gray-300"
                }`}
            >
                {Icon && (
                    <div className="pl-3.5 text-gray-400 flex items-center justify-center pointer-events-none">
                        <Icon size={16} strokeWidth={1.75} className={isFocused ? "text-[#4a5043]" : "text-gray-400"} />
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full ${Icon ? "pl-3" : "pl-4"} pr-3 py-2.5 text-sm font-medium text-[#2a2a2a] placeholder:text-gray-300 bg-transparent outline-none`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -5 }}
                        className="text-red-500 text-xs font-medium leading-tight mt-0.5"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Check if vendor is already logged in and redirect them
    useEffect(() => {
        const vendorId = localStorage.getItem("vendorId");
        if (vendorId) {
            navigate("/dashboard", { replace: true });
        }
        if (searchParams.get("suspended") === "true") {
            toast.error("Your vendor account has been suspended. Please contact support.");
        }
    }, [navigate, searchParams]);

    const [form, setForm] = useState<LoginForm>({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState<LoginErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateLogin("vendor", form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser("vendor", form);

            if ("vendor" in data) {
                localStorage.setItem("vendorId", data.vendor._id);
                toast.success("Login Success 🚀");
                setTimeout(() => navigate("/dashboard", { replace: true }), 800);
            } else {
                toast.error("Invalid credentials");
                setLoading(false);
            }
        } catch (error: any) {
            if (error?.response?.status === 404) {
                try {
                    const data = await loginUser("admin", { username: form.username, password: form.password });
                    if ("admin" in data) {
                        localStorage.setItem("adminId", data.admin._id);
                        toast.success("Admin Login Success 🚀");
                        setTimeout(() => navigate("/dashboard", { replace: true }), 800);
                        return;
                    }
                } catch (adminError: any) {
                    const serverMessage = adminError?.response?.data?.message || "Login Failed ❌";
                    toast.error(serverMessage);
                    setLoading(false);
                    return;
                }
            }
            const serverMessage = error?.response?.data?.message || "Login Failed ❌";
            toast.error(serverMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F5F2] font-sans flex flex-col lg:flex-row relative overflow-hidden">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#fff",
                        color: "#4a5043",
                        borderRadius: "1rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                    },
                }}
            />

            {/* Glowing Ambient Blobs (Subtle Depth) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div 
                    animate={{ 
                        y: [0, 30, 0],
                        x: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 right-1/4 w-96 h-96 bg-[#4a5043]/5 rounded-full blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#5f6558]/5 rounded-full blur-[100px]"
                />
            </div>

            {/* ── Left Side: Visuals (Hidden on Mobile) ──────────────────── */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-[#4a5043] items-center justify-center flex-col z-10">
                {/* Background Image with overlay */}
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
                        alt="Luxury Venue" 
                        className="w-full h-full object-cover opacity-35 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4a5043]/95 via-[#4a5043]/85 to-[#4a5043]/65 backdrop-blur-[2px]"></div>
                </div>

                {/* Floating animated blobs for depth */}
                <motion.div 
                    animate={{ 
                        y: [0, -30, 0],
                        x: [0, 20, 0],
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 -left-12 w-80 h-80 bg-white/5 rounded-full blur-[80px]"
                />
                <motion.div 
                    animate={{ 
                        y: [0, 40, 0],
                        x: [0, -20, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 -right-12 w-96 h-96 bg-[#F6F5F2]/10 rounded-full blur-[100px]"
                />

                {/* Content */}
                <div className="relative z-10 pt-6 pb-12 px-12 lg:pt-8 lg:pb-14 lg:px-14 xl:pt-10 xl:pb-16 xl:px-16 max-w-2xl w-full flex flex-col justify-between h-full">
                    <Link to="/" className="mb-auto flex items-center gap-3.5 group transition-opacity hover:opacity-90">
                        <img 
                            src="/logo.png" 
                            alt="Book My Venue" 
                            className="h-20 w-auto object-contain brightness-0 invert" 
                        />
                        <span className="text-xl font-serif font-semibold tracking-wider text-white">
                            BOOK MY VENUE
                        </span>
                    </Link>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                            <Sparkles className="w-4 h-4 text-white/90" />
                            <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Vendor Portal</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-serif text-white leading-tight mb-6">
                            Manage your venue bookings effortlessly.
                        </h1>
                        <p className="text-white/70 text-lg xl:text-xl leading-relaxed max-w-lg font-light">
                            Join our exclusive network of premium venues. Streamline your operations, reach more clients, and elevate your business to new heights.
                        </p>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="flex gap-8 pt-6 mt-8 border-t border-white/10">
                        {[
                            { value: "5,000+", label: "Active Vendors" },
                            { value: "150K+", label: "Bookings Managed" },
                            { value: "4.8★", label: "Vendor Rating" },
                        ].map(({ value, label }) => (
                            <div key={label} className="flex flex-col">
                                <span className="text-2xl font-serif font-bold text-white tracking-tight">{value}</span>
                                <span className="text-xs text-white/60 font-medium uppercase tracking-wider mt-1">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Side: Login Form ─────────────────────────────────── */}
            <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col relative min-h-screen z-10 justify-start lg:justify-start lg:pt-12">
                
                {/* Mobile Navbar / Top Bar */}
                <div className="lg:hidden w-full p-6 sm:p-8 flex justify-between items-center z-20">
                    <Link to="/" className="flex items-center gap-3.5 transition-opacity hover:opacity-90">
                        <img 
                            src="/logo.png" 
                            alt="Book My Venue" 
                            className="h-16 w-auto object-contain" 
                        />
                        <span className="text-lg font-serif font-semibold tracking-wider text-[#4a5043]">
                            BOOK MY VENUE
                        </span>
                    </Link>
                </div>

                <div className="flex items-center justify-center p-6 sm:p-10 pt-4 lg:pt-8 lg:pb-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-md"
                    >
                        {/* Brand Icon Container */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex items-center justify-center mb-5 mx-auto lg:mx-0"
                        >
                            <div className="p-3 bg-white rounded-2xl shadow-[0_8px_24px_rgba(74,80,67,0.06)] border border-gray-100/80 hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-[#4a5043]" strokeWidth={1.5} />
                            </div>
                        </motion.div>

                        {/* Heading Section */}
                        <div className="text-center lg:text-left mb-6">
                            <h2 className="text-2xl sm:text-3xl font-serif text-[#4a5043] leading-tight mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">
                                Sign in to access your vendor dashboard
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_16px_40px_rgba(74,80,67,0.05)] border border-white/80 p-5 sm:p-6 relative">
                            {/* Subtle internal gradient for glassmorphism */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-[2rem] pointer-events-none"></div>
                            
                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                                {/* Username */}
                                <InputField
                                    id="login-username"
                                    label="Username"
                                    name="username"
                                    type="text"
                                    value={form.username || ""}
                                    error={errors.username}
                                    placeholder="Enter your username"
                                    onChange={handleChange}
                                    icon={User}
                                    required
                                />

                                {/* Password */}
                                <div>
                                    <InputField
                                        id="login-password"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        value={form.password}
                                        error={errors.password}
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                        icon={Lock}
                                        required
                                    />
                                    <div className="flex justify-end mt-1.5">
                                        <a href="#" className="text-[10px] font-bold text-[#4a5043]/60 hover:text-[#4a5043] transition-colors uppercase tracking-wider">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={[
                                        "w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm font-semibold",
                                        "tracking-wide transition-all duration-300 shadow-[0_6px_20px_rgba(74,80,67,0.12)]",
                                        loading
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                            : "bg-[#4a5043] text-[#F6F5F2] hover:bg-[#3d4237] hover:shadow-[0_6px_25px_rgba(74,80,67,0.2)]",
                                    ].join(" ")}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <motion.div
                                                initial={{ x: 0 }}
                                                whileHover={{ x: 3 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ArrowRight size={16} strokeWidth={2.5} />
                                            </motion.div>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 pt-5 border-t border-gray-100/60 flex flex-col gap-3 text-center text-xs text-gray-500 relative z-10">
                                <p>
                                    Are you a new venue owner?{" "}
                                    <Link to="/register" className="text-[#4a5043] font-bold hover:underline">
                                        Register as Vendor
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;