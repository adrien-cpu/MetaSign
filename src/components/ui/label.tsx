// src/components/ui/label.tsx
import * as React from "react";

// Extension directe du type natif plutôt qu'une interface vide
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-medium leading-none text-gray-700 ${className || ""}`}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";