import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.sessionId?.trim()) {
      return NextResponse.json(
        { error: 'sessionId est requis' },
        { status: 400 }
      );
    }
    
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: 'message ne peut pas être vide' },
        { status: 400 }
      );
    }
    
    // Simulation of CODA interaction responses
    const responses = [
      {
        content: "Oh ! C'est intéressant ! Peux-tu me montrer ce signe une fois de plus ? Je pense que j'ai mal fait la position de la main... 🤔",
        emotionalState: 'curious',
        gestureDescription: 'Geste d\'interrogation avec les mains',
        currentLevel: 'A2',
        suggestions: ['Répéter le mouvement', 'Corriger la position']
      },
      {
        content: "Wow ! J'ai l'impression de progresser ! Peux-tu me corriger si je fais une erreur ? Je veux vraiment bien apprendre ! 🌟",
        emotionalState: 'excited',
        gestureDescription: 'Geste d\'enthousiasme et d\'attention',
        currentLevel: 'A2',
        suggestions: ['Encourager', 'Proposer un exercice plus complexe']
      },
      {
        content: "Je crois que j'ai compris ! Mais est-ce que tu peux me dire si ma forme de main est correcte ? J'ai un doute... 🤚",
        emotionalState: 'focused',
        gestureDescription: 'Geste de vérification avec la main',
        currentLevel: 'A2',
        suggestions: ['Valider la forme', 'Corriger si nécessaire']
      },
      {
        content: "Hmm, je ne suis pas sûr(e) d'avoir bien compris... Peux-tu répéter s'il te plaît ? 😅",
        emotionalState: 'confused',
        gestureDescription: 'Geste d\'hésitation',
        currentLevel: 'A1',
        suggestions: ['Répéter plus lentement', 'Simplifier l\'explication']
      },
      {
        content: "Super ! Je pense que j'ai saisi ! Maintenant, peux-tu me montrer un signe plus complexe ? 🚀",
        emotionalState: 'accomplished',
        gestureDescription: 'Geste de victoire',
        currentLevel: 'A2',
        suggestions: ['Niveau supérieur', 'Exercice avancé']
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return NextResponse.json({
      ...randomResponse,
      sessionId: body.sessionId.trim(),
      timestamp: new Date().toISOString(),
      userMessage: body.message.trim()
    });
  } catch (error) {
    console.error('Erreur interaction CODA:', error);
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}