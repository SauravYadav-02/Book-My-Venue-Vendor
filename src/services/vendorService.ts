import axios from "axios";

import { type CreateVendorRequest, type Vendor } from "../pages/auth/VendorRegistration/types/vendorTypes";

// const API_URL = "http://localhost:3000/vendors/register";
const API_URL = "http://localhost:3000/vendors/register";

export async function createVendor(
    data: CreateVendorRequest
): Promise<Vendor> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value as string | Blob);
        }
    });
    formData.append("status", "pending");
    formData.append("adminMessage", "");

    const res = await axios.post<Vendor>(API_URL, formData);

    return res.data;
}

export async function getVendorById(id: string): Promise<any> {
    const res = await axios.get(`http://localhost:3000/vendors/${id}`);
    return res.data;
}