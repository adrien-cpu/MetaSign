'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Languages, GraduationCap, Users, EarOff, Newspaper, Briefcase, Palette, TvMinimalPlay, Plane, Menu } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { usePathname } from "next/navigation";
import { useCardPreferences } from '@/context/CardPreferencesContext';
import { ROUTES } from '@/constants/routes';
import { useScreenSize } from "@/context/ScreenSizeContext";

const menuItems = [
    { id: "traduction", title: "Traduction", text: "Traduire des textes en LSF.", icon: Languages, href: ROUTES.TRANSLATION },
    { id: "learn", title: "Apprentissage", text: "Accédez à vos formations et cours en LSF.", icon: GraduationCap, href: ROUTES.LEARN },
    { id: "socialDashboard", title: "Social", text: "Découvrez les événements et activités communautaires.", icon: Users, href: ROUTES.SOCIAL },
    { id: "facilities", title: "Accessibilité", text: "Trouvez des lieux accessibles en LSF.", icon: EarOff, href: "/modules/facilities" },
    { id: "actualite", title: "Actualités", text: "Restez informé des dernières nouvelles de la communauté sourde.", icon: Newspaper, href: "/modules/actualite" },
    { id: "business", title: "Business", text: "Explorez les opportunités professionnelles.", icon: Briefcase, href: "/modules/business" },
    { id: "culture", title: "Culture", text: "Découvrez la richesse de la culture sourde.", icon: Palette, href: "/modules/culture" },
    { id: "divertissement", title: "Divertissements", text: "Films, musique et loisirs accessibles.", icon: TvMinimalPlay, href: "/modules/divertissement" },
    { id: "voyage", title: "Voyage", text: "Planifiez vos voyages en toute accessibilité.", icon: Plane, href: "/modules/voyage" }
];

const CardsPage = () => {
    const { isMobile } = useScreenSize();
    const pathname = usePathname() ?? "";
    const { preferences, isLoading } = useCardPreferences();
    const [collapsed, setCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(!isMobile); // ✅ Sidebar fermée par défaut sur mobile

    // Réagit aux changements de `isMobile`
    useEffect(() => {
        setIsOpen(!isMobile);
    }, [isMobile]);

    // ✅ Attendre que les préférences soient chargées avant de filtrer
    const activeCards = useMemo(() => {
        if (isLoading) return menuItems;
        return menuItems.filter(feature => preferences[feature.id]);
    }, [preferences, isLoading]);

    // Cacher la sidebar sur certaines pages
    const HIDDEN_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, "/"];
    if (HIDDEN_PATHS.includes(pathname)) return null;

    return (
        <div className="flex h-full relative">
            {/* Barre latérale dynamique */}
            <nav
                className={`bg-slate-900 ${isOpen ? (collapsed ? "w-20" : "w-64") : "w-20"} transition-all duration-300 text-white fixed right-0 flex flex-col overflow-y-auto`}
                style={{ top: "64px", bottom: "64px", zIndex: 30 }}
                onMouseEnter={() => !isMobile && setIsOpen(true)} // ✅ Ouvrir au survol si non mobile
                onMouseLeave={() => !isMobile && setIsOpen(true)} // ✅ Fermer au sortir du survol
            >
                {/* Bouton d'ouverture/fermeture (toujours visible) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-3 mx-auto my-4 rounded-md hover:bg-slate-700 flex items-center justify-center transition-colors duration-200"
                    data-tooltip-id="sidebar-tooltip"
                    data-tooltip-content="Menu thématiques"
                >
                    <Menu className="h-6 w-6" />
                    {!collapsed && <span className="ml-3">Menu thématiques</span>}
                </button>

                {/* Menu - Icônes visibles en mode réduit, descriptions en mode ouvert */}
                <div className="space-y-4 mt-4 flex-1 px-3 overflow-y-auto ">
                    {activeCards.map(({ href, icon: Icon, title, text }, index) => (
                        <Link
                            key={index}
                            href={href}
                            className="flex items-center p-3 rounded-md bg-white hover:bg-slate-400 transition-colors duration-200"
                        >
                            <Icon
                                className="h-6 w-6 text-black"
                                data-tooltip-id="sidebar-tooltip"
                                data-tooltip-content={title}
                            />
                            {/* Titre + Description affichés uniquement si sidebar ouverte */}
                            {!collapsed && isOpen && (
                                <div className="ml-3">
                                    <span className="font-semibold text-black">{title}</span>
                                    <p className="text-xs text-black">{text}</p>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>

            <Tooltip id="sidebar-tooltip" place="left" className="z-50" style={{ zIndex: 50 }} />
        </div>
    );
};

export default CardsPage;
