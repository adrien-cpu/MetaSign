'use client';
import React, { useState, useEffect } from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CardProps
>(({ className = '', children, ...props }, ref) => {
  const [showCards, setShowCards] = useState(true);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedPreferences = JSON.parse(localStorage.getItem("userPreferences") || "{}");
      setShowCards(savedPreferences.showCards !== false);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (!showCards) return null; // Si l'option est désactivée, on ne retourne rien 🔥

  return (
    <div ref={ref} className={`card ${className}`} {...props}>
      {children}
    </div>
  );
});
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`card-header ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h3 ref={ref} className={`card-title ${className}`} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`card-content ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`card-footer ${className}`} {...props} />
));
CardFooter.displayName = "CardFooter";
