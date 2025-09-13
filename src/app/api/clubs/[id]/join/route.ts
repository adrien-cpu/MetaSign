import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    const params = await context.params;
    const userId = session.user.id;
    const clubId = params.id;

    try {
        // Vérifier si l'utilisateur est déjà membre
        const existingMembership = await prisma.clubMembership.findUnique({
            where: { userId_clubId: { userId, clubId } },
        });

        if (existingMembership) {
            // ❌ L'utilisateur est déjà membre → on le supprime (désinscription)
            await prisma.clubMembership.delete({
                where: { id: existingMembership.id },
            });
            console.log("👋 Désinscription du club :", clubId);
            return NextResponse.json({ message: "Désinscription réussie", action: "left" });
        } else {
            // ✅ L'utilisateur n'est pas membre → on l'ajoute (inscription)
            await prisma.clubMembership.create({
                data: { userId, clubId },
            });
            console.log("✅ Inscription au club :", clubId);
            return NextResponse.json({ message: "Inscription réussie", action: "joined" });
        }
    } catch (error) {
        console.error("🚨 Erreur API d'inscription au club :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
