"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
    return (
        <label className="flex items-center cursor-pointer select-none">
            <div className="relative w-10 h-6">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div
                    className={cn(
                        "w-10 h-6 rounded-full transition-colors shadow-inner",
                        checked ? "bg-blue-500" : "bg-gray-300"
                    )}
                />
                <div
                    className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform",
                        checked ? "translate-x-4" : "translate-x-0"
                    )}
                />
            </div>
            {label && <span className="ml-3 text-sm">{label}</span>}
        </label>
    );
};

export default Toggle;
