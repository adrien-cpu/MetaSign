import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = params; // Club ID
    console.log("Club ID reçu :", id);

    try {
        const { title, description, mediaUrl } = await req.json();

        const artifact = await prisma.artifact.create({
            data: {
                title,
                description,
                mediaUrl,
                clubId: id,
            },
        });

        return NextResponse.json(artifact);
    } catch (error) {
        console.error("Error creating artifact:", error);
        return NextResponse.json({ error: "Erreur lors de l'ajout de l'artefact" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const artifacts = await prisma.artifact.findMany({
            where: { clubId: params.id },
        });

        return NextResponse.json(artifacts);
    } catch (error) {
        console.error("Error retrieving artifacts:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des artefacts" }, { status: 500 });
    }
}