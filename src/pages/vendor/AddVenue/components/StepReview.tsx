import { useRef } from "react";
import type { VenueForm } from "../types/Interface";
import SectionCard from "./SectionCard";
import { currencyFormatter } from "../../../../utils/currency";


export const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-[15px] text-slate-800 font-bold">{value || "—"}</p>
    </div>
);

export default function StepReview({
    form, onAddMedia, onRemoveMedia,
}: {
    form: VenueForm; onAddMedia: (files: File[]) => void; onRemoveMedia?: (index: number) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fmt = (n: string) => n ? currencyFormatter.format(parseInt(n)) : "—";
    const MAX_IMAGES = 10;
    const remaining = MAX_IMAGES - form.mediaFiles.length;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        const allowed = selected.slice(0, remaining); // enforce max 10
        onAddMedia(allowed);
        e.target.value = ""; // reset so same files can be re-selected
    };

    const getImageUrl = (file: File | string) => {
        if (file instanceof File) return URL.createObjectURL(file);
        if (!file) return '';
        if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('data:')) return file;
        const baseUrl = 'http://localhost:3000';
        return file.startsWith('/') ? `${baseUrl}${file}` : `${baseUrl}/${file}`;
    };



    return (
        <>
            <SectionCard title="Media upload">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Upload zone — only show if under limit */}
                {remaining > 0 ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50
              hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group shadow-sm"
                    >
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-100
              flex items-center justify-center transition-all group-hover:scale-110">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-[15px] text-slate-600 group-hover:text-emerald-700 font-bold transition-colors">
                            Click to upload photos
                        </p>
                        <p className="text-sm text-slate-400 mt-1 font-medium">
                            JPG, PNG or WEBP · max 5MB each · {remaining} of {MAX_IMAGES} remaining
                        </p>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-400 font-medium">Maximum {MAX_IMAGES} images uploaded</p>
                    </div>
                )}

                {/* Image previews with remove button */}
                {form.mediaFiles.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                        {form.mediaFiles.map((file, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm hover:border-emerald-200 transition-colors">
                                <img src={getImageUrl(file)} alt={`upload-${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                {onRemoveMedia && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveMedia(i)}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500/90 text-white backdrop-blur-sm
                      text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Review before publishing">
                <div className="grid grid-cols-2 gap-4">
                    <ReviewRow label="Name" value={form.name} />
                    <ReviewRow label="Type" value={form.type} />
                    <ReviewRow label="Capacity" value={form.capacity ? `${form.capacity} guests` : ""} />
                    <ReviewRow label="Location" value={[form.city, form.state].filter(Boolean).join(", ")} />
                    <ReviewRow label="Available From" value={form.availableFrom || "Not set"} />
                    <ReviewRow label="Price" value={fmt(form.pricePerDay) + (form.pricePerDay ? "/day" : "")} />
                    <div className="col-span-2 bg-slate-50/70 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-white hover:shadow-sm">
                        <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-1">Amenities</p>
                        <p className="text-[15px] text-slate-800 font-bold leading-relaxed">
                            {form.amenities.size > 0 ? [...form.amenities].join(", ") : "None selected"}
                        </p>
                    </div>
                </div>
            </SectionCard>
        </>
    );
}

