const clsx = require("clsx");
const { twMerge } = require("tailwind-merge");

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Export tailwind-variants for AlignUI components
export { tv, type VariantProps } from "tailwind-variants";

// Add polymorphic types for AlignUI components
export type PolymorphicComponentProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>; 