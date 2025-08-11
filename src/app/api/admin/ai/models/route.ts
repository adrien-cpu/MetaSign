// src/app/api/admin/ai/models/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    return NextResponse.json(models);
  } catch (error) {
    console.error('Failed to fetch AI models:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const model = await prisma.aIModel.create({
      data: {
        name: data.name,
        type: data.type,
        version: data.version,
        configuration: data.configuration
      }
    });
    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error('Failed to create AI model:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}