// src/app/api/admin/nodes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const nodes = await prisma.node.findMany({
      orderBy: {
        lastPing: 'desc'
      }
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Failed to fetch nodes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}