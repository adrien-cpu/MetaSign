/**
 * @file /api/coda/session/create/route.ts
 * @description Endpoint API pour créer une nouvelle session CODA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// Import conditionnel des services CODA (en attendant la finalisation)
let ReverseApprenticeshipSystem: typeof import('@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem').ReverseApprenticeshipSystem | null = null;
let CODASessionManager: typeof import('@/ai/services/learning/human/coda/codavirtuel/managers/CODASessionManager').CODASessionManager | null = null;

try {
  // Tentative d'import des services CODA réels
  const codaModule = await import('@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem');
  ReverseApprenticeshipSystem = codaModule.ReverseApprenticeshipSystem;
  
  const sessionModule = await import('@/ai/services/learning/human/coda/codavirtuel/managers/CODASessionManager');
  CODASessionManager = sessionModule.CODASessionManager;
} catch (error) {
  console.warn('Services CODA non disponibles, utilisation du mode simulation:', error);
}

interface CreateSessionRequest {
  targetLevel: string;
  personalityType: string;
  mentorId: string;
  topic: string;
}

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body: CreateSessionRequest = await request.json();
    const { targetLevel, personalityType, mentorId, topic } = body;

    // Validation des données
    if (!targetLevel || !personalityType || !topic) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    let sessionData;

    if (ReverseApprenticeshipSystem && CODASessionManager) {
      // Utilisation des services CODA réels
      try {
        const codaSystem = new ReverseApprenticeshipSystem({
          personalityType,
          targetLevel,
          adaptationEnabled: true,
          culturalEnvironment: 'standard'
        });

        const sessionManager = new CODASessionManager();
        
        sessionData = await sessionManager.createSession({
          mentorId: session.user.id,
          topic,
          targetLevel,
          concepts: [],
          teachingMethod: personalityType,
          expectedDuration: 30 * 60 * 1000, // 30 minutes
          materials: [],
          tags: [personalityType, targetLevel]
        });

        console.log('✅ Session CODA créée avec les services réels:', sessionData.id);
      } catch (error) {
        console.error('Erreur avec les services CODA réels:', error);
        throw error;
      }
    } else {
      // Mode simulation
      sessionData = {
        id: `sim_session_${Date.now()}`,
        mentorId: session.user.id,
        topic,
        targetLevel,
        personalityType,
        status: 'active',
        startTime: new Date(),
        interactions: [],
        emotionalState: 'curious',
        currentLevel: targetLevel,
        metadata: {
          mode: 'simulation',
          created: new Date().toISOString()
        }
      };

      console.log('⚠️ Session CODA créée en mode simulation:', sessionData.id);
    }

    return NextResponse.json({
      success: true,
      id: sessionData.id,
      status: sessionData.status || 'active',
      emotionalState: sessionData.emotionalState || 'curious',
      currentLevel: sessionData.currentLevel || targetLevel,
      mode: sessionData.metadata?.mode || 'real'
    });

  } catch (error) {
    console.error('Erreur lors de la création de session CODA:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de la création de session',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}