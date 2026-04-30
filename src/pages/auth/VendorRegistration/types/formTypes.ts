import React from "react";

export type FormValues = {
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    businessType: string;
    governmentId: File | null;
    address: string;
    pincode: string;
    state: string;

    licenseDoc: File | null;
};

export type Touched = Partial<Record<keyof FormValues, boolean>>;
export type Errors = Partial<Record<keyof FormValues, string>>;

export type Field = {
    id: keyof FormValues;
    label: string;
    icon: React.ElementType;
    type?: string;
    placeholder?: string;
    section: 'personal' | 'business' | 'security';
    options?: string[];
};