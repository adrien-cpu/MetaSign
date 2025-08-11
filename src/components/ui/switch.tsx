// src/components/ui/switch.tsx
import * as React from "react";

interface SwitchProps {
  /**
   * État checked du switch
   */
  checked: boolean;

  /**
   * Fonction appelée lorsque l'état change
   */
  onCheckedChange: (checked: boolean) => void;

  /**
   * ID du switch pour les labels
   */
  id?: string;

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Est-ce que le switch est désactivé
   */
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  id,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked
        ? 'bg-blue-600'
        : 'bg-gray-200'
        } ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer'
        } ${className}`}
      {...props}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  );
};
