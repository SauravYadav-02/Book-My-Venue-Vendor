import { CheckCircle2, ArrowRight } from "lucide-react";

type Props = {
    name: string;
    reset: () => void;
};

export default function SuccessScreen({ name, reset }: Props) {
    return (
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] text-center space-y-6 transform transition-all duration-500 hover:scale-[1.02]">
            <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Success! 🎉</h2>
                <p className="text-gray-500 text-lg">
                    <span className="font-semibold text-indigo-600">{name}</span>, your registration was submitted successfully.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    Our team will review your application and get back to you shortly.
                </p>
            </div>

            <div className="pt-6">
                <button
                    onClick={reset}
                    className="group inline-flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-600 transition-all py-3.5 px-6 rounded-xl font-bold text-lg"
                >
                    Register another business
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}