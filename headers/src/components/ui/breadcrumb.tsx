/* eslint-disable prettier/prettier */
import * as React from "react";
import { createElement } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" className={cn("tw-font-barlow", className)} {...props} />
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "tw-flex tw-flex-wrap tw-items-center tw-gap-1.5 tw-break-words tw-text-base",
      "tw-text-muted-foreground tw-font-medium",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(
      "tw-inline-flex tw-items-center tw-gap-1.5",
      "tw-min-h-[2rem]",
      className
    )}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "tw-hover:text-foreground tw-transition-colors",
      "tw-flex tw-items-center tw-gap-1.5",
      className
    )}
    {...props}
  />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-current="page"
    className={cn(
      "tw-font-medium tw-text-foreground",
      "tw-flex tw-items-center tw-gap-1.5",
      className
    )}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn(
      "tw-opacity-50 tw-flex tw-items-center",
      "tw-min-h-[2rem]",
      className
    )}
    {...props}
  >
    <ChevronRight className="tw-h-4 tw-w-4" />
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
}; 