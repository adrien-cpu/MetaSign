import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params; // Artifact ID
    const { vote } = await req.json();

    // ✅ Vérification que `vote` est bien `true` ou `false`
    if (typeof vote !== "boolean") {
        return NextResponse.json({ error: "Le vote doit être un booléen (true ou false)" }, { status: 400 });
    }

    const userId = session.user.id;

    try {
        // ✅ Vérifier si l'utilisateur a déjà voté
        const existingVote = await prisma.artifactVote.findUnique({
            where: { userId_artifactId: { userId, artifactId: id } },
        });

        if (existingVote) {
            return NextResponse.json({ message: "Vous avez déjà voté !" }, { status: 400 });
        }

        // ✅ Ajouter le vote
        await prisma.artifactVote.create({
            data: { userId, artifactId: id, vote },
        });

        // ✅ Recalculer le pourcentage de votes positifs
        const votes = await prisma.artifactVote.findMany({
            where: { artifactId: id },
        });

        const totalVotes = votes.length;
        const positiveVotes = votes.filter(v => v.vote).length;
        const approvalPercentage = (positiveVotes / totalVotes) * 100;

        // ✅ Valider l'artefact si plus de 80% des membres l'approuvent
        if (approvalPercentage >= 80) {
            await prisma.artifact.update({
                where: { id: id }, // ✅ Correction de l'erreur ici
                data: { validated: true },
            });

            // TODO : Envoyer l'artefact validé à l'IA
        }

        return NextResponse.json({ message: "Vote enregistré", approvalPercentage });
    } catch (error) {
        console.error("Erreur API :", error);
        return NextResponse.json({ error: "Erreur lors de la requête" }, { status: 500 });
    }
}
