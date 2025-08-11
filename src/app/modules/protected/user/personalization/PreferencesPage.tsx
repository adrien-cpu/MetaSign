'use client';

import React, { useEffect, useState } from "react";
import { useCardPreferences } from "@/context/CardPreferencesContext";
import { CATEGORIES } from "@/context/CardPreferencesContext";
import axios from 'axios';

const PreferencesPage: React.FC = () => {
    const { preferences, toggleCard, isLoading } = useCardPreferences();
    const [localPreferences, setLocalPreferences] = useState(preferences);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await axios.get<{ preferences: Record<string, boolean> }>('/api/user/preferences');
                setLocalPreferences(response.data.preferences);
            } catch (error) {
                console.error("Erreur lors de la récupération des préférences de cartes:", error);
            }
        };

        fetchPreferences();
    }, []);

    const handleToggleCard = (cardId: string) => {
        toggleCard(cardId);
        setLocalPreferences((prevPreferences) => ({
            ...prevPreferences,
            [cardId]: !prevPreferences[cardId],
        }));
    };

    if (isLoading) return <p>Chargement des préférences...</p>;

    return (
        <div className="pt-0">
            <h2 className="text-xl font-bold mb-4">Préférences d&apos;affichage</h2>

            {Object.entries(CATEGORIES).map(([category, cardIds]) => (
                <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {cardIds.map((cardId) => (
                            <label key={cardId} className="flex items-center gap-2 bg-gray-800 text-white p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition">
                                <input
                                    type="checkbox"
                                    checked={localPreferences[cardId]}
                                    onChange={() => handleToggleCard(cardId)}
                                    className="hidden"
                                />
                                <span className="w-6 h-6 border-2 border-white rounded-md flex items-center justify-center">
                                    {localPreferences[cardId] && <span className="w-4 h-4 bg-white rounded"></span>}
                                </span>
                                {cardId}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PreferencesPage;
