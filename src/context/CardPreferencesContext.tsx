'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export const VALID_CARDS = [
    "profile", "personalization", "avatar", "badges", "stats", "contacts",
    "traduction", "learn", "socialDashboard", "facilities",
    "actualite", "business", "culture", "divertissement", "voyage",
    "clubs", "salons", "rencontres", "amis", "groupes", "evenements",
];

export const CATEGORIES = {
    "Mon Espace": ["profile", "avatar", "badges", "stats", "contacts"],
    "Thématiques": ["traduction", "learn", "socialDashboard", "facilities", "actualite", "business", "culture", "divertissement", "voyage"],
    "Social": ["clubs", "salons", "rencontres", "amis", "groupes", "evenements"],
};

type CardPreferences = Record<string, boolean>;

interface CardContextType {
    preferences: CardPreferences;
    toggleCard: (card: string) => void;
    isLoading: boolean;
}

const CardPreferencesContext = createContext<CardContextType | null>(null);

export const CardProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status, update } = useSession();
    const [preferences, setPreferences] = useState<CardPreferences>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || !session.user) {
            setIsLoading(false);
            return;
        }

        const syncPreferences = async () => {
            try {
                const response = await axios.get("/api/user/preferences");
                if (response.status !== 200) throw new Error(`Erreur API: ${response.status}`);

                const savedPreferences: CardPreferences = response.data.preferences || {};
                console.log("📥 Préférences récupérées :", savedPreferences);

                // 🔥 Suppression des cartes supprimées de VALID_CARDS directement en base
                const removedCards = Object.keys(savedPreferences).filter(card => !VALID_CARDS.includes(card));

                if (removedCards.length > 0) {
                    console.log("🗑 Suppression des cartes obsolètes :", removedCards);
                    await axios.post("/api/user/preferenceRemove", { removedCards });
                }

                // 🔥 Mettre à jour seulement les cartes encore valides
                const updatedPreferences = Object.keys(savedPreferences).reduce((acc, card) => {
                    if (VALID_CARDS.includes(card)) acc[card] = savedPreferences[card];
                    return acc;
                }, {} as CardPreferences);

                // ✅ Ajouter les nouvelles cartes manquantes
                VALID_CARDS.forEach((card) => {
                    if (!updatedPreferences.hasOwnProperty(card)) updatedPreferences[card] = true;
                });

                // ✅ Mise à jour des préférences uniquement si nécessaire
                if (JSON.stringify(updatedPreferences) !== JSON.stringify(savedPreferences)) {
                    await axios.post("/api/user/preferences", { preferences: updatedPreferences });
                    console.log("🔄 Synchronisation des préférences en base :", updatedPreferences);
                }

                setPreferences(updatedPreferences);
            } catch (error) {
                console.error("🚨 Erreur lors du chargement des préférences:", error);
            } finally {
                setIsLoading(false);
            }
        };

        syncPreferences();
    }, [session, status]);

    const toggleCard = async (card: string) => {
        if (!VALID_CARDS.includes(card)) {
            console.warn(`❌ Tentative de modification d'une carte non autorisée: ${card}`);
            return; // 🔥 Empêche l'utilisateur de modifier une carte qui n'est plus valide
        }

        const newPreferences = { ...preferences, [card]: !preferences[card] };

        // ✅ Mettre à jour immédiatement l'état local (UX plus fluide)
        setPreferences(newPreferences);

        try {
            await axios.post("/api/user/preferences", { preferences: newPreferences });
            console.log("✅ Préférences enregistrées :", newPreferences);

            setTimeout(() => {
                if (update) update();
            }, 1000); // 🔥 Petit délai pour éviter un rechargement visible
        } catch (error) {
            console.error("🚨 Erreur lors de l'update des préférences :", error);
        }
    };

    return (
        <CardPreferencesContext.Provider value={{ preferences, toggleCard, isLoading }}>
            {children}
        </CardPreferencesContext.Provider>
    );
};

export const useCardPreferences = () => {
    const context = useContext(CardPreferencesContext);
    if (!context) {
        throw new Error("useCardPreferences doit être utilisé à l'intérieur d'un CardProvider");
    }
    return context;
};
