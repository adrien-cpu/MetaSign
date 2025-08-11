import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

type UserRole = "USER" | "ADMIN" | "DEVELOPER";

export async function POST(req: NextRequest) {
  try {
    // ✅ Utiliser authOptions au lieu de config
    const session = await getServerSession(authOptions);
    console.log("🔍 Session récupérée :", session);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { userId, newRole } = data;

    if (!userId || !newRole || !["USER", "ADMIN", "DEVELOPER"].includes(newRole)) {
      console.error("❌ Données invalides :", { userId, newRole });
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as UserRole },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    console.log("✅ Utilisateur mis à jour :", updatedUser);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ Erreur interne du serveur :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
