import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
        }

        const { firstName, email, phone, location } = await req.json();

        // Vérification des valeurs reçues
        if (!firstName || !email) {
            return NextResponse.json({ error: "Les champs obligatoires sont manquants" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                email,
                profile: { update: { firstName, phone, location } }
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("❌ Erreur API update-profile :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
