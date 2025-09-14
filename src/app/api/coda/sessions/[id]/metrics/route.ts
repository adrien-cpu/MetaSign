import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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
    
    // Simulation de métriques cohérentes
    const simulatedInteractions = Math.floor(Math.random() * 20 + 5);
    const durationMinutes = Math.floor(simulatedInteractions * 2.5 + Math.random() * 10);
    
    const metrics = {
      sessionId: sessionId.trim(),
      interactions: simulatedInteractions,
      duration: durationMinutes * 60, // en secondes
      emotionalEvolution: [
        'curious',
        'focused', 
        ...(simulatedInteractions > 10 ? ['excited'] : []),
        ...(simulatedInteractions > 15 ? ['accomplished'] : [])
      ].slice(0, Math.min(4, Math.floor(simulatedInteractions / 5) + 1)),
      learningProgress: Math.min(100, Math.floor(simulatedInteractions * 4 + Math.random() * 20 + 40)),
      topicsCovered: Math.floor(simulatedInteractions / 3),
      averageResponseTime: Math.floor(Math.random() * 3000 + 1000), // 1-4 secondes
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erreur récupération métriques CODA:', error);
    return NextResponse.json(
      { error: 'Failed to get session metrics' },
      { status: 500 }
    );
  }
}