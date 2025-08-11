import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params; // Correction ID
    const { vote } = await req.json(); // true = approuvé, false = rejeté
    const userId = session.user.id;

    try {
        // Vérifier si l'utilisateur a déjà voté
        const existingVote = await prisma.correctionVote.findUnique({
            where: { userId_correctionId: { userId, correctionId: id } },
        });

        if (existingVote) {
            return NextResponse.json({ message: "Vous avez déjà voté !" }, { status: 400 });
        }

        // Ajouter le vote
        await prisma.correctionVote.create({
            data: { userId, correctionId: id, vote },
        });

        // Recalculer le pourcentage de votes positifs
        const votes = await prisma.correctionVote.findMany({
            where: { correctionId: id },
        });

        const totalVotes = votes.length;
        const positiveVotes = votes.filter(v => v.vote).length;
        const approvalPercentage = (positiveVotes / totalVotes) * 100;

        // Valider la correction si plus de 80% des membres l'approuvent
        if (approvalPercentage >= 80) {
            await prisma.glossaryCorrection.update({
                where: { id },
                data: { status: "APPROVED" },
            });

            // TODO : Envoyer la correction validée à l'IA
        }

        return NextResponse.json({ message: "Vote enregistré", approvalPercentage });
    } catch (error) {
        console.error("Erreur API :", error); // ✅ Utilisation de error
        return NextResponse.json({ error: "Erreur lors du vote" }, { status: 500 });
    }

}
