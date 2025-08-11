import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const { removedCards } = await req.json();

        if (!Array.isArray(removedCards) || removedCards.length === 0) {
            return NextResponse.json({ error: "Aucune carte à supprimer" }, { status: 400 });
        }

        console.log("🗑 Suppression des cartes en base :", removedCards);

        // Récupérer les préférences actuelles de l'utilisateur
        const userPreferences = await prisma.userPreferences.findUnique({
            where: { userId: session.user.id },
        });

        if (userPreferences) {
            // ✅ Convertir en objet TypeScript
            const currentPreferences = userPreferences.preferences as Record<string, boolean>;

            // ✅ Vérifier si c'est bien un objet avant d'utiliser `...`
            if (typeof currentPreferences === "object" && currentPreferences !== null) {
                const newPreferences = { ...currentPreferences };
                removedCards.forEach(card => delete newPreferences[card]);

                await prisma.userPreferences.update({
                    where: { userId: session.user.id },
                    data: { preferences: newPreferences },
                });

                console.log("✅ Cartes supprimées en base :", removedCards);
            } else {
                console.error("🚨 `preferences` n'est pas un objet valide :", currentPreferences);
            }
        }

        return NextResponse.json({ message: "Cartes supprimées avec succès" }, { status: 200 });
    } catch (error) {
        console.error("🚨 Erreur lors de la suppression des cartes :", error);
        return NextResponse.json({ error: "Erreur serveur", details: error }, { status: 500 });
    }
}
