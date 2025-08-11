import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // ✅ Récupération de `userId`

    try {
        const userPreferences = await prisma.userPreferences.findUnique({
            where: { userId },
        });

        return NextResponse.json({ preferences: userPreferences?.preferences || {} });
    } catch (error) {
        console.error("🚨 Erreur lors de la récupération des préférences :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { preferences } = await req.json();

    console.log("📥 Données reçues pour mise à jour :", { userId, preferences });

    try {
        let updatedPreferences;

        const existingPreferences = await prisma.userPreferences.findUnique({
            where: { userId },
        });

        if (existingPreferences) {
            updatedPreferences = await prisma.userPreferences.update({
                where: { userId },
                data: { preferences },
            });
        } else {
            updatedPreferences = await prisma.userPreferences.create({
                data: { userId, preferences },
            });
        }

        console.log("✅ Préférences mises à jour en base :", updatedPreferences);

        return NextResponse.json({ message: "Preferences updated", preferences: updatedPreferences });
    } catch (error) {
        console.error("🚨 Erreur Prisma :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
