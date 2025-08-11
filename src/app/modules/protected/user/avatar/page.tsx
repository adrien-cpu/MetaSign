'use client';

import React from 'react';
import { Smile } from 'lucide-react';
import AvatarCreator from '@/components/avatar/AvatarCreator';
import Banner from '@/components/ui/banner';
import { ROUTES } from '@/constants/routes';

const AvatarPage: React.FC = () => {
    return (
        <div>
            <Banner
                title="Avatar Creator"
                description="Create your own avatar."
                icon={<Smile className="text-orange-600" />}
                backHref={ROUTES.USER_DASHBOARD}
            />
            <div>
                {/* Avatar Creator */}

                <AvatarCreator />

            </div>
        </div>
    );
};

export default AvatarPage;
