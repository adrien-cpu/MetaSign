import { NextResponse } from 'next/server';

/**
 * Type de notification pour les utilisateurs
 * @interface Notification
 */
interface Notification {
    /** Identifiant unique de la notification */
    id: string;
    /** Message à afficher */
    message: string;
    /** Type de notification pour le style et le comportement */
    type: "new_member" | "new_post" | "info" | "error" | "warning" | "success";
    /** Identifiant du club associé, si applicable */
    clubId?: string;
    /** Indique si la notification a été lue */
    read: boolean;
    /** Horodatage de la notification */
    timestamp: string;
}

/**
 * Exemple de notifications pour le développement
 * À remplacer par des données réelles depuis la base de données
 */
const mockNotifications: Notification[] = [
    {
        id: '1',
        message: 'John Doe a rejoint le club LSF Débutants',
        type: 'new_member',
        clubId: 'club-1',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString() // Il y a 1 heure
    },
    {
        id: '2',
        message: 'Nouveau message dans le forum Entraide',
        type: 'new_post',
        clubId: 'club-2',
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString() // Il y a 1 jour
    },
    {
        id: '3',
        message: 'Bienvenue sur MetaSign!',
        type: 'info',
        read: false,
        timestamp: new Date(Date.now() - 259200000).toISOString() // Il y a 3 jours
    }
];

/**
 * Récupère la liste des notifications pour l'utilisateur actuel
 * @returns {NextResponse} Réponse avec les notifications
 */
export async function GET(): Promise<NextResponse> {
    try {
        // Ici, vous pourriez obtenir l'ID de l'utilisateur authentifié
        // const session = await getSession();
        // const userId = session?.user?.id;

        // Puis récupérer les notifications depuis la base de données
        // const notifications = await db.notification.findMany({ where: { userId } });

        // Pour le développement, on utilise des données fictives
        return NextResponse.json({
            notifications: mockNotifications,
            timestamp: new Date().toISOString()
        }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return NextResponse.json({
            error: 'Erreur lors de la récupération des notifications',
            notifications: []
        }, { status: 500 });
    }
}