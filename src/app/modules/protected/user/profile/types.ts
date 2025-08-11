export interface UserData {
    id: string;
    avatar: string;
    firstName: string;
    role: string;
    createdAt: string | null;
    email?: string;
    phone?: string;
    location?: string;
}

export interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordErrors {
    length: boolean;
    specialChar: boolean;
    uppercase: boolean;
    number: boolean;
    lowercase: boolean;
    match: boolean;
}
