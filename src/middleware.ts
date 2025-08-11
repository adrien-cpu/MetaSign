import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ✅ Routes publiques accessibles sans connexion
const publicRoutes = ["/", "/modules/public/auth/login", "/modules/public/auth/register"];

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

// ✅ Appliquer le middleware à toutes les pages SAUF `/auth/*`, `/api/*`, et fichiers Next.js
export const config = {
  matcher: ["/((?!auth|api|_next/static|_next/image|favicon.ico).*)"],
};
