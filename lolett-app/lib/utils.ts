import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as French price: 31.2 → "31,20" (without € symbol) */
export function formatPriceNumber(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

/** Format a number as French price with € symbol: 31.2 → "31,20 €" */
export function formatPrice(amount: number): string {
  return `${formatPriceNumber(amount)}\u00a0€`;
}
