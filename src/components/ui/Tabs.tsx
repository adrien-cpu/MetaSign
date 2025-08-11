// src/components/ui/Tabs.tsx
"use client";

import * as React from "react";

// Types pour les composants Tabs
export interface TabsProps {
    children: React.ReactNode;
    defaultValue: string;
    value?: string;
    className?: string;
    onValueChange?: (value: string) => void;
}

export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export interface TabsTriggerProps {
    children: React.ReactNode;
    value: string;
    className?: string;
    disabled?: boolean;
}

export interface TabsContentProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}

// Contexte pour les Tabs
type TabsContextValue = {
    value: string;
    onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("useTabs must be used within a Tabs component");
    }
    return context;
}

// Composant principal Tabs
export const Tabs = React.forwardRef<
    HTMLDivElement,
    TabsProps
>(({ children, defaultValue, value, onValueChange, className = "", ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

    React.useEffect(() => {
        if (value) {
            setSelectedValue(value);
        }
    }, [value]);

    const handleValueChange = React.useCallback((newValue: string) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
    }, [onValueChange]);

    return (
        <TabsContext.Provider
            value={{ value: selectedValue, onValueChange: handleValueChange }}
        >
            <div
                ref={ref}
                className={`w-full ${className}`}
                {...props}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
});
Tabs.displayName = "Tabs";

// Composant TabsList
export const TabsList = React.forwardRef<
    HTMLDivElement,
    TabsListProps
>(({ children, className = "", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
});
TabsList.displayName = "TabsList";

// Composant TabsTrigger
export const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    TabsTriggerProps
>(({ children, value, className = "", disabled = false, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs();
    const isSelected = selectedValue === value;

    return (
        <button
            ref={ref}
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
        ${isSelected
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-700 hover:text-gray-900'
                } ${className}`}
            onClick={() => onValueChange(value)}
            {...props}
        >
            {children}
        </button>
    );
});
TabsTrigger.displayName = "TabsTrigger";

// Composant TabsContent
export const TabsContent = React.forwardRef<
    HTMLDivElement,
    TabsContentProps
>(({ children, value, className = "", ...props }, ref) => {
    const { value: selectedValue } = useTabs();
    const isSelected = selectedValue === value;

    if (!isSelected) return null;

    return (
        <div
            ref={ref}
            role="tabpanel"
            className={`mt-2 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
});
TabsContent.displayName = "TabsContent";