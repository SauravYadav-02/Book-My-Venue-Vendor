export type CreateVendorRequest = {
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

export type Vendor = CreateVendorRequest & {
    id: string;
    status: "pending" | "approved" | "rejected";
    adminMessage: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
};