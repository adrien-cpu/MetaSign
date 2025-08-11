import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // ✅ Assure-toi que l'import est correct

interface CorrectionRequest {
    sign: string;
    incorrectTranslation: string;
    suggestedCorrection: string;
    clubId: string;
}

// ✅ Ajout de la méthode GET pour récupérer les corrections
export async function GET() {
    try {
        const corrections = await prisma.glossaryCorrection.findMany();

        if (!corrections || corrections.length === 0) {
            console.warn("🚨 Aucune correction trouvée !");
            return NextResponse.json([], { status: 200 }); // ✅ Retourne un tableau vide si aucune correction
        }

        return NextResponse.json(corrections);
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// ✅ POST pour ajouter une correction
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    try {
        const body = await req.json();
        console.log("📥 Données reçues :", body);

        if (!body?.sign || !body?.incorrectTranslation || !body?.suggestedCorrection || !body?.clubId) {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }

        const { sign, incorrectTranslation, suggestedCorrection, clubId }: CorrectionRequest = body;

        const correction = await prisma.glossaryCorrection.create({
            data: {
                sign,
                incorrectTranslation,
                suggestedCorrection,
                clubId,
                status: "PENDING",
            },
        });

        console.log("✅ Correction ajoutée avec succès :", correction);
        return NextResponse.json(correction);

    } catch (error) {
        if (error instanceof Error) {
            console.error("🚨 Erreur Prisma :", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Erreur serveur inconnue" }, { status: 500 });
    }
}
