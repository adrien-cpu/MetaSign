import React from 'react';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
    return (
        <div className="LayoutWrapper">
            {children}
        </div>
    );
};

export default LayoutWrapper;