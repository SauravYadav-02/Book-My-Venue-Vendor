import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { FormErrors, VenueForm } from "./AddVenue/types/Interface";
import { INITIAL_FORM, STEPS } from "./AddVenue/types/Constants";
import StepBar from "./AddVenue/components/StepBar";
import Toast from "./AddVenue/components/Toast";
import StepBasicInfo from "./AddVenue/components/StepBasicInfo";
import StepLocation from "./AddVenue/components/StepLocation";
import StepAmenities from "./AddVenue/components/StepAmenities";
import StepReview from "./AddVenue/components/StepReview";
import NavigationButtons from "./AddVenue/components/NavigationButtons";
import SuccessScreen from "./AddVenue/components/SuccessScreen";
import { createVenue } from "../../services/venueService";
import { useSubscription } from "../../context/SubscriptionContext";
import toastNotification from "react-hot-toast";

export default function AddVenue() {
  const navigate = useNavigate();
  const { currentSubscription, planLimits, venueUsage, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (!subLoading) {
      const status = String(currentSubscription?.status || "").toUpperCase();
      if (!currentSubscription || (status !== "ACTIVE" && status !== "active")) {
        toastNotification.error("You need an active subscription to add venues.");
        navigate("/billing");
        return;
      }

      const limit = planLimits?.maxVenues || 1;
      if (venueUsage >= limit) {
        toastNotification.error(`Limit reached: You have reached the maximum number of venues (${limit}) allowed for your plan.`);
        navigate("/billing");
      }
    }
  }, [currentSubscription, planLimits, venueUsage, subLoading, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VenueForm>({ ...INITIAL_FORM, amenities: new Set() });
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

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

  const toggleVenueType = (name: string) => {
    setForm((prev) => {
      const exists = prev.venueTypes.has(name);
      const next = new Set(prev.venueTypes);
      if (exists) {
        next.delete(name);
      } else {
        next.add(name);
      }
      const firstType = Array.from(next)[0] || "";
      return { ...prev, venueTypes: next, type: firstType };
    });
  };

  const toggleEventSupported = (name: string) => {
    setForm((prev) => {
      const exists = prev.eventsSupported.has(name);
      const next = new Set(prev.eventsSupported);
      if (exists) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return { ...prev, eventsSupported: next };
    });
  };

  const removeMedia = (index: number) => {
    setForm((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const addMedia = (files: File[]) => {
    const photoLimit = planLimits?.maxPhotos || 10;
    const totalSelected = form.mediaFiles.length + files.length;
    if (totalSelected > photoLimit) {
      toastNotification.error(`Limit exceeded: You can only upload a maximum of ${photoLimit} photos per venue.`);
    }
    setForm((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files].slice(0, photoLimit),
    }));
  };

  const validateStep = (s: number): boolean => {
    const errs: FormErrors = {};
    if (s === 0) {
      if (!form.name.trim()) errs.name = "Venue name is required";
      if (!form.venueTypes || form.venueTypes.size === 0) errs.type = "Please select at least one venue category";
      if (!form.eventsSupported || form.eventsSupported.size === 0) errs.eventsSupported = "Please select at least one supported event";
      if (!form.capacity || parseInt(form.capacity) < 1) errs.capacity = "Enter a valid capacity";
      if (!form.description.trim()) errs.description = "Description is required";
      if (!form.pricePerDay) errs.pricePerDay = "Enter daily pricing";
    }
    if (s === 1) {
      if (!form.address.trim()) errs.address = "Address is required";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.state.trim()) errs.state = "State is required";
      if (!form.zip?.trim()) errs.zip = "ZIP code is required";
      if (!form.country?.trim()) errs.country = "Country is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (loading || isSubmittingRef.current) return;
    if (!validateStep(step)) return;

    if (step === STEPS.length - 1) {
      try {
        isSubmittingRef.current = true;
        setLoading(true);
        const result = await createVenue(form);
        console.log("Venue created:", result);
        setSubmitted(true);
        setToast(true);
        setTimeout(() => setToast(false), 3500);
      } catch (error) {
        isSubmittingRef.current = false;
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
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Subtle decorative background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3" />

        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-12 shadow-[0_20px_50px_rgba(15,_118,_110,_0.05)] border border-slate-100 max-w-md w-full relative z-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(15,_118,_110,_0.08)]">
          <SuccessScreen
            isEditing={false}
            onReset={() => {
              setForm({ ...INITIAL_FORM, amenities: new Set() });
              setStep(0);
              setSubmitted(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white sm:bg-slate-50 sm:p-6 md:p-8 relative font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col items-center">
      {/* Subtle background decoration */}
      <div className="hidden sm:block absolute top-0 right-0 w-[40vw] h-[40vw] max-w-2xl max-h-2xl bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="w-full max-w-4xl bg-white sm:rounded-3xl sm:shadow-[0_20px_60px_rgba(15,_118,_110,_0.04)] sm:border sm:border-slate-100/50 relative z-10 flex flex-col p-4 sm:p-10 transition-all duration-300">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/venue")}
          className="group mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-emerald-700 transition-colors border-none bg-transparent cursor-pointer p-0 self-start focus:outline-none"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Listings</span>
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold sm:font-extrabold text-slate-900 tracking-tight">Add new venue</h1>
            <p className="text-xs sm:text-base md:text-lg text-slate-500 mt-1 sm:mt-2 font-medium sm:font-semibold">Build your listing profile step by step.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="inline-flex items-center justify-center text-[11px] sm:text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 font-bold shadow-sm whitespace-nowrap">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        <div className="mb-10">
          <StepBar current={step} />
        </div>

        <Toast message="Venue published successfully!" show={toast} />

        <div className="flex-1 min-h-[400px]">
          {step === 0 && (
            <StepBasicInfo
              form={form}
              errors={errors}
              update={update}
              toggleVenueType={toggleVenueType}
              toggleEventSupported={toggleEventSupported}
            />
          )}
          {step === 1 && <StepLocation form={form} errors={errors} update={update} />}
          {step === 2 && (
            <StepAmenities form={form} updateAmenities={toggleAmenity} update={update} />
          )}
          {step === 3 && (
            <StepReview form={form} onAddMedia={addMedia} onRemoveMedia={removeMedia} />
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="mt-8 sm:mt-12 pt-5 sm:pt-6 border-t border-slate-100">
          <NavigationButtons
            step={step}
            totalSteps={STEPS.length}
            loading={loading}
            isEditing={false}
            onBack={handleBack}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}