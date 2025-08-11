import React from 'react';
import { Phone, Globe, Mail } from "lucide-react";
import { UserData } from './types';

interface PersonalInfoProps {
    userData: UserData;
    isEditing: boolean;
    setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ userData, isEditing, setUserData }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations Personnelles</h3>
            <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    className="border rounded p-1 w-full text-black"
                    disabled={!isEditing}
                />
            </div>
            <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <input
                    type="text"
                    name="location"
                    value={userData.location}
                    onChange={handleChange}
                    className="border rounded p-1 w-full text-black"
                    disabled={!isEditing}
                />
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="border rounded p-1 w-full text-black"
                    disabled={!isEditing}
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
