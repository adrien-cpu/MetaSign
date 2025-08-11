'use client';

import Link from 'next/link';
import { Home, Search, Bell, BookOpen, MessageCircleX, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from "next/navigation";
import { ROUTES } from '@/constants/routes';
import { useState } from 'react';
import LSFAvatar from '@/components/avatar/LSFAvatar'; // Assurez-vous d'importer le composant LSFAvatar

export default function BottomBar() {
  const pathname = usePathname() ?? "";
  const [lsfMode, setLsfMode] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(false);

  const BottomBar = [ROUTES.LOGIN, ROUTES.REGISTER, "/"];

  if (BottomBar.includes(pathname)) return null;

  const navItems = [
    { href: ROUTES.HOME, icon: Home, label: 'Accueil' },
    { href: '/search', icon: Search, label: 'Recherche' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: 'http://127.0.0.1:8000', icon: BookOpen, label: 'Documentation', target: '_blank' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-gray-200 h-16 z-50">
        <div className="flex justify-around items-center h-full max-w-screen-xl mx-auto">
          {navItems.map(({ href, icon: Icon, label, target }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                target={target}
                className={cn(
                  "flex flex-col items-center",
                  isActive ? "text-white" : "text-white hover:text-blue-500"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setLsfMode(!lsfMode)}
            className="flex flex-col items-center text-white hover:text-blue-500"
          >
            {lsfMode ? <MessageCircleX className="h-6 w-6" /> : <MessageCircleQuestion className="h-6 w-6" />}
            <span className="text-xs mt-1">{lsfMode ? 'Fermer' : 'Aide'}</span>
          </button>
        </div>
      </nav>
      {lsfMode && <LSFAvatar avatarVisible={avatarVisible} setAvatarVisible={setAvatarVisible} />}
    </>
  );
}
