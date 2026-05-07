import { useState } from "react";
import { ALL_AMENITIES } from "../types/Constants";
import type { VenueForm } from "../types/Interface";
import SectionCard from "./SectionCard";

function StepAmenities({
    form, updateAmenities, update,
}: {
    form: VenueForm;
    updateAmenities: (name: string) => void;
    update: (k: keyof VenueForm, v: string) => void;
}) {
    const [customAmenity, setCustomAmenity] = useState("");

    const handleAddCustom = () => {
        const trimmed = customAmenity.trim();
        if (trimmed && !form.amenities.has(trimmed)) {
            updateAmenities(trimmed);
            setCustomAmenity("");
        }
    };

    // Combine standard amenities and any custom ones that were added
    const displayAmenities = Array.from(new Set([...ALL_AMENITIES, ...Array.from(form.amenities)]));

    return (
        <div className="flex flex-col gap-4 sm:gap-5">
            <SectionCard title="Amenities">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {displayAmenities.map((a) => {
                        const selected = form.amenities.has(a);
                        return (
                            <button
                                key={a}
                                type="button"
                                onClick={() => updateAmenities(a)}
                                className={[
                                    "inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border transition-all cursor-pointer",
                                    // Responsive sizing
                                    "px-3 py-2 sm:px-4 sm:py-2.5",
                                    "text-[11px] sm:text-xs md:text-sm",
                                    "font-semibold sm:font-bold",
                                    selected
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-500/10"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm"
                                ].join(" ")}
                            >
                                {selected && (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {a}
                            </button>
                        );
                    })}
                </div>
                
                {/* Custom Amenity Input */}
                <div className="mt-5 flex items-center gap-2">
                    <input 
                        type="text" 
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustom();
                            }
                        }}
                        placeholder="Add other amenity..."
                        className="flex-1 max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-[13px] sm:text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 font-medium text-slate-800 placeholder:text-slate-400"
                    />
                    <button 
                        type="button"
                        onClick={handleAddCustom}
                        disabled={!customAmenity.trim()}
                        className="px-4 py-2 bg-emerald-500 text-white text-[13px] sm:text-sm font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        Add
                    </button>
                </div>
            </SectionCard>

            <SectionCard title="Availability">
                <div className="flex flex-col gap-1 sm:gap-1.5">
                    <label className="text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-medium sm:font-semibold text-slate-700 leading-none tracking-wide">
                        Available From
                    </label>
                    <input
                        type="date"
                        value={form.availableFrom}
                        onChange={(e) => update("availableFrom", e.target.value)}
                        className={[
                            "w-full rounded-xl border bg-slate-50 outline-none transition-all duration-200",
                            "px-3 py-2.5 sm:px-4 sm:py-3",
                            "text-[13px] sm:text-sm md:text-[15px]",
                            "font-normal sm:font-medium",
                            "text-slate-800",
                            "border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                        ].join(" ")}
                    />
                </div>
            </SectionCard>
        </div>
    );
}

export default StepAmenities;