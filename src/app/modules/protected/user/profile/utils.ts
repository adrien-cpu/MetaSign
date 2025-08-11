import { PasswordData } from "./types";  // ✅ Assure-toi que `types.ts` est bien dans le même dossier

export const validatePassword = ({ newPassword, confirmPassword }: PasswordData) => {
    return {
        length: newPassword.length >= 8,
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        uppercase: /[A-Z]/.test(newPassword),
        number: /\d/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        match: newPassword === confirmPassword,
    };
};
