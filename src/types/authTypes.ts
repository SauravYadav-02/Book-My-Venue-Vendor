export type Role = "user" | "vendor" | "admin";

export interface LoginForm {
    email?: string;
    username?: string;
    password: string;
}

export interface UserResponse {
    user: { _id: string };
}

export interface VendorResponse {
    vendor: { _id: string };
}

export interface AdminResponse {
    admin: { _id: string };
}

export type LoginResponse = UserResponse | VendorResponse | AdminResponse;