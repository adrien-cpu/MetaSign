import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        console.log("📩 Requête reçue pour vérification du mot de passe");

        const session = await getServerSession(authOptions);
        console.log("🔑 Session utilisateur :", session);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
        }

        const { currentPassword } = await req.json();
        console.log("📦 Mot de passe reçu :", currentPassword ? "Oui" : "Non");

        if (!currentPassword) {
            return NextResponse.json({ error: "Le mot de passe est requis." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log("🔍 Résultat de la vérification :", isMatch);

        if (!isMatch) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Mot de passe correct." });
    } catch (error) {
        console.error("❌ Erreur API verify-password :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
