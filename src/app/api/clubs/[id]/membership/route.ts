/**
 * @fileoverview API route pour gérer l'adhésion à un club
 * @path src/app/api/clubs/[id]/membership/route.ts
 * @description Endpoint pour rejoindre ou quitter un club avec gestion complète des erreurs
 * @author MetaSign Team
 * @version 2.1.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Gestion du toggle membership (rejoindre/quitter)
 * - Validation stricte des paramètres
 * - Gestion complète des erreurs TypeScript
 * - Support des caractères spéciaux dans les IDs
 * - Logs détaillés pour le debugging
 * 
 * @dependencies
 * - @/lib/prisma - Client Prisma pour la base de données
 * - next/server - NextResponse pour les réponses HTTP
 * - next-auth/next - Gestion de l'authentification
 * - @/app/api/auth/[...nextauth]/authOptions - Configuration NextAuth
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * Interface pour la réponse d'adhésion au club
 * @interface ClubMembershipResponse
 */
interface ClubMembershipResponse {
    success: boolean;
    data: {
        action: 'joined' | 'left';
    };
    message: string;
}

/**
 * Interface pour la réponse d'erreur
 * @interface ErrorResponse
 */
interface ErrorResponse {
    error: string;
}

/**
 * Type de réponse pour l'endpoint membership
 * @typedef {ClubMembershipResponse | ErrorResponse} MembershipResponseType
 */
type MembershipResponseType = ClubMembershipResponse | ErrorResponse;

/**
 * POST /api/clubs/[id]/membership
 * 
 * @description Rejoint ou quitte un club (toggle membership)
 * @param {Request} req - Requête HTTP
 * @param {Object} context - Contexte avec les paramètres de route
 * @param {Object} context.params - Paramètres de route
 * @param {string} context.params.id - ID du club (encodé URL)
 * @returns {Promise<NextResponse<MembershipResponseType>>} Réponse avec le statut de l'adhésion
 * 
 * @example
 * ```typescript
 * // Rejoindre/quitter un club
 * const response = await fetch('/api/clubs/123/membership', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * 
 * const result = await response.json();
 * console.log(result.data.action); // 'joined' ou 'left'
 * ```
 * 
 * @throws {401} Utilisateur non connecté
 * @throws {404} Club ou utilisateur introuvable
 * @throws {409} Contrainte d'unicité violée
 * @throws {500} Erreur serveur interne
 */
export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse<MembershipResponseType>> {
    try {
        // Décoder l'ID pour gérer les caractères spéciaux
        const params = await context.params;
        const clubId = decodeURIComponent(params.id);

        console.log('🔍 API Membership: Club ID:', clubId);
        console.log('🔍 API Membership: ID original:', params.id);

        // Récupérer la session utilisateur avec validation stricte
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.log('❌ Utilisateur non connecté');
            return NextResponse.json(
                { error: "Vous devez être connecté pour rejoindre un club" } satisfies ErrorResponse,
                { status: 401 }
            );
        }

        console.log('🔍 API Membership: User email:', session.user.email);

        // Vérifier que le club existe avec une requête optimisée
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            select: {
                id: true,
                name: true
            }
        });

        if (!club) {
            console.log('❌ Club non trouvé:', clubId);
            return NextResponse.json(
                { error: "Club introuvable" } satisfies ErrorResponse,
                { status: 404 }
            );
        }

        // Récupérer l'utilisateur par email avec sélection stricte
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                email: true
            }
        });

        if (!user) {
            console.log('❌ Utilisateur non trouvé en base:', session.user.email);
            return NextResponse.json(
                { error: "Utilisateur introuvable" } satisfies ErrorResponse,
                { status: 404 }
            );
        }

        console.log('🔍 API Membership: User ID:', user.id);

        // Vérifier si l'utilisateur est déjà membre avec optimisation
        const existingMembership = await prisma.clubMembership.findUnique({
            where: {
                userId_clubId: {
                    userId: user.id,
                    clubId: clubId
                }
            },
            select: {
                userId: true,
                clubId: true
            }
        });

        let action: 'joined' | 'left';

        if (existingMembership) {
            // L'utilisateur est membre → le retirer
            await prisma.clubMembership.delete({
                where: {
                    userId_clubId: {
                        userId: user.id,
                        clubId: clubId
                    }
                }
            });
            action = 'left';
            console.log('✅ Utilisateur retiré du club:', user.email, '→', club.name);
        } else {
            // L'utilisateur n'est pas membre → l'ajouter
            await prisma.clubMembership.create({
                data: {
                    userId: user.id,
                    clubId: clubId,
                    joinedAt: new Date()
                }
            });
            action = 'joined';
            console.log('✅ Utilisateur ajouté au club:', user.email, '→', club.name);
        }

        // Réponse typée et structurée
        const response: ClubMembershipResponse = {
            success: true,
            data: { action },
            message: action === 'joined'
                ? `Vous avez rejoint le club "${club.name}"`
                : `Vous avez quitté le club "${club.name}"`
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("🚨 Erreur API membership :", error);

        // Gestion d'erreur plus spécifique et typée
        if (error instanceof Error) {
            // Erreur de contrainte d'unicité Prisma
            if (error.message.includes('Unique constraint')) {
                return NextResponse.json(
                    { error: "Vous êtes déjà membre de ce club" } satisfies ErrorResponse,
                    { status: 409 }
                );
            }

            // Erreur de contrainte de clé étrangère
            if (error.message.includes('Foreign key constraint')) {
                return NextResponse.json(
                    { error: "Club ou utilisateur introuvable" } satisfies ErrorResponse,
                    { status: 404 }
                );
            }

            // Erreur de validation Prisma
            if (error.message.includes('Invalid') || error.message.includes('validation')) {
                return NextResponse.json(
                    { error: "Données invalides fournies" } satisfies ErrorResponse,
                    { status: 400 }
                );
            }
        }

        // Erreur générique pour les cas non couverts
        return NextResponse.json(
            { error: "Erreur serveur lors de la mise à jour de l'adhésion" } satisfies ErrorResponse,
            { status: 500 }
        );
    }
}