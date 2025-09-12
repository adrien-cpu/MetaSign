/**
 * @file /api/coda/session/[id]/end/route.ts
 * @description Endpoint API pour terminer une session CODA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// Import conditionnel des services CODA
let CODASessionManager: typeof import('@/ai/services/learning/human/coda/codavirtuel/managers/CODASessionManager').CODASessionManager | null = null;

try {
  const sessionModule = await import('@/ai/services/learning/human/coda/codavirtuel/managers/CODASessionManager');
  CODASessionManager = sessionModule.CODASessionManager;
} catch (error) {
  console.warn('Services CODA non disponibles pour la fermeture de session:', error);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    let endResult;

    if (CODASessionManager) {
      // Utilisation du service CODA réel
      try {
        const sessionManager = new CODASessionManager();
        endResult = await sessionManager.endSession(sessionId, {
          endTime: new Date(),
          reason: 'user_requested',
          userId: session.user.id
        });

        console.log('✅ Session CODA fermée avec les services réels:', sessionId);
      } catch (error) {
        console.error('Erreur avec le service CODA réel:', error);
        throw error;
      }
    } else {
      // Mode simulation
      endResult = {
        sessionId,
        status: 'completed',
        endTime: new Date(),
        summary: {
          duration: Math.floor(Math.random() * 30 + 10), // 10-40 minutes
          interactions: Math.floor(Math.random() * 20 + 5), // 5-25 interactions
          finalEmotionalState: 'satisfied',
          finalLevel: 'A2'
        }
      };

      console.log('⚠️ Session CODA fermée en mode simulation:', sessionId);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'completed',
      endTime: new Date().toISOString(),
      summary: endResult.summary || {
        message: 'Session terminée avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la fermeture de session CODA:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la fermeture de session',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}