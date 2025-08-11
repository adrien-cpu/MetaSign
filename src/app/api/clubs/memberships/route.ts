import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        console.log("❌ Pas de session utilisateur !");
        return NextResponse.json([], { status: 403 });
    }

    try {
        const memberships = await prisma.clubMembership.findMany({
            where: { userId: session.user.id },
            select: { clubId: true },
        });

        console.log("📢 Clubs où l'utilisateur est inscrit :", memberships);

        if (!Array.isArray(memberships)) {
            console.error("🚨 Prisma ne retourne pas un tableau :", memberships);
            return NextResponse.json([]); // Protection anti-erreur
        }

        const clubIds = memberships.map((m) => m.clubId);
        return NextResponse.json(clubIds);
    } catch (error) {
        console.error("🚨 Erreur API récupération des adhésions :", error);
        return NextResponse.json([], { status: 500 });
    }
}
