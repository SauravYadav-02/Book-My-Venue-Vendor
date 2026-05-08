import axios from "axios";

// Assuming backend is at 3000 based on standard project configuration
const API_URL = "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
});

export const getVendorReviews = async (vendorId: string, params: { sort: string; venueId: string; page: number; limit: number }) => {
    try {
        const response = await api.get(`/ratings/vendor/${vendorId}`, { params });
        return response.data;
    } catch (error) {
        console.error("Get vendor reviews error:", error);
        throw error;
    }
};
