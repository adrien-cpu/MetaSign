"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Banner from "@/components/ui/banner";
import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import ProfileFooter from "./ProfileFooter";
import { UserData, PasswordData, PasswordErrors } from "./types";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

const ProfilePage = () => {
    const { data: session, status, update } = useSession();

    // Initialisation avec les données de la session
    const initialUserData: UserData = {
        id: session?.user?.id || "",
        avatar: session?.user?.image || "/ReadyPlayerMe-Avatar.png",
        firstName: session?.user?.firstName || "Utilisateur inconnu",
        createdAt: session?.user?.createdAt || null,
        role: session?.user?.role || "USER",
        email: session?.user?.email || "",
        phone: session?.user?.phone || "",
        location: session?.user?.location || "Nantes, France",
    };

    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [userData, setUserData] = useState<UserData>(initialUserData);
    const [backupUserData, setBackupUserData] = useState<UserData>(initialUserData);
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({
        length: false,
        specialChar: false,
        uppercase: false,
        number: false,
        lowercase: false,
        match: false,
    });

    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Met à jour les données locales lorsque la session change
    useEffect(() => {
        if (session) {
            const updatedUserData: UserData = {
                id: session.user.id,
                avatar: session.user.image || "/ReadyPlayerMe-Avatar.png",
                firstName: session.user.firstName || "Utilisateur inconnu",
                createdAt: session.user.createdAt || null,
                role: session.user.role || "USER",
                email: session.user.email || "",
                phone: session.user.phone || "",
                location: session.user.location || "Nantes, France",
            };
            setUserData(updatedUserData);
            setBackupUserData(updatedUserData);
        }
    }, [session]);

    const handleEdit = () => {
        setBackupUserData(userData);
        setIsEditing(true);
        setProfileError(null);
    };

    const handleCancel = () => {
        setUserData(backupUserData);
        setIsEditing(false);
        setProfileError(null);
    };

    const handleProfileSave = async () => {
        setSuccessMessage(null);
        setProfileError(null);

        try {
            const response = await fetch("/api/user/updateProfile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                setIsEditing(false);
                setSuccessMessage("Profil mis à jour avec succès");

                // Forcer le rafraîchissement du token/session
                await update();

                // Refetch des données utilisateur avec un paramètre pour éviter le cache
                const updatedUserResponse = await fetch(`/api/user/profile?ts=${Date.now()}`);
                if (updatedUserResponse.ok) {
                    const updatedUserData = await updatedUserResponse.json();
                    setUserData(updatedUserData);
                    setBackupUserData(updatedUserData);
                } else {
                    setProfileError("Erreur lors de la récupération des données mises à jour.");
                }
            } else {
                const errorData = await response.json();
                setProfileError(errorData.message || "Erreur lors de la mise à jour du profil.");
            }
        } catch (error) {
            setProfileError("Une erreur s'est produite lors de la requête.");
            console.error(error);
        }
    };

    const handlePasswordSave = async () => {
        try {
            // Réinitialiser les erreurs
            setPasswordError(null);
            setPasswordErrors({
                length: false,
                specialChar: false,
                uppercase: false,
                number: false,
                lowercase: false,
                match: false
            });

            // Valider les critères de mot de passe
            const errors = {
                length: passwordData.newPassword.length < 8,
                specialChar: !/[!@#$%^&*]/.test(passwordData.newPassword),
                uppercase: !/[A-Z]/.test(passwordData.newPassword),
                number: !/[0-9]/.test(passwordData.newPassword),
                lowercase: !/[a-z]/.test(passwordData.newPassword),
                match: passwordData.newPassword !== passwordData.confirmPassword,
            };
            setPasswordErrors(errors);

            // Vérifier s'il y a des erreurs
            if (Object.values(errors).some(error => error)) {
                setPasswordError("Le mot de passe ne répond pas aux critères requis.");
                return;
            }

            // Appel API pour mettre à jour le mot de passe
            const response = await fetch('/api/user/updatePassword', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!response.ok) {
                const data = await response.json();
                setPasswordError(data.message || "Erreur lors de la mise à jour du mot de passe");
                return;
            }

            // Réinitialiser le formulaire après succès
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setIsPasswordEditing(false);
            setSuccessMessage("Mot de passe mis à jour avec succès");

        } catch (error) {
            console.error('Erreur:', error);
            setPasswordError("Une erreur s'est produite lors de la mise à jour du mot de passe");
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    if (status === "loading") return <p>Chargement...</p>;

    return (
        <div>
            <Banner
                title="Profil"
                description="Gérez vos informations personnelles."
                icon={<User className="text-blue-600" />}
                backHref={ROUTES.HOME}
            />

            <div className="max-w-5xl mx-auto">
                <Card>
                    <ProfileHeader userData={userData} />
                    <ProfileContent
                        userData={userData}
                        setUserData={setUserData}
                        isEditing={isEditing}
                        isPasswordEditing={isPasswordEditing}
                        passwordData={passwordData}
                        showPassword={showPassword}
                        toggleShowPassword={toggleShowPassword}
                        setPasswordData={setPasswordData}
                        passwordError={passwordError}
                        setPasswordError={setPasswordError}
                        passwordErrors={passwordErrors} // Ajout de la prop
                        setPasswordErrors={setPasswordErrors}
                        setIsPasswordEditing={setIsPasswordEditing}
                        handlePasswordEdit={() => setIsPasswordEditing(true)}
                        handlePasswordCancel={() => setIsPasswordEditing(false)}
                        handlePasswordSave={handlePasswordSave}
                    />
                    <ProfileFooter
                        isEditing={isEditing}
                        handleEdit={handleEdit}
                        handleCancel={handleCancel}
                        handleProfileSave={handleProfileSave}
                        profileError={profileError}
                        successMessage={successMessage}
                    />
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
