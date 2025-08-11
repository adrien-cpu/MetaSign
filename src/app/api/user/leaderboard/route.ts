import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const leaderboard = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: { posts: true, votes: true }
                }
            },
            orderBy: {
                posts: { _count: "desc" }
            }
        });

        return NextResponse.json(leaderboard);
    } catch {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
