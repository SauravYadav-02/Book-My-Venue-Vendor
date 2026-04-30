import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenueById, updateVenue } from "../../../services/venueService";
import type { FormErrors, VenueForm } from "../AddVenue/types/Interface";
import { INITIAL_FORM, STEPS } from "../AddVenue/types/Constants";
import StepBar from "../AddVenue/components/StepBar";
import Toast from "../AddVenue/components/Toast";
import StepBasicInfo from "../AddVenue/components/StepBasicInfo";
import StepLocation from "../AddVenue/components/StepLocation";
import StepAmenities from "../AddVenue/components/StepAmenities";
import StepReview from "../AddVenue/components/StepReview";

export default function EditVenue() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState<VenueForm>({ ...INITIAL_FORM, amenities: new Set() });
    const [errors, setErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [venueName, setVenueName] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setFetching(true);
                const venue = await getVenueById(id!);

                // ── Ownership guard ──────────────────────────────────
                const loggedInVendorId = localStorage.getItem("vendorId");
                if (loggedInVendorId && venue.vendorId !== loggedInVendorId) {
                    alert("You are not authorized to edit this venue.");
                    navigate("/venues");
                    return;
                }

                setVenueName(venue.name);
                setForm({
                    name: venue.name || "",
                    type: venue.type || "",
                    capacity: venue.capacity ? String(venue.capacity) : "",
                    description: venue.description || "",
                    pricePerDay: venue.pricePerDay ? String(venue.pricePerDay) : "",
                    address: venue.address || "",
                    city: venue.city || "",
                    state: venue.state || "",
                    zip: venue.zip || "",
                    country: venue.country || "",
                    lat: venue.lat ? String(venue.lat) : "",
                    lng: venue.lng ? String(venue.lng) : "",
                    amenities: new Set(venue.amenities || []),
                    availableFrom: venue.availableFrom || "",
                    mediaFiles: venue.mediaFiles || [],
                });
            } catch {
                alert("Failed to load venue. Redirecting back.");
                navigate("/venues");
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [id]);

    const update = (key: keyof VenueForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const toggleAmenity = (name: string) => {
        setForm((prev) => {
            const exists = prev.amenities.has(name);
            const next = new Set(prev.amenities);
            if (exists) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return { ...prev, amenities: next };
        });
    };

    const addMedia = (files: File[]) => {
        setForm((prev) => ({
            ...prev,
            mediaFiles: [...prev.mediaFiles, ...files].slice(0, 10),
        }));
    };

    const removeMedia = (index: number) => {
        setForm((prev) => ({
            ...prev,
            mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
        }));
    };

    const validateStep = (s: number): boolean => {
        const errs: FormErrors = {};
        if (s === 0) {
            if (!form.name.trim()) errs.name = "Venue name is required";
            if (!form.type) errs.type = "Please select a venue type";
            if (!form.capacity || parseInt(form.capacity) < 1) errs.capacity = "Enter a valid capacity";
            if (!form.description.trim()) errs.description = "Description is required";
            if (!form.pricePerDay) errs.pricePerDay = "Enter daily pricing";
        }
        if (s === 1) {
            if (!form.address.trim()) errs.address = "Address is required";
            if (!form.city.trim()) errs.city = "City is required";
            if (!form.state.trim()) errs.state = "State is required";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep(step)) return;

        if (step === STEPS.length - 1) {
            try {
                setLoading(true);
                await updateVenue(id!, form);
                setToast(true);
                setTimeout(() => navigate("/venues"), 2000);
            } catch {
                alert("Failed to update venue. Please try again.");
            } finally {
                setLoading(false);
            }
            return;
        }
        setStep((s) => s + 1);
    };

    const handleBack = () => {
        if (step === 0) navigate("/venues");
        else setStep((s) => s - 1);
    };

    if (fetching) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="bg-white rounded-3xl p-10 text-center shadow border border-slate-100 flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-base font-medium text-slate-500">Loading venue profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-50 py-4 px-4 sm:py-6 sm:px-6 relative font-sans text-slate-800 flex justify-center">
            <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-2xl bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(15,118,110,0.04)] border border-slate-100/50 relative z-10 flex flex-col pt-8 pb-10 px-6 sm:px-12 sm:pt-12 sm:pb-14">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit venue</h1>
                        <p className="text-base text-slate-500 mt-1.5 font-medium">
                            Editing: <span className="font-semibold text-slate-700">{venueName}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/venues")}
                            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400
                                hover:text-slate-700 transition-colors px-4 py-2 bg-slate-50 hover:bg-slate-100
                                border border-slate-200 rounded-xl"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                        </button>
                        <span className="inline-flex items-center text-sm text-emerald-700 bg-emerald-50
                            border border-emerald-100 rounded-xl px-4 py-2 font-bold shadow-sm whitespace-nowrap">
                            Step {step + 1} of {STEPS.length}
                        </span>
                    </div>
                </div>

                <div className="mb-10">
                    <StepBar current={step} />
                </div>

                <Toast message="Venue updated successfully!" show={toast} />

                <div className="flex-1 min-h-[400px]">
                    {step === 0 && <StepBasicInfo form={form} errors={errors} update={update} />}
                    {step === 1 && <StepLocation form={form} errors={errors} update={update} />}
                    {step === 2 && <StepAmenities form={form} updateAmenities={toggleAmenity} update={update} />}
                    {step === 3 && <StepReview form={form} onAddMedia={addMedia} onRemoveMedia={removeMedia} />}
                </div>

                {/* Nav buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between mt-12 pt-6 border-t border-slate-100 gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="group w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3
                            rounded-xl text-sm font-bold border border-slate-200 text-slate-600
                            hover:bg-slate-50 hover:text-slate-800 transition-all"
                    >
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {step === 0
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            }
                        </svg>
                        {step === 0 ? "Discard Changes" : "Back"}
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className={`group w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3
                            rounded-xl text-base font-bold bg-emerald-500 hover:bg-emerald-600
                            active:bg-emerald-700 text-white transition-all shadow-md
                            hover:shadow-emerald-500/25 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : step === STEPS.length - 1 ? "Save changes" : "Continue"}

                        {!loading && step < STEPS.length - 1 && (
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}