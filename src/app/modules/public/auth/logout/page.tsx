"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from '@/constants/routes';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut({ redirect: false }); // ✅ Déconnecte proprement sans redirection forcée
        router.push("/auth/login"); // ✅ Redirige après la déconnexion
      } catch (error) {
        console.error("❌ Erreur de déconnexion :", error);
        router.push(ROUTES.LOGIN);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Déconnexion en cours...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
