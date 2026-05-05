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

    return (
        <>
            <SectionCard title="Amenities">
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {ALL_AMENITIES.map((a) => {
                        const selected = form.amenities.has(a);
                        return (
                            <button
                                key={a}
                                type="button"
                                onClick={() => updateAmenities(a)}
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all cursor-pointer
                  ${selected
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-500/10"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm"
                                    }`}
                            >
                                {selected && (
                                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {a}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>

            <SectionCard title="Availability">
                <div className="form-flow">
                    <div className="field-stack">
                        <label className="form-label">
                            Available From
                        </label>
                        <input
                            type="date"
                            value={form.availableFrom}
                            onChange={(e) => update("availableFrom", e.target.value)}
                            className="form-control"
                        />
                    </div>
                </div>
            </SectionCard>
        </>
    );
}
export default StepAmenities;
