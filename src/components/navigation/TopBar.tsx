import React, { ReactNode } from 'react';
import { topbarStyles } from '@/styles/components/topbar'; // Assurez-vous que le chemin est correct


interface TopBarProps {
  children: ReactNode;
  className?: string; // Optional className prop for styling
}

const TopBar: React.FC<TopBarProps> = ({ children, className }) => {
  return (
    <div className={`${topbarStyles.container} ${className || ''}`}>
      <div className={topbarStyles.logo.container}>MS</div>
      <div className={topbarStyles.logo.text}>MetaSign</div>
      <div className={topbarStyles.nav.container}>{children}</div>

    </div>
  );
};

export default TopBar;