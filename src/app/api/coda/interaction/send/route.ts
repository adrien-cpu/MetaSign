/**
 * @file /api/coda/interaction/send/route.ts
 * @description Endpoint API pour envoyer une interaction à l'IA CODA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// Import conditionnel des services CODA
let EnhancedCODASystem: typeof import('@/ai/services/learning/human/coda/codavirtuel/systems/EnhancedCODASystem').EnhancedCODASystem | null = null;
let CODAResponseGenerator: typeof import('@/ai/services/learning/human/coda/codavirtuel/systems/response/CODAResponseGenerator').CODAResponseGenerator | null = null;

try {
  // Tentative d'import des services CODA réels
  const codaModule = await import('@/ai/services/learning/human/coda/codavirtuel/systems/EnhancedCODASystem');
  EnhancedCODASystem = codaModule.EnhancedCODASystem;
  
  const responseModule = await import('@/ai/services/learning/human/coda/codavirtuel/systems/response/CODAResponseGenerator');
  CODAResponseGenerator = responseModule.CODAResponseGenerator;
} catch (error) {
  console.warn('Services CODA non disponibles, utilisation du simulateur:', error);
}

interface SendInteractionRequest {
  sessionId: string;
  message: string;
  timestamp: string;
}

// Simulateur de réponses CODA
const codaSimulator = {
  responses: [
    {
      content: "Oh ! C'est intéressant ! Peux-tu me montrer ce signe une fois de plus ? Je pense que j'ai mal fait la position de la main... 🤔",
      emotionalState: 'curious',
      gestureDescription: 'Geste d\'interrogation avec les mains',
      currentLevel: 'A2',
      suggestions: ['Répéter le mouvement', 'Corriger la position']
    },
    {
      content: "Attends, attends ! Est-ce que le mouvement c'est comme ça ? *reproduit le geste* Ou plutôt comme ça ? Je me mélange un peu... 😅",
      emotionalState: 'frustrated',
      gestureDescription: 'Tentative de reproduction du geste avec hésitation',
      currentLevel: 'A2',
      suggestions: ['Clarifier le mouvement', 'Montrer étape par étape']
    },
    {
      content: "Wow ! J'ai l'impression de progresser ! Peux-tu me corriger si je fais une erreur ? Je veux vraiment bien apprendre ! 🌟",
      emotionalState: 'excited',
      gestureDescription: 'Geste d\'enthousiasme et d\'attention',
      currentLevel: 'A2',
      suggestions: ['Encourager', 'Proposer un exercice plus complexe']
    },
    {
      content: "C'est génial ! Je commence à comprendre ! Est-ce que tu peux m'expliquer pourquoi ce signe se fait dans cette zone de l'espace ? 🤯",
      emotionalState: 'focused',
      gestureDescription: 'Geste de concentration et d\'attention soutenue',
      currentLevel: 'B1',
      suggestions: ['Expliquer la spatialité', 'Donner des exemples']
    },
    {
      content: "Hmm... je sens que je fatigue un peu. On peut faire une petite pause ou tu as un exercice plus simple ? 😴",
      emotionalState: 'tired',
      gestureDescription: 'Geste de fatigue avec ralentissement',
      currentLevel: 'A2',
      suggestions: ['Faire une pause', 'Simplifier l\'exercice']
    }
  ],

  generateResponse(message: string) {
    // Logique simple basée sur le contenu du message
    let responseIndex = 0;
    
    if (message.toLowerCase().includes('correct') || message.toLowerCase().includes('bien')) {
      responseIndex = 2; // Réponse excitée
    } else if (message.toLowerCase().includes('erreur') || message.toLowerCase().includes('non')) {
      responseIndex = 1; // Réponse frustrée
    } else if (message.toLowerCase().includes('question') || message.toLowerCase().includes('pourquoi')) {
      responseIndex = 3; // Réponse concentrée
    } else if (message.length > 100) {
      responseIndex = 4; // Réponse fatiguée pour les longs messages
    } else {
      responseIndex = Math.floor(Math.random() * this.responses.length);
    }

    return this.responses[responseIndex];
  }
};

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

    const body: SendInteractionRequest = await request.json();
    const { sessionId, message, timestamp } = body;

    // Validation des données
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'SessionId et message requis' },
        { status: 400 }
      );
    }

    let response;

    if (EnhancedCODASystem && CODAResponseGenerator) {
      // Utilisation des services CODA réels
      try {
        const codaSystem = new EnhancedCODASystem({
          personalityType: 'curious', // À récupérer depuis la session
          targetLevel: 'A2',
          adaptationEnabled: true
        });

        const responseData = await codaSystem.processTeacherInput(message, {
          sessionId,
          mentorId: session.user.id,
          timestamp: new Date(timestamp)
        });

        response = {
          content: responseData.response || responseData.content || '',
          emotionalState: responseData.emotionalState || 'focused',
          gestureDescription: responseData.gestureDescription || '',
          currentLevel: responseData.currentLevel || 'A2',
          suggestions: responseData.suggestions || []
        };

        console.log('✅ Réponse CODA générée avec les services réels');
      } catch (error) {
        console.error('Erreur avec les services CODA réels:', error);
        throw error;
      }
    } else {
      // Mode simulation
      response = codaSimulator.generateResponse(message);
      console.log('⚠️ Réponse CODA générée en mode simulation');
    }

    // Log de l'interaction pour debug
    console.log(`💬 Interaction CODA [${sessionId}]:`, {
      userMessage: message.substring(0, 50) + '...',
      aiResponse: response.content?.substring(0, 50) + '...',
      emotion: response.emotionalState
    });

    return NextResponse.json({
      success: true,
      content: response.content,
      message: response.content, // Compatibilité
      emotionalState: response.emotionalState,
      gestureDescription: response.gestureDescription,
      currentLevel: response.currentLevel,
      suggestions: response.suggestions,
      timestamp: new Date().toISOString(),
      sessionId
    });

  } catch (error) {
    console.error('Erreur lors du traitement de l\'interaction CODA:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors du traitement de l\'interaction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}