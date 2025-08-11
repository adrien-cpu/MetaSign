'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronDown,
    ChevronUp,
    Star,
    Users,
    Phone,
    Mail,
    MapPin,
    MoreVertical,
    Edit,
    Trash,
    Star as StarFilled,
    StarIcon,
    Video,
    MessageSquare,
    Share2,
} from 'lucide-react';
import type { Contact } from './types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactListProps {
    contacts: Contact[];
    searchQuery: string;
    onUpdateContacts: (contacts: Contact[]) => void;
}

const initialContacts: Contact[] = [
    {
        id: '1',
        name: 'Marie Dupont',
        phone: '06 12 34 56 78',
        email: 'marie.dupont@email.com',
        address: '123 rue de Paris, 75001 Paris',
        group: 'Famille',
        isFavorite: true,
        description: 'Contact Famille'
    },
    {
        id: '2',
        name: 'Jean Martin',
        phone: '06 23 45 67 89',
        email: 'jean.martin@email.com',
        address: '456 avenue des Champs-Élysées, 75008 Paris',
        group: 'Travail',
        isFavorite: true,
        description: 'Contact Travail'
    },
    {
        id: '3',
        name: 'Sophie Bernard',
        phone: '06 34 56 78 90',
        email: 'sophie.bernard@email.com',
        address: '789 boulevard Saint-Germain, 75006 Paris',
        group: 'Amis',
        isFavorite: false,
        description: 'Contact Amis'
    },
    {
        id: '4',
        name: 'Lucas Petit',
        phone: '06 45 67 89 01',
        email: 'lucas.petit@email.com',
        address: '321 rue de Rivoli, 75004 Paris',
        group: 'Travail',
        isFavorite: false,
        description: 'Contact Travail'
    },
    {
        id: '5',
        name: 'Emma Leroy',
        phone: '06 56 78 90 12',
        email: 'emma.leroy@email.com',
        address: '654 rue du Faubourg Saint-Honoré, 75008 Paris',
        group: 'Famille',
        isFavorite: true,
        description: 'Contact Famille'
    }
];

