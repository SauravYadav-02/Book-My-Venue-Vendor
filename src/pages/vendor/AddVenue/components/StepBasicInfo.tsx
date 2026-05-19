import { useState } from "react";
import { VENUE_TYPES, EVENTS_SUPPORTED } from "../types/Constants";
import type { FormErrors, VenueForm } from "../types/Interface";
import InputField from "./InputField";
import Label from "./Label";
import SectionCard from "./SectionCard";
import TextareaField from "./TextareaField";
import { currencyFormatter } from "../../../../utils/currency";

function StepBasicInfo({
    form, errors, update, toggleVenueType, toggleEventSupported,
}: {
    form: VenueForm;
    errors: FormErrors;
    update: (k: keyof VenueForm, v: string) => void;
    toggleVenueType: (name: string) => void;
    toggleEventSupported: (name: string) => void;
}) {
    const [categories, setCategories] = useState<string[]>(() => {
        const defaultList = [...VENUE_TYPES];
        if (!defaultList.includes("Other")) {
            defaultList.push("Other");
        }
        // Add any existing custom categories from form.venueTypes
        const existingCustom = Array.from(form.venueTypes).filter(t => !defaultList.includes(t));
        const otherIndex = defaultList.indexOf("Other");
        if (otherIndex !== -1) {
            defaultList.splice(otherIndex, 0, ...existingCustom);
        } else {
            defaultList.push(...existingCustom);
        }
        return defaultList;
    });

    const [events, setEvents] = useState<string[]>(() => {
        const defaultList = [...EVENTS_SUPPORTED];
        if (!defaultList.includes("Other")) {
            defaultList.push("Other");
        }
        // Add any existing custom events from form.eventsSupported
        const existingCustom = Array.from(form.eventsSupported).filter(ev => !defaultList.includes(ev));
        const otherIndex = defaultList.indexOf("Other");
        if (otherIndex !== -1) {
            defaultList.splice(otherIndex, 0, ...existingCustom);
        } else {
            defaultList.push(...existingCustom);
        }
        return defaultList;
    });

    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
    const [customCategory, setCustomCategory] = useState("");

    const [showCustomEventInput, setShowCustomEventInput] = useState(false);
    const [customEvent, setCustomEvent] = useState("");

    const handleAddCustomCategory = () => {
        const trimmed = customCategory.trim();
        if (!trimmed) return;
        if (!categories.includes(trimmed)) {
            const updated = [...categories];
            const otherIdx = updated.indexOf("Other");
            if (otherIdx !== -1) {
                updated.splice(otherIdx, 0, trimmed);
            } else {
                updated.push(trimmed);
            }
            setCategories(updated);
        }
        if (!form.venueTypes.has(trimmed)) {
            toggleVenueType(trimmed);
        }
        setCustomCategory("");
        setShowCustomCategoryInput(false);
    };

    const handleAddCustomEvent = () => {
        const trimmed = customEvent.trim();
        if (!trimmed) return;
        if (!events.includes(trimmed)) {
            const updated = [...events];
            const otherIdx = updated.indexOf("Other");
            if (otherIdx !== -1) {
                updated.splice(otherIdx, 0, trimmed);
            } else {
                updated.push(trimmed);
            }
            setEvents(updated);
        }
        if (!form.eventsSupported.has(trimmed)) {
            toggleEventSupported(trimmed);
        }
        setCustomEvent("");
        setShowCustomEventInput(false);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-5">

            <SectionCard title="Basic info">
                <div className="flex flex-col gap-5 sm:gap-6">

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label required>Venue name</Label>
                        <InputField
                            id="name" value={form.name} placeholder="e.g. Grand Ballroom"
                            onChange={(v) => update("name", v)} error={errors.name}
                        />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <Label required>Venue Categories (Select multiple)</Label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((t) => {
                                const isSelected = form.venueTypes.has(t);
                                return (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => {
                                            if (t === "Other") {
                                                setShowCustomCategoryInput(prev => !prev);
                                            } else {
                                                toggleVenueType(t);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                                            t === "Other"
                                                ? (showCustomCategoryInput ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                                                : (isSelected
                                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                                        }`}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                        {showCustomCategoryInput && (
                            <div className="flex gap-2 max-w-md mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <input
                                    type="text"
                                    placeholder="Enter custom category..."
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCustomCategory();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomCategory}
                                    className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 shadow transition-all duration-200 cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                        {errors.type && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.type}</p>}
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <Label required>Supported Events (Select multiple)</Label>
                        <div className="flex flex-wrap gap-2">
                            {events.map((ev) => {
                                const isSelected = form.eventsSupported.has(ev);
                                return (
                                    <button
                                        type="button"
                                        key={ev}
                                        onClick={() => {
                                            if (ev === "Other") {
                                                setShowCustomEventInput(prev => !prev);
                                            } else {
                                                toggleEventSupported(ev);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                                            ev === "Other"
                                                ? (showCustomEventInput ? "bg-slate-100 border-slate-900 text-slate-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                                                : (isSelected
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                                        }`}
                                    >
                                        {ev}
                                    </button>
                                );
                            })}
                        </div>
                        {showCustomEventInput && (
                            <div className="flex gap-2 max-w-md mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <input
                                    type="text"
                                    placeholder="Enter custom event..."
                                    value={customEvent}
                                    onChange={(e) => setCustomEvent(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all bg-slate-50"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCustomEvent();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomEvent}
                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 shadow transition-all duration-200 cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                        {errors.eventsSupported && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.eventsSupported}</p>}
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label required>Capacity (guests)</Label>
                        <InputField
                            id="capacity" type="number" value={form.capacity}
                            placeholder="e.g. 200" min="1"
                            onChange={(v) => update("capacity", v)} error={errors.capacity}
                        />
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label required>Description</Label>
                        <TextareaField
                            id="description" value={form.description}
                            placeholder="Describe your venue — layout, ambience, special features…"
                            onChange={(v) => update("description", v)} error={errors.description}
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Pricing & Catering">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2">
                        <Label required>Per day ({currencyFormatter.resolvedOptions().currency})</Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] sm:text-sm md:text-[15px] font-medium sm:font-semibold text-slate-400 sm:left-4">
                                {currencyFormatter.formatToParts(0).find(part => part.type === 'currency')?.value || '₹'}
                            </span>
                            <div className="pl-6 sm:pl-8">
                                <InputField
                                    id="pricePerDay" type="number" value={form.pricePerDay}
                                    placeholder="e.g. 50,000" min="0"
                                    onChange={(v) => update("pricePerDay", v)} error={errors.pricePerDay}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label>Veg Plate Price</Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] sm:text-sm md:text-[15px] font-medium text-slate-400 sm:left-4">
                                {currencyFormatter.formatToParts(0).find(part => part.type === 'currency')?.value || '₹'}
                            </span>
                            <div className="pl-6 sm:pl-8">
                                <InputField
                                    id="vegPrice" type="number" value={form.vegPrice}
                                    placeholder="e.g. 800" min="0"
                                    onChange={(v) => update("vegPrice", v)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label>Non-Veg Plate Price</Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] sm:text-sm md:text-[15px] font-medium text-slate-400 sm:left-4">
                                {currencyFormatter.formatToParts(0).find(part => part.type === 'currency')?.value || '₹'}
                            </span>
                            <div className="pl-6 sm:pl-8">
                                <InputField
                                    id="nonVegPrice" type="number" value={form.nonVegPrice}
                                    placeholder="e.g. 1200" min="0"
                                    onChange={(v) => update("nonVegPrice", v)}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </SectionCard>

        </div>
    );
}

export default StepBasicInfo;