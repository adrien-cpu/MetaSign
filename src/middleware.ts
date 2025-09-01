/**
 * @fileoverview Middleware Next.js pour la gestion de l'authentification et l'autorisation des routes
 * @module middleware
 * @description Ce middleware intercepte toutes les requêtes et vérifie l'authentification
 * de l'utilisateur avant d'autoriser l'accès aux routes protégées.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/** 
 * Routes publiques accessibles sans connexion 
 * @constant {string[]}
 */
const publicRoutes = ["/", "/modules/public/auth/login", "/modules/public/auth/register"];

/**
 * Middleware principal pour la gestion de l'authentification
 * @async
 * @function middleware
 * @param {NextRequest} request - L'objet de requête Next.js
 * @returns {Promise<NextResponse>} Réponse Next.js (redirection ou poursuite)
 * @description
 * Ce middleware :
 * - Autorise l'accès aux fichiers statiques
 * - Autorise l'accès aux routes publiques
 * - Vérifie l'authentification pour les routes protégées
 * - Redirige vers la page de connexion si non authentifié
 * - Gère la persistance de session selon l'option "Se souvenir de moi"
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  console.log(`🛑 Middleware activé pour : ${path}`);

  // ✅ Autoriser les fichiers statiques (évite de bloquer les images et CSS)
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/public") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".svg") ||
    path.endsWith(".ico") ||
    path.endsWith(".css") ||
    path.endsWith(".webp")
  ) {
    console.log(`✅ Fichier statique détecté, autorisé : ${path}`);
    return NextResponse.next();
  }

  // ✅ Autoriser les routes publiques
  if (publicRoutes.includes(path)) {
    console.log(`✅ Route publique détectée, accès autorisé : ${path}`);
    return NextResponse.next();
  }

  // ✅ Vérifier si l'utilisateur est authentifié
  const token = await getToken({ req: request });

  if (!token) {
    console.log(`🚨 UTILISATEUR NON CONNECTÉ : Redirection vers /auth/login`);
    return NextResponse.redirect(new URL("/modules/public/auth/login", request.nextUrl.origin));
  }

  // ✅ Si l'utilisateur n'a PAS coché "Se souvenir de moi", forcer expiration à la fermeture du navigateur
  if (!token.rememberMe) {
    request.cookies.delete("__Secure-next-auth.session-token");

  }
  console.log(`✅ UTILISATEUR CONNECTÉ : ${token.email}`);

  return NextResponse.next();
}

/**
 * Configuration du middleware Next.js
 * @constant {Object} config
 * @property {string[]} matcher - Patterns de routes où appliquer le middleware
 * @description
 * Le middleware est appliqué à toutes les pages SAUF :
 * - Routes d'authentification (`/auth/*`)
 * - Routes API (`/api/*`) 
 * - Fichiers statiques Next.js (`/_next/static`, `/_next/image`)
 * - Favicon et autres assets
 */
export const config = {
  matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
