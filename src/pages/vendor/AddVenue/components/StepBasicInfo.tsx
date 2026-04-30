import { VENUE_TYPES } from "../types/Constants";
import type { FormErrors, VenueForm } from "../types/Interface";
import InputField from "./InputField";
import Label from "./Label";
import SectionCard from "./SectionCard";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";

function StepBasicInfo({
    form, errors, update,
}: {
    form: VenueForm; errors: FormErrors; update: (k: keyof VenueForm, v: string) => void;
}) {
    return (
        <>
            <SectionCard title="Basic info">
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <Label required>Venue name</Label>
                        <InputField
                            id="name" value={form.name} placeholder="e.g. Grand Ballroom"
                            onChange={(v) => update("name", v)} error={errors.name}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label required>Venue type</Label>
                            <SelectField
                                id="type" value={form.type}
                                options={[{ label: "Select type", value: "" }, ...VENUE_TYPES.map((t) => ({ label: t, value: t }))]}
                                onChange={(v) => update("type", v)} error={errors.type}
                            />
                        </div>
                        <div>
                            <Label required>Capacity (guests)</Label>
                            <InputField
                                id="capacity" type="number" value={form.capacity} placeholder="e.g. 200"
                                min="1" onChange={(v) => update("capacity", v)} error={errors.capacity}
                            />
                        </div>
                    </div>
                    <div>
                        <Label required>Description</Label>
                        <TextareaField
                            id="description" value={form.description}
                            placeholder="Describe your venue — layout, ambience, special features..."
                            onChange={(v) => update("description", v)} error={errors.description}
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Pricing">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <Label required>Per day ($)</Label>
                        <InputField
                            id="pricePerDay" type="number" value={form.pricePerDay}
                            placeholder="e.g. 3000" min="0"
                            onChange={(v) => update("pricePerDay", v)} error={errors.pricePerDay}
                        />
                    </div>
                </div>
            </SectionCard>
        </>
    );
}

export default StepBasicInfo;
