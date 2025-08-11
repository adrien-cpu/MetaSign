import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, LayoutDashboard, Phone, User, UserRoundPen, Settings, LogOut } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ROUTES } from '@/constants/routes';
import { useScreenSize } from "@/context/ScreenSizeContext";

interface SidebarProps {
  /** Callback appelé lors du clic sur le bouton d'administration */
  onAdminClick?: () => void;
  /** Détermine si l'option d'administration doit être affichée */
  showAdminOption?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAdminClick, showAdminOption }) => {
  const { isMobile } = useScreenSize();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() ?? "";
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const HIDDEN_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, "/"];
  if (HIDDEN_PATHS.includes(pathname)) return null;

  const menuItems = [
    { href: ROUTES.USER_DASHBOARD, icon: LayoutDashboard, text: "Mon espace" },
    { href: ROUTES.USER_PROFILE, icon: User, text: "Mon Profil" },
    { href: ROUTES.USER_CONTACTS, icon: Phone, text: "Appeler" },
    { href: ROUTES.USER_AVATAR, icon: UserRoundPen, text: "Avatar" },
    ...(session?.user.role === "ADMIN"
      ? [{ href: ROUTES.ADMIN_DASHBOARD, icon: Settings, text: "Administration" }]
      : []),
  ];

  return (
    <div className="flex h-full relative">
      <nav
        className={`bg-slate-900 ${isOpen ? (collapsed ? "w-20" : "w-64") : "w-20"} transition-all duration-300 text-white fixed left-0 flex flex-col overflow-y-auto`}
        style={{ top: "64px", bottom: "64px", zIndex: 30 }}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 mx-auto my-4 rounded-md hover:bg-slate-700 flex items-center justify-center transition-colors duration-200"
          data-tooltip-id="sidebar-tooltip"
          data-tooltip-content="Menu"
        >
          <Menu className="h-6 w-6" />
          {!collapsed && <span className="ml-3">Menu</span>}
        </button>

        <div className="space-y-4 mt-4 flex-1 px-3">
          {menuItems.map(({ href, icon: Icon, text }, index) => (
            <Link
              key={index}
              href={href}
              className={`bg-slate-700 flex items-center ${collapsed ? "justify-center" : "justify-start"} p-3 rounded-md hover:bg-slate-500 transition-colors duration-200 relative ${pathname === href ? "bg-slate-500" : ""}`}
              data-tooltip-id="sidebar-tooltip"
              data-tooltip-content={collapsed ? text : ""}
            >
              <Icon className="h-5 w-5 min-w-5" />
              {!collapsed && <span className="ml-4 truncate">{text}</span>}
            </Link>
          ))}

          {showAdminOption && (
            <button
              onClick={onAdminClick}
              className={`bg-slate-700 w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} p-3 rounded-md hover:bg-slate-500 transition-colors duration-200`}
              data-tooltip-id="sidebar-tooltip"
              data-tooltip-content={collapsed ? "Administration" : ""}
            >
              <Settings className="h-5 w-5 min-w-5" />
              {!collapsed && <span className="ml-4 truncate">Administration</span>}
            </button>
          )}

          <button
            onClick={() => signOut({ callbackUrl: ROUTES.LOGOUT })}
            className={`bg-slate-700 w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} p-3 rounded-md hover:bg-slate-500 font-bold text-red-600 transition-colors duration-200 mt-auto mb-4 relative`}
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content={collapsed ? "Déconnexion" : ""}
          >
            <LogOut className="h-5 w-5 min-w-5" />
            {!collapsed && <span className="ml-4 truncate">Déconnexion</span>}
          </button>
        </div>
      </nav>

      <Tooltip id="sidebar-tooltip" place="right" className="z-50" style={{ zIndex: 50 }} />
    </div>
  );
};

export default Sidebar;
