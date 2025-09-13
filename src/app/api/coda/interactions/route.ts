import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulation of CODA interaction responses
    const responses = [
      {
        response: "Oh ! C'est intéressant ! Peux-tu me montrer ce signe une fois de plus ? Je pense que j'ai mal fait la position de la main... 🤔",
        emotionalState: 'curious',
        gestureDescription: 'Geste d\'interrogation avec les mains',
        currentLevel: 'A2',
        suggestions: ['Répéter le mouvement', 'Corriger la position']
      },
      {
        response: "Wow ! J'ai l'impression de progresser ! Peux-tu me corriger si je fais une erreur ? Je veux vraiment bien apprendre ! 🌟",
        emotionalState: 'excited',
        gestureDescription: 'Geste d\'enthousiasme et d\'attention',
        currentLevel: 'A2',
        suggestions: ['Encourager', 'Proposer un exercice plus complexe']
      },
      {
        response: "Je crois que j'ai compris ! Mais est-ce que tu peux me dire si ma forme de main est correcte ? J'ai un doute... 🤚",
        emotionalState: 'focused',
        gestureDescription: 'Geste de vérification avec la main',
        currentLevel: 'A2',
        suggestions: ['Valider la forme', 'Corriger si nécessaire']
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return NextResponse.json({
      ...randomResponse,
      sessionId: body.sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}