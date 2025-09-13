import React from 'react';
import { X } from 'lucide-react';

interface SidebarAdminProps {
  onClose: () => void;
  isVisible: boolean;
}

export const SidebarAdmin: React.FC<SidebarAdminProps> = ({ onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#users" className="block px-3 py-2 rounded hover:bg-gray-800">
              User Management
            </a>
          </li>
          <li>
            <a href="#system" className="block px-3 py-2 rounded hover:bg-gray-800">
              System Settings
            </a>
          </li>
          <li>
            <a href="#security" className="block px-3 py-2 rounded hover:bg-gray-800">
              Security
            </a>
          </li>
          <li>
            <a href="#logs" className="block px-3 py-2 rounded hover:bg-gray-800">
              Audit Logs
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};