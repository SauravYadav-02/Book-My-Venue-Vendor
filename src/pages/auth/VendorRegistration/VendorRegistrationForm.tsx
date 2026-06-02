import { useState } from "react";
import { User, Mail, Phone, Building2, FileText, CheckCircle2 } from "lucide-react";

import FormSection from "./components/FormSection";
import SuccessScreen from "./components/SuccessScreen";
import { validate } from "./utils/validate";
import { createVendor } from "../../../services/vendorService";
import { getActiveTerms } from "../../../services/termsService";

import { type Field, type FormValues, type Touched } from "./types/formTypes";
import { INDIAN_STATES } from "./components/states";

const INIT: FormValues = {
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    governmentId: null,

    address: "",
    pincode: "",
    state: "",
    licenseDoc: null,
};

const FIELDS: Field[] = [
    { id: "fullName", label: "Full Name", icon: User, section: "personal", required: true },
    { id: "email", label: "Email Address", icon: Mail, section: "personal", type: "email", required: true },
    { id: "phone", label: "Phone Number", icon: Phone, section: "personal", type: "tel", required: true },

    { id: "businessName", label: "Business Name", icon: Building2, section: "business", required: true },
    { id: "businessType", label: "Business Type", icon: Building2, section: "business", required: true },
    { id: "governmentId", label: "Government ID", icon: FileText, section: "business", type: "file", required: true },
    { id: "licenseDoc", label: "License Document", icon: FileText, section: "business", type: "file", required: true },
    { id: "address", label: "Full Address", icon: Building2, section: "business", required: true },
    { id: "pincode", label: "Pincode", icon: Building2, section: "business", required: true },

    {
        id: "state",
        label: "State",
        icon: Building2,
        section: "business",
        type: "select",
        options: INDIAN_STATES,
        required: true
    },
];

