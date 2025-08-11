'use client';

import { createContext, useContext, useEffect, useState } from "react";

const ScreenSizeContext = createContext<{ isMobile: boolean }>({ isMobile: false });

export const ScreenSizeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768); // 📏 Définit si c'est mobile (768px = Tailwind `md`)
        };

        checkScreenSize(); // Vérifie à l'initialisation
        window.addEventListener("resize", checkScreenSize); // Écoute les changements

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    return (
        <ScreenSizeContext.Provider value={{ isMobile }}>
            {children}
        </ScreenSizeContext.Provider>
    );
};

// Hook personnalisé pour l'utiliser facilement
export const useScreenSize = () => useContext(ScreenSizeContext);
