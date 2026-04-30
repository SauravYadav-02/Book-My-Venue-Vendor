import { useState } from "react";
import type { FormErrors, VenueForm } from "./AddVenue/types/Interface";
import { INITIAL_FORM, STEPS } from "./AddVenue/types/Constants";
import StepBar from "./AddVenue/components/StepBar";
import Toast from "./AddVenue/components/Toast";
import StepBasicInfo from "./AddVenue/components/StepBasicInfo";
import StepLocation from "./AddVenue/components/StepLocation";
import StepAmenities from "./AddVenue/components/StepAmenities";
import StepReview from "./AddVenue/components/StepReview";
import { createVenue } from "../../services/venueService";


export default function AddVenue() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VenueForm>({ ...INITIAL_FORM, amenities: new Set() });
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof VenueForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleAmenity = (name: string) => {
    setForm((prev) => {
      const exists = Array.from(prev.amenities).includes(name);
      const newAmenities = exists
        ? Array.from(prev.amenities).filter((a) => a !== name)
        : [...Array.from(prev.amenities), name];
      return { ...prev, amenities: new Set(newAmenities) };
    });
  };


  const removeMedia = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const addMedia = (files: File[]) => {
    setForm((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files].slice(0, 10),
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
        const result = await createVenue(form);
        console.log("Venue created:", result);
        setSubmitted(true);
        setToast(true);
        setTimeout(() => setToast(false), 3500);
      } catch (error) {
        alert(`Failed to publish venue. Please try again.,${error}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (submitted && !toast) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 relative">
        {/* Subtle decorative background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3" />

        <div className="bg-white rounded-[2rem] p-10 sm:p-12 text-center shadow-[0_20px_50px_rgba(15,_118,_110,_0.05)] border border-slate-100 max-w-md w-full relative z-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(15,_118,_110,_0.08)]">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-50/50">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Venue Published!</h2>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">
            <span className="font-semibold text-emerald-600">{form.name}</span> is now live, visible to customers, and ready to receive bookings.
          </p>
          <button
            onClick={() => {
              setForm({ ...INITIAL_FORM, amenities: new Set() });
              setStep(0);
              setSubmitted(false);
            }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-base font-bold transition-all shadow-md hover:shadow-emerald-500/25"
          >
            Add another venue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-4 px-4 sm:py-6 sm:px-6 relative font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 flex justify-center">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-2xl max-h-2xl bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(15,_118,_110,_0.04)] border border-slate-100/50 relative z-10 flex flex-col pt-8 pb-10 px-6 sm:px-12 sm:pt-12 sm:pb-14 transition-all duration-300">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Add new venue</h1>
            <p className="text-base text-slate-500 mt-1.5 font-medium">Build your listing profile step by step.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="inline-flex items-center justify-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 font-bold shadow-sm whitespace-nowrap">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        <div className="mb-10">
          <StepBar current={step} />
        </div>

        <Toast message="Venue published successfully!" show={toast} />

        <div className="flex-1 min-h-[400px]">
          {step === 0 && <StepBasicInfo form={form} errors={errors} update={update} />}
          {step === 1 && <StepLocation form={form} errors={errors} update={update} />}
          {step === 2 && (
            <StepAmenities form={form} updateAmenities={toggleAmenity} update={update} />
          )}
          {step === 3 && (
            <StepReview form={form} onAddMedia={addMedia} onRemoveMedia={removeMedia} />
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            className={`group flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-slate-200
              text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all ${step === 0 ? "invisible" : ""}`}
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className={`group flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-all shadow-md hover:shadow-emerald-500/25 ${loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
            ) : step === STEPS.length - 1 ? "Publish listing" : "Continue"}

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