import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check - return ok status
  // In production, this could check actual CODA services availability
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      coda: 'simulation_mode'
    }
  });
}