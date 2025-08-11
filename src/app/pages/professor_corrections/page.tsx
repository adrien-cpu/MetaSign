'use client';
import { useEffect, useState } from "react";

interface Correction {
    id: string;
    sign: string;
    incorrectTranslation: string;
    suggestedCorrection: string;
}

export default function ProfessorCorrections() {
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [loading, setLoading] = useState(true);

    const voteCorrection = async (correctionId: string, vote: boolean) => {
        console.log(`🗳 Vote pour correction ${correctionId} : ${vote ? "Acceptée" : "Rejetée"}`);
        try {
            const response = await fetch(`/api/corrections/${correctionId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vote }),
            });

            if (response.ok) {
                console.log("✅ Vote enregistré !");
                setCorrections(prev => prev.filter(correction => correction.id !== correctionId));
            } else {
                console.error("❌ Erreur lors du vote");
            }
        } catch (error) {
            console.error("🚨 Erreur lors du vote :", error);
        }
    };

    useEffect(() => {
        fetch("/api/clubs/professeur/corrections")
            .then((res) => {
                if (!res.ok) {
                    console.error(`🚨 Erreur API: ${res.status} ${res.statusText}`);
                    setLoading(false);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setCorrections(data);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("❌ Erreur lors du chargement des corrections :", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Chargement...</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                {corrections.length > 0 ? "Corrections en attente" : "Aucune correction en attente"}
            </h1>
            {corrections.length > 0 ? (
                <ul>
                    {corrections.map((correction) => (
                        <li key={correction.id} className="p-4 border rounded mb-2 flex justify-between">
                            <div>
                                <h2 className="font-semibold">Signe : {correction.sign}</h2>
                                <p><strong>Incorrect :</strong> {correction.incorrectTranslation}</p>
                                <p><strong>Proposition :</strong> {correction.suggestedCorrection}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => voteCorrection(correction.id, true)}
                                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    ✅ Accepter
                                </button>
                                <button
                                    onClick={() => voteCorrection(correction.id, false)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    ❌ Rejeter
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Il n&apos;y a actuellement aucune correction en attente.</p>
            )}
        </div>
    );
}
