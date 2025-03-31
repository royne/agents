/**
 * Utilities for handling dates with GMT-5 timezone
 */

/**
 * Gets the current date in GMT-5
 * @returns Current date in GMT-5
 */
export const getCurrentLocalDate = (): Date => {
  // Get the current date
  const now = new Date();
  
  // Create a date that represents only the current day (without time)
  // in the user's local timezone
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  return new Date(year, month, day);
};

/**
 * Formats a date for use in HTML date inputs (YYYY-MM-DD)
 * @param date Date to format
 * @returns String in YYYY-MM-DD format
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns Current date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  const today = getCurrentLocalDate();
  return formatDateForInput(today);
};

/**
 * Compares if two dates are the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns true if they are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};