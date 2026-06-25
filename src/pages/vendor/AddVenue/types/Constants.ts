import type { VenueForm } from "./Interface";

export const STEPS = ["Basic info", "Location", "Amenities & details", "Review & publish"];

export const VENUE_TYPES = [
    "Hotels & Resorts",
    "Farmhouses & Private Villas",
    "Destination Venues",
    "Banquet Hall",
    "Outdoor Venue",
    "Conference Hall",
    "Rooftop",
    "Other"
];

export const EVENTS_SUPPORTED = [
    "Weddings",
    "Birthday Parties",
    "Engagements",
    "Anniversaries",
    "Corporate Events",
    "Baby Showers",
    "Social Gatherings"
];

export const ALL_AMENITIES = [
    "Wi-Fi", "Parking", "Stage", "AC", "Projector",
    "Gazebo", "Lighting", "Catering", "Bar", "Sound System",
    "Generator", "CCTV",
];

export const COUNTRIES = ["United States", "India", "United Kingdom", "Canada", "Australia", "Other"];

export const INITIAL_FORM: VenueForm = {
    name: "", type: "", venueTypes: new Set(), eventsSupported: new Set(), capacity: "", description: "",
    pricePerDay: "", vegPrice: "", nonVegPrice: "", bothPrice: "",
    availableFrom: "",
    address: "", city: "", state: "", zip: "", country: "India", lat: "", lng: "",
    amenities: new Set(),
    mediaFiles: [],
};