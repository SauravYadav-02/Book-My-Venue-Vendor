import type React from 'react';

type Props = {
    label: string;
    icon: React.ElementType;
    value: any;
    error?: string;
    touched?: boolean;
    onChange: (val: any) => void;
    onBlur: () => void;
    type?: string;
    placeholder?: string;
    options?: string[];
};

export default function InputField({
    label,
    icon: Icon,
    value,
    error,
    touched,
    onChange,
    onBlur,
    type = "text",
    placeholder,
    options
}: Props) {

    const hasError = error && touched;

    const baseClass = `
        w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-white
        border border-gray-200 text-gray-800 placeholder-gray-400
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-4 
        ${hasError 
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 shadow-sm shadow-red-100" 
            : "hover:border-indigo-300 focus:border-indigo-600 focus:ring-indigo-600/20 shadow-sm hover:shadow-md"
        }
    `;

    return (
        <div className="space-y-1.5 flex flex-col items-start group">
            <label className="text-[11px] font-bold tracking-wider text-gray-400 uppercase ml-1 transition-colors group-focus-within:text-indigo-600">
                {label}
            </label>

            <div className="relative w-full">
                <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${hasError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />

                {type === "select" ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        className={`${baseClass} appearance-none cursor-pointer`}
                    >
                        <option value="" disabled>Select {label}</option>
                        {options?.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                ) : type === "file" ? (
                     <input
                        type="file"
                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                        onBlur={onBlur}
                        className={`${baseClass} file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer p-1.5`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value as string}
                        placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        className={baseClass}
                    />
                )}
                {type === "select" && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                )}
            </div>

            {hasError && (
                <p className="text-xs font-medium text-red-500 pl-1">{error}</p>
            )}
        </div>
    );
}