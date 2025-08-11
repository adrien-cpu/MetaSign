import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            console.error("🔴 Erreur : Accès non autorisé");
            return NextResponse.json({ error: "Accès non autorisé" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            console.error("🔴 Erreur : Champs manquants", { currentPassword, newPassword });
            return NextResponse.json({ error: "Les champs obligatoires sont manquants" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            console.error("🔴 Erreur : Utilisateur non trouvé");
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.error("🔴 Erreur : Mot de passe actuel incorrect");
            return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
        }

        // Hashage du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("🟢 Nouveau mot de passe hashé :", hashedPassword);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        console.log("✅ Mot de passe mis à jour avec succès");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Erreur serveur update-password :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
