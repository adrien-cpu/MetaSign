'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Settings } from 'lucide-react';
import axios from 'axios';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const predefinedInterests = [
    'Sport',
    'Musique',
    'Lecture',
    'Voyage',
    'Cuisine',
    'Technologie',
    'Art',
    'Cinéma',
    'Photographie',
    'Jeux vidéo'
];

interface InterestsProps {
    interests?: string[];
}

const Interests: React.FC<InterestsProps> = ({ interests = [] }) => {
    const [localInterests, setLocalInterests] = useState<string[]>(interests);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInterest, setSelectedInterest] = useState<string>('');
    const [isPublic, setIsPublic] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const response = await axios.get<{ preferences: { interests: string[] } }>('/api/user/preferences');
                setLocalInterests(response.data.preferences.interests || []);
            } catch (error) {
                console.error("Erreur lors de la récupération des intérêts:", error);
                setError("Impossible de récupérer les intérêts. Veuillez réessayer plus tard.");
                setLocalInterests([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterests();
    }, []);

    const updateInterests = async (newInterests: string[]) => {
        try {
            await axios.post('/api/user/preferences', {
                preferences: {
                    interests: newInterests,
                    isPublic
                }
            });
            setLocalInterests(newInterests);
        } catch (error) {
            console.error("Erreur lors de la mise à jour des intérêts:", error);
            setError("Impossible de mettre à jour les intérêts. Veuillez réessayer plus tard.");
        }
    };

    const addInterest = () => {
        if (selectedInterest && !localInterests.includes(selectedInterest)) {
            updateInterests([...localInterests, selectedInterest]);
            setSelectedInterest('');
        }
    };

    const removeInterest = (interestToRemove: string) => {
        const updatedInterests = localInterests.filter(interest => interest !== interestToRemove);
        updateInterests(updatedInterests);
    };

    if (isLoading) {
        return <div>Chargement des intérêts...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Intérêts</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Paramètres des intérêts</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="visibility">Visibilité</label>
                            <Select
                                value={isPublic ? "public" : "private"}
                                onValueChange={(value) => setIsPublic(value === "public")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Privé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <Select value={selectedInterest} onValueChange={setSelectedInterest}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ajouter un intérêt" />
                    </SelectTrigger>
                    <SelectContent>
                        {predefinedInterests.map((interest, index) => (
                            <SelectItem key={index} value={interest}>
                                {interest}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={addInterest} disabled={!selectedInterest}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {localInterests.map((interest, index) => (
                    <div key={index} className="flex items-center bg-white px-2 py-1 rounded text-black">
                        <span>{interest}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeInterest(interest)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Interests;