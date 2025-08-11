// page.tsx (modifié pour intégrer CardsPage en sidebar à droite avec ascenseur et bouton d'ouverture/fermeture visible)
'use client';

import React from 'react';
import AvatarPage from './AvatarPage';
import Banner from '@/components/ui/banner';
import { House } from 'lucide-react';


const HomePageContent: React.FC = () => {
    return (
        <div>
            <Banner
                title="MetaSign"
                icon={<House className="text-slate-600" />}
                description="Bienvenue sur la plateforme MetaSign."
                backHref="/modules"
            />

            <div className='justify-items-center justify-center'>
                <AvatarPage />
            </div>

        </div>
    );
};

export default HomePageContent;