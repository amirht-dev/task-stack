import { clsx, type ClassValue } from 'clsx';
import { interval, startOfMonth, endOfMonth } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMonthInterval(month: Date) {
  return interval(startOfMonth(month), endOfMonth(month));
}
