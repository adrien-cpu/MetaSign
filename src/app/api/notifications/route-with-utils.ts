import { NextRequest } from 'next/server';
import { withApiHandler, withRequestApiHandler } from '@/utils/api-helpers';

/**
 * Type de notification pour les utilisateurs
 */
interface Notification {
    id: string;
    message: string;
    type: "new_member" | "new_post" | "info" | "error" | "warning" | "success";
    clubId?: string;
    read: boolean;
    timestamp: string;
}

/**
 * Exemple de notifications pour le développement
 */
const mockNotifications: Notification[] = [
    {
        id: '1',
        message: 'John Doe a rejoint le club LSF Débutants',
        type: 'new_member',
        clubId: 'club-1',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '2',
        message: 'Nouveau message dans le forum Entraide',
        type: 'new_post',
        clubId: 'club-2',
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString()
    }
];

/**
 * Récupère la liste des notifications pour l'utilisateur actuel
 * Utilisation de withApiHandler quand nous n'avons pas besoin du paramètre request
 */
export const GET = withApiHandler(
    () => {
        // Logique qui ne nécessite pas le paramètre request
        return {
            notifications: mockNotifications,
            timestamp: new Date().toISOString()
        };
    },
    { successStatusCode: 200 }
);

/**
 * Exemple d'un endpoint qui utilise le paramètre request
 * Utilisation de withRequestApiHandler quand nous avons besoin d'accéder au request
 */
export const POST = withRequestApiHandler(
    async (request: NextRequest) => {
        // Nous pouvons accéder aux données du corps de la requête
        const body = await request.json();

        // Ou aux paramètres de recherche
        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter');

        // Retourner un résultat basé sur les paramètres de la requête
        return {
            received: body,
            filter,
            timestamp: new Date().toISOString()
        };
    },
    { successStatusCode: 201 }
);