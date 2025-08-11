// src/components/ui/slider.tsx
import * as React from "react";

interface SliderProps {
    /**
     * Valeur actuelle du slider
     */
    value: number[];

    /**
     * Fonction appelée quand la valeur change
     */
    onValueChange: (value: number[]) => void;

    /**
     * Valeur minimum du slider
     */
    min?: number;

    /**
     * Valeur maximum du slider
     */
    max?: number;

    /**
     * Pas d'incrémentation
     */
    step?: number;

    /**
     * ID du slider pour les labels
     */
    id?: string;

    /**
     * Classes CSS additionnelles
     */
    className?: string;

    /**
     * Est-ce que le slider est désactivé
     */
    disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    id,
    className = "",
    disabled = false,
    ...props
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value, 10);
        onValueChange([newValue]);
    };

    return (
        <div className={`relative w-full ${className}`}>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleChange}
                disabled={disabled}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                style={{
                    background: `linear-gradient(to right, #2563eb ${(value[0] - min) / (max - min) * 100}%, #e5e7eb ${(value[0] - min) / (max - min) * 100}%)`,
                }}
                {...props}
            />
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-blue-600 rounded-full shadow"
                    style={{
                        left: `calc(${(value[0] - min) / (max - min) * 100}% - 8px)`,
                        display: disabled ? 'none' : 'block'
                    }}
                />
            </div>
        </div>
    );
};