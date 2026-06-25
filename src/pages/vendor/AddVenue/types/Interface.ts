

export interface VenueForm {
    name: string;
    type: string;
    venueTypes: Set<string>;
    eventsSupported: Set<string>;
    capacity: string;
    description: string;
    pricePerDay: string;
    vegPrice: string;
    nonVegPrice: string;
    bothPrice: string;
    availableFrom: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: string;
    lng: string;
    amenities: Set<string>;
    mediaFiles: (File | string)[];
}

export type FormErrors = Partial<Record<keyof VenueForm | string, string>>;
