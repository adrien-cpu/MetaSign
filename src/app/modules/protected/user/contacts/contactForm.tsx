// src/app/user/contacts/contactForm.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Contact } from './types';

interface ContactFormProps {
    onAddContact: (contact: Omit<Contact, 'isFavorite'>) => void;
    onClose: () => void;
}

const ContactForm = ({ onAddContact, onClose }: ContactFormProps) => {
    const [newContact, setNewContact] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        group: 'Amis'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contactWithId = {
            ...newContact,
            id: Date.now().toString(),
        };
        onAddContact(contactWithId);
        setNewContact({ name: '', phone: '', email: '', address: '', group: 'Amis' });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un contact</h2>

            <div className="space-y-4">
                <Input
                    placeholder="Nom"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                />

                <Input
                    placeholder="Téléphone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    required
                />

                <Input
                    type="email"
                    placeholder="Email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    required
                />

                <Input
                    placeholder="Adresse"
                    value={newContact.address}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                />

                <select
                    value={newContact.group}
                    onChange={(e) => setNewContact({ ...newContact, group: e.target.value })}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="Amis">Amis</option>
                    <option value="Famille">Famille</option>
                    <option value="Travail">Travail</option>
                    <option value="Autres">Autres</option>
                </select>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Ajouter le contact
                </Button>
            </div>
        </form>
    );
};

export default ContactForm;