'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import DeafSocialNetwork from '@/app/modules/protected/user/social/chatRooms';
//import IntegratedPlatformsDashboard from './IntegratedPlatformsDashboard';
import { socialRoutes } from '@/app/modules/protected/user/social/routes';
import Banner from '@/components/ui/banner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import ClubsPage from '../clubs/page';

const SocialPage = () => {
    const router = useRouter();
    return (
        <div className="bg-gray-100">
            <Banner
                title="Réseau Social"
                description="Connectez-vous avec vos amis et votre famille."
                icon={<Users className="text-blue-500" />}
                backHref={ROUTES.HOME}
            />
            <nav className="flex gap-4 mb-6 bg-gray-400">
                <Button onClick={() => router.push(socialRoutes.main)}>Accueil</Button>
                <Button onClick={() => router.push(socialRoutes.friends)}>Amis</Button>
                <Button onClick={() => router.push(socialRoutes.groups)}>Groupes</Button>
                <Button onClick={() => router.push(socialRoutes.events)}>Événements</Button>
            </nav>
            <div className="container px-4 py-4">
                <div className="max-w-5xl mx-auto">
                    <DeafSocialNetwork />
                    <ClubsPage />
                </div>
            </div>
        </div>
    );
};

export default SocialPage;