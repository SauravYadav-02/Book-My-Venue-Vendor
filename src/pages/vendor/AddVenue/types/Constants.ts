import type { VenueForm } from "./Interface";

export const STEPS = ["Basic info", "Location", "Amenities & details", "Review & publish"];

export const VENUE_TYPES = [
    "Banquet Hall",
    "Outdoor Venue",
    "Conference Hall",
    "Wedding Venue",
    "Rooftop",
    "Other",
];

export const ALL_AMENITIES = [
    "Wi-Fi", "Parking", "Stage", "AC", "Projector",
    "Gazebo", "Lighting", "Catering", "Bar", "Sound System",
    "Generator", "CCTV",
];

export const COUNTRIES = ["United States", "India", "United Kingdom", "Canada", "Australia", "Other"];

export const INITIAL_FORM: VenueForm = {
    name: "", type: "", capacity: "", description: "",
    pricePerDay: "", availableFrom: "",
    address: "", city: "", state: "", zip: "", country: "United States", lat: "", lng: "",
    amenities: new Set(),
    mediaFiles: [],
};