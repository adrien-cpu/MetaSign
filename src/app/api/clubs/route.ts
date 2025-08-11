/**
 * @fileoverview API route pour récupérer la liste des clubs
 * @path src/app/api/clubs/route.ts
 * @description Endpoint pour récupérer tous les clubs disponibles
 * @author MetaSign Team
 * @version 2.0.0
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/clubs
 * Récupère la liste de tous les clubs
 */
export async function GET(): Promise<NextResponse> {
    try {
        console.log('🔍 API: Récupération de la liste des clubs');

        const clubs = await prisma.club.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                createdAt: true,
                // Compter les membres via la relation
                members: {
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Formater la réponse avec le nombre de membres calculé
        const formattedClubs = clubs.map(club => ({
            id: club.id,
            name: club.name,
            description: club.description,
            memberCount: club.members.length, // Calculer depuis la relation
            type: club.type || 'general',
            category: 'general',
            isActive: true,
            lastActivity: '1 jour'
        }));

        console.log(`✅ ${clubs.length} clubs récupérés`);
        return NextResponse.json(formattedClubs);

    } catch (error) {
        console.error("🚨 Erreur API récupération des clubs :", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des clubs" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/clubs
 * Crée un nouveau club (optionnel pour plus tard)
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body = await req.json();
        const { name, description, type } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Le nom du club est requis" },
                { status: 400 }
            );
        }

        const club = await prisma.club.create({
            data: {
                name,
                description,
                type: type || 'general'
            }
        });

        console.log('✅ Nouveau club créé:', club.name);
        return NextResponse.json(club, { status: 201 });

    } catch (error) {
        console.error("🚨 Erreur API création de club :", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la création du club" },
            { status: 500 }
        );
    }
}