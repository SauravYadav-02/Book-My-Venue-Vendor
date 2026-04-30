import { useState } from "react";
import { User, Mail, Phone, Building2, FileText, CheckCircle2 } from "lucide-react";

import FormSection from "./components/FormSection";
import SuccessScreen from "./components/SuccessScreen";
import { validate } from "./utils/validate";
import { createVendor } from "../../../services/vendorService";

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
    { id: "fullName", label: "Full Name", icon: User, section: "personal" },
    { id: "email", label: "Email Address", icon: Mail, section: "personal", type: "email" },
    { id: "phone", label: "Phone Number", icon: Phone, section: "personal", type: "tel" },

    { id: "businessName", label: "Business Name", icon: Building2, section: "business" },
    { id: "businessType", label: "Business Type", icon: Building2, section: "business" },
    { id: "governmentId", label: "Government ID", icon: FileText, section: "business", type: "file" },
    { id: "licenseDoc", label: "License Document", icon: FileText, section: "business", type: "file" },
    { id: "address", label: "Full Address", icon: Building2, section: "business" },
    { id: "pincode", label: "Pincode", icon: Building2, section: "business" },

    {
        id: "state",
        label: "State",
        icon: Building2,
        section: "business",
        type: "select",
        options: INDIAN_STATES
    },
];

export default function VendorRegistrationForm() {
    const [values, setValues] = useState<FormValues>(INIT);
    const [touched, setTouched] = useState<Touched>({});
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const errors = validate(values);

    const set = (id: keyof FormValues, val: any) => {
        setValues(v => ({ ...v, [id]: val }));
    };

    const blur = (id: keyof FormValues) => {
        setTouched(t => ({ ...t, [id]: true }));
    };

    async function handleSubmit() {
        setTouched(Object.keys(values).reduce((a, k) => ({ ...a, [k]: true }), {}));

        if (Object.values(errors).some(Boolean)) return;

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
                            <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                                By submitting, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500 hover:underline transition-colors">Privacy Policy</a>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}