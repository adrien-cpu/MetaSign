'use client';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranslationLayoutProps {
    title: string;
    icon: ReactNode;
    color: string;
    children: ReactNode;
}

export function TranslationLayout({ title, icon, color, children }: TranslationLayoutProps) {
    return (
        <div className="space-y-6">
            <Card className={`bg-gradient-to-br from-${color}-50 to-white border-none shadow-lg`}>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
                            {icon}
                        </div>
                        <CardTitle className={`text-2xl font-bold text-${color}-600`}>
                            {title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
