import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface RelationalTabProps {
  prismaUrl: string;
}

interface Status {
  state: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

const RelationalTab: React.FC<RelationalTabProps> = ({ prismaUrl }) => {
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const handleStartPrisma = async () => {
    setStatus({ state: 'loading' });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus({ state: 'success' });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to start Prisma:', error);
        setStatus({ state: 'error', message: error.message || 'Erreur inconnue' });
      } else {
        console.error('Failed to start Prisma:', error);
        setStatus({ state: 'error', message: 'Une erreur inconnue s\'est produite' });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Gestion de Prisma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" onClick={handleStartPrisma} disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Démarrage en cours...' : 'Démarrer Prisma'}
          </Button>
          {status.state === 'success' && <p className="text-green-600">Prisma a démarré avec succès !</p>}
          {status.state === 'error' && <p className="text-red-600">{status.message}</p>}
          <a
            className="text-blue-500 underline"
            href={prismaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Accéder à Prisma Studio
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationalTab;
