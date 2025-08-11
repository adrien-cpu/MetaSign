/**
 * @fileoverview Layout principal de l'application MetaSign
 * @path src/app/layout.tsx
 * @description Configuration du layout racine avec Toaster correctement positionné
 * @author MetaSign Team
 * @version 2.1.0
 * @since 2025-01-08
 * 
 * @remarks
 * - Layout racine avec gestion des toasts
 * - Toaster configuré pour éviter la TopBar (z-index: 50)
 * - Support complet de l'internationalisation
 * - Gestion des contextes globaux
 * 
 * @dependencies
 * - next/font/google - Polices Google Fonts
 * - sonner - Système de notifications toast
 * - @/components/ClientLayout - Layout client-side
 * - @/context/* - Contextes globaux de l'application
 */

import { ReactNode } from "react";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import ClientProvider from "@/app/providers/ClientProvider";
import ClientLayout from "@/components/ClientLayout";
import { CardProvider } from '@/context/CardPreferencesContext';
import { NotificationProvider } from "@/context/NotificationContext";
import { ScreenSizeProvider } from "@/context/ScreenSizeContext";

/**
 * Métadonnées de la page principale
 * @constant {Metadata}
 */
export const metadata: Metadata = {
  title: "MetaSign",
  description: "Plateforme de traduction LSF révolutionnaire avec IA avancée",
  keywords: ["LSF", "Langue des Signes", "Traduction", "IA", "Accessibilité"],
  authors: [{ name: "MetaSign Team" }],
  viewport: "width=device-width, initial-scale=1",
};

/**
 * Configuration des polices Google Fonts
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

/**
 * Interface pour les propriétés du layout racine
 * @interface RootLayoutProps
 */
interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Composant de layout racine de l'application
 * 
 * @description Layout principal qui encapsule toute l'application avec :
 * - Configuration des polices
 * - Toaster pour les notifications
 * - Contextes globaux (ScreenSize, Notification, Card, Client)
 * - Layout client-side
 * 
 * @param {RootLayoutProps} props - Propriétés du composant
 * @param {ReactNode} props.children - Contenu enfant à rendre
 * @returns {JSX.Element} Layout racine configuré
 * 
 * @example
 * ```tsx
 * // Le layout est automatiquement utilisé par Next.js
 * export default function Page() {
 *   return <div>Contenu de la page</div>;
 * }
 * ```
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          flex 
          flex-col 
          h-screen 
          bg-gradient-to-br 
          from-slate-50 
          to-slate-100 
          dark:from-slate-900 
          dark:to-slate-800
        `}
      >
        {/* Contextes globaux encapsulés */}
        <ScreenSizeProvider>
          <NotificationProvider>
            <ClientProvider>
              <CardProvider>
                {/* Layout client avec gestion des composants */}
                <ClientLayout>
                  {children}
                </ClientLayout>

                {/* 
                  Toaster configuré pour les notifications
                  - Position: top-center pour visibilité optimale
                  - Offset: 80px pour éviter la TopBar (h-16 = 64px + marge)
                  - Z-index: 9999 pour être au-dessus de tout
                  - Thème adaptatif (clair/sombre)
                */}
                <Toaster
                  position="top-center"
                  offset={80}
                  closeButton
                  richColors
                  expand={true}
                  duration={4000}
                  visibleToasts={5}
                  toastOptions={{
                    className: `
                      z-[9999] 
                      !important 
                      bg-white 
                      dark:bg-slate-800 
                      border 
                      border-slate-200 
                      dark:border-slate-700 
                      shadow-lg 
                      backdrop-blur-sm
                    `,
                    style: {
                      zIndex: 9999,
                      marginTop: '0px',
                    },
                    classNames: {
                      toast: `
                        group 
                        bg-white 
                        dark:bg-slate-800 
                        border-slate-200 
                        dark:border-slate-700 
                        text-slate-900 
                        dark:text-slate-100
                      `,
                      title: 'font-semibold text-slate-900 dark:text-slate-100',
                      description: 'text-slate-600 dark:text-slate-400',
                      success: `
                        bg-emerald-50 
                        dark:bg-emerald-900/20 
                        border-emerald-200 
                        dark:border-emerald-800 
                        text-emerald-800 
                        dark:text-emerald-200
                      `,
                      error: `
                        bg-red-50 
                        dark:bg-red-900/20 
                        border-red-200 
                        dark:border-red-800 
                        text-red-800 
                        dark:text-red-200
                      `,
                      warning: `
                        bg-amber-50 
                        dark:bg-amber-900/20 
                        border-amber-200 
                        dark:border-amber-800 
                        text-amber-800 
                        dark:text-amber-200
                      `,
                      info: `
                        bg-blue-50 
                        dark:bg-blue-900/20 
                        border-blue-200 
                        dark:border-blue-800 
                        text-blue-800 
                        dark:text-blue-200
                      `,
                      closeButton: `
                        bg-slate-100 
                        dark:bg-slate-700 
                        text-slate-500 
                        dark:text-slate-400 
                        hover:bg-slate-200 
                        dark:hover:bg-slate-600
                      `,
                    },
                  }}
                />
              </CardProvider>
            </ClientProvider>
          </NotificationProvider>
        </ScreenSizeProvider>
      </body>
    </html>
  );
}