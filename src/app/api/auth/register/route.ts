import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, phone, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe sont obligatoires" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "USER",
        profile: {
          create: { firstName, lastName, phone },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ "Erreur lors de l'inscription": error }, { status: 500 });
  }
}
