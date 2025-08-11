/**
 * @fileoverview Composant Tooltip pour l'application MetaSign
 * @module @/components/ui/tooltip
 * @version 1.0.0
 * @author MetaSign Team
 * @since 2025-06-16
 * 
 * Composant de tooltip basé sur Radix UI avec accessibilité intégrée.
 * 
 * @path src/components/ui/tooltip.tsx
 */

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

/**
 * Provider de tooltip pour l'application
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Composant racine du tooltip
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Déclencheur du tooltip
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Contenu du tooltip avec styles personnalisés
 */
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };