// LSFAvatar.js
import React from 'react';
import { Button } from '@/components/ui/button'; // Assurez-vous d'importer le composant Button
import { VolumeX, Volume2 } from 'lucide-react'; // Assurez-vous d'importer les icônes
import Image from "next/image";

const LSFAvatar = ({ avatarVisible, setAvatarVisible }) => (
    <div className="fixed bottom-24 right-24 bg-slate-800 p-4 rounded-lg shadow-lg z-50">
        <div className="w-64 h-64 bg-gray-200 rounded-full mb-2">
            {/* Placeholder pour l'avatar MetaSign */}
            <Image src="/avatar-placeholder.png" width={300} height={300} alt="MetaSign Avatar" className="rounded-full" />
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={() => setAvatarVisible(!avatarVisible)}
            className="w-full"
        >
            {avatarVisible ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-" />}
        </Button>
    </div>
);

export default LSFAvatar;