const ContactList: React.FC<ContactListProps> = ({
    contacts = initialContacts,
    searchQuery,
    onUpdateContacts
}) => {
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
    const [localContacts, setLocalContacts] = useState<Contact[]>(
        contacts.length > 0 ? contacts : initialContacts
    );
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const toggleFavorite = (contactId: string) => {
        const updatedContacts = localContacts.map(contact =>
            contact.id === contactId
                ? { ...contact, isFavorite: !contact.isFavorite }
                : contact
        );
        setLocalContacts(updatedContacts);
        onUpdateContacts(updatedContacts);
    };

    const deleteContact = (contactId: string) => {
        const updatedContacts = localContacts.filter(contact => contact.id !== contactId);
        setLocalContacts(updatedContacts);
        onUpdateContacts(updatedContacts);
        setMenuOpen(null);
    };

    const handleEditContact = (contact: Contact) => {
        setEditingContact({ ...contact });
        setIsEditDialogOpen(true);
        setMenuOpen(null);
    };

    const handleSaveContact = () => {
        if (editingContact) {
            const updatedContacts = localContacts.map(contact =>
                contact.id === editingContact.id ? editingContact : contact
            );
            setLocalContacts(updatedContacts);
            onUpdateContacts(updatedContacts);
            setIsEditDialogOpen(false);
            setEditingContact(null);
        }
    };

    const EditContactDialog = () => (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier le contact</DialogTitle>
                </DialogHeader>
                {editingContact && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                value={editingContact.name}
                                onChange={(e) =>
                                    setEditingContact({
                                        ...editingContact,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={editingContact.phone}
                                onChange={(e) =>
                                    setEditingContact({
                                        ...editingContact,
                                        phone: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editingContact.email}
                                onChange={(e) =>
                                    setEditingContact({
                                        ...editingContact,
                                        email: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Adresse</Label>
                            <Input
                                id="address"
                                value={editingContact.address || ''}
                                onChange={(e) =>
                                    setEditingContact({
                                        ...editingContact,
                                        address: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group">Groupe</Label>
                            <Input
                                id="group"
                                value={editingContact.group}
                                onChange={(e) =>
                                    setEditingContact({
                                        ...editingContact,
                                        group: e.target.value
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
                <DialogFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleSaveContact}>
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const ContactActions = ({ contact }: { contact: Contact }) => (
        <div className="flex items-start gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(contact.id)}
                className={`w-10 h-10 p-2 rounded-full hover:bg-yellow-300 ${contact.isFavorite ? 'bg-yellow-50' : 'bg-slate-50'
                    }`}
            >
                {contact.isFavorite ? (
                    <StarFilled className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                    <StarIcon className="h-4 w-4 text-slate-400" />
                )}
            </Button>

            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMenuOpen(menuOpen === contact.id ? null : contact.id)}
                    className="w-10 h-10 p-0 rounded-full bg-slate-50 hover:bg-slate-300"
                >
                    <MoreVertical className="h-6 w-6 text-slate-600" />
                </Button>

                {menuOpen === contact.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-slate-200 overflow-hidden z-20">
                        <div className="py-1">
                            <button
                                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 w-full transition-colors"
                                onClick={() => handleEditContact(contact)}
                            >
                                <Edit className="h-4 w-4" />
                                Modifier
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                                onClick={() => deleteContact(contact.id)}
                            >
                                <Trash className="h-4 w-4" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContactCard = (contact: Contact) => (
        <Card
            key={contact.id}
            className="relative hover:shadow-lg transition-all duration-200"
        >
            <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{contact.name}</h3>
                            <span className="px-2 py-1 text-xs text-black font-medium bg-slate-100 rounded-full">
                                {contact.group}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4" />
                                <span>{contact.phone}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4" />
                                <span>{contact.email}</span>
                            </div>

                            {contact.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4" />
                                    <span>{contact.address}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <Video className="h-4 w-4" />
                                Appel vidéo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Message
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                            >
                                <Share2 className="h-4 w-4" />
                                Partager
                            </Button>
                        </div>
                    </div>

                    <ContactActions contact={contact} />
                </div>
            </CardContent>
        </Card>
    );

    const favoriteContacts = localContacts.filter(contact => contact.isFavorite);
    const nonFavoriteContacts = localContacts.filter(contact => !contact.isFavorite);

    const filteredFavoriteContacts = favoriteContacts.filter(contact => {
        const name = contact.name?.toLowerCase() || '';
        const phone = contact.phone?.toLowerCase() || '';
        const email = contact.email?.toLowerCase() || '';

        return (
            name.includes(searchQuery.toLowerCase()) ||
            phone.includes(searchQuery.toLowerCase()) ||
            email.includes(searchQuery.toLowerCase())
        );
    });

    const filteredNonFavoriteContacts = nonFavoriteContacts.filter(contact => {
        const name = contact.name?.toLowerCase() || '';
        const phone = contact.phone?.toLowerCase() || '';
        const email = contact.email?.toLowerCase() || '';

        return (
            name.includes(searchQuery.toLowerCase()) ||
            phone.includes(searchQuery.toLowerCase()) ||
            email.includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="space-y-8">
            {filteredFavoriteContacts.length > 0 && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div
                        className="flex items-center justify-between p-4 bg-yellow-100 cursor-pointer"
                        onClick={() => setIsFavoritesExpanded(!isFavoritesExpanded)}
                    >
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <h2 className="text-xl font-semibold text-slate-900">
                                Favoris ({filteredFavoriteContacts.length})
                            </h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 hover:bg-yellow-100"
                        >
                            {isFavoritesExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {isFavoritesExpanded && (
                        <div className="p-4 space-y-4">
                            {filteredFavoriteContacts.map(renderContactCard)}
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-blue-50">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-semibold text-slate-900">
                            Tous les contacts ({filteredNonFavoriteContacts.length})
                        </h2>
                    </div>
                </div>

                <div className="p-4">
                    {filteredNonFavoriteContacts.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">
                            Aucun contact trouvé
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredNonFavoriteContacts.map(renderContactCard)}
                        </div>
                    )}
                </div>
            </div>
            <EditContactDialog />
        </div>
    );
};

export default ContactList;
