import InputField from './InputField';
import { type Field, type FormValues, type Errors, type Touched } from '../types/formTypes';

type Props = {
    title: string;
    subtitle?: string;
    fields: Field[];
    values: FormValues;
    errors: Errors;
    touched: Touched;
    set: (id: keyof FormValues, val: any) => void;
    blur: (id: keyof FormValues) => void;
};

export default function FormSection({
    title,
    subtitle,
    fields,
    values,
    errors,
    touched,
    set,
    blur
}: Props) {

    return (
        <div className="relative p-6 sm:p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full inline-block"></span>
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-gray-500 ml-3.5 leading-relaxed">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map(field => (
                    <InputField
                        key={field.id}
                        {...field}
                        value={values[field.id] as any}
                        error={errors[field.id]}
                        touched={touched[field.id]}
                        onChange={(val) => set(field.id, val)}
                        onBlur={() => blur(field.id)}
                    />
                ))}
            </div>
        </div>
    );
}