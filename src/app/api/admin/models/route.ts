import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Utility function for error handling
const withErrorHandling = async <T>(fn: () => Promise<T>) => {
  try {
    const result = await fn();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

// Example handler for managing AI models
const handler = async () => {
  const fetchModels = async (): Promise<{ models: string[] }> => {
    const models = await prisma.aiModel.findMany(); // Utilisez le nouveau modèle AiModel
    return { models: models.map((model: { name: string }) => model.name) };
  };

  return withErrorHandling(fetchModels);
};

export { handler };
