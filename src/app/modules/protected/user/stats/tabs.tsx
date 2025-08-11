'use client';

import React, { useState, ReactNode } from 'react';

interface TabProps {
    label: string;
    children: ReactNode;
}

interface TabsProps {
    children: ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
    return <>{children}</>;
};

export const Tabs: React.FC<TabsProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);

    const tabChildren = React.Children.toArray(children);

    return (
        <div>
            <div className="flex border-b border-gray-700 mb-4">
                {tabChildren.map((child, index) => {
                    if (!React.isValidElement(child)) return null;

                    return (
                        <button
                            key={index}
                            className={`px-4 py-2 ${activeTab === index
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                            onClick={() => setActiveTab(index)}
                        >
                            {child.props.label}
                        </button>
                    );
                })}
            </div>

            <div>
                {tabChildren[activeTab]}
            </div>
        </div>
    );
};