'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { socialRoutes } from '../routes';

export const SocialNavigation = () => {
    const router = useRouter();

    return (
        <nav className="flex gap-4 mb-6">
            <Button onClick={() => router.push(socialRoutes.main)}>Accueil</Button>
            <Button onClick={() => router.push(socialRoutes.friends)}>Amis</Button>
            <Button onClick={() => router.push(socialRoutes.groups)}>Groupes</Button>
            <Button onClick={() => router.push(socialRoutes.events)}>Événements</Button>
        </nav>
    );
};