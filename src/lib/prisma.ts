import { PrismaClient } from '@prisma/client';

// ✅ Déclaration globale correcte pour éviter les erreurs TypeScript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// ✅ Utiliser une seule instance de Prisma en développement
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
