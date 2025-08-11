/**
 * Contexte de notification pour gérer les notifications dans l'application
 * @module NotificationContext
 * @requires react
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Interface pour la requête de marquage d'une notification comme lue
 */
interface MarkReadRequest {
    /** ID de la notification à marquer comme lue */
    id: string;
}

/**
 * Marque une notification spécifique comme lue
 * @param {NextRequest} request - Requête entrante contenant l'ID de la notification
 * @returns {NextResponse} Réponse indiquant le succès ou l'échec
 */
export async function POST(request: NextRequest) {
    try {
        // Extraire l'ID de la notification du corps de la requête
        const body: MarkReadRequest = await request.json();

        if (!body.id) {
            return NextResponse.json({
                error: 'ID de notification manquant'
            }, { status: 400 });
        }

        // Dans une application réelle, vous mettriez à jour la base de données ici
        // Exemple:
        // await db.notification.update({
        //   where: { id: body.id },
        //   data: { read: true }
        // });

        // Simulation d'une opération réussie
        return NextResponse.json({
            success: true,
            message: `Notification ${body.id} marquée comme lue`
        }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
        return NextResponse.json({
            error: 'Erreur lors du marquage de la notification',
            success: false
        }, { status: 500 });
    }
}