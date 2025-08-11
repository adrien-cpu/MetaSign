import React from 'react';
import { CardContent } from '@/components/ui/card';
import PasswordSection from './PasswordSection';
import { PasswordErrors, UserData, PasswordData } from './types';
import { Phone, Globe, Mail } from 'lucide-react';

// ✅ Définition des types des props
interface ProfileContentProps {
    userData: UserData;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
    isEditing: boolean;
    isPasswordEditing: boolean;
    passwordData: PasswordData;
    showPassword: boolean;
    toggleShowPassword: () => void;
    setPasswordData: React.Dispatch<React.SetStateAction<PasswordData>>;
    passwordError: string | null;
    setPasswordError: React.Dispatch<React.SetStateAction<string | null>>;
    passwordErrors: PasswordErrors; // Ajout de cette ligne
    setPasswordErrors: React.Dispatch<React.SetStateAction<PasswordErrors>>;
    setIsPasswordEditing: React.Dispatch<React.SetStateAction<boolean>>;
    handlePasswordEdit: () => void;
    handlePasswordCancel: () => void;
    handlePasswordSave: () => void;
}

// ✅ Vérifie que le composant prend bien les bonnes props
const ProfileContent: React.FC<ProfileContentProps> = ({ passwordErrors, ...props }) => {
    return (
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informations Personnelles</h3>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        <input
                            type="text"
                            name="phone"
                            value={props.userData.phone || ''}
                            onChange={(e) => props.setUserData({ ...props.userData, phone: e.target.value })}
                            className="border rounded p-1 w-full text-black"
                            disabled={!props.isEditing}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <input
                            type="text"
                            name="location"
                            value={props.userData.location || ''}
                            onChange={(e) => props.setUserData({ ...props.userData, location: e.target.value })}
                            className="border rounded p-1 w-full text-black"
                            disabled={!props.isEditing}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <input
                            type="email"
                            name="email"
                            value={props.userData.email || ''}
                            onChange={(e) => props.setUserData({ ...props.userData, email: e.target.value })}
                            className="border rounded p-1 w-full text-black"
                            disabled={!props.isEditing}
                        />
                    </div>
                </div>

                <PasswordSection
                    passwordData={props.passwordData}
                    isPasswordEditing={props.isPasswordEditing}
                    showPassword={props.showPassword}
                    toggleShowPassword={props.toggleShowPassword}
                    setPasswordData={props.setPasswordData}
                    passwordError={props.passwordError}
                    setPasswordError={props.setPasswordError}
                    setPasswordErrors={props.setPasswordErrors}
                    setIsPasswordEditing={props.setIsPasswordEditing}
                    handlePasswordEdit={props.handlePasswordEdit}
                    handlePasswordCancel={props.handlePasswordCancel}
                    handlePasswordSave={props.handlePasswordSave}
                />
            </div>
            {props.isPasswordEditing && (
                <div className="space-y-2 text-sm text-red-500">
                    {passwordErrors.length && <p>Le mot de passe doit contenir au moins 8 caractères</p>}
                    {passwordErrors.specialChar && <p>Le mot de passe doit contenir au moins un caractère spécial</p>}
                    {passwordErrors.uppercase && <p>Le mot de passe doit contenir au moins une majuscule</p>}
                    {passwordErrors.number && <p>Le mot de passe doit contenir au moins un chiffre</p>}
                    {passwordErrors.lowercase && <p>Le mot de passe doit contenir au moins une minuscule</p>}
                    {passwordErrors.match && <p>Les mots de passe ne correspondent pas</p>}
                </div>
            )}
        </CardContent>
    );
};

export default ProfileContent;
