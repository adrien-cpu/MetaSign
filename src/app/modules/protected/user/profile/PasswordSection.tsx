import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PasswordErrors } from './types';

interface PasswordSectionProps {
    passwordData: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    isPasswordEditing: boolean;
    showPassword: boolean;
    toggleShowPassword: () => void;
    setPasswordData: React.Dispatch<React.SetStateAction<{
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>>;
    passwordError: string | null;
    setPasswordError: React.Dispatch<React.SetStateAction<string | null>>;
    setPasswordErrors: React.Dispatch<React.SetStateAction<PasswordErrors>>;
    setIsPasswordEditing: React.Dispatch<React.SetStateAction<boolean>>;
    handlePasswordEdit: () => void;
    handlePasswordCancel: () => void;
    handlePasswordSave: () => void;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({
    passwordData,
    isPasswordEditing,
    showPassword,
    toggleShowPassword,
    setPasswordData,
    passwordError,
    setPasswordError,
    setPasswordErrors,
    setIsPasswordEditing,
    handlePasswordEdit,
    handlePasswordCancel,
    handlePasswordSave,
}) => {
    const [isVerifying, setIsVerifying] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        specialChar: false,
        uppercase: false,
        number: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        const newPassword = passwordData.newPassword;
        setPasswordCriteria({
            length: newPassword.length >= 8,
            specialChar: /[!@#$%^&*]/.test(newPassword),
            uppercase: /[A-Z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
        });
    }, [passwordData.newPassword]);

    const checkOldPassword = async () => {
        setIsVerifying(true);
        setPasswordError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(ROUTES.VERIFY_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: passwordData.currentPassword }),
            });

            const result = await response.json();

            if (!response.ok) {
                setPasswordError(result.error || "Échec de la vérification.");
                setIsPasswordEditing(false);
            } else {
                handlePasswordEdit();
                setSuccessMessage("Mot de passe correct, vous pouvez le modifier.");
            }
        } catch (error: unknown) {
            console.error("Erreur lors de la vérification du mot de passe:", error);
            setPasswordError("Erreur de connexion au serveur.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setSuccessMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: "Les mots de passe ne correspondent pas.",
            }));
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!passwordCriteria.length || !passwordCriteria.specialChar || !passwordCriteria.uppercase || !passwordCriteria.number) {
            setPasswordErrors((prevErrors) => ({
                ...prevErrors,
                newPassword: "Le mot de passe ne répond pas aux critères requis.",
            }));
            setPasswordError("Le mot de passe ne répond pas aux critères requis.");
            return;
        }

        try {
            const response = await fetch(ROUTES.UPDATE_PASSWORD, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                setPasswordError(result.error);
            } else {
                handlePasswordSave();
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setIsPasswordEditing(false);
                setSuccessMessage("Mot de passe mis à jour avec succès !");
            }
        } catch (error: unknown) {
            console.error("Erreur lors de la mise à jour du mot de passe:", error);
            setPasswordError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modifier le mot de passe</h3>

            {/* Vérification du mot de passe actuel */}
            <div className="flex items-center gap-3">
                <Lock className="h-5 w-5" />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe actuel"
                    value={passwordData.currentPassword}
                    onChange={handleInputChange}
                    className="input"
                    name="currentPassword"
                />
                <button type="button" onClick={toggleShowPassword} className="text-gray-500">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>

            <Button variant="outline" size="sm" onClick={checkOldPassword} disabled={isVerifying}>
                {isVerifying ? "Vérification..." : "Vérifier le mot de passe actuel"}
            </Button>

            {passwordError && <p className="text-red-500">{passwordError}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}

            {/* Si l'ancien mot de passe est correct, afficher les nouveaux champs */}
            {isPasswordEditing && (
                <>
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nouveau mot de passe"
                            value={passwordData.newPassword}
                            onChange={handleInputChange}
                            className="input"
                            name="newPassword"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirmer le mot de passe"
                            value={passwordData.confirmPassword}
                            onChange={handleInputChange}
                            className="input"
                            name="confirmPassword"
                        />
                    </div>

                    {/* Critères du mot de passe */}
                    <div className="text-sm space-y-1">
                        <p className={passwordCriteria.length ? "text-green-600" : "text-red-600"}>
                            ✔ Au moins 8 caractères
                        </p>
                        <p className={passwordCriteria.specialChar ? "text-green-600" : "text-red-600"}>
                            ✔ Au moins un caractère spécial (!@#$%^&*)
                        </p>
                        <p className={passwordCriteria.uppercase ? "text-green-600" : "text-red-600"}>
                            ✔ Au moins une lettre majuscule
                        </p>
                        <p className={passwordCriteria.number ? "text-green-600" : "text-red-600"}>
                            ✔ Au moins un chiffre
                        </p>
                    </div>

                    <Button variant="outline" size="sm" onClick={handlePasswordChange}>
                        Changer le mot de passe
                    </Button>

                    <Button variant="outline" size="sm" onClick={handlePasswordCancel}>
                        Annuler
                    </Button>
                </>
            )}
        </div>
    );
};

export default PasswordSection;
