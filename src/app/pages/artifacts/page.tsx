'use client';

import { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import Image from "next/image";

interface Club {
    id: string;
    name: string;
    description?: string;
    memberCount: number;
}

interface Artifact {
    id: string;
    title: string;
    description?: string;
    mediaUrl?: string;
    validated: boolean;
    ownerEmail: string; // Ajout de l'email du propriétaire
}

export default function ClubsAndArtifacts() {
    const { data: session, status } = useSession();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClub, setSelectedClub] = useState<string | null>(null);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/clubs")
                .then((res) => res.json())
                .then((data) => {
                    setClubs(data);
                    setLoading(false);
                });
        }
    }, [status]);

    const joinClub = async (clubId: string) => {
        if (status !== "authenticated") {
            alert("Vous devez être connecté pour rejoindre un club.");
            return;
        }
        const response = await fetch(`/api/clubs/${clubId}/join`, {
            method: "POST",
        });
        if (response.ok) {
            alert("Inscription réussie !");
        } else {
            alert("Erreur lors de l'inscription");
        }
    };

    const fetchArtifacts = async (clubId: string) => {
        if (status !== "authenticated") {
            alert("Vous devez être connecté pour voir les artefacts.");
            return;
        }
        setSelectedClub(clubId);
        setLoading(true);
        fetch(`/api/clubs/${clubId}/artifacts`)
            .then((res) => res.json())
            .then((data) => {
                setArtifacts(data);
                setLoading(false);
            });
    };

    if (status === "loading") return <p>Chargement...</p>;
    if (status !== "authenticated") return <p>Veuillez vous connecter pour voir cette page.</p>;

    // 🔥 Filtrer les artefacts appartenant à l'utilisateur connecté
    const userArtifacts = artifacts.filter(
        (artifact) => artifact.ownerEmail === session?.user?.email
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center">
                <User className="mr-2" /> Clubs
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                    <Card key={club.id}>
                        <CardHeader>
                            <CardTitle>{club.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{club.description}</p>
                            <p className="text-sm text-gray-500">{club.memberCount} membres</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => fetchArtifacts(club.id)}>
                                Voir les artefacts
                            </Button>
                            <Button variant="default" onClick={() => joinClub(club.id)}>
                                Rejoindre
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {selectedClub && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Mes Artefacts</h2>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : userArtifacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userArtifacts.map((artifact) => (
                                <Card key={artifact.id}>
                                    <CardHeader>
                                        <CardTitle>{artifact.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{artifact.description}</p>
                                        {artifact.mediaUrl && (
                                            <Image
                                                src={artifact.mediaUrl}
                                                alt={artifact.title}
                                                width={100}
                                                height={100}
                                                className="rounded"
                                            />
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="default">Voter</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>Aucun artefact trouvé.</p>
                    )}
                </div>
            )}
        </div>
    );
}
