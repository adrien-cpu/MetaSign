import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.id;
    
    if (!sessionId?.trim()) {
      return NextResponse.json(
        { error: 'sessionId est requis' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (!body.emotionalState?.trim()) {
      return NextResponse.json(
        { error: 'emotionalState est requis' },
        { status: 400 }
      );
    }
    
    // Validation des états émotionnels autorisés
    const validEmotionalStates = [
      'curious', 'frustrated', 'excited', 'focused', 
      'tired', 'confused', 'accomplished', 'motivated'
    ];
    
    if (!validEmotionalStates.includes(body.emotionalState.trim())) {
      return NextResponse.json(
        { 
          error: 'État émotionnel invalide',
          validStates: validEmotionalStates
        },
        { status: 400 }
      );
    }
    
    // Simulation de mise à jour d'état émotionnel
    const emotionUpdate = {
      sessionId: sessionId.trim(),
      emotionalState: body.emotionalState.trim(),
      timestamp: new Date().toISOString(),
      updated: true
    };

    return NextResponse.json(emotionUpdate);
  } catch (error) {
    console.error('Erreur mise à jour émotionnelle CODA:', error);
    return NextResponse.json(
      { error: 'Failed to update emotional state' },
      { status: 500 }
    );
  }
}