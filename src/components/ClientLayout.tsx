'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import BottomBar from '@/components/navigation/BottomBar';
import CardsPage from '@/components/navigation/CardsPage';
import TopBar from '@/components/navigation/TopBar';
import LayoutWrapper from '@/components/ui/LayoutWrapper';
import { Preferences } from '@/types/settings';
import { LearningProvider } from '@/context/learningContext';
import Link from 'next/link';

interface ClientLayoutProps {
    children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
    const [preferences, setPreferences] = useState<Preferences | null>(null);

    useEffect(() => {
        const fetchPreferences = () => {
            try {
                const storedPreferences = localStorage.getItem('preferences');
                if (storedPreferences) {
                    const parsedPreferences = JSON.parse(storedPreferences);
                    if (typeof parsedPreferences === 'object' && parsedPreferences !== null) {
                        setPreferences(parsedPreferences as Preferences);
                    }
                }
            } catch (error) {
                console.error('Error parsing stored preferences:', error);
            }
        };
        fetchPreferences();
    }, []);

    if (!preferences) return null;

    return (
        <LearningProvider>
            <TopBar>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/settings">Settings</Link>
                {/* Autres éléments de navigation */}
            </TopBar>

            <ClientLayoutContent preferences={preferences}>
                {children}
            </ClientLayoutContent>
        </LearningProvider>
    );
};

interface ClientLayoutContentProps {
    children: ReactNode;
    preferences: Preferences;
}

const ClientLayoutContent: React.FC<ClientLayoutContentProps> = ({ children }) => (
    <div className="fixed left-0 right-0 top-0 bottom-16 mx-auto w-full flex flex-col overflow-y-auto z-40">
        <div className="flex flex-1 relative mx-auto w-full max-w-screen-xl">
            <SidebarWrapper />
            <CardsPageWrapper />
            <LayoutWrapper>
                <main className="flex-1 p-4">{children}</main>
            </LayoutWrapper>
        </div>
        <BottomBar />
    </div>
);

const SidebarWrapper: React.FC = () => (
    <div className="fixed left-0 top-32 bottom-16 w-20 z-40">
        <Sidebar />
    </div>
);

const CardsPageWrapper: React.FC = () => (
    <div className="fixed right-0 top-32 bottom-16 w-20 z-40">
        <CardsPage />
    </div>
);

export default ClientLayout;
