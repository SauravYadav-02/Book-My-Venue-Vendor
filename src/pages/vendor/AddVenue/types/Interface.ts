

export interface VenueForm {
    name: string;
    type: string;
    capacity: string;
    description: string;
    pricePerDay: string;
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
