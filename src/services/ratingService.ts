import axios from "axios";

// Assuming backend is at 3000 based on standard project configuration
// const API_URL = "http://192.168.1.12:3000";
const API_URL = "http://192.168.1.12:3000";

const api = axios.create({
    baseURL: API_URL,
});

export interface Review {
    _id: string;
    userId: { name: string; profilePhoto: string } | null;
    venueId: { _id: string; name: string } | null;
    rating: number;
    feedback: string;
    status: string;
    createdAt: string;
}

export interface VendorReviewsResponse {
    reviews: Review[];
    analytics: {
        averageRating: number;
        totalReviews: number;
        distribution: { [key: string]: number };
    };
    venueStats: { [key: string]: { averageRating: number; totalReviews: number } };
    totalPages: number;
    currentPage: number;
}

export const getVendorReviews = async (
    vendorId: string, 
    params: { sort: string; venueId: string; page: number; limit: number }
): Promise<VendorReviewsResponse> => {
    try {
        const response = await api.get<VendorReviewsResponse>(`/ratings/vendor/${vendorId}`, { params });
        return response.data;
    } catch (error) {
        console.error("Get vendor reviews error:", error);
        throw error;
    }
};
