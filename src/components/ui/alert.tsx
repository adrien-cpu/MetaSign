import * as React from "react"
import { cn } from "@/lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning"
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-background text-foreground border",
      destructive: "border-destructive/50 text-destructive dark:border-destructive",
      warning: "border-yellow-500/50 text-yellow-600 dark:border-yellow-500"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg px-4 py-3 text-sm",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Alert.displayName = "Alert"

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string
}

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, message, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {message || children}
    </div>
  )
)
AlertDescription.displayName = "AlertDescription"