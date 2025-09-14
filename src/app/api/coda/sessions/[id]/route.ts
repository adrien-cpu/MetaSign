import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
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
    
    // Validation du body pour les données de fermeture
    const body = await request.json().catch(() => ({}));
    
    // Simulation de fermeture de session
    const sessionEnd = {
      sessionId: sessionId.trim(),
      endTime: body.endTime || new Date().toISOString(),
      reason: body.reason || 'user_requested',
      status: 'closed'
    };

    return NextResponse.json(sessionEnd);
  } catch (error) {
    console.error('Erreur fermeture session CODA:', error);
    return NextResponse.json(
      { error: 'Failed to close session' },
      { status: 500 }
    );
  }
}