'use client';

import React, { useEffect, useState } from 'react';
import { Book, ChevronRight } from 'lucide-react';
import axios from 'axios';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LearningPreferencesProps {
    preferredSignLanguage: string;
    learningGoals?: string[];
}

const LearningPreferences: React.FC<LearningPreferencesProps> = ({ preferredSignLanguage, learningGoals = [] }) => {
    const [localLearningGoals, setLocalLearningGoals] = useState<string[]>(learningGoals);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [dailyStudyTime, setDailyStudyTime] = useState<number>(30); // Temps à consacrer par jour en minutes
    const [preferredStudyTime, setPreferredStudyTime] = useState<string>('Matinée'); // Préférence de moment de la journée
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchLearningGoals = async () => {
            try {
                const response = await axios.get<{ preferences: { learningGoals: string[], dailyStudyTime: number, preferredStudyTime: string } }>('/api/user/preferences');
                setLocalLearningGoals(response.data.preferences.learningGoals || []);
                setDailyStudyTime(response.data.preferences.dailyStudyTime || 30);
                setPreferredStudyTime(response.data.preferences.preferredStudyTime || 'Matinée');
            } catch (error) {
                console.error("Erreur lors de la récupération des objectifs d'apprentissage:", error);
                setError("Impossible de récupérer les objectifs d'apprentissage. Veuillez réessayer plus tard.");
                setLocalLearningGoals([]); // Assurez-vous que localLearningGoals est un tableau vide en cas d'erreur
            } finally {
                setIsLoading(false);
            }
        };

        fetchLearningGoals();
    }, []);

    const updatePreferences = async () => {
        setIsUpdating(true);
        try {
            await axios.post('/api/user/preferences', {
                preferences: {
                    learningGoals: localLearningGoals,
                    dailyStudyTime,
                    preferredStudyTime
                }
            });
            setSuccessMessage("Préférences mises à jour avec succès !");
            setTimeout(() => setSuccessMessage(null), 3000); // Effacer le message après 3 secondes
        } catch (error) {
            console.error("Erreur lors de la mise à jour des préférences:", error);
            setError("Impossible de mettre à jour les préférences. Veuillez réessayer plus tard.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return <div>Chargement des objectifs d &apos; apprentissage...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Préférences d&apos;Apprentissage</h3>
            <div className="flex items-center space-x-3">
                <Book className="text-white" />
                <span>
                    Langue des Signes Préférée : {preferredSignLanguage}
                </span>
            </div>
            <div>
                <h4 className="font-medium mb-2">Objectifs</h4>
                <ul className="space-y-1">
                    {localLearningGoals.map((goal, index) => (
                        <li key={index} className="flex items-center space-x-2">
                            <ChevronRight className="h-4 w-4" />
                            <span>{goal}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-medium mb-2">Temps à consacrer par jour</h4>
                <input
                    type="number"
                    value={dailyStudyTime}
                    onChange={(e) => setDailyStudyTime(Number(e.target.value))}
                    className="input w-full p-2 border rounded"
                />
            </div>
            <div>
                <h4 className="font-medium mb-2">Préférence de moment de la journée</h4>
                <Select value={preferredStudyTime} onValueChange={setPreferredStudyTime}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Préférence de moment de la journée" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Matinée">Matinée</SelectItem>
                        <SelectItem value="Après-midi">Après-midi</SelectItem>
                        <SelectItem value="Soirée">Soirée</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <button
                    onClick={updatePreferences}
                    className={`mt-4 p-2 bg-blue-500 text-white rounded ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Mise à jour...' : 'Mettre à jour les préférences'}
                </button>
                {successMessage && <div className="mt-2 text-green-500">{successMessage}</div>}
            </div>
        </div>
    );
};

export default LearningPreferences;
