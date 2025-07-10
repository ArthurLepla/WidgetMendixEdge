const clsx = require("clsx");
const { twMerge } = require("tailwind-merge");

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
} 