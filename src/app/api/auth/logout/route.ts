// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await prisma.session.delete({
      where: { token }
    });

    return NextResponse.json(
      { message: 'Successfully logged out' }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}