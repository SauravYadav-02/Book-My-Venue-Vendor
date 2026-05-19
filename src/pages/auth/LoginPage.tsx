import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
    id, label, name, value, error, type = "text",
    placeholder, required, onChange,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col gap-1.5 relative">
            <label
                htmlFor={id}
                className="text-[10px] font-bold tracking-[0.18em] text-gray-400 uppercase flex items-center gap-1"
            >
                {label}
                {required && <span className="text-[#3C4032]">*</span>}
            </label>

            <motion.div
                animate={{
                    boxShadow: isFocused && !error ? "0 0 0 4px rgba(60, 64, 50, 0.08)" : "0 0 0 0px rgba(60, 64, 50, 0)",
                    borderColor: isFocused ? "#3C4032" : (error ? "#f87171" : "#e5e7eb")
                }}
                className="rounded-xl border bg-white overflow-hidden transition-colors"
            >
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full px-4 py-3 text-sm font-medium text-[#3C4032] placeholder:text-gray-300 bg-transparent outline-none"
                />
            </motion.div>

            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-red-500 text-xs font-medium leading-tight mt-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Check if vendor is already logged in and redirect them
    useEffect(() => {
        const vendorId = localStorage.getItem("vendorId");
        if (vendorId) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]); // runs on mount and whenever navigate changes

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
                // Use replace so the login page is removed from history
                // Small delay to let the toast show
                setTimeout(() => navigate("/dashboard", { replace: true }), 800);
            } else {
                toast.error("Invalid credentials");
                setLoading(false);
            }
        } catch {
            toast.error("Login Failed ❌");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F5F2] font-sans flex flex-col lg:flex-row">
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: "#fff",
                        color: "#3C4032",
                        borderRadius: "1rem",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                    },
                }}
            />

            {/* ── Left Side: Visuals (Hidden on Mobile) ──────────────────── */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-[#3C4032] items-center justify-center flex-col">
                {/* Background Image with overlay */}
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
                        alt="Luxury Venue" 
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3C4032]/95 to-[#3C4032]/60 backdrop-blur-[2px]"></div>
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
                <div className="relative z-10 p-12 lg:p-16 xl:p-24 max-w-2xl w-full flex flex-col justify-center h-full">
                    <Link
                        to="/"
                        className="text-3xl font-serif italic tracking-wide text-white mb-auto"
                    >
                        Book My Venue.
                    </Link>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="mt-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                            <Sparkles className="w-4 h-4 text-white/90" />
                            <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Vendor Portal</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-serif text-white leading-tight mb-8">
                            Manage your venue bookings effortlessly.
                        </h1>
                        <p className="text-white/70 text-lg xl:text-xl leading-relaxed max-w-lg font-light">
                            Join our exclusive network of premium venues. Streamline your operations, reach more clients, and elevate your business to new heights.
                        </p>
                    </motion.div>

                    <div className="mt-auto"></div>
                </div>
            </div>

            {/* ── Right Side: Login Form ─────────────────────────────────── */}
            <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col relative min-h-screen">
                
                {/* Mobile Navbar / Top Bar */}
                <div className="lg:hidden absolute top-0 left-0 right-0 p-6 sm:p-8 flex justify-between items-center z-10">
                    <Link
                        to="/"
                        className="text-2xl font-serif italic tracking-wide text-[#3C4032]"
                    >
                        Book My Venue.
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-12 pt-28 lg:pt-12">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full max-w-md"
                    >
                        {/* Brand Icon */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-10 mx-auto lg:mx-0 group hover:shadow-md transition-all"
                        >
                            <Building2 className="w-8 h-8 text-[#3C4032] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                        </motion.div>

                        {/* Heading Section */}
                        <div className="text-center lg:text-left mb-10">
                            <h2 className="text-3xl sm:text-4xl font-serif text-[#3C4032] leading-tight mb-3">
                                Welcome Back
                            </h2>
                            <p className="text-gray-500 text-sm sm:text-base font-medium">
                                Sign in to access your vendor dashboard
                            </p>
                        </div>

                        {/* Card */}
                        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_rgba(60,64,50,0.06)] border border-white p-6 sm:p-8 relative">
                            {/* Subtle internal gradient for glassmorphism */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 rounded-[2rem] pointer-events-none"></div>
                            
                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <a href="#" className="text-xs font-bold text-[#3C4032]/60 hover:text-[#3C4032] transition-colors">
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
                                        "w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl text-sm font-semibold",
                                        "tracking-wide transition-all duration-300 shadow-lg",
                                        loading
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                            : "bg-[#3C4032] text-[#F6F5F2] hover:bg-[#2a2d23] hover:shadow-[#3C4032]/20",
                                    ].join(" ") || undefined}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
                                                <ArrowRight size={18} strokeWidth={2.5} />
                                            </motion.div>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-gray-100/50 flex flex-col gap-3 text-center text-sm text-gray-500 relative z-10">
                                <p>
                                    Are you a new venue owner?{" "}
                                    <Link to="/register" className="text-[#3C4032] font-bold hover:underline">
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