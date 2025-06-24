import { createElement } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground tw-shadow-sm",
                className
            )}
            {...props}
        />
    );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
    return (
        <div
            className={cn("tw-flex tw-flex-col tw-space-y-1.5 tw-p-6", className)}
            {...props}
        />
    );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
    return (
        <div className={cn("tw-p-6 tw-pt-0", className)} {...props} />
    );
} 