import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(dateString: string) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day} ${months[month - 1]} ${year}`;

}

export function convertMinutesToHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${Math.round(mins)}m`
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

export const getMinutesAgo = (lastReport: string) => {
  if (!lastReport) return "Unknown";
  
  try {
    const lastReportTime = new Date(lastReport);
    const now = new Date();
    const diffInMs = now.getTime() - lastReportTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 min ago";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    // For longer periods, show hours
    const hours = Math.floor(diffInMinutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    
    // For very long periods, show days
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
    
  } catch (error) {
    return "Unknown";
  }
};

export function getMonthAndYear(dateYear: string) {
  // dateYear = "1_25"

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const month = MONTHS[parseInt(dateYear.split("_")[0]) - 1];
  const year = parseInt(dateYear.split("_")[1]);

  return `${month} 20${year}`; // January 2025
}

/**
 * Formats timeframe text based on the timeframe string
 * @param timeframe The timeframe string (e.g., "month-8_24", "flight-800", "7")
 * @returns Formatted text (e.g., "on June 2024", "for the last 800 flights", "7 days")
 */
export function formatTimeframeText(timeframe: string): string {
  if (timeframe.startsWith('month-')) {
    const monthYear = timeframe.split('-')[1];
    return `on ${getMonthAndYear(monthYear)}`;
  }
  
  if (timeframe.startsWith('flight-')) {
    const flightCount = timeframe.split('-')[1];
    return `for the last ${flightCount} flights`;
  }
  
  // Handle days
  if (timeframe.startsWith('day-')) {
    const days = timeframe.split('-')[1];
    return `for the last ${days} days`;
  }
  
  return `for the last 30 days`;
}

