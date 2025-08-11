// src/app/user/contacts/types.ts

export interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    group: string;
    isFavorite: boolean;
    description?: string;
    icon?: JSX.Element;
}