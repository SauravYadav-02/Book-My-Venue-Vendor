
import { COUNTRIES } from "../types/Constants";
import type { FormErrors, VenueForm } from "../types/Interface";
import InputField from "./InputField";
import Label from "./Label";
import SectionCard from "./SectionCard";
import SelectField from "./SelectField";

function StepLocation({
    form, errors, update,
}: {
    form: VenueForm; errors: FormErrors; update: (k: keyof VenueForm, v: string) => void;
}) {
    return (
        <SectionCard title="Location">
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <Label required>Street address</Label>
                    <InputField
                        id="address" value={form.address} placeholder="e.g. 789 Wedding Lane"
                        onChange={(v) => update("address", v)} error={errors.address}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label required>City</Label>
                        <InputField
                            id="city" value={form.city} placeholder="e.g. Springfield"
                            onChange={(v) => update("city", v)} error={errors.city}
                        />
                    </div>
                    <div>
                        <Label required>State</Label>
                        <InputField
                            id="state" value={form.state} placeholder="e.g. Illinois"
                            onChange={(v) => update("state", v)} error={errors.state}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label>ZIP code</Label>
                        <InputField
                            id="zip" value={form.zip} placeholder="e.g. 62701"
                            onChange={(v) => update("zip", v)}
                        />
                    </div>
                    <div>
                        <Label>Country</Label>
                        <SelectField
                            id="country" value={form.country}
                            options={COUNTRIES.map((c) => ({ label: c, value: c }))}
                            onChange={(v) => update("country", v)}
                        />
                    </div>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                        Coordinates <span className="normal-case font-normal">(optional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <InputField
                            id="lat" type="number" value={form.lat} placeholder="Latitude e.g. 39.7817"
                            step="any" onChange={(v) => update("lat", v)}
                        />
                        <InputField
                            id="lng" type="number" value={form.lng} placeholder="Longitude e.g. -89.65"
                            step="any" onChange={(v) => update("lng", v)}
                        />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}
export default StepLocation;