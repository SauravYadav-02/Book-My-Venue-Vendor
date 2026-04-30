import { type Errors, type FormValues } from "../types/formTypes";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validate(v: FormValues): Errors {
    const e: Errors = {};

    if (!v.fullName) e.fullName = "Required";

    if (!v.email) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
        e.email = "Invalid email";

    if (!v.phone) e.phone = "Required";
    else if (!/^\d{10}$/.test(v.phone))
        e.phone = "Invalid phone";

    if (!v.businessName) e.businessName = "Required";
    if (!v.businessType) e.businessType = "Required";
    
    if (!v.governmentId) {
        e.governmentId = "Required";
    } else if (v.governmentId.size > MAX_FILE_SIZE) {
        e.governmentId = "Image must be less than 5MB";
    }

    if (!v.licenseDoc) {
        e.licenseDoc = "Required";
    } else if (v.licenseDoc.size > MAX_FILE_SIZE) {
        e.licenseDoc = "Image must be less than 5MB";
    }

    if (!v.address) e.address = "Required";
    if (!v.pincode) e.pincode = "Required";
    if (!v.state) e.state = "Required";

    return e;

}