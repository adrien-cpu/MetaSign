import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProfileFooterProps {
    isEditing: boolean;
    handleEdit: () => void;
    handleCancel: () => void;
    handleProfileSave: () => void;
    profileError: string | null;
    successMessage: string | null;
}

const ProfileFooter: React.FC<ProfileFooterProps> = ({
    isEditing,
    handleEdit,
    handleCancel,
    handleProfileSave,
    profileError,
    successMessage,
}) => {
    return (
        <CardFooter className="flex justify-between">
            {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                    Modifier le Profil
                </Button>
            ) : (
                <>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        Annuler
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleProfileSave}>
                        Sauvegarder
                    </Button>
                </>
            )}
            {profileError && <p className="text-red-500">{profileError}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
        </CardFooter>
    );
};

export default ProfileFooter;