export default function VendorRegistrationForm() {
    const [values, setValues] = useState<FormValues>(INIT);
    const [touched, setTouched] = useState<Touched>({});
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const [termsError, setTermsError] = useState<string>("");
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [termsContent, setTermsContent] = useState<string>("");
    const [loadingTerms, setLoadingTerms] = useState<boolean>(false);

    const handleOpenTerms = async () => {
        setShowTermsModal(true);
        if (termsContent) return; // cache previous terms fetch
        setLoadingTerms(true);
        try {
            const data = await getActiveTerms();
            if (data.success) {
                setTermsContent(data.terms.content);
            } else {
                setTermsContent("<p class='text-red-500 text-center py-4 font-semibold'>Failed to load Terms & Conditions. Please try again later.</p>");
            }
        } catch (err: any) {
            setTermsContent("<p class='text-red-500 text-center py-4 font-semibold'>Error loading Terms & Conditions. Please check your server connection.</p>");
        } finally {
            setLoadingTerms(false);
        }
    };

    const errors = validate(values);

    const set = (id: keyof FormValues, val: string | File | null) => {
        setValues(v => ({ ...v, [id]: val }));
    };

    const blur = (id: keyof FormValues) => {
        setTouched(t => ({ ...t, [id]: true }));
    };

    async function handleSubmit() {
        setTouched(Object.keys(values).reduce((a, k) => ({ ...a, [k]: true }), {}));

        if (Object.values(errors).some(Boolean)) return;

        if (!agreedToTerms) {
            setTermsError("You must read and agree to the Terms & Conditions to complete your registration.");
            return;
        }

        setStatus("submitting");
        try {
            await createVendor(values);
            setStatus("success");
        } catch {
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                 <SuccessScreen
                    name={values.fullName}
                    reset={() => {
                        setValues(INIT);
                        setTouched({});
                        setStatus("idle");
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex text-gray-800 bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left Side: Illustration / Branding */}
            <div className="hidden lg:flex lg:w-5/12 bg-indigo-900 relative overflow-hidden flex-col justify-between items-start text-white p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-900 to-indigo-900 opacity-90 z-0"></div>
                
                {/* Decorative blob shapes */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transition duration-1000"></div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse transition duration-1000 delay-500"></div>

                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight mb-16">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-900 shadow-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        BookMyVenue
                    </div>

                    <div className="space-y-6 max-w-md">
                        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                            Partner with us <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                                Grow your business.
                            </span>
                        </h1>
                        <p className="text-lg text-indigo-200 leading-relaxed font-light">
                            Join thousands of top-rated venues and vendors managing their bookings seamlessly. Reach more customers, effortlessly.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full">
                    <div className="space-y-4">
                        {[
                            "Access to thousands of daily users",
                            "Advanced analytics and dashboard",
                            "Secure, automated fast payouts",
                            "24/7 dedicated partner support"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-indigo-100">
                                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                                <span className="font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 relative overflow-y-auto w-full bg-[#f8fafc]">
                 {/* Mobile Header elements that only show on small screens */}
                 <div className="lg:hidden w-full max-w-2xl text-center mb-10">
                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6 text-white">
                         <Building2 className="w-8 h-8" />
                     </div>
                     <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Vendor Registration</h1>
                     <p className="text-gray-500 font-medium">Join our network of premium venues and vendors.</p>
                 </div>

                <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Let's build together</h2>
                        <p className="text-gray-500 text-lg">Please fill in your details to create your partner account.</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} encType="multipart/form-data" className="space-y-8">
                        <FormSection
                            title="Personal Information"
                            subtitle="We'll use this to communicate with you about your account."
                            fields={FIELDS.filter(f => f.section === "personal")}
                            values={values}
                            errors={errors}
                            touched={touched}
                            set={set}
                            blur={blur}
                        />

                        <FormSection
                            title="Business Details"
                            subtitle="Information about your company and physical location."
                            fields={FIELDS.filter(f => f.section === "business")}
                            values={values}
                            errors={errors}
                            touched={touched}
                            set={set}
                            blur={blur}
                        />

                        {/* Terms & Conditions Checkbox */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center h-5">
                                    <input
                                        id="agree-terms"
                                        name="agree-terms"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            setAgreedToTerms(e.target.checked);
                                            if (e.target.checked) setTermsError("");
                                        }}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer transition-colors duration-200"
                                    />
                                </div>
                                <div className="text-sm">
                                    <label htmlFor="agree-terms" className="font-semibold text-gray-700 cursor-pointer select-none">
                                        Terms & Conditions Agreement
                                    </label>
                                    <p className="text-gray-500 mt-1 select-none">
                                        I certify that I have read and agree to the{" "}
                                        <button
                                            type="button"
                                            onClick={handleOpenTerms}
                                            className="text-indigo-600 font-bold hover:text-indigo-500 hover:underline focus:outline-none transition-colors"
                                        >
                                            Terms and Conditions
                                        </button>{" "}
                                        of BookMyVenue.
                                    </p>
                                </div>
                            </div>
                            {termsError && (
                                <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 animate-pulse mt-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {termsError}
                                </p>
                            )}
                        </div>

                        {status === "error" && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Something went wrong while submitting. Please try again.</span>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className={`w-full group relative flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                                ${status === "submitting" ? 'opacity-70 cursor-not-allowed transform-none hover:-translate-y-0 hover:shadow-none' : ''}
                                `}
                            >
                                {status === "submitting" ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    "Complete Registration"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowTermsModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh] transform transition-all duration-300 scale-100 animate-fade-in-up">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Terms and Conditions</h3>
                                <p className="text-xs text-gray-500 mt-1">Please review carefully before accepting</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTermsModal(false)}
                                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body (scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 text-gray-600 prose prose-sm max-w-none scrollbar-thin">
                            {loadingTerms ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="font-semibold text-gray-500 text-sm">Retrieving active agreement terms...</span>
                                </div>
                            ) : (
                                <div 
                                    className="space-y-4"
                                    dangerouslySetInnerHTML={{ 
                                        __html: termsContent || "<p class='text-gray-500 italic text-center py-6'>No active terms currently defined.</p>" 
                                    }}
                                />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setShowTermsModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAgreedToTerms(true);
                                    setTermsError("");
                                    setShowTermsModal(false);
                                }}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                Agree & Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}