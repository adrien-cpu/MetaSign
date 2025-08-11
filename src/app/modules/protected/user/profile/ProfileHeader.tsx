import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { UserData } from './types';

interface ProfileHeaderProps {
    userData: UserData;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Date inconnue";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <CardHeader className="flex flex-col items-center p-6">
            <CardTitle>
                <Image
                    src={userData.avatar}
                    alt="Avatar"
                    width={300}
                    height={300}
                    className="w-20 h-20 rounded-full border-b"
                />
            </CardTitle>
            <h1 className="text-2xl font-bold mt-4">{userData.firstName}</h1>
            <p className="text-base">Inscrit depuis le {formatDate(userData.createdAt)}</p>
            <p className="text-base">Rôle : {userData.role}</p> {/* Affiche le rôle de l'utilisateur */}
        </CardHeader>
    );
};

export default ProfileHeader;
