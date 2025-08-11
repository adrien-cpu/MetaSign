// src/components/ui/badge.tsx
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-600 text-white",
      secondary: "bg-gray-100 text-gray-900",
      outline: "bg-white text-gray-700 border border-gray-200",
      destructive: "bg-red-600 text-white"
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";