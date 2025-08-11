'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Search, Users } from 'lucide-react';
import ContactList from './contactList';
import ContactForm from './contactForm';
import type { Contact } from './types';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';

const ContactsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState<boolean>(false);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const handleAddContact = (newContact: Omit<Contact, 'isFavorite'>) => {
        const contactWithFavorite: Contact = {
            ...newContact,
            isFavorite: false,
            description: `Contact ${newContact.group}`,
        };
        setContacts(prevContacts => [...prevContacts, contactWithFavorite]);
        setShowForm(false);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div>
            {/* Bannière */}
            <Banner
                title='Contacts'
                description='Gérez vos contacts.'
                icon={<Users className="text-red-800" />}
                backHref={ROUTES.USER_DASHBOARD}
            />
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    {/* Barre de recherche et bouton d'ajout */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un contact..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            {showForm ? 'Fermer le formulaire' : 'Ajouter un contact'}
                        </Button>
                    </div>

                    {/* Formulaire d'ajout (conditionnel) */}
                    {showForm && (
                        <div className="mb-6 animate-slideDown">
                            <Card className="border border-blue-100">
                                <ContactForm
                                    onAddContact={handleAddContact}
                                    onClose={() => setShowForm(false)}
                                />
                            </Card>
                        </div>
                    )}

                    {/* Liste des contacts */}
                    <div className="mt-6">
                        <ContactList
                            searchQuery={searchQuery}
                            contacts={contacts}
                            onUpdateContacts={setContacts}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactsPage;
