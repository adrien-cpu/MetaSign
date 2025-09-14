import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.mentorId?.trim()) {
      return NextResponse.json(
        { error: 'mentorId est requis' },
        { status: 400 }
      );
    }
    
    if (!body.targetLevel?.trim()) {
      return NextResponse.json(
        { error: 'targetLevel est requis' },
        { status: 400 }
      );
    }
    
    // Simulation of session creation with validation
    const session = {
      id: `session_${Date.now()}`,
      mentorId: body.mentorId.trim(),
      status: 'active',
      startTime: new Date().toISOString(),
      targetLevel: body.targetLevel.trim(),
      teachingMethod: body.teachingMethod?.trim() || 'adaptive',
      topic: body.topic?.trim() || 'Session LSF',
      interactions: 0,
      expectedDuration: body.expectedDuration || 30 * 60 * 1000,
      concepts: body.concepts || [],
      materials: body.materials || [],
      tags: body.tags || []
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Erreur création session CODA:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}