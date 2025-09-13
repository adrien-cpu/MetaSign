import React from 'react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  showCopy?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onCancel,
  onDelete,
  onEdit,
  onDownload,
  onShare,
  onCopy,
  showCopy = false,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onSave && (
        <Button onClick={onSave} disabled={disabled}>
          Save
        </Button>
      )}
      {onEdit && (
        <Button onClick={onEdit} disabled={disabled} variant="outline">
          Edit
        </Button>
      )}
      {onDownload && (
        <Button onClick={onDownload} disabled={disabled} variant="outline">
          Download
        </Button>
      )}
      {onShare && (
        <Button onClick={onShare} disabled={disabled} variant="outline">
          Share
        </Button>
      )}
      {onCancel && (
        <Button onClick={onCancel} disabled={disabled} variant="outline">
          Cancel
        </Button>
      )}
      {showCopy && onCopy && (
        <Button onClick={onCopy} disabled={disabled} variant="outline">
          Copy
        </Button>
      )}
      {onDelete && (
        <Button onClick={onDelete} disabled={disabled} variant="destructive">
          Delete
        </Button>
      )}
    </div>
  );
};