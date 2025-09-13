import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextResponse } from "next/server"; // ✅ Import correct

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    try {
        const params = await context.params;
        const { vote } = await req.json();

        if (typeof vote !== "boolean") {
            return NextResponse.json({ error: "Vote invalide, attendu true ou false" }, { status: 400 });
        }

        await prisma.artifactVote.upsert({
            where: {
                userId_artifactId: {
                    userId: session.user.id,
                    artifactId: params.id,
                },
            },
            update: { vote },
            create: {
                userId: session.user.id,
                artifactId: params.id,
                vote,
            },
        });

        return NextResponse.json({ message: "Vote enregistré avec succès !" });
    } catch (error) {
        console.error("🚨 Erreur lors de l'enregistrement du vote :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
