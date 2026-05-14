import { VENUE_TYPES } from "../types/Constants";
import type { FormErrors, VenueForm } from "../types/Interface";
import InputField from "./InputField";
import Label from "./Label";
import SectionCard from "./SectionCard";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";
import { currencyFormatter } from "../../../../utils/currency";

function StepBasicInfo({
    form, errors, update,
}: {
    form: VenueForm; errors: FormErrors; update: (k: keyof VenueForm, v: string) => void;
}) {
    const isCustomType = form.type && !VENUE_TYPES.includes(form.type) && form.type !== "Other";
    const selectValue = isCustomType ? "Other" : form.type;

    return (
        <div className="flex flex-col gap-4 sm:gap-5">

            <SectionCard title="Basic info">
                <div className="flex flex-col gap-3 sm:gap-4">

                    <div className="flex flex-col gap-1 sm:gap-1.5">
                        <Label required>Venue name</Label>
                        <InputField
                            id="name" value={form.name} placeholder="e.g. Grand Ballroom"
                            onChange={(v) => update("name", v)} error={errors.name}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="flex flex-col gap-1 sm:gap-1.5">
                            <Label required>Venue type</Label>
                            <SelectField
                                id="type" value={selectValue}
                                options={[
                                    { label: "Select type", value: "" },
                                    ...VENUE_TYPES.map((t) => ({ label: t, value: t })),
                                ]}
                                onChange={(v) => update("type", v)} error={errors.type}
                            />
                            {(selectValue === "Other" || form.type === "Other") && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <InputField
                                        id="customType"
                                        value={form.type === "Other" ? "" : form.type}
                                        placeholder="Enter custom venue type"
                                        onChange={(v) => update("type", v || "Other")}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-1.5">
                            <Label required>Capacity (guests)</Label>
                            <InputField
                                id="capacity" type="number" value={form.capacity}
                                placeholder="e.g. 200" min="1"
                                onChange={(v) => update("capacity", v)} error={errors.capacity}
                            />
                        </div>
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