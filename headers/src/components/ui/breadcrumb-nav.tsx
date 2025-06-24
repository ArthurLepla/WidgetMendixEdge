import * as React from "react";
import { createElement } from "react";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { cn } from "../../lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
  homeHref?: string;
  onNavigate?: (href: string) => void;
  homeAction?: () => void;
}

export function BreadcrumbNav({
  items,
  className,
  showHomeIcon = true,
  homeHref = "/",
  onNavigate,
  homeAction,
}: BreadcrumbNavProps) {
  const handleClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.(href);
  };

  return (
    <Breadcrumb className={cn("tw-min-h-[22px]", className)}>
      <BreadcrumbList>
        {showHomeIcon && (
          <BreadcrumbItem>
            <BreadcrumbLink
              href={homeHref}
              onClick={homeAction}
              className="tw-cursor-pointer hover:tw-opacity-75 tw-transition-opacity"
              aria-label="Accueil"
            >
              <Home className="tw-h-6 tw-w-6 tw-text-primary" />
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast) {
            return (
              <BreadcrumbItem key={item.label}>
                <BreadcrumbPage className="tw-text-lg">{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <BreadcrumbItem key={item.label}>
              <BreadcrumbLink
                href={item.href || "#"}
                onClick={item.href ? handleClick(item.href) : undefined}
                className="tw-text-lg"
              >
                {item.label}
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 