import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to get contrasting text color based on background
 */
export function getContrastingTextColor(hexColor: string): string {
  if (!hexColor) return '#000000';
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Utility function to format element category for CSS classes
 */
export function formatCategoryClass(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Utility function to debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Utility function to throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Utility function to format numbers with proper precision
 */
export function formatNumber(num: number, precision: number = 3): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toFixed(precision);
}

/**
 * Utility function to capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Utility function to generate element color based on category
 */
export function getElementColor(category: string): string {
  const colorMap: Record<string, string> = {
    'alkali metal': 'rgb(255, 99, 132)',
    'alkaline earth metal': 'rgb(54, 162, 235)',
    'transition metal': 'rgb(255, 205, 86)',
    'post-transition metal': 'rgb(75, 192, 192)',
    'metalloid': 'rgb(153, 102, 255)',
    'diatomic nonmetal': 'rgb(255, 159, 64)',
    'polyatomic nonmetal': 'rgb(199, 199, 199)',
    'noble gas': 'rgb(83, 102, 255)',
    'lanthanide': 'rgb(255, 99, 255)',
    'actinide': 'rgb(255, 159, 255)',
    'unknown': 'rgb(201, 203, 207)'
  };
  
  return colorMap[category.toLowerCase()] || colorMap['unknown'];
}

/**
 * Utility function to validate and sanitize search input
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .substring(0, 100); // Limit length
}

/**
 * Utility function to check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Utility function to check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Utility function to generate unique IDs
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}