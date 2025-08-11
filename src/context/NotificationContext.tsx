/**
 * Contexte de notification pour gérer les notifications dans l'application
 * @module NotificationContext
 * @requires react
 * @requires react-dom
 * @requires react-router-dom
 * @requires react-query
 * @requires react-toastify
 * @requires react-icons
 * @requires react-hot-toast
 * @requires react-helmet
 * @requires react-markdown
 * @requires react-quill                
 */
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * Interface définissant la structure d'une notification
 * @interface Notification
 */
interface Notification {
    /** Identifiant unique de la notification */
    id: string;
    /** Message à afficher dans la notification */
    message: string;
    /** Type de notification pour déterminer l'apparence et le comportement */
    type: "new_member" | "new_post" | "info" | "error" | "warning" | "success";
    /** Identifiant du club associé, si applicable */
    clubId?: string;
    /** Indique si la notification a été lue */
    read?: boolean;
    /** Horodatage de la notification */
    timestamp?: string;
}

/**
 * Interface définissant les méthodes et propriétés du contexte de notification
 * @interface NotificationContextType
 */
interface NotificationContextType {
    /** Liste des notifications actives */
    notifications: Notification[];
    /** Nombre de notifications non lues */
    unreadCount: number;
    /** Ajoute une nouvelle notification */
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
    /** Supprime toutes les notifications */
    clearNotifications: () => void;
    /** Marque une notification spécifique comme lue */
    markAsRead: (id: string) => void;
    /** Marque toutes les notifications comme lues */
    markAllAsRead: () => void;
    /** Indique si les notifications sont en cours de chargement */
    loading: boolean;
    /** Message d'erreur en cas d'échec du chargement des notifications */
    error: string | null;
}

// Création du contexte avec une valeur initiale null
const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Fournisseur de contexte pour les notifications dans l'application
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contexte avec les enfants
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Calcul du nombre de notifications non lues
    const unreadCount = notifications.filter(notification => !notification.read).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                // Utilisation de try/catch pour gérer les erreurs réseau
                const res = await fetch("/api/notifications");

                // Vérification du statut de la réponse
                if (!res.ok) {
                    throw new Error(`Erreur lors de la récupération des notifications: ${res.status}`);
                }

                // Vérification du type de contenu pour éviter les erreurs de parsing JSON
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("La réponse n'est pas au format JSON");
                }

                const data = await res.json();
                setNotifications(data.notifications || []);
                setError(null);
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications:", error);
                setError(error instanceof Error ? error.message : "Erreur inconnue");

                // En développement, utiliser un tableau vide pour éviter les erreurs dans l'UI
                if (process.env.NODE_ENV === "development") {
                    setNotifications([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Configuration d'un intervalle pour rafraîchir périodiquement les notifications
        const intervalId = setInterval(fetchNotifications, 60000); // 1 minute

        // Nettoyage de l'intervalle à la destruction du composant
        return () => clearInterval(intervalId);
    }, []);

    /**
     * Ajoute une nouvelle notification à la liste
     * @param {Omit<Notification, "id" | "timestamp" | "read">} notification - Données de la notification à ajouter
     */
    const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification: Notification = {
            ...notification,
            id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false
        };

        setNotifications((prev) => [newNotification, ...prev]);
    };

    /**
     * Supprime toutes les notifications
     */
    const clearNotifications = () => {
        setNotifications([]);

        // Option: vous pourriez ajouter un appel API ici pour synchroniser avec le serveur
        // fetch("/api/notifications/clear", { method: "POST" });
    };

    /**
     * Marque une notification spécifique comme lue
     * @param {string} id - Identifiant de la notification à marquer comme lue
     */
    const markAsRead = async (id: string) => {
        // Mise à jour optimiste
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );

        try {
            // Appel API pour mettre à jour côté serveur (si implémenté)
            await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.error("Erreur lors du marquage de la notification:", error);
            // En cas d'erreur, on pourrait recharger les notifications pour annuler la mise à jour optimiste
        }
    };

    /**
     * Marque toutes les notifications comme lues
     */
    const markAllAsRead = async () => {
        // Mise à jour optimiste
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );

        try {
            // Appel API pour mettre à jour côté serveur (si implémenté)
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Erreur lors du marquage de toutes les notifications:", error);
            // En cas d'erreur, on pourrait recharger les notifications pour annuler la mise à jour optimiste
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                clearNotifications,
                markAsRead,
                markAllAsRead,
                loading,
                error
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * Hook personnalisé pour accéder au contexte de notification
 * @returns {NotificationContextType} Le contexte de notification
 * @throws {Error} Si utilisé en dehors d'un NotificationProvider
 */
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications doit être utilisé à l'intérieur d'un NotificationProvider");
    }
    return context;
};