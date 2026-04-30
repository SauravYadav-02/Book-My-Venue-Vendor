// src/services/venueService.ts
import axios, { AxiosError } from "axios";
import type { VenueForm } from "../pages/vendor/AddVenue/types/Interface";

const API_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
});

export interface Venue {
    _id: string;
    vendorId: string;

    name: string;
    type?: string;
    capacity?: number;
    description?: string;

    pricePerDay?: number;

    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;

    lat?: number;   // 🔥 changed to number
    lng?: number;

    amenities?: string[];
    availableFrom?: string;

    mediaFiles: string[];

    status: "pending" | "approved" | "rejected";

    adminDescription?: string;

    createdAt?: string;
    updatedAt?: string;
}


// export interface Venue {
//     id: string;
//     name: string;
//     type: string;
//     capacity: string;
//     description: string;
//     pricePerDay: string;
//     address: string;
//     city: string;
//     state: string;
//     zip: string;
//     country: string;
//     lat: string;
//     lng: string;
//     amenities: string[];
//     availableFrom: string;
//     mediaFiles: string[];
//     pricePerHour: string;
//     availability: { status: string }[];
// }

// Helper to sanitize incoming venue from the backend
const normalizeVenue = (v: Venue): Venue => {
    let amenities = v.amenities || [];
    if (typeof amenities === "string") {
        try { amenities = JSON.parse(amenities); } catch { /* ignore fallback */ }
    } else if (Array.isArray(amenities) && amenities.length === 1 && typeof amenities[0] === "string" && amenities[0].startsWith("[")) {
        try { amenities = JSON.parse(amenities[0]); } catch { /* ignore fallback */ }
    }
    return { ...v, amenities };
};

// Helper to serialize form to FormData
const buildFormData = (form: VenueForm): FormData => {
    const formData = new FormData();

    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
        formData.append("vendorId", vendorId);
    }

    Object.entries(form).forEach(([key, val]) => {
        if (key === "amenities") {
            formData.append(key, JSON.stringify(Array.from(form.amenities)));
        } else if (key === "mediaFiles") {
            form.mediaFiles.forEach((file) =>
                formData.append("mediaFiles", file)
            );
        } else if (val !== null && val !== undefined) {
            formData.append(key, val as string);
        }
    });

    return formData;
};

// CREATE
export const createVenue = async (form: VenueForm): Promise<Venue> => {
    try {
        const response = await api.post<Venue>(
            "/venues/add",
            buildFormData(form),
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );
        return normalizeVenue(response.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Create venue error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

// READ ALL
export const getVenues = async (): Promise<Venue[]> => {
    try {
        const response = await api.get<Venue[]>("/venues");
        return response.data.map(normalizeVenue);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Get venues error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

// READ VENDOR'S OWN VENUES
export const getVenuesByVendor = async (vendorId: string): Promise<Venue[]> => {
    try {
        const response = await api.get<Venue[]>(`/venues/vendor/${vendorId}`);
        return response.data.map(normalizeVenue);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Get vendor venues error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};


// READ ONE
export const getVenueById = async (id: string): Promise<Venue> => {
    try {
        const response = await api.get<Venue>(`/venues/${id}`);
        return normalizeVenue(response.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Get venue error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

// UPDATE
export const updateVenue = async (
    id: string,
    form: VenueForm
): Promise<Venue> => {
    try {
        const response = await api.put<Venue>(
            `/venues/${id}`,
            buildFormData(form),
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );
        return normalizeVenue(response.data);
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Update venue error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};

// DELETE
export const deleteVenue = async (id: string): Promise<void> => {
    try {
        const vendorId = localStorage.getItem("vendorId");
        await api.delete(`/venues/${id}`, {
            params: vendorId ? { vendorId } : {},
        });
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Delete venue error:",
                error.response?.data || error.message
            );
        } else {
            console.error("Unexpected error:", error);
        }
        throw error;
    }
};











// ✅ Generic error handler
const handleError = (error: unknown): never => {
    const err = error as AxiosError<{ message?: string }>;
    const message =
        err.response?.data?.message || err.message || "Something went wrong";
    throw new Error(message);
};

// ✅ Service methods
export const venueService = {
    // 🔹 Get all venues
    getAll: async (): Promise<Venue[]> => {
        try {
            const { data } = await api.get<Venue[]>("/venues");
            return data.map(normalizeVenue);
        } catch (error) {
            return handleError(error); // 🔥 important
        }
    },

    // 🔹 Get single venue
    getById: async (id: string): Promise<Venue> => {
        try {
            const { data } = await api.get<Venue>(`/venues/${id}`);
            return normalizeVenue(data);
        } catch (error) {
            return handleError(error);
        }
    },



    // 🔹 Update venue
    update: async (id: string, payload: Partial<Venue>): Promise<Venue> => {
        try {
            const { data } = await api.put<Venue>(`/venues/${id}`, payload);
            return normalizeVenue(data);
        } catch (error) {
            return handleError(error);
        }
    },

    // 🔹 Delete venue
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/venues/${id}`);
        } catch (error) {
            handleError(error);
        }
    },

    // 🔥 ADMIN ACTIONS (very important for your use case)

    // Approve venue
    approve: async (id: string): Promise<Venue> => {
        try {
            const { data } = await api.patch<Venue>(`/venues/${id}/approve`);
            return normalizeVenue(data);
        } catch (error) {
            return handleError(error);
        }
    },

    // Reject venue with reason
    reject: async (
        id: string,
        adminDescription: string
    ): Promise<Venue> => {
        try {
            const { data } = await api.patch<Venue>(`/venues/${id}/reject`, {
                adminDescription,
            });
            return normalizeVenue(data);
        } catch (error) {
            return handleError(error);
        }
    },
};