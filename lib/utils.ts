import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function convertMinutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const minutesFormatted = minutes % 60;
  return `${hours}h ${minutesFormatted.toFixed(0)}m`;
}

export function formatDate(dateString: string) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day} ${months[month - 1]} ${year}`;

}

/**
 * Calculates the Flight Time XP based on the total flight time in minutes
 * @param minutes Total flight time in minutes
 * @returns The XP earned from flight time (10 XP per minute)
 */
export function calculateFlightTimeXP(minutes: number): number {
    // Every minute of flight accumulates 10 XP
    return minutes * 10;
}

