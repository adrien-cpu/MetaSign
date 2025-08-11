import * as React from "react";
import { Dispatch, SetStateAction } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la propagation du clic au backdrop
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
        onClick={handleDialogClick}
      >
        {children}
      </div>
    </div>
  );
}

// Mise à jour de DialogContent pour accepter className
export function DialogContent({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-4 ${className || ''}`}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

export function DialogFooter({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-6 flex justify-end space-x-4 ${className || ''}`}>
      {children}
    </div>
  );
}
