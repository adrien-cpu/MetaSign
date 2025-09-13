import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [], className = '' }) => {
  // Provide default items if none are provided
  const breadcrumbItems = items.length > 0 ? items : [
    { label: 'Dashboard', href: '/dashboard' }
  ];
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-800 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;